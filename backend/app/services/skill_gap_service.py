from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.recommendation import SkillGap
from app.repositories.recommendation_repository import RecommendationRepository


class SkillGapService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.rec_repo = RecommendationRepository(session)

    async def get_skill_gaps(
        self,
        user_id: str,
        career_id: Optional[str] = None,
    ) -> List[SkillGap]:
        return await self.rec_repo.get_skill_gaps(user_id=user_id, career_id=career_id)
