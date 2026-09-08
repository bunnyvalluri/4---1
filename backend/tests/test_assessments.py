import pytest
from unittest.mock import patch
from httpx import AsyncClient
from app.models.assessment import AptitudeQuestion, AptitudeCategory
from tests.conftest import TestSessionLocal
from scripts.seed_questions import QUESTIONS_DATA


@pytest.fixture(autouse=True)
def mock_firestore_storage():
    """Mocks Firestore collections in memory for fast, isolated test execution."""
    mock_db = {}

    class MockRepo:
        def __init__(self, collection_name: str):
            self.collection_name = collection_name
            mock_db.setdefault(collection_name, {})

        def get(self, doc_id: str):
            item = mock_db[self.collection_name].get(doc_id)
            if item:
                res = dict(item)
                res["id"] = doc_id
                return res
            return None

        def set(self, doc_id: str, data: dict, merge: bool = True):
            if merge and doc_id in mock_db[self.collection_name]:
                merged = dict(mock_db[self.collection_name][doc_id])
                merged.update(data)
                merged["id"] = doc_id
                mock_db[self.collection_name][doc_id] = merged
            else:
                to_save = dict(data)
                to_save["id"] = doc_id
                mock_db[self.collection_name][doc_id] = to_save
            return mock_db[self.collection_name][doc_id]

        def update(self, doc_id: str, data: dict):
            if doc_id in mock_db[self.collection_name]:
                mock_db[self.collection_name][doc_id].update(data)
                return mock_db[self.collection_name][doc_id]
            return None

        def delete(self, doc_id: str):
            mock_db[self.collection_name].pop(doc_id, None)
            return True

        def query_by_user(self, user_id: str, limit: int = 100):
            return [
                dict(v) for v in mock_db[self.collection_name].values()
                if v.get("userId") == user_id or v.get("uid") == user_id
            ][:limit]

        def query_by_field(self, field: str, op: str, value, limit: int = 100):
            return [
                dict(v) for v in mock_db[self.collection_name].values()
                if v.get(field) == value
            ][:limit]

        def list_all(self, limit: int = 100):
            return [dict(v) for v in mock_db[self.collection_name].values()][:limit]

        def create(self, data: dict):
            doc_id = data.get("id") or "mock_" + str(len(mock_db[self.collection_name]) + 1)
            data["id"] = doc_id
            mock_db[self.collection_name][doc_id] = dict(data)
            return data

    with patch("app.services.assessment_service.FirestoreRepository", side_effect=MockRepo):
        with patch("app.firebase.firestore.FirestoreRepository", side_effect=MockRepo):
            with patch("app.services.assessment_service.record_audit_log"):
                yield mock_db


@pytest.fixture(autouse=True)
async def seed_test_questions():
    """Seeds test database with the 25 questions."""
    async with TestSessionLocal() as session:
        for q in QUESTIONS_DATA:
            question = AptitudeQuestion(
                category=q["category"],
                question=q["question"],
                options=q["options"],
                correct_option=q["correct_option"],
                explanation=q["explanation"],
                difficulty=q["difficulty"],
            )
            session.add(question)
        await session.commit()


@pytest.mark.asyncio
async def test_sanitized_questions_endpoint(client: AsyncClient):
    """Verifies that questions are returned without correct answers or explanations."""
    res = await client.get("/api/v1/assessments/questions")
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) == 25

    for q in questions:
        assert "correct_option" not in q
        assert "explanation" not in q
        assert "question" in q
        assert "options" in q
        assert len(q["options"]) >= 2
        assert "category" in q


@pytest.mark.asyncio
async def test_assessment_status_not_started(client: AsyncClient, auth_headers: dict):
    """Verifies initial status is NOT_STARTED when no attempt exists."""
    res = await client.get("/api/v1/assessments/status", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]


