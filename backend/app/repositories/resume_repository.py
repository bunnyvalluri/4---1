from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.resume import ResumeAnalysis


class ResumeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, analysis_id: str) -> Optional[ResumeAnalysis]:
        stmt = select(ResumeAnalysis).where(ResumeAnalysis.id == analysis_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: str) -> List[ResumeAnalysis]:
        stmt = (
            select(ResumeAnalysis)
            .where(ResumeAnalysis.user_id == user_id)
            .order_by(ResumeAnalysis.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, analysis: ResumeAnalysis) -> ResumeAnalysis:
        self.session.add(analysis)
        await self.session.flush()
        return analysis
