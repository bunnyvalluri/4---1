import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_and_update_profile(client: AsyncClient, auth_headers: dict):
    # 1. Get initial profile (auto-created)
    res = await client.get("/api/v1/profile", headers=auth_headers)
    assert res.status_code == 200
    profile = res.json()
    assert "interests" in profile

    # 2. Update profile
    update_data = {
        "bio": "Cloud-native backend engineer and open-source contributor.",
        "degree": "B.S. Computer Science",
        "cgpa": 9.1,
        "interests": ["Distributed Systems", "Rust", "FastAPI"],
        "work_experience_years": 2.5,
    }
    update_res = await client.put("/api/v1/profile", json=update_data, headers=auth_headers)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["bio"] == update_data["bio"]
    assert updated["cgpa"] == 9.1
    assert "Rust" in updated["interests"]