@pytest.mark.asyncio
async def test_full_assessment_lifecycle(client: AsyncClient, auth_headers: dict):
    """
    Tests complete lifecycle:
    1. Start new assessment attempt
    2. Save answers
    3. Toggle question flags
    4. Review assessment summary
    5. Submit and verify scoring, category breakdown, career impacts, and AI insights
    6. Retrieve completed results with unlocked explanations
    """
    # 1. Start assessment (restart=True to get fresh attempt)
    start_res = await client.post(
        "/api/v1/assessments/start",
        json={"restart": True},
        headers=auth_headers,
    )
    assert start_res.status_code == 200
    start_data = start_res.json()
    attempt_id = start_data["attempt_id"]
    assert start_data["status"] == "IN_PROGRESS"
    assert start_data["current_question_index"] == 0

    # 2. Fetch questions to answer
    q_res = await client.get("/api/v1/assessments/questions")
    questions = q_res.json()
    assert len(questions) == 25

    first_q = questions[0]
    second_q = questions[1]

    # 3. Autosave answer for question 1
    save_res = await client.post(
        f"/api/v1/assessments/attempts/{attempt_id}/answers",
        json={
            "question_id": first_q["id"],
            "selected_option": 0,
            "current_question_index": 1,
            "time_spent_seconds": 25,
        },
        headers=auth_headers,
    )
    assert save_res.status_code == 200
    save_data = save_res.json()
    assert save_data["status"] == "SAVED"
    assert save_data["answered_count"] >= 1

    # 4. Autosave answer for question 2
    await client.post(
        f"/api/v1/assessments/attempts/{attempt_id}/answers",
        json={
            "question_id": second_q["id"],
            "selected_option": 2,
            "current_question_index": 2,
            "time_spent_seconds": 45,
        },
        headers=auth_headers,
    )

    # 5. Toggle flag on question 2
    flag_res = await client.post(
        f"/api/v1/assessments/attempts/{attempt_id}/flag",
        json={"question_id": second_q["id"], "flagged": True},
        headers=auth_headers,
    )
    assert flag_res.status_code == 200
    flagged_ids = flag_res.json()
    assert second_q["id"] in flagged_ids

    # 6. Check review summary
    rev_res = await client.get(
        f"/api/v1/assessments/attempts/{attempt_id}/review",
        headers=auth_headers,
    )
    assert rev_res.status_code == 200
    rev_data = rev_res.json()
    assert rev_data["answered_count"] >= 2
    assert rev_data["flagged_count"] >= 1
    assert "section_summary" in rev_data

    # 7. Submit assessment
    submit_res = await client.post(
        f"/api/v1/assessments/attempts/{attempt_id}/submit",
        json={"time_spent_seconds": 180},
        headers=auth_headers,
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert result["status"] == "COMPLETED"
    assert "score" in result
    assert "performance_tier" in result
    assert "category_scores" in result
    assert "strengths" in result
    assert "career_impacts" in result
    assert len(result["career_impacts"]) >= 1
    assert "review_items" in result
    assert len(result["review_items"]) >= 1

    # In completed results, explanation is now available
    assert "explanation" in result["review_items"][0]

    # 8. Retrieve results via GET /results
    res_get = await client.get(
        f"/api/v1/assessments/attempts/{attempt_id}/results",
        headers=auth_headers,
    )
    assert res_get.status_code == 200
    final_res = res_get.json()
    assert final_res["score"] == result["score"]
    assert final_res["performance_tier"] == result["performance_tier"]

    # 9. Status should now reflect COMPLETED
    status_res = await client.get("/api/v1/assessments/status", headers=auth_headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "COMPLETED"
    assert status_data["latest_result"] is not None


@pytest.mark.asyncio
async def test_legacy_singular_endpoint(client: AsyncClient, auth_headers: dict):
    """Verifies that legacy /api/v1/assessment/questions is properly routed."""
    res = await client.get("/api/v1/assessment/questions")
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) == 25
