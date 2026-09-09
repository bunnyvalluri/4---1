import pytest
from httpx import AsyncClient
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_assistant_chat_message(client: AsyncClient, auth_headers: dict):
    payload = {
        "content": "How should I prepare for a Python and FastAPI technical interview?",
        "mode": "standard",
    }
    res = await client.post(
        "/api/v1/assistant/message",
        json=payload,
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "assistant"
    assert "FastAPI" in data["content"] or "Python" in data["content"] or len(data["content"]) > 20
    assert "actions" in data


@pytest.mark.asyncio
async def test_assistant_sessions_listing(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/assistant/sessions", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@pytest.mark.asyncio
async def test_assistant_career_context(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/assistant/context", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "user_id" in data
    assert "user_name" in data
    assert "suggested_prompts" in data
    assert isinstance(data["suggested_prompts"], list)


@pytest.mark.asyncio
async def test_assistant_session_lifecycle(client: AsyncClient, auth_headers: dict):
    # 1. Create session
    create_res = await client.post(
        "/api/v1/assistant/sessions",
        json={"title": "MLOps Architecture Planning", "mode": "standard"},
        headers=auth_headers,
    )
    assert create_res.status_code == 200
    session_data = create_res.json()
    session_id = session_data["id"]
    assert session_data["title"] == "MLOps Architecture Planning"

    # 2. Get session detail
    detail_res = await client.get(f"/api/v1/assistant/sessions/{session_id}", headers=auth_headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == session_id

    # 3. Patch session (rename)
    patch_res = await client.patch(
        f"/api/v1/assistant/sessions/{session_id}",
        json={"title": "Senior MLOps Roadmap Review"},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["title"] == "Senior MLOps Roadmap Review"

    # 4. Delete session
    del_res = await client.delete(f"/api/v1/assistant/sessions/{session_id}", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 5. Verify deleted session returns 404
    get_deleted = await client.get(f"/api/v1/assistant/sessions/{session_id}", headers=auth_headers)
    assert get_deleted.status_code == 404


@pytest.mark.asyncio
async def test_assistant_session_cross_user_isolation(client: AsyncClient, auth_headers: dict):
    # Create session as User A
    create_res = await client.post(
        "/api/v1/assistant/sessions",
        json={"title": "User A Private Session"},
        headers=auth_headers,
    )
    assert create_res.status_code == 200
    session_id = create_res.json()["id"]

    # Seed User B
    from tests.conftest import TestSessionLocal
    from app.models.user import User, Role
    from app.core.security import get_password_hash

    async with TestSessionLocal() as session:
        user_b = User(
            name="User B Engineer",
            email="user_b_assistant@careerai.dev",
            password_hash=get_password_hash("SecretPass123"),
            role=Role.USER,
        )
        session.add(user_b)
        await session.commit()
        await session.refresh(user_b)
        user_b_id = user_b.id

    user_b_token = create_access_token(
        subject=user_b_id,
        role="USER",
    )
    user_b_headers = {"Authorization": f"Bearer {user_b_token}"}

    # User B attempting to access User A's session must be forbidden
    res = await client.get(f"/api/v1/assistant/sessions/{session_id}", headers=user_b_headers)
    assert res.status_code == 403

    # User B attempting to delete User A's session must be forbidden
    del_res = await client.delete(f"/api/v1/assistant/sessions/{session_id}", headers=user_b_headers)
    assert del_res.status_code == 403


@pytest.mark.asyncio
async def test_assistant_action_execution(client: AsyncClient, auth_headers: dict):
    # Test navigation action
    res = await client.post(
        "/api/v1/assistant/actions/execute",
        json={"action_type": "OPEN_ROADMAP"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["action_type"] == "OPEN_ROADMAP"
    assert data["data"]["route"] == "/roadmap"
