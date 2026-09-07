from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.assessment import AptitudeCategory
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import (
    AptitudeQuestionResponse,
    SubmitAssessmentRequest,
    AssessmentResultResponse,
)

router = APIRouter(prefix="/assessment", tags=["Assessment"])


@router.get("/questions", response_model=List[AptitudeQuestionResponse])
async def get_questions(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[AptitudeCategory] = None,
    limit: int = Query(25, ge=1, le=50),
):
    service = AssessmentService(db)
    return await service.get_assessment_questions(category=category, limit=limit)


@router.post("/submit", response_model=AssessmentResultResponse)
async def submit_assessment(
    req: SubmitAssessmentRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssessmentService(db)
    return await service.evaluate_submission(current_user.id, req)


@router.get("/history", response_model=List[AssessmentResultResponse])
async def get_assessment_history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssessmentService(db)
    return await service.get_user_attempts(current_user.id)
