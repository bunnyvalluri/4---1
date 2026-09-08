from typing import Any, Dict, List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.career import Career, CareerSkill
from app.models.skill import Skill
from app.core.exceptions import ResourceNotFoundError, ValidationError
from app.core.logging import logger


class AdminCareerService:
    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db

    async def list_careers(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Lists careers with mapped required skills."""
        if self.db is None:
            return []

        query = select(Career).options(
            selectinload(Career.skills).joinedload(CareerSkill.skill)
        )
        if search:
            query = query.where(Career.title.ilike(f"%{search.strip()}%"))

        careers = (await self.db.execute(query.order_by(Career.title))).scalars().all()

        results = []
        for c in careers:
            mapped_skills = [
                {
                    "skill_id": cs.skill.id,
                    "name": cs.skill.name,
                    "is_required": cs.is_required,
                    "min_proficiency": cs.min_proficiency,
                    "weight": cs.weight,
                }
                for cs in c.skills if cs.skill
            ]
            results.append({
                "id": c.id,
                "title": c.title,
                "slug": c.slug,
                "category": c.category,
                "description": c.description,
                "salary_range": c.salary_range,
                "demand_level": c.demand_level,
                "experience_level": c.experience_level,
                "required_skills": mapped_skills,
                "skill_count": len(mapped_skills),
            })
        return results

    async def create_career(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new career entry in the catalog."""
        if self.db is None:
            raise ValidationError("Database session required.")

        title = data.get("title", "").strip()
        if not title:
            raise ValidationError("Career title is required.")

        slug = data.get("slug") or title.lower().replace(" ", "-").replace("/", "-")
        category = data.get("category", "Technology")
        description = data.get("description", "Dynamic professional career path.")
        salary_range = data.get("salary_range", "$95,000 - $160,000 / yr")
        demand_level = data.get("demand_level", "High")
        experience_level = data.get("experience_level", "Entry / Mid")
        overview = data.get("overview", description)
        education_reqs = data.get("education_reqs", "Bachelor's degree in relevant field or equivalent experience.")

        new_career = Career(
            id=uuid.uuid4().hex,
            title=title,
            slug=slug,
            category=category,
            description=description,
            salary_range=salary_range,
            demand_level=demand_level,
            experience_level=experience_level,
            overview=overview,
            education_reqs=education_reqs,
            aptitude_reqs={},
            common_job_titles=[title],
        )
        self.db.add(new_career)
        await self.db.commit()
        await self.db.refresh(new_career)

        return {
            "id": new_career.id,
            "title": new_career.title,
            "slug": new_career.slug,
            "category": new_career.category,
            "message": "Career successfully created in catalog.",
        }

    async def update_career_skill_mapping(
        self,
        career_id: str,
        skill_id: str,
        min_proficiency: int = 3,
        weight: float = 1.0,
        is_required: bool = True,
    ) -> Dict[str, Any]:
        """Maps a skill, proficiency requirement, and importance weight to a career."""
        if self.db is None:
            raise ValidationError("Database session required.")

        career = (await self.db.execute(select(Career).where(Career.id == career_id))).scalar_one_or_none()
        if not career:
            raise ResourceNotFoundError(f"Career '{career_id}' not found.")

        skill = (await self.db.execute(select(Skill).where(Skill.id == skill_id))).scalar_one_or_none()
        if not skill:
            raise ResourceNotFoundError(f"Skill '{skill_id}' not found.")

        q = select(CareerSkill).where(
            CareerSkill.career_id == career_id,
            CareerSkill.skill_id == skill_id
        )
        existing = (await self.db.execute(q)).scalar_one_or_none()

        if existing:
            existing.min_proficiency = min_proficiency
            existing.weight = weight
            existing.is_required = is_required
        else:
            new_mapping = CareerSkill(
                career_id=career_id,
                skill_id=skill_id,
                min_proficiency=min_proficiency,
                weight=weight,
                is_required=is_required,
            )
            self.db.add(new_mapping)

        await self.db.commit()
        return {
            "career_id": career_id,
            "skill_id": skill_id,
            "min_proficiency": min_proficiency,
            "weight": weight,
            "is_required": is_required,
            "message": "Career-skill mapping updated successfully."
        }
