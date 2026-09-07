from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.career import Career, CareerSkill


class CareerRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, career_id: str, load_relations: bool = True) -> Optional[Career]:
        stmt = select(Career).where(Career.id == career_id)
        if load_relations:
            stmt = stmt.options(
                selectinload(Career.skills).selectinload(CareerSkill.skill),
                selectinload(Career.project_suggestions),
            )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str, load_relations: bool = True) -> Optional[Career]:
        stmt = select(Career).where(Career.slug == slug)
        if load_relations:
            stmt = stmt.options(
                selectinload(Career.skills).selectinload(CareerSkill.skill),
                selectinload(Career.project_suggestions),
            )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_careers(
        self,
        category: Optional[str] = None,
        demand_level: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Career]:
        stmt = select(Career)
        if category:
            stmt = stmt.where(Career.category.ilike(f"%{category}%"))
        if demand_level:
            stmt = stmt.where(Career.demand_level.ilike(f"%{demand_level}%"))
        if search:
            stmt = stmt.where(
                Career.title.ilike(f"%{search}%") | Career.description.ilike(f"%{search}%")
            )
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, career: Career) -> Career:
        self.session.add(career)
        await self.session.flush()
        return career

    async def count(self) -> int:
        from sqlalchemy import func
        stmt = select(func.count(Career.id))
        result = await self.session.execute(stmt)
        return result.scalar() or 0
