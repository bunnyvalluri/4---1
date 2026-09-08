from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.assessment import AptitudeCategory
from app.services.assessment_service import AssessmentService
from app.schemas.assessment import (
    AptitudeQuestionResponse,
    StartAssessmentRequest,
    StartAssessmentResponse,
    SaveAnswerRequest,
    ToggleFlagRequest,
    AssessmentReviewResponse,
    SubmitAssessmentRequest,
    AssessmentResultResponse,
    AssessmentStatusResponse,
)

router = APIRouter(tags=["Assessments"])


# =========================================================================
# 1. QUESTION CATALOG & STATUS
# =========================================================================

@router.get("/questions", response_model=List[AptitudeQuestionResponse])
async def get_questions(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[AptitudeCategory] = None,
    limit: int = Query(50, ge=1, le=100),
):
    """Retrieves sanitized assessment questions. Answers and explanations are strictly stripped."""
    service = AssessmentService(db)
    return await service.get_assessment_questions(category=category, limit=limit)


@router.get("/status", response_model=AssessmentStatusResponse)
async def get_assessment_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Checks the candidate's assessment status (IN_PROGRESS, COMPLETED, or NOT_STARTED)."""
    service = AssessmentService(db)
    return await service.get_assessment_status(current_user.id)


# =========================================================================
# 2. ATTEMPT LIFECYCLE & AUTOSAVE
# =========================================================================

@router.post("/start", response_model=StartAssessmentResponse)
async def start_assessment(
    req: StartAssessmentRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Starts a new assessment attempt or resumes an existing in-progress attempt."""
    service = AssessmentService(db)
    return await service.start_assessment(current_user.id, restart=req.restart)


@router.get("/attempts/{attempt_id}")
async def get_attempt(
    attempt_id: Annotated[str, Path(description="Attempt UUID")],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieves attempt details and verifies candidate ownership."""
    service = AssessmentService(db)
    attempt = await service.get_attempt(current_user.id, attempt_id)
    return {
        "id": attempt.id,
        "user_id": attempt.user_id,
        "status": attempt.status,
        "current_question_index": attempt.current_question_index,
        "answers": attempt.answers_data or {},
        "flagged_questions": attempt.flagged_questions or [],
        "section_progress": attempt.section_progress or {},
        "time_spent_seconds": attempt.time_spent_seconds or 0,
        "total_questions": attempt.total_questions,
        "started_at": attempt.started_at,
        "last_activity_at": attempt.last_activity_at,
    }


@router.post("/attempts/{attempt_id}/answers")
async def save_answer(
    attempt_id: Annotated[str, Path(description="Attempt UUID")],
    req: SaveAnswerRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Autosaves an answer choice. Updates local SQLite database and Cloud Firestore in real time."""
    service = AssessmentService(db)
    return await service.save_answer(current_user.id, attempt_id, req)


@router.post("/attempts/{attempt_id}/flag", response_model=List[str])
async def toggle_flag(
    attempt_id: Annotated[str, Path(description="Attempt UUID")],
    req: ToggleFlagRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Toggles question flag for review."""
    service = AssessmentService(db)
    return await service.toggle_flag(current_user.id, attempt_id, req)


@router.get("/attempts/{attempt_id}/review", response_model=AssessmentReviewResponse)
async def get_review_summary(
    attempt_id: Annotated[str, Path(description="Attempt UUID")],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Provides summary breakdown (answered, unanswered, flagged) before final submission."""
    service = AssessmentService(db)
    return await service.get_review_summary(current_user.id, attempt_id)


# =========================================================================
# 3. SUBMISSION & RESULTS
# =========================================================================

@router.post("/attempts/{attempt_id}/submit", response_model=AssessmentResultResponse)
async def submit_attempt(
    attempt_id: Annotated[str, Path(description="Attempt UUID")],
    req: SubmitAssessmentRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Evaluates submission, calculates cognitive scores, and updates downstream recommendations & skills."""
    service = AssessmentService(db)
    return await service.submit_and_score(current_user.id, attempt_id, req)


@router.get("/attempts/{attempt_id}/results", response_model=AssessmentResultResponse)
async def get_attempt_results(
    attempt_id: Annotated[str, Path(description="Attempt UUID")],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieves full results of a completed attempt, including answer explanations."""
    service = AssessmentService(db)
    return await service.get_attempt_results(current_user.id, attempt_id)


# =========================================================================
# 4. BACKWARD COMPATIBILITY ENDPOINTS (/submit, /history)
# =========================================================================

@router.post("/submit", response_model=AssessmentResultResponse)
async def submit_assessment_legacy(
    req: SubmitAssessmentRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Legacy submission endpoint. Automatically starts or resumes attempt, then submits."""
    service = AssessmentService(db)
    start_res = await service.start_assessment(current_user.id, restart=False)
    return await service.submit_and_score(current_user.id, start_res.attempt_id, req)


@router.get("/history", response_model=List[AssessmentResultResponse])
async def get_assessment_history(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns candidate's past assessment results."""
    service = AssessmentService(db)
    return await service.get_user_attempts(current_user.id)
