import pytest
from httpx import AsyncClient
from app.models.career import Career
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_careers_catalog(client: AsyncClient, admin_auth_headers: dict):
    # 1. Admin creates a career
    career_payload = {
        "title": "Systems Architect",
        "slug": "systems-architect",
        "category": "Architecture",
        "description": "Designs large-scale distributed architectures and microservices.",
        "salary_range": "$140,000 - $220,000",
        "demand_level": "Very High",
        "experience_level": "Senior",
        "overview": "Oversees system reliability, fault-tolerance, and infrastructure scalability.",
        "education_reqs": "Bachelor's degree in Computer Science or equivalent.",
        "aptitude_reqs": {"LOGICAL": 85, "ANALYTICAL": 90},
        "common_job_titles": ["Principal Architect", "Enterprise Architect"],
    }
    create_res = await client.post(
        "/api/v1/careers",
        json=career_payload,
        headers=admin_auth_headers,
    )
    assert create_res.status_code == 200
    career_id = create_res.json()["id"]

    # 2. List careers
    list_res = await client.get("/api/v1/careers")
    assert list_res.status_code == 200
    careers = list_res.json()
    assert any(c["title"] == "Systems Architect" for c in careers)

    # 3. Get career by slug
    slug_res = await client.get("/api/v1/careers/slug/systems-architect")
    assert slug_res.status_code == 200
    assert slug_res.json()["id"] == career_id
