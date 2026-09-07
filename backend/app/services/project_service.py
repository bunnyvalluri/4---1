from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import ProjectRecommendation
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate


class ProjectService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.project_repo = ProjectRepository(session)

    async def list_projects(
        self,
        career_id: Optional[str] = None,
        difficulty: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[ProjectRecommendation]:
        return await self.project_repo.list_projects(
            career_id=career_id,
            difficulty=difficulty,
            skip=skip,
            limit=limit,
        )

    async def create_project(self, data: ProjectCreate) -> ProjectRecommendation:
        project = ProjectRecommendation(**data.model_dump())
        return await self.project_repo.create(project)
