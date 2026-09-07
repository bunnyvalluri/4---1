import pytest
from httpx import AsyncClient
from app.models.career import Career
from app.models.skill import Skill, SkillCategory
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_skill_gaps_endpoint(client: AsyncClient, auth_headers: dict):
    # Trigger recommendations first which also creates skill gaps
    await client.post("/api/v1/recommendations/generate", headers=auth_headers)

    gaps_res = await client.get("/api/v1/recommendations/skill-gaps", headers=auth_headers)
    assert gaps_res.status_code == 200
    assert isinstance(gaps_res.json(), list)
