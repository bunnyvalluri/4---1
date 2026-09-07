from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundError
from app.models.roadmap import Roadmap, RoadmapItem
from app.repositories.roadmap_repository import RoadmapRepository
from app.repositories.career_repository import CareerRepository
from app.repositories.recommendation_repository import RecommendationRepository
from app.ai.roadmap_generator import ai_roadmap_generator
from app.schemas.roadmap import RoadmapItemUpdate


class RoadmapService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.roadmap_repo = RoadmapRepository(session)
        self.career_repo = CareerRepository(session)
        self.rec_repo = RecommendationRepository(session)

    async def get_or_generate_roadmap(
        self,
        user_id: str,
        career_id: str,
        duration_months: int = 6,
    ) -> Roadmap:
        existing = await self.roadmap_repo.get_by_user_and_career(user_id, career_id)
        if existing:
            return existing

        career = await self.career_repo.get_by_id(career_id)
        if not career:
            raise EntityNotFoundError("Career", career_id)

        # Get missing skills from skill gaps
        gaps = await self.rec_repo.get_skill_gaps(user_id, career_id)
        missing_skills = [g.skill.name for g in gaps if g.skill]

        roadmap = Roadmap(
            user_id=user_id,
            career_id=career_id,
            title=f"Path to {career.title}",
            description=f"Personalized {duration_months}-month mastery roadmap targeting critical skill gaps.",
            duration_months=duration_months,
            progress_percent=0.0,
            status="IN_PROGRESS",
        )
        self.session.add(roadmap)
        await self.session.flush()

        items_data = await ai_roadmap_generator.generate_roadmap_items(
            career_title=career.title,
            missing_skills=missing_skills,
            duration_months=duration_months,
        )

        for item in items_data:
            r_item = RoadmapItem(
                roadmap_id=roadmap.id,
                month=item["month"],
                title=item["title"],
                description=item["description"],
                skills=item["skills"],
                tasks=item["tasks"],
                is_completed=item["is_completed"],
                notes=item.get("notes", ""),
            )
            self.session.add(r_item)

        await self.session.flush()
        return await self.roadmap_repo.get_by_id(roadmap.id)

    async def get_user_roadmaps(self, user_id: str) -> List[Roadmap]:
        return await self.roadmap_repo.get_by_user_id(user_id)

    async def update_roadmap_item(
        self,
        item_id: str,
        update_data: RoadmapItemUpdate,
    ) -> RoadmapItem:
        item = await self.roadmap_repo.get_item_by_id(item_id)
        if not item:
            raise EntityNotFoundError("RoadmapItem", item_id)

        if update_data.is_completed is not None:
            item.is_completed = update_data.is_completed
            if update_data.is_completed:
                item.completed_at = datetime.now(timezone.utc)
            else:
                item.completed_at = None

        if update_data.tasks is not None:
            item.tasks = update_data.tasks

        if update_data.notes is not None:
            item.notes = update_data.notes

        await self.roadmap_repo.update_item(item)

        # Recalculate roadmap overall progress percentage
        roadmap = await self.roadmap_repo.get_by_id(item.roadmap_id)
        if roadmap and roadmap.items:
            completed_count = sum(1 for i in roadmap.items if i.is_completed)
            roadmap.progress_percent = round((completed_count / len(roadmap.items)) * 100.0, 1)
            if roadmap.progress_percent >= 100.0:
                roadmap.status = "COMPLETED"
            await self.session.flush()

        return item
