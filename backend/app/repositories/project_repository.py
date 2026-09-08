from typing import List, Optional
from sqlalchemy import select, or_, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.project import ProjectRecommendation, UserProject, UserProjectMilestone, SavedProject


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
        stmt = (
            select(ProjectRecommendation)
            .options(selectinload(ProjectRecommendation.career))
        )
        if career_id:
            stmt = stmt.where(ProjectRecommendation.career_id == career_id)
        if difficulty and difficulty.upper() != "ALL":
            stmt = stmt.where(ProjectRecommendation.difficulty.ilike(f"%{difficulty}%"))
        stmt = stmt.order_by(ProjectRecommendation.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_projects(
        self,
        query: Optional[str] = None,
        career_id: Optional[str] = None,
        difficulty: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[ProjectRecommendation]:
        stmt = (
            select(ProjectRecommendation)
            .options(selectinload(ProjectRecommendation.career))
        )
        if career_id:
            stmt = stmt.where(ProjectRecommendation.career_id == career_id)
        if difficulty and difficulty.upper() != "ALL":
            stmt = stmt.where(ProjectRecommendation.difficulty.ilike(f"%{difficulty}%"))
        if query and query.strip():
            q_term = f"%{query.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    ProjectRecommendation.title.ilike(q_term),
                    ProjectRecommendation.problem_statement.ilike(q_term),
                    ProjectRecommendation.expected_outcome.ilike(q_term),
                )
            )
        stmt = stmt.order_by(ProjectRecommendation.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, project_id: str) -> Optional[ProjectRecommendation]:
        stmt = (
            select(ProjectRecommendation)
            .where(ProjectRecommendation.id == project_id)
            .options(selectinload(ProjectRecommendation.career))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, project: ProjectRecommendation) -> ProjectRecommendation:
        self.session.add(project)
        await self.session.flush()
        return project

    # -------------------------------------------------------------
    # User Project Operations
    # -------------------------------------------------------------
    async def get_user_projects(self, user_id: str, status: Optional[str] = None) -> List[UserProject]:
        stmt = (
            select(UserProject)
            .where(UserProject.user_id == user_id)
            .options(
                selectinload(UserProject.project).selectinload(ProjectRecommendation.career),
                selectinload(UserProject.milestones),
            )
        )
        if status:
            stmt = stmt.where(UserProject.status == status)
        stmt = stmt.order_by(UserProject.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_user_project_by_id(self, user_id: str, user_project_id: str) -> Optional[UserProject]:
        stmt = (
            select(UserProject)
            .where(UserProject.id == user_project_id, UserProject.user_id == user_id)
            .options(
                selectinload(UserProject.project).selectinload(ProjectRecommendation.career),
                selectinload(UserProject.milestones),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_project_by_blueprint(self, user_id: str, project_id: str) -> Optional[UserProject]:
        stmt = (
            select(UserProject)
            .where(UserProject.user_id == user_id, UserProject.project_id == project_id)
            .options(
                selectinload(UserProject.project).selectinload(ProjectRecommendation.career),
                selectinload(UserProject.milestones),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user_project(self, user_project: UserProject) -> UserProject:
        self.session.add(user_project)
        await self.session.flush()
        return user_project

    async def get_milestone_by_id(self, milestone_id: str) -> Optional[UserProjectMilestone]:
        stmt = (
            select(UserProjectMilestone)
            .where(UserProjectMilestone.id == milestone_id)
            .options(selectinload(UserProjectMilestone.user_project))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    # -------------------------------------------------------------
    # Saved Project Operations
    # -------------------------------------------------------------
    async def get_saved_projects(self, user_id: str) -> List[SavedProject]:
        stmt = (
            select(SavedProject)
            .where(SavedProject.user_id == user_id)
            .options(selectinload(SavedProject.project).selectinload(ProjectRecommendation.career))
            .order_by(SavedProject.saved_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_saved_project(self, user_id: str, project_id: str) -> Optional[SavedProject]:
        stmt = select(SavedProject).where(
            SavedProject.user_id == user_id,
            SavedProject.project_id == project_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def save_project(self, user_id: str, project_id: str) -> SavedProject:
        existing = await self.get_saved_project(user_id, project_id)
        if existing:
            return existing
        saved = SavedProject(user_id=user_id, project_id=project_id)
        self.session.add(saved)
        await self.session.flush()
        return saved

    async def unsave_project(self, user_id: str, project_id: str) -> bool:
        stmt = delete(SavedProject).where(
            SavedProject.user_id == user_id,
            SavedProject.project_id == project_id,
        )
        await self.session.execute(stmt)
        await self.session.flush()
        return True
