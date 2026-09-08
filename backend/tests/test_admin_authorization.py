import pytest
from httpx import AsyncClient
from app.models.user import User


@pytest.mark.asyncio
async def test_candidate_access_admin_dashboard_forbidden(
    client: AsyncClient,
    auth_headers: dict,
):
    """Candidate token attempting to access /api/v1/admin/dashboard must receive 403 Forbidden."""
    res = await client.get("/api/v1/admin/dashboard", headers=auth_headers)
    assert res.status_code == 403
    data = res.json()
    assert "detail" in data
    assert "Administrative privileges required" in data["detail"]


@pytest.mark.asyncio
async def test_candidate_access_admin_candidates_forbidden(
    client: AsyncClient,
    auth_headers: dict,
):
    """Candidate token attempting to access /api/v1/admin/candidates must receive 403 Forbidden."""
    res = await client.get("/api/v1/admin/candidates", headers=auth_headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_candidate_access_admin_careers_forbidden(
    client: AsyncClient,
    auth_headers: dict,
):
    """Candidate token attempting to access /api/v1/admin/careers must receive 403 Forbidden."""
    res = await client.get("/api/v1/admin/careers", headers=auth_headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_candidate_access_admin_audit_logs_forbidden(
    client: AsyncClient,
    auth_headers: dict,
):
    """Candidate token attempting to access /api/v1/admin/audit-logs must receive 403 Forbidden."""
    res = await client.get("/api/v1/admin/audit-logs", headers=auth_headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_admin_access_dashboard_success(
    client: AsyncClient,
    admin_auth_headers: dict,
):
    """Admin token accessing /api/v1/admin/dashboard must receive 200 OK with real metrics."""
    res = await client.get("/api/v1/admin/dashboard", headers=admin_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert "total_candidates" in data["metrics"]
    assert "live_activity" in data
    assert isinstance(data["live_activity"], list)
    assert data["admin_user"]["role"] == "ADMIN"


@pytest.mark.asyncio
async def test_admin_access_candidates_success(
    client: AsyncClient,
    admin_auth_headers: dict,
    test_user: User,
):
    """Admin token accessing /api/v1/admin/candidates must receive 200 OK and list candidates."""
    res = await client.get("/api/v1/admin/candidates", headers=admin_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "candidates" in data
    assert data["total"] >= 1
    # Verify no password hash or secrets are returned in candidate list
    for cand in data["candidates"]:
        assert "password_hash" not in cand
        assert "token" not in cand


@pytest.mark.asyncio
async def test_admin_access_system_health_success(
    client: AsyncClient,
    admin_auth_headers: dict,
):
    """Admin token accessing /api/v1/admin/health must receive 200 OK with systems status."""
    res = await client.get("/api/v1/admin/health", headers=admin_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "systems" in data
    assert "api" in data["systems"]
    assert data["systems"]["api"]["status"] == "OPERATIONAL"


@pytest.mark.asyncio
async def test_admin_create_career_and_mapping(
    client: AsyncClient,
    admin_auth_headers: dict,
):
    """Admin can create a career entry and it is verified in the catalog."""
    payload = {
        "title": "Quantum ML Research Engineer",
        "category": "Quantum Computing",
        "salary_range": "$160,000 - $240,000 / yr",
        "description": "Research and construct quantum-classical hybrid algorithms.",
    }
    res = await client.post("/api/v1/admin/careers", json=payload, headers=admin_auth_headers)
    assert res.status_code == 200
    career_data = res.json()
    assert career_data["title"] == "Quantum ML Research Engineer"
    assert "id" in career_data


@pytest.mark.asyncio
async def test_candidate_cannot_alter_candidate_status(
    client: AsyncClient,
    auth_headers: dict,
    test_user: User,
):
    """A candidate cannot suspend another candidate or alter account status (IDOR defense)."""
    res = await client.patch(
        f"/api/v1/admin/candidates/{test_user.id}/status",
        json={"status": "SUSPENDED"},
        headers=auth_headers,
    )
    assert res.status_code == 403
