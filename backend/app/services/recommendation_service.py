from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.recommendation import CareerRecommendation, SkillGap
from app.models.career import Career, CareerSkill
from app.models.skill import UserSkill, Skill
from app.models.profile import Profile
from app.repositories.recommendation_repository import RecommendationRepository
from app.repositories.assessment_repository import AssessmentRepository
from app.ml.feature_engineering import extract_user_features
from app.ml.recommendation_model import recommender_engine
from app.ai.career_recommender import ai_career_recommender
from app.ai.skill_analyzer import skill_analyzer


class RecommendationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.rec_repo = RecommendationRepository(session)
        self.assessment_repo = AssessmentRepository(session)

    async def generate_recommendations_for_user(self, user_id: str) -> List[CareerRecommendation]:
        # 1. Fetch user profile
        prof_stmt = select(Profile).where(Profile.user_id == user_id)
        profile = (await self.session.execute(prof_stmt)).scalar_one_or_none()
        profile_dict = {
            "bio": profile.bio if profile else "",
            "career_goals": profile.career_goals if profile else "",
            "interests": profile.interests if profile else [],
            "preferred_industries": profile.preferred_industries if profile else [],
            "preferred_roles": profile.preferred_roles if profile else [],
            "work_experience_years": profile.work_experience_years if profile else 0.0,
            "cgpa": profile.cgpa if profile else 7.5,
        }

        # 2. Fetch user skills
        skills_stmt = (
            select(UserSkill)
            .where(UserSkill.user_id == user_id)
            .options(selectinload(UserSkill.skill))
        )
        user_skills_objs = (await self.session.execute(skills_stmt)).scalars().all()
        skills_map = {
            us.skill.name.lower(): us.proficiency
            for us in user_skills_objs
            if us.skill
        }

        # 3. Fetch latest aptitude attempt
        latest_attempt = await self.assessment_repo.get_latest_attempt(user_id)
        aptitude_scores = {}
        if latest_attempt and latest_attempt.category_scores:
            for cat, data in latest_attempt.category_scores.items():
                if isinstance(data, dict):
                    aptitude_scores[cat.upper()] = float(data.get("percentage", 50.0))

        # 4. Extract features
        user_features = extract_user_features(
            profile_data=profile_dict,
            skills_map=skills_map,
            aptitude_scores=aptitude_scores,
        )

        # 5. Fetch all careers with their skills
        career_stmt = select(Career).options(
            selectinload(Career.skills).selectinload(CareerSkill.skill)
        )
        careers = (await self.session.execute(career_stmt)).scalars().all()

        careers_data = []
        for c in careers:
            c_skills = []
            for cs in c.skills:
                if cs.skill:
                    c_skills.append({
                        "skill_id": cs.skill_id,
                        "name": cs.skill.name,
                        "is_required": cs.is_required,
                        "min_proficiency": cs.min_proficiency,
                        "weight": cs.weight,
                    })
            careers_data.append({
                "id": c.id,
                "title": c.title,
                "category": c.category,
                "description": c.description,
                "overview": c.overview,
                "experience_level": c.experience_level,
                "aptitude_reqs": c.aptitude_reqs or {},
                "skills": c_skills,
            })

        # 6. Run Recommendation ML Engine
        ranked_results = recommender_engine.rank_careers(
            user_data=user_features,
            careers=careers_data,
        )

        saved_recs = []
        for rank_item in ranked_results[:10]:  # Top 10 careers
            career_id = rank_item["career_id"]
            # Save or update recommendation record
            rec = CareerRecommendation(
                user_id=user_id,
                career_id=career_id,
                match_score=rank_item["match_score"],
                matching_skills=rank_item["matching_skills"],
                missing_skills=rank_item["missing_skills"],
                reasoning=rank_item["reasoning"],
                breakdown=rank_item["breakdown"],
                recommended_actions=rank_item["recommended_actions"],
            )
            saved_rec = await self.rec_repo.upsert_recommendation(rec)
            saved_recs.append(saved_rec)

            # Generate and persist skill gaps for this career
            gap_data_list = skill_analyzer.analyze_gaps(
                user_id=user_id,
                career_id=career_id,
                missing_skills_data=rank_item["missing_skills"],
                career_skills=next(
                    (c["skills"] for c in careers_data if c["id"] == career_id), []
                ),
            )
            gaps = [
                SkillGap(
                    user_id=g["user_id"],
                    career_id=g["career_id"],
                    skill_id=g["skill_id"],
                    current_proficiency=g["current_proficiency"],
                    required_proficiency=g["required_proficiency"],
                    gap_severity=g["gap_severity"],
                    priority=g["priority"],
                    suggested_resource=g["suggested_resource"],
                )
                for g in gap_data_list
                if g.get("skill_id")
            ]
            await self.rec_repo.save_skill_gaps(user_id, career_id, gaps)

        return await self.rec_repo.get_by_user_id(user_id)

    async def get_user_recommendations(self, user_id: str) -> List[CareerRecommendation]:
        recs = await self.rec_repo.get_by_user_id(user_id)
        if not recs:
            # Auto-generate first set
            return await self.generate_recommendations_for_user(user_id)
        return recs
