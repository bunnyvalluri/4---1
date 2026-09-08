from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.roadmap_service import RoadmapService
from app.schemas.roadmap import (
    RoadmapResponse,
    RoadmapGenerateRequest,
    RoadmapItemResponse,
    RoadmapItemUpdate,
    RoadmapSettingsUpdate,
    RoadmapRegenerateRequest,
    RoadmapProgressResponse,
)

router = APIRouter(prefix="", tags=["Roadmap"])


@router.get("", response_model=List[RoadmapResponse])
async def get_my_roadmaps(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns all roadmaps associated with the authenticated candidate."""
    service = RoadmapService(db)
    roadmaps = await service.roadmap_repo.get_by_user_id(current_user.id)
    results = []
    for r in roadmaps:
        formatted = await service._format_roadmap_response(r)
        results.append(formatted)
    return results


@router.get("/active", response_model=Optional[RoadmapResponse])
async def get_active_roadmap(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns candidate's current active curriculum roadmap."""
    service = RoadmapService(db)
    return await service.get_active_roadmap(current_user.id)


@router.post("/generate", response_model=RoadmapResponse)
async def generate_career_roadmap(
    req: RoadmapGenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Synthesizes or retrieves personalized curriculum based on profile, skills, and target career."""
    service = RoadmapService(db)
    return await service.get_or_generate_roadmap(
        user_id=current_user.id,
        career_id=req.career_id,
        duration_months=req.duration_months or 6,
        hours_per_week=req.hours_per_week or 10,
        learning_pace=req.learning_pace or "balanced",
    )


@router.get("/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap_by_id(
    roadmap_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Retrieves specific roadmap with verification of candidate ownership."""
    service = RoadmapService(db)
    return await service.get_roadmap_by_id(current_user.id, roadmap_id)


@router.get("/{roadmap_id}/progress", response_model=RoadmapProgressResponse)
async def get_roadmap_progress(
    roadmap_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns overall progress percentage, career readiness, and active milestone metrics."""
    service = RoadmapService(db)
    return await service.get_roadmap_progress(current_user.id, roadmap_id)


@router.patch("/{roadmap_id}/settings", response_model=RoadmapResponse)
async def update_roadmap_settings(
    roadmap_id: str,
    req: RoadmapSettingsUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Updates hours per week and pace, recalibrating the estimated completion date."""
    service = RoadmapService(db)
    return await service.update_settings(current_user.id, roadmap_id, req)


@router.post("/{roadmap_id}/regenerate", response_model=RoadmapResponse)
async def regenerate_roadmap(
    roadmap_id: str,
    req: RoadmapRegenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Archives existing roadmap and produces a new version calibrated to latest skill evidence."""
    service = RoadmapService(db)
    return await service.regenerate_roadmap(current_user.id, roadmap_id, req)


@router.post("/items/{item_id}/start", response_model=RoadmapItemResponse)
async def start_roadmap_item(
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Transitions item to IN_PROGRESS after enforcing prerequisite dependency completion."""
    service = RoadmapService(db)
    return await service.start_roadmap_item(current_user.id, item_id)


@router.post("/items/{item_id}/complete", response_model=RoadmapItemResponse)
async def complete_roadmap_item(
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Completes item, unlocks downstream dependencies, updates verified skill evidence, and recalculates readiness."""
    service = RoadmapService(db)
    return await service.complete_roadmap_item(current_user.id, item_id)


@router.post("/items/{item_id}/skip", response_model=RoadmapItemResponse)
async def skip_roadmap_item(
    item_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Safely skips a non-essential item and satisfies dependency progression."""
    service = RoadmapService(db)
    return await service.skip_roadmap_item(current_user.id, item_id)


@router.post("/items/{item_id}/resources/{resource_id}/complete", response_model=RoadmapItemResponse)
async def complete_roadmap_resource(
    item_id: str,
    resource_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Tracks consumption and completion of external learning documentation or tutorial resources."""
    service = RoadmapService(db)
    return await service.complete_resource(current_user.id, item_id, resource_id)


@router.patch("/items/{item_id}", response_model=RoadmapItemResponse)
async def update_roadmap_item(
    item_id: str,
    req: RoadmapItemUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Backward-compatible update for personal notes, subtasks, or toggle completion."""
    service = RoadmapService(db)
    return await service.update_roadmap_item(item_id, req, user_id=current_user.id)
