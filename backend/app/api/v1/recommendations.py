"""
Career Recommendations API — FastAPI Router

Endpoints:
  GET  /recommendations                   List & filter enhanced recommendations
  POST /recommendations/generate          Generate recommendations (sync, legacy)
  POST /recommendations/recalculate       Async background recalculation + job tracking
  GET  /recommendations/status            Status check (staleness, completion, active job)
  GET  /recommendations/job/{job_id}      Real-time job progress
  GET  /recommendations/compare           Comparison matrix for 2–3 careers
  GET  /recommendations/skill-gaps        Skill gap list (optionally filtered by career)
"""
from typing import Annotated, List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.recommendation_service import RecommendationService
from app.services.skill_gap_service import SkillGapService
from app.schemas.recommendation import (
    RecommendationResponse,
    SkillGapResponse,
    RecommendationStatusResponse,
    RecalculateJobResponse,
    JobStatusResponse,
    CareerComparisonResponse,
    RecommendationsListResponse,
)

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


# ──────────────────────────────────────────────────────────────
# GET  /recommendations
# Enhanced list with search / category / sort / min_score filters
# ──────────────────────────────────────────────────────────────
@router.get("", response_model=RecommendationsListResponse)
async def get_my_recommendations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    search: Optional[str] = Query(default=None, description="Search career title"),
    category: Optional[str] = Query(default=None, description="Filter by career category"),
    sort_by: str = Query(default="match_score", description="match_score | skills_score | interests_score | lowest_gap"),
    min_score: Optional[float] = Query(default=None, description="Minimum match score (0-100)"),
):
    """
    Returns enriched, filtered, and ranked career recommendations for the
    authenticated user. Auto-generates if none exist.
    """
    svc = RecommendationService(db)
    result = await svc.get_user_recommendations_enhanced(
        user_id=current_user.id,
        search=search,
        category=category,
        sort_by=sort_by,
        min_score=min_score,
    )
    return result


# ──────────────────────────────────────────────────────────────
# GET  /recommendations/status
# ──────────────────────────────────────────────────────────────
@router.get("/status", response_model=RecommendationStatusResponse)
async def get_recommendation_status(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Returns the current recommendation status:
    - up_to_date | stale | generating | no_data | error
    - Last analyzed timestamp and relative time
    - Profile completion with missing items
    - Active background job ID (if any)
    """
    svc = RecommendationService(db)
    return await svc.get_recommendation_status(current_user.id)


# ──────────────────────────────────────────────────────────────
# POST /recommendations/recalculate
# Async background recalculation with job tracking
# ──────────────────────────────────────────────────────────────
@router.post("/recalculate", response_model=RecalculateJobResponse)
async def recalculate_recommendations(
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Starts an async background recommendation recalculation job.
    Returns a job_id immediately. Poll /recommendations/job/{job_id} for progress.
    Only one active job per user at a time.
    """
    svc = RecommendationService(db)

    # Prevent duplicate jobs
    existing_job = svc.get_active_job_for_user(current_user.id)
    if existing_job:
        return {
            "job_id": existing_job,
            "status": "processing",
            "message": "Recalculation already in progress",
        }

    job_id = svc.start_recalculate_job(current_user.id)
    background_tasks.add_task(svc.run_recalculate, job_id, current_user.id)

    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Recalculation started",
    }


# ──────────────────────────────────────────────────────────────
# GET  /recommendations/job/{job_id}
# Real-time job status polling
# ──────────────────────────────────────────────────────────────
@router.get("/job/{job_id}", response_model=JobStatusResponse)
async def get_job_status(
    job_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Returns real-time processing status for a recalculation job.
    Includes stage name, stage label, and progress (0–100 based on actual stages).
    """
    svc = RecommendationService(db)
    job = svc.get_job_status(job_id)

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found. It may have expired or never existed.",
        )

    # Security: only the owning user can view their job
    if job.get("user_id") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this job.",
        )

    return {
        "job_id": job_id,
        "status": job.get("status", "unknown"),
        "stage": job.get("stage"),
        "stage_label": job.get("stage_label"),
        "progress": job.get("progress", 0),
        "message": job.get("message"),
        "error": job.get("error"),
        "completed_at": job.get("completed_at"),
    }


# ──────────────────────────────────────────────────────────────
# GET  /recommendations/compare
# Career comparison matrix
# ──────────────────────────────────────────────────────────────
@router.get("/compare", response_model=CareerComparisonResponse)
async def compare_careers(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    careers: str = Query(description="Comma-separated list of 2–3 career IDs to compare"),
):
    """
    Returns a side-by-side compatibility comparison matrix for 2–3 careers.
    Includes match scores, factor breakdowns, skill gap analysis, and winner flags.
    """
    career_ids = [c.strip() for c in careers.split(",") if c.strip()]
    if len(career_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least 2 career IDs to compare.",
        )
    svc = RecommendationService(db)
    return await svc.compare_careers(current_user.id, career_ids)


# ──────────────────────────────────────────────────────────────
# GET  /recommendations/skill-gaps
# ──────────────────────────────────────────────────────────────
@router.get("/skill-gaps", response_model=List[SkillGapResponse])
async def get_my_skill_gaps(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    career_id: Optional[str] = None,
):
    """Returns skill gaps for the authenticated user, optionally filtered by career."""
    gap_service = SkillGapService(db)
    return await gap_service.get_skill_gaps(user_id=current_user.id, career_id=career_id)


# ──────────────────────────────────────────────────────────────
# POST /recommendations/generate  (legacy / sync)
# ──────────────────────────────────────────────────────────────
@router.post("/generate", response_model=List[RecommendationResponse])
async def generate_my_recommendations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Synchronously generates and persists recommendations. Use /recalculate for async."""
    service = RecommendationService(db)
    return await service.generate_recommendations_for_user(current_user.id)
