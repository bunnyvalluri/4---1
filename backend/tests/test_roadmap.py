import pytest
from httpx import AsyncClient
from app.models.career import Career
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_roadmap_generation_and_task_completion(client: AsyncClient, auth_headers: dict):
    # Seed a career
    async with TestSessionLocal() as session:
        c = Career(
            title="Backend Architect",
            slug="backend-architect",
            category="Backend",
            description="Scalable distributed systems.",
            salary_range="$130k - $190k",
            overview="Distributed backends overview.",
            education_reqs="B.S. CS",
            aptitude_reqs={},
            common_job_titles=[],
        )
        session.add(c)
        await session.commit()
        await session.refresh(c)
        career_id = c.id

    # Generate roadmap
    gen_res = await client.post(
        "/api/v1/roadmap/generate",
        json={"career_id": career_id, "duration_months": 6},
        headers=auth_headers,
    )
    assert gen_res.status_code == 200
    roadmap = gen_res.json()
    assert len(roadmap["items"]) == 6
    first_item_id = roadmap["items"][0]["id"]

    # Mark first item as completed
    update_res = await client.patch(
        f"/api/v1/roadmap/items/{first_item_id}",
        json={"is_completed": True, "notes": "Completed month 1 foundations."},
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["is_completed"] is True
