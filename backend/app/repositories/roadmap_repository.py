from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.roadmap import Roadmap, RoadmapItem


class RoadmapRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: str) -> List[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.user_id == user_id)
            .options(selectinload(Roadmap.items), selectinload(Roadmap.career))
            .order_by(Roadmap.updated_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_user_and_career(self, user_id: str, career_id: str) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.user_id == user_id, Roadmap.career_id == career_id)
            .options(selectinload(Roadmap.items), selectinload(Roadmap.career))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, roadmap_id: str) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.id == roadmap_id)
            .options(selectinload(Roadmap.items), selectinload(Roadmap.career))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, roadmap: Roadmap) -> Roadmap:
        self.session.add(roadmap)
        await self.session.flush()
        return roadmap

    async def get_active_by_user(self, user_id: str) -> Optional[Roadmap]:
        stmt = (
            select(Roadmap)
            .where(Roadmap.user_id == user_id, Roadmap.status == "ACTIVE")
            .options(selectinload(Roadmap.items), selectinload(Roadmap.career))
            .order_by(Roadmap.updated_at.desc())
        )
        result = await self.session.execute(stmt)
        active = result.scalar_one_or_none()
        if active:
            return active
        # Fallback to latest roadmap regardless of status
        stmt_any = (
            select(Roadmap)
            .where(Roadmap.user_id == user_id)
            .options(selectinload(Roadmap.items), selectinload(Roadmap.career))
            .order_by(Roadmap.updated_at.desc())
        )
        result_any = await self.session.execute(stmt_any)
        return result_any.scalars().first()

    async def get_item_with_roadmap(self, item_id: str) -> Optional[RoadmapItem]:
        stmt = (
            select(RoadmapItem)
            .where(RoadmapItem.id == item_id)
            .options(
                selectinload(RoadmapItem.roadmap).selectinload(Roadmap.items),
                selectinload(RoadmapItem.roadmap).selectinload(Roadmap.career),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_item(self, item: RoadmapItem) -> RoadmapItem:
        await self.session.flush()
        return item
