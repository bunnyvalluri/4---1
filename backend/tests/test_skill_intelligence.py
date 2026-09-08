import pytest
from unittest.mock import patch
from httpx import AsyncClient
from app.services.skill_normalization import normalize_skill_name, get_canonical_skills_list


@pytest.fixture(autouse=True)
def mock_firestore_storage():
    """Mocks Firestore collections in memory for fast, deterministic unit test execution."""
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

    with patch("app.services.skill_intelligence_service.FirestoreRepository", side_effect=MockRepo), \
         patch("app.api.deps.FirestoreRepository", side_effect=MockRepo):
        yield


def test_skill_normalization_rules():
    """Verifies that common aliases normalize to canonical names and correct categories."""
    assert normalize_skill_name("reactjs")[0] == "React.js"
    assert normalize_skill_name("React.js")[1] == "FRAMEWORKS"

    assert normalize_skill_name("Postgres")[0] == "PostgreSQL"
    assert normalize_skill_name("postgresql")[1] == "DATABASES"

    assert normalize_skill_name("js")[0] == "JavaScript"
    assert normalize_skill_name("python 3")[0] == "Python"
    assert normalize_skill_name("k8s")[0] == "Kubernetes"
    assert normalize_skill_name("aws")[0] == "Amazon Web Services (AWS)"
    assert normalize_skill_name("fast api")[0] == "FastAPI"


def test_canonical_skills_listing():
    """Verifies canonical list filtering by category and search query."""
    all_skills = get_canonical_skills_list()
    assert len(all_skills) >= 25

    db_skills = get_canonical_skills_list(category="DATABASES")
    assert any(s["name"] == "PostgreSQL" for s in db_skills)
    assert not any(s["name"] == "React.js" for s in db_skills)

    search_skills = get_canonical_skills_list(search="python")
    assert any(s["name"] == "Python" for s in search_skills)


@pytest.mark.asyncio
async def test_api_list_canonical_skills(client: AsyncClient):
    """Verifies GET /api/v1/skills endpoint returns canonical skills list."""
    res = await client.get("/api/v1/skills")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert any(s["name"] == "Python" for s in data)


@pytest.mark.asyncio
async def test_api_add_skill_with_normalization(client: AsyncClient, auth_headers: dict):
    """Verifies POST /api/v1/skills normalizes alias and returns canonical skill record."""
    payload = {
        "name": "reactjs",
        "proficiency": 3,
        "years_of_experience": 2.5,
        "evidence_source": "Project",
    }
    res = await client.post("/api/v1/skills", json=payload, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "React.js"
    assert data["canonical_name"] == "React.js"
    assert data["proficiency"] == 3
    assert data["level"] == "Advanced"
    assert data["verified"] is True


@pytest.mark.asyncio
async def test_api_add_skill_validation_rejection(client: AsyncClient, auth_headers: dict):
    """Verifies rejection of invalid proficiency values outside 1-4 range."""
    payload = {
        "name": "Docker",
        "proficiency": 8,  # Invalid
    }
    res = await client.post("/api/v1/skills", json=payload, headers=auth_headers)
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_api_get_skill_intelligence_profile(client: AsyncClient, auth_headers: dict):
    """Verifies GET /api/v1/skills/profile returns full intelligence payload."""
    res = await client.get("/api/v1/skills/profile", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    # Check top metric keys
    assert "metrics" in data
    m = data["metrics"]
    assert "total_skills" in m
    assert "skill_readiness_pct" in m
    assert "career_alignment_pct" in m

    # Check target career
    assert "target_career" in data
    assert "required_skills_count" in data["target_career"]

    # Check matrix
    assert "matrix" in data
    assert isinstance(data["matrix"], list)

    # Check critical gaps
    assert "critical_gaps" in data
    assert isinstance(data["critical_gaps"], list)

    # Check AI insights
    assert "ai_insights" in data
    assert "strongest_area" in data["ai_insights"]
    assert "confidence_level" in data["ai_insights"]


@pytest.mark.asyncio
async def test_api_career_matrix_and_gaps(client: AsyncClient, auth_headers: dict):
    """Verifies career matrix and gaps endpoints return aligned telemetry."""
    matrix_res = await client.get("/api/v1/skills/career-matrix", headers=auth_headers)
    assert matrix_res.status_code == 200
    matrix = matrix_res.json()
    assert isinstance(matrix, list)
    if matrix:
        first = matrix[0]
        assert "skill" in first
        assert "user_level" in first
        assert "required_level" in first
        assert "gap_severity" in first
        assert "priority" in first
        assert "status" in first

    gaps_res = await client.get("/api/v1/skills/gaps", headers=auth_headers)
    assert gaps_res.status_code == 200
    gaps = gaps_res.json()
    assert isinstance(gaps, list)


@pytest.mark.asyncio
async def test_api_patch_and_delete_skill(client: AsyncClient, auth_headers: dict):
    """Verifies PATCH and DELETE endpoints for skill mutation."""
    # Add skill
    add_res = await client.post("/api/v1/skills", json={"name": "Docker", "proficiency": 2}, headers=auth_headers)
    assert add_res.status_code == 201
    skill_id = add_res.json()["id"]

    # Patch skill
    patch_res = await client.patch(f"/api/v1/skills/{skill_id}", json={"proficiency": 3}, headers=auth_headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["proficiency"] == 3
    assert patch_res.json()["level"] == "Advanced"

    # Delete skill
    del_res = await client.delete(f"/api/v1/skills/{skill_id}", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"


@pytest.mark.asyncio
async def test_api_recalculate_and_status(client: AsyncClient, auth_headers: dict):
    """Verifies POST /api/v1/skills/recalculate and GET /api/v1/skills/status."""
    recalc_res = await client.post("/api/v1/skills/recalculate", headers=auth_headers)
    assert recalc_res.status_code == 200
    assert recalc_res.json()["status"] == "success"

    status_res = await client.get("/api/v1/skills/status", headers=auth_headers)
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "Live"
    assert status_res.json()["synced"] is True
