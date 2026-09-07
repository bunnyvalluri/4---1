from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.models.profile import Profile
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import ProfileCreate, ProfileUpdate


class ProfileService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.profile_repo = ProfileRepository(session)

    async def get_profile(self, user_id: str) -> Profile:
        profile = await self.profile_repo.get_by_user_id(user_id)
        if not profile:
            # Auto-create if not yet generated
            profile = Profile(user_id=user_id)
            profile = await self.profile_repo.create(profile)
        return profile

    async def update_profile(self, user_id: str, req: ProfileUpdate) -> Profile:
        profile = await self.get_profile(user_id)
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)
        await self.profile_repo.update(profile)
        await self.session.refresh(profile)
        return profile
