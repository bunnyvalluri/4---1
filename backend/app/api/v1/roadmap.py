from typing import Annotated, List
from fastapi import APIRouter, Depends
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
)

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


@router.get("", response_model=List[RoadmapResponse])
async def get_my_roadmaps(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = RoadmapService(db)
    return await service.get_user_roadmaps(current_user.id)


@router.post("/generate", response_model=RoadmapResponse)
async def generate_career_roadmap(
    req: RoadmapGenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = RoadmapService(db)
    return await service.get_or_generate_roadmap(
        user_id=current_user.id,
        career_id=req.career_id,
        duration_months=req.duration_months or 6,
    )


@router.patch("/items/{item_id}", response_model=RoadmapItemResponse)
async def update_roadmap_item(
    item_id: str,
    req: RoadmapItemUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = RoadmapService(db)
    return await service.update_roadmap_item(item_id, req)
