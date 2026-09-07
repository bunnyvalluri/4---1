import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login(client: AsyncClient):
    # 1. Register new user
    reg_payload = {
        "name": "Sarah Connor",
        "email": "sarah@resistance.org",
        "password": "StrongPassword123!",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, reg_res.text
    data = reg_res.json()
    assert "access_token" in data
    assert data["email"] == "sarah@resistance.org"
    token = data["access_token"]

    # 2. Access /me
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Sarah Connor"

    # 3. Login with credentials
    login_payload = {
        "email": "sarah@resistance.org",
        "password": "StrongPassword123!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


@pytest.mark.asyncio
async def test_invalid_login(client: AsyncClient):
    login_payload = {
        "email": "nonexistent@careerai.dev",
        "password": "WrongPassword!",
    }
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 401
