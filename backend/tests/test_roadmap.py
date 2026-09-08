import pytest
from httpx import AsyncClient
from app.models.career import Career
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_roadmap_generation_and_task_completion(client: AsyncClient, auth_headers: dict):
    # 1. Seed a career
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

    # 2. Generate roadmap
    gen_res = await client.post(
        "/api/v1/roadmap/generate",
        json={"career_id": career_id, "duration_months": 6, "hours_per_week": 10, "learning_pace": "balanced"},
        headers=auth_headers,
    )
    assert gen_res.status_code == 200
    roadmap = gen_res.json()
    assert len(roadmap["phases"]) == 6
    assert len(roadmap["items"]) >= 6
    assert roadmap["career_readiness_score"] >= 0.0
    assert "skill_coverage" in roadmap["readiness_breakdown"]
    assert roadmap["version"] == 1

    first_item = roadmap["items"][0]
    first_item_id = first_item["id"]
    assert first_item["status"] in ["NOT_STARTED", "IN_PROGRESS"]

    # 3. Start first item
    start_res = await client.post(
        f"/api/v1/roadmap/items/{first_item_id}/start",
        headers=auth_headers,
    )
    assert start_res.status_code == 200
    assert start_res.json()["status"] == "IN_PROGRESS"

    # 4. Complete first item
    comp_res = await client.post(
        f"/api/v1/roadmap/items/{first_item_id}/complete",
        headers=auth_headers,
    )
    assert comp_res.status_code == 200
    completed_item = comp_res.json()
    assert completed_item["is_completed"] is True
    assert completed_item["status"] == "COMPLETED"

    # 5. Check progress update
    prog_res = await client.get(
        f"/api/v1/roadmap/{roadmap['id']}/progress",
        headers=auth_headers,
    )
    assert prog_res.status_code == 200
    prog_data = prog_res.json()
    assert prog_data["completed_items"] >= 1
    assert prog_data["overall_progress"] > 0.0


@pytest.mark.asyncio
async def test_dependency_locking_and_unlocking(client: AsyncClient, auth_headers: dict):
    # Seed career
    async with TestSessionLocal() as session:
        c = Career(
            title="AI Systems Engineer",
            slug="ai-systems-engineer",
            category="AI",
            description="AI infrastructure.",
            salary_range="$140k - $200k",
            overview="AI infrastructure overview.",
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
    items = gen_res.json()["items"]

    # Item 0 is unlocked (prerequisite for Item 1)
    item0_id = items[0]["id"]
    item1_id = items[1]["id"]
    assert items[1]["status"] == "LOCKED"

    # Attempting to start locked item 1 must fail with 422
    locked_start = await client.post(
        f"/api/v1/roadmap/items/{item1_id}/start",
        headers=auth_headers,
    )
    assert locked_start.status_code == 422
    assert "Prerequisite milestone" in locked_start.json()["detail"]

    # Complete item 0
    await client.post(f"/api/v1/roadmap/items/{item0_id}/complete", headers=auth_headers)

    # Now item 1 must be unlocked to NOT_STARTED and can be started
    started_item1 = await client.post(f"/api/v1/roadmap/items/{item1_id}/start", headers=auth_headers)
    assert started_item1.status_code == 200
    assert started_item1.json()["status"] == "IN_PROGRESS"


@pytest.mark.asyncio
async def test_roadmap_settings_and_regeneration(client: AsyncClient, auth_headers: dict):
    # Seed career
    async with TestSessionLocal() as session:
        c = Career(
            title="Cloud Security Engineer",
            slug="cloud-security-engineer",
            category="Security",
            description="Cloud security architectures.",
            salary_range="$135k - $185k",
            overview="Security overview.",
            education_reqs="B.S. CS",
            aptitude_reqs={},
            common_job_titles=[],
        )
        session.add(c)
        await session.commit()
        await session.refresh(c)
        career_id = c.id

    gen_res = await client.post(
        "/api/v1/roadmaps/generate",
        json={"career_id": career_id, "hours_per_week": 10},
        headers=auth_headers,
    )
    assert gen_res.status_code == 200
    roadmap_id = gen_res.json()["id"]

    # Update settings to Fast Track (20 hrs/week)
    patch_res = await client.patch(
        f"/api/v1/roadmaps/{roadmap_id}/settings",
        json={"hours_per_week": 20, "learning_pace": "fast_track"},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["hours_per_week"] == 20
    assert updated["learning_pace"] == "fast_track"

    # Regenerate roadmap
    regen_res = await client.post(
        f"/api/v1/roadmaps/{roadmap_id}/regenerate",
        json={"reason": "Candidate updated target hours and focus", "hours_per_week": 20},
        headers=auth_headers,
    )
    assert regen_res.status_code == 200
    regen_data = regen_res.json()
    assert regen_data["version"] == 2
    assert regen_data["status"] == "ACTIVE"
