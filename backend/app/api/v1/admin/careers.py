from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_admin, FirebaseUserWrapper
from app.models.user import User
from app.services.admin_career_service import AdminCareerService
from app.services.admin_audit_service import AdminAuditService

router = APIRouter(prefix="/careers", tags=["Admin Careers"])


@router.get("")
async def list_admin_careers(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    search: Optional[str] = Query(None),
) -> List[Dict[str, Any]]:
    """Lists careers and mapped skill requirements."""
    service = AdminCareerService(db)
    return await service.list_careers(search=search)


@router.post("")
async def create_career(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """Creates a new career entry in the catalog."""
    service = AdminCareerService(db)
    result = await service.create_career(payload)

    audit_service = AdminAuditService()
    audit_service.record_action(
        actor_id=admin.id,
        actor_role="ADMIN",
        action="CAREER_CREATED",
        resource_type="CAREER",
        resource_id=result.get("id"),
        details={"title": payload.get("title")},
    )

    return result


@router.post("/{career_id}/skills")
async def update_career_skill_mapping(
    career_id: str,
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """Maps a required skill, level, and importance to a career."""
    skill_id = payload.get("skill_id")
    required_level = payload.get("required_level", "INTERMEDIATE")
    importance = float(payload.get("importance", 1.0))

    service = AdminCareerService(db)
    result = await service.update_career_skill_mapping(
        career_id=career_id,
        skill_id=skill_id,
        required_level=required_level,
        importance=importance,
    )

    audit_service = AdminAuditService()
    audit_service.record_action(
        actor_id=admin.id,
        actor_role="ADMIN",
        action="CAREER_SKILL_MAPPED",
        resource_type="CAREER_SKILL",
        resource_id=career_id,
        details={"skill_id": skill_id, "level": required_level, "importance": importance},
    )

    return result
