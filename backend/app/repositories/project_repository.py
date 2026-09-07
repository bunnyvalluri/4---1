from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.project import ProjectRecommendation


class ProjectRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_projects(
        self,
        career_id: Optional[str] = None,
        difficulty: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[ProjectRecommendation]:
        stmt = select(ProjectRecommendation)
        if career_id:
            stmt = stmt.where(ProjectRecommendation.career_id == career_id)
        if difficulty:
            stmt = stmt.where(ProjectRecommendation.difficulty.ilike(f"%{difficulty}%"))
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, project_id: str) -> Optional[ProjectRecommendation]:
        stmt = select(ProjectRecommendation).where(ProjectRecommendation.id == project_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, project: ProjectRecommendation) -> ProjectRecommendation:
        self.session.add(project)
        await self.session.flush()
        return project
