from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.models.career import Career
from app.repositories.career_repository import CareerRepository
from app.schemas.career import CareerCreate, CareerFilter


class CareerService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.career_repo = CareerRepository(session)

    async def list_careers(
        self,
        category: Optional[str] = None,
        demand_level: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Career]:
        return await self.career_repo.list_careers(
            category=category,
            demand_level=demand_level,
            search=search,
            skip=skip,
            limit=limit,
        )

    async def get_career_by_id(self, career_id: str) -> Career:
        career = await self.career_repo.get_by_id(career_id)
        if not career:
            raise EntityNotFoundError("Career", career_id)
        return career

    async def get_career_by_slug(self, slug: str) -> Career:
        career = await self.career_repo.get_by_slug(slug)
        if not career:
            raise EntityNotFoundError("Career", slug)
        return career

    async def create_career(self, data: CareerCreate) -> Career:
        career = Career(**data.model_dump())
        return await self.career_repo.create(career)
