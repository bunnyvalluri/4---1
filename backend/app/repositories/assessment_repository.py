from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.assessment import AptitudeQuestion, AptitudeAttempt, AptitudeCategory


class AssessmentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_questions(
        self,
        category: Optional[AptitudeCategory] = None,
        limit: int = 25,
    ) -> List[AptitudeQuestion]:
        stmt = select(AptitudeQuestion)
        if category:
            stmt = stmt.where(AptitudeQuestion.category == category)
        stmt = stmt.limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_question_by_id(self, question_id: str) -> Optional[AptitudeQuestion]:
        stmt = select(AptitudeQuestion).where(AptitudeQuestion.id == question_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_attempt(self, attempt: AptitudeAttempt) -> AptitudeAttempt:
        self.session.add(attempt)
        await self.session.flush()
        return attempt

    async def get_user_attempts(self, user_id: str) -> List[AptitudeAttempt]:
        stmt = (
            select(AptitudeAttempt)
            .where(AptitudeAttempt.user_id == user_id)
            .order_by(AptitudeAttempt.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_latest_attempt(self, user_id: str) -> Optional[AptitudeAttempt]:
        stmt = (
            select(AptitudeAttempt)
            .where(AptitudeAttempt.user_id == user_id)
            .order_by(AptitudeAttempt.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
