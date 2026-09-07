import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_assistant_chat_message(client: AsyncClient, auth_headers: dict):
    payload = {
        "content": "How should I prepare for a Python and FastAPI technical interview?",
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


@pytest.mark.asyncio
async def test_assistant_sessions_listing(client: AsyncClient, auth_headers: dict):
    res = await client.get("/api/v1/assistant/sessions", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
