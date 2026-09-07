import pytest
from httpx import AsyncClient
from app.models.assessment import AptitudeQuestion, AptitudeCategory
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_assessment_flow(client: AsyncClient, auth_headers: dict):
    # 1. Seed a test question
    async with TestSessionLocal() as session:
        q = AptitudeQuestion(
            category=AptitudeCategory.LOGICAL,
            question="What is the time complexity of quicksort average case?",
            options=["O(n)", "O(n log n)", "O(n^2)", "O(1)"],
            correct_option=1,
            explanation="Average case of randomized quicksort is O(n log n).",
            difficulty="Medium",
        )
        session.add(q)
        await session.commit()
        await session.refresh(q)
        q_id = q.id

    # 2. Fetch questions
    q_res = await client.get("/api/v1/assessment/questions")
    assert q_res.status_code == 200
    questions = q_res.json()
    assert len(questions) >= 1

    # 3. Submit assessment answer
    submit_payload = {
        "answers": [
            {"question_id": q_id, "selected_option": 1}
        ]
    }
    sub_res = await client.post(
        "/api/v1/assessment/submit",
        json=submit_payload,
        headers=auth_headers,
    )
    assert sub_res.status_code == 200
    result = sub_res.json()
    assert result["score"] == 100.0
    assert result["correct_count"] == 1
    assert "LOGICAL" in result["strengths"]
