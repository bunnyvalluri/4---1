from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.recommendation import CareerRecommendation, SkillGap
from app.models.career import Career


class RecommendationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: str) -> List[CareerRecommendation]:
        stmt = (
            select(CareerRecommendation)
            .where(CareerRecommendation.user_id == user_id)
            .options(selectinload(CareerRecommendation.career))
            .order_by(CareerRecommendation.match_score.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def upsert_recommendation(self, rec: CareerRecommendation) -> CareerRecommendation:
        # Check if exists
        stmt = select(CareerRecommendation).where(
            CareerRecommendation.user_id == rec.user_id,
            CareerRecommendation.career_id == rec.career_id,
        )
        existing = (await self.session.execute(stmt)).scalar_one_or_none()
        if existing:
            existing.match_score = rec.match_score
            existing.matching_skills = rec.matching_skills
            existing.missing_skills = rec.missing_skills
            existing.reasoning = rec.reasoning
            existing.breakdown = rec.breakdown
            existing.recommended_actions = rec.recommended_actions
            await self.session.flush()
            return existing
        else:
            self.session.add(rec)
            await self.session.flush()
            return rec

    async def get_skill_gaps(self, user_id: str, career_id: Optional[str] = None) -> List[SkillGap]:
        stmt = select(SkillGap).where(SkillGap.user_id == user_id).options(
            selectinload(SkillGap.skill),
            selectinload(SkillGap.career),
        )
        if career_id:
            stmt = stmt.where(SkillGap.career_id == career_id)
        stmt = stmt.order_by(SkillGap.priority.asc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def save_skill_gaps(self, user_id: str, career_id: str, gaps: List[SkillGap]) -> None:
        # Delete old gaps for user & career
        delete_stmt = delete(SkillGap).where(
            SkillGap.user_id == user_id,
            SkillGap.career_id == career_id,
        )
        await self.session.execute(delete_stmt)
        for gap in gaps:
            self.session.add(gap)
        await self.session.flush()
