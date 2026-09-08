from typing import Annotated, Any, Dict, Optional
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_admin, FirebaseUserWrapper
from app.models.user import User
from app.services.admin_assessment_service import AdminAssessmentService
from app.services.admin_audit_service import AdminAuditService

router = APIRouter(prefix="/assessments", tags=["Admin Assessments"])


@router.get("/questions")
async def list_questions(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> Dict[str, Any]:
    """Lists questions from the Question Bank."""
    service = AdminAssessmentService(db)
    return await service.list_questions(category=category, limit=limit, offset=offset)


@router.post("/questions")
async def create_question(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, Any]:
    """Creates a new validated question in the Question Bank."""
    service = AdminAssessmentService(db)
    result = await service.create_question(payload)

    audit_service = AdminAuditService()
    audit_service.record_action(
        actor_id=admin.id,
        actor_role="ADMIN",
        action="QUESTION_CREATED",
        resource_type="ASSESSMENT_QUESTION",
        resource_id=str(result.get("id")),
        details={"category": payload.get("category")},
    )

    return result


@router.get("/analytics")
async def get_assessment_analytics(
    admin: Annotated[User | FirebaseUserWrapper, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Returns attempts, completion rate, and category performance analytics."""
    service = AdminAssessmentService(db)
    return await service.get_assessment_analytics()
