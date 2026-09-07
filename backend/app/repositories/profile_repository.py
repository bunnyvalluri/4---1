from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.profile import Profile


class ProfileRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: str) -> Optional[Profile]:
        stmt = select(Profile).where(Profile.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, profile: Profile) -> Profile:
        self.session.add(profile)
        await self.session.flush()
        return profile

    async def update(self, profile: Profile) -> Profile:
        await self.session.flush()
        return profile
