import pytest
from httpx import AsyncClient
from app.models.career import Career
from app.models.skill import Skill, SkillCategory
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_recommendations_generation(client: AsyncClient, auth_headers: dict):
    # Seed a career and a skill
    async with TestSessionLocal() as session:
        c = Career(
            title="DevOps Engineer",
            slug="devops-engineer",
            category="Infrastructure",
            description="Manages automated deployments and CI/CD pipelines.",
            salary_range="$100k - $160k",
            overview="DevOps builds reliable infrastructure pipelines.",
            education_reqs="B.S. CS or related",
            aptitude_reqs={"LOGICAL": 70},
            common_job_titles=["SRE"],
        )
        session.add(c)
        await session.commit()

    # Request recommendations
    rec_res = await client.post("/api/v1/recommendations/generate", headers=auth_headers)
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs) >= 1
    assert "match_score" in recs[0]
    assert "breakdown" in recs[0]


@pytest.mark.asyncio
async def test_recommendations_status(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/recommendations/status", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "profile_complete" in data
    assert "profile_completion_pct" in data


@pytest.mark.asyncio
async def test_recommendations_enhanced_list(client: AsyncClient, auth_headers: dict):
    # Seed a career
    async with TestSessionLocal() as session:
        c = Career(
            title="Cloud Architect",
            slug="cloud-architect",
            category="Cloud",
            description="Designs scalable cloud infrastructure.",
            salary_range="$130k - $200k",
            overview="Architects cloud systems.",
            education_reqs="B.S. CS",
            aptitude_reqs={"LOGICAL": 75},
            common_job_titles=["Architect"],
        )
        session.add(c)
        await session.commit()

    res = await client.get("/api/v1/recommendations?category=Cloud", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "top_match" in data
    assert "status" in data


@pytest.mark.asyncio
async def test_recommendations_recalculate_and_job(client: AsyncClient, auth_headers: dict):
    # Start recalculation
    recalc_res = await client.post("/api/v1/recommendations/recalculate", headers=auth_headers)
    assert recalc_res.status_code == 200
    data = recalc_res.json()
    assert "job_id" in data
    job_id = data["job_id"]

    # Poll job status
    job_res = await client.get(f"/api/v1/recommendations/job/{job_id}", headers=auth_headers)
    assert job_res.status_code == 200
    job_data = job_res.json()
    assert job_data["job_id"] == job_id
    assert "status" in job_data
    assert "progress" in job_data


@pytest.mark.asyncio
async def test_recommendations_compare(client: AsyncClient, auth_headers: dict):
    async with TestSessionLocal() as session:
        c1 = Career(
            title="Backend Engineer",
            slug="backend-engineer",
            category="Software",
            description="Builds APIs and databases.",
            salary_range="$100k - $150k",
            overview="Backend engineering.",
            education_reqs="B.S. CS",
            aptitude_reqs={"LOGICAL": 80},
            common_job_titles=["Backend Dev"],
        )
        c2 = Career(
            title="Frontend Engineer",
            slug="frontend-engineer",
            category="Software",
            description="Builds web interfaces.",
            salary_range="$95k - $140k",
            overview="Frontend engineering.",
            education_reqs="B.S. CS",
            aptitude_reqs={"LOGICAL": 70},
            common_job_titles=["Frontend Dev"],
        )
        session.add_all([c1, c2])
        await session.commit()
        await session.refresh(c1)
        await session.refresh(c2)
        c1_id = c1.id
        c2_id = c2.id

    res = await client.get(f"/api/v1/recommendations/compare?careers={c1_id},{c2_id}", headers=auth_headers)
    assert res.status_code == 200
    compare_data = res.json()
    assert "careers" in compare_data
    assert len(compare_data["careers"]) == 2
    assert "best_overall" in compare_data
