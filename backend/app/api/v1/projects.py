from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.project_service import ProjectService
from app.schemas.project import ProjectResponse, ProjectCreate
from app.api.deps import get_current_admin
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    career_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    service = ProjectService(db)
    return await service.list_projects(
        career_id=career_id,
        difficulty=difficulty,
        skip=skip,
        limit=limit,
    )


@router.post("", response_model=ProjectResponse)
async def create_project(
    data: ProjectCreate,
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = ProjectService(db)
    return await service.create_project(data)
