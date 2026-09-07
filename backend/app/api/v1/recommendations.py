from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.recommendation_service import RecommendationService
from app.services.skill_gap_service import SkillGapService
from app.schemas.recommendation import RecommendationResponse, SkillGapResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=List[RecommendationResponse])
async def get_my_recommendations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = RecommendationService(db)
    return await service.get_user_recommendations(current_user.id)


@router.post("/generate", response_model=List[RecommendationResponse])
async def generate_my_recommendations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = RecommendationService(db)
    return await service.generate_recommendations_for_user(current_user.id)


@router.get("/skill-gaps", response_model=List[SkillGapResponse])
async def get_my_skill_gaps(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    career_id: Optional[str] = None,
):
    gap_service = SkillGapService(db)
    return await gap_service.get_skill_gaps(user_id=current_user.id, career_id=career_id)
