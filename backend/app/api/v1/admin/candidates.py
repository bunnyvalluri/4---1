from typing import Annotated, Any, Dict, Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_admin, FirebaseUserWrapper
from app.models.user import User
from app.services.admin_candidate_service import AdminCandidateService
from app.services.admin_audit_service import AdminAuditService

router = APIRouter(prefix="/candidates", tags=["Admin Candidates"])


@router.get("")
async def list_candidates(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    search: Optional[str] = Query(None, description="Search by name or email"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> Dict[str, Any]:
    """Lists candidates with target career, profile completion, and status."""
    service = AdminCandidateService(db)
    return await service.list_candidates(search=search, limit=limit, offset=offset)


@router.get("/{candidate_id}")
async def get_candidate_detail(
    candidate_id: str,
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """
    Retrieves controlled candidate detail.
    Enforces authorization and records an audit log entry.
    Never exposes passwords or tokens.
    """
    service = AdminCandidateService(db)
    candidate = await service.get_candidate_detail(candidate_id)

    # Record audit log
    audit_service = AdminAuditService()
    audit_service.record_action(
        actor_id=admin.id,
        actor_role="ADMIN",
        action="CANDIDATE_VIEWED",
        resource_type="CANDIDATE",
        resource_id=candidate_id,
        details={"candidate_email": candidate.get("email")},
    )

    return candidate


@router.patch("/{candidate_id}/status")
async def update_candidate_status(
    candidate_id: str,
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """Suspends or activates candidate account."""
    status = payload.get("status", "ACTIVE")
    service = AdminCandidateService(db)
    res = await service.update_candidate_status(candidate_id, status)

    # Record audit log
    audit_service = AdminAuditService()
    audit_service.record_action(
        actor_id=admin.id,
        actor_role="ADMIN",
        action=f"CANDIDATE_{status.upper()}",
        resource_type="CANDIDATE",
        resource_id=candidate_id,
        details={"new_status": status},
    )

    return res
