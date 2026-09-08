import pytest
from httpx import AsyncClient
from app.models.career import Career
from app.models.project import ProjectRecommendation
from tests.conftest import TestSessionLocal


@pytest.fixture
async def sample_project() -> ProjectRecommendation:
    async with TestSessionLocal() as session:
        career = Career(
            title="AI / Machine Learning Engineer",
            slug="ai-ml-engineer-test",
            category="AI",
            description="Designs and trains ML systems",
            salary_range="$120,000 - $195,000",
            demand_level="Very High",
            experience_level="Mid",
            overview="Applied ML engineering",
            education_reqs="Bachelor's degree in Computer Science, Data Science, or related field.",
        )
        session.add(career)
        await session.commit()
        await session.refresh(career)

        proj = ProjectRecommendation(
            career_id=career.id,
            title="Multi-Modal RAG Document Intelligence Engine",
            difficulty="Advanced",
            tech_stack=["Python", "FastAPI", "PyTorch", "Docker"],
            problem_statement="Enterprises struggle to query heterogeneous PDF manuals.",
            expected_outcome="Multi-modal vector search engine deployed with REST APIs.",
            skills_learned=["RAG", "PyTorch", "FastAPI", "Vector Search"],
            estimated_duration="4–6 weeks",
            portfolio_value="Extreme — Direct showcase of modern applied AI",
        )
        session.add(proj)
        await session.commit()
        await session.refresh(proj)
        return proj


@pytest.mark.asyncio
async def test_list_projects(client: AsyncClient, sample_project: ProjectRecommendation):
    res = await client.get("/api/v1/projects")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["title"] == sample_project.title


@pytest.mark.asyncio
async def test_project_strategy(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/projects/strategy", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "target_career" in data
    assert "project_readiness" in data
    assert "portfolio_strength" in data
    assert "top_skills_needed" in data
    assert isinstance(data["top_skills_needed"], list)


@pytest.mark.asyncio
async def test_recommended_projects(
    client: AsyncClient, auth_headers: dict, sample_project: ProjectRecommendation
):
    res = await client.get("/api/v1/projects/recommended", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    top = data[0]
    assert "match_score" in top
    assert top["match_score"] >= 50
    assert "match_breakdown" in top
    assert "why_recommended" in top
    assert len(top["why_recommended"]) > 0


@pytest.mark.asyncio
async def test_save_and_unsave_project(
    client: AsyncClient, auth_headers: dict, sample_project: ProjectRecommendation
):
    # Save
    res_save = await client.post(f"/api/v1/projects/{sample_project.id}/save", headers=auth_headers)
    assert res_save.status_code == 200
    assert res_save.json()["saved"] is True

    # Check saved list
    res_list = await client.get("/api/v1/projects/saved", headers=auth_headers)
    assert res_list.status_code == 200
    saved_items = res_list.json()
    assert any(s["project_id"] == sample_project.id for s in saved_items)

    # Unsave
    res_unsave = await client.delete(f"/api/v1/projects/{sample_project.id}/save", headers=auth_headers)
    assert res_unsave.status_code == 200
    assert res_unsave.json()["saved"] is False


@pytest.mark.asyncio
async def test_project_workspace_lifecycle(
    client: AsyncClient, auth_headers: dict, sample_project: ProjectRecommendation
):
    # 1. Start Project
    res_start = await client.post(f"/api/v1/projects/{sample_project.id}/start", headers=auth_headers)
    assert res_start.status_code == 200
    up = res_start.json()
    assert up["status"] == "IN_PROGRESS"
    assert up["progress"] == 0.0
    assert len(up["milestones"]) == 7
    first_m = up["milestones"][0]
    second_m = up["milestones"][1]

    user_proj_id = up["id"]

    # 2. Dependency validation check: Cannot complete second milestone before first
    res_invalid = await client.post(
        f"/api/v1/projects/user/{user_proj_id}/milestones/{second_m['id']}/complete",
        json={"actual_hours": 3.0},
        headers=auth_headers,
    )
    assert res_invalid.status_code == 400
    assert "Prerequisite" in res_invalid.json()["detail"]

    # 3. Complete first milestone
    res_m1 = await client.post(
        f"/api/v1/projects/user/{user_proj_id}/milestones/{first_m['id']}/complete",
        json={"actual_hours": 4.0},
        headers=auth_headers,
    )
    assert res_m1.status_code == 200
    up_after_m1 = res_m1.json()
    assert up_after_m1["progress"] > 0.0
    assert up_after_m1["milestones"][0]["status"] == "COMPLETED"

    # 4. Update deliverables
    res_deliv = await client.post(
        f"/api/v1/projects/user/{user_proj_id}/deliverables",
        json={"deliverables": {"readme": True, "tests": True}},
        headers=auth_headers,
    )
    assert res_deliv.status_code == 200
    assert res_deliv.json()["portfolio_readiness"] > 20.0

    # 5. Connect GitHub
    res_gh = await client.post(
        f"/api/v1/projects/user/{user_proj_id}/github",
        json={"repository_url": "https://github.com/candidate/rag-engine"},
        headers=auth_headers,
    )
    assert res_gh.status_code == 200
    assert res_gh.json()["github_data"]["connected"] is True

    # 6. Ask AI Mentor
    res_ai = await client.post(
        f"/api/v1/projects/user/{user_proj_id}/assistant",
        json={"message": "What should I work on next?"},
        headers=auth_headers,
    )
    assert res_ai.status_code == 200
    assert "response" in res_ai.json()
    assert len(res_ai.json()["response"]) > 20

    # 7. Quality Gate: Cannot complete project if milestones incomplete
    res_complete_fail = await client.post(
        f"/api/v1/projects/user/{user_proj_id}/complete",
        headers=auth_headers,
    )
    assert res_complete_fail.status_code == 400
