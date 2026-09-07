from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.services.career_service import CareerService
from app.schemas.career import CareerResponse, CareerDetailResponse, CareerCreate

router = APIRouter(prefix="/careers", tags=["Careers"])


@router.get("", response_model=List[CareerResponse])
async def list_careers(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Optional[str] = None,
    demand_level: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
):
    service = CareerService(db)
    return await service.list_careers(
        category=category,
        demand_level=demand_level,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/slug/{slug}", response_model=CareerDetailResponse)
async def get_career_by_slug(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = CareerService(db)
    return await service.get_career_by_slug(slug)


@router.get("/{career_id}", response_model=CareerDetailResponse)
async def get_career_by_id(
    career_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = CareerService(db)
    return await service.get_career_by_id(career_id)


@router.post("", response_model=CareerResponse)
async def create_career(
    data: CareerCreate,
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = CareerService(db)
    return await service.create_career(data)
