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
