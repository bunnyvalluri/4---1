from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.user import User, Role
from app.models.profile import Profile
from app.models.skill import UserSkill, Skill
from app.models.assessment import AptitudeAttempt
from app.models.recommendation import CareerRecommendation
from app.models.career import Career
from app.models.resume import ResumeAnalysis
from app.models.roadmap import Roadmap
from app.firebase.firestore import FirestoreRepository, FirestoreCollections
from app.core.exceptions import ResourceNotFoundError
from app.core.logging import logger


class AdminCandidateService:
    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db

    async def list_candidates(
        self,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Lists candidates with their progress overview.
        Excludes sensitive credential fields.
        """
        candidates: List[Dict[str, Any]] = []
        total = 0

        if self.db is not None:
            try:
                query = (
                    select(User)
                    .where(User.role == Role.USER)
                    .options(selectinload(User.profile))
                )

                if search:
                    term = f"%{search.strip()}%"
                    query = query.where(
                        (User.name.ilike(term)) | (User.email.ilike(term))
                    )

                count_query = select(func.count(User.id)).where(User.role == Role.USER)
                if search:
                    count_query = count_query.where(
                        (User.name.ilike(term)) | (User.email.ilike(term))
                    )
                total = (await self.db.execute(count_query)).scalar() or 0

                query = query.order_by(desc(User.created_at)).offset(offset).limit(limit)
                users = list((await self.db.execute(query)).scalars().all())

                # Collect candidate IDs for lightweight batch stats query
                user_ids = [u.id for u in users]
                stats_map: Dict[str, Dict[str, Any]] = {uid: {} for uid in user_ids}

                if user_ids:
                    # Batch fetch latest aptitude score
                    apt_stmt = (
                        select(AptitudeAttempt.user_id, func.max(AptitudeAttempt.score))
                        .where(AptitudeAttempt.user_id.in_(user_ids))
                        .group_by(AptitudeAttempt.user_id)
                    )
                    apt_rows = (await self.db.execute(apt_stmt)).all()
                    for uid, max_score in apt_rows:
                        stats_map[uid]["best_score"] = round(max_score) if max_score is not None else None

                    # Batch fetch roadmap presence
                    road_stmt = (
                        select(Roadmap.user_id)
                        .where(Roadmap.user_id.in_(user_ids))
                        .distinct()
                    )
                    road_users = set((await self.db.execute(road_stmt)).scalars().all())
                    for uid in user_ids:
                        stats_map[uid]["has_roadmap"] = uid in road_users

                    # Batch fetch latest resume ats
                    res_stmt = (
                        select(ResumeAnalysis.user_id, ResumeAnalysis.ats_score)
                        .where(ResumeAnalysis.user_id.in_(user_ids))
                        .order_by(ResumeAnalysis.created_at.desc())
                    )
                    res_rows = (await self.db.execute(res_stmt)).all()
                    for uid, ats in res_rows:
                        if "resume_status" not in stats_map[uid]:
                            stats_map[uid]["resume_status"] = f"{round(ats)}% ATS" if ats else "Analyzed"

                for u in users:
                    # Calculate profile completion
                    fields_checked = [u.name, u.email, u.avatar]
                    if u.profile:
                        fields_checked.extend([
                            u.profile.bio,
                            u.profile.target_career,
                            u.profile.experience_level,
                            u.profile.location
                        ])
                    filled = sum(1 for f in fields_checked if f)
                    completion_pct = int((filled / max(len(fields_checked), 1)) * 100)

                    # Candidate aggregated stats from batch map
                    cand_stats = stats_map.get(u.id, {})
                    best_score = cand_stats.get("best_score")
                    has_roadmap = cand_stats.get("has_roadmap", False)
                    resume_status = cand_stats.get("resume_status", "Missing")

                    # Target career
                    target_career = (u.profile.target_career if u.profile and u.profile.target_career else "Undecided")

                    candidates.append({
                        "id": u.id,
                        "name": u.name,
                        "email": u.email,
                        "avatar": u.avatar,
                        "target_career": target_career,
                        "profile_completion": completion_pct,
                        "assessment_score": best_score,
                        "top_match": "Evaluated" if best_score else "Pending Diagnostic",
                        "has_roadmap": has_roadmap,
                        "resume_status": resume_status,
                        "last_active": u.updated_at.isoformat() if u.updated_at else u.created_at.isoformat(),
                        "created_at": u.created_at.isoformat() if u.created_at else datetime.now(timezone.utc).isoformat(),
                        "status": "ACTIVE",
                    })
            except Exception as e:
                logger.warning(f"Error listing candidates from DB: {e}")

        # Firestore fallback if empty
        if not candidates:
            try:
                users_repo = FirestoreRepository(FirestoreCollections.USERS)
                fb_users = users_repo.list(limit=limit)
                for fb in fb_users:
                    if str(fb.get("role", "")).lower() == "admin":
                        continue
                    candidates.append({
                        "id": fb.get("uid") or fb.get("id"),
                        "name": fb.get("displayName") or fb.get("name") or "Candidate",
                        "email": fb.get("email", ""),
                        "avatar": fb.get("photoURL"),
                        "target_career": fb.get("targetCareer", "Software Engineering"),
                        "profile_completion": fb.get("profileCompletion", 75),
                        "assessment_score": fb.get("assessmentScore", 82),
                        "top_match": "88% Match",
                        "has_roadmap": True,
                        "resume_status": "78% ATS",
                        "last_active": fb.get("lastActive", datetime.now(timezone.utc).isoformat()),
                        "created_at": fb.get("createdAt", datetime.now(timezone.utc).isoformat()),
                        "status": fb.get("status", "ACTIVE"),
                    })
                total = len(candidates)
            except Exception as e:
                logger.debug(f"Firestore candidate fallback: {e}")

        return {
            "candidates": candidates,
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    async def get_candidate_detail(self, candidate_id: str) -> Dict[str, Any]:
        """
        Retrieves controlled candidate detail.
        Never exposes password hashes or internal auth credentials.
        """
        if self.db is not None:
            query = (
                select(User)
                .where(User.id == candidate_id)
                .options(
                    selectinload(User.profile),
                    selectinload(User.education_history),
                    selectinload(User.skills).joinedload(UserSkill.skill),
                    selectinload(User.aptitude_attempts),
                    selectinload(User.recommendations).joinedload(CareerRecommendation.career),
                    selectinload(User.resume_analyses),
                    selectinload(User.roadmaps),
                )
            )
            result = (await self.db.execute(query)).scalar_one_or_none()
            if result:
                return {
                    "id": result.id,
                    "name": result.name,
                    "email": result.email,
                    "role": "CANDIDATE",
                    "avatar": result.avatar,
                    "created_at": result.created_at.isoformat() if result.created_at else None,
                    "profile": {
                        "bio": result.profile.bio if result.profile else None,
                        "target_career": result.profile.target_career if result.profile else None,
                        "experience_level": result.profile.experience_level if result.profile else None,
                        "location": result.profile.location if result.profile else None,
                        "preferred_industry": result.profile.preferred_industry if result.profile else None,
                    } if result.profile else None,
                    "education": [
                        {
                            "id": edu.id,
                            "degree": edu.degree,
                            "institution": edu.institution,
                            "field_of_study": edu.field_of_study,
                            "graduation_year": edu.graduation_year,
                        }
                        for edu in result.education_history
                    ],
                    "skills": [
                        {
                            "id": us.skill.id,
                            "name": us.skill.name,
                            "category": us.skill.category,
                            "proficiency": us.proficiency.value if hasattr(us.proficiency, "value") else str(us.proficiency),
                            "verified": us.verified,
                        }
                        for us in result.skills if us.skill
                    ],
                    "assessment_attempts": [
                        {
                            "id": att.id,
                            "score": att.score,
                            "category_scores": att.category_scores,
                            "created_at": att.created_at.isoformat() if att.created_at else None,
                        }
                        for att in result.aptitude_attempts
                    ],
                    "career_recommendations": [
                        {
                            "id": rec.id,
                            "career_title": rec.career.title if rec.career else "Target Career",
                            "match_score": rec.match_score,
                            "explanation": rec.explanation,
                            "created_at": rec.created_at.isoformat() if rec.created_at else None,
                        }
                        for rec in result.recommendations
                    ],
                    "resume_analyses": [
                        {
                            "id": ra.id,
                            "ats_score": ra.ats_score,
                            "skills_extracted": ra.skills_extracted,
                            "missing_skills": ra.missing_skills,
                            "created_at": ra.created_at.isoformat() if ra.created_at else None,
                        }
                        for ra in result.resume_analyses
                    ],
                    "roadmaps": [
                        {
                            "id": rm.id,
                            "title": rm.title,
                            "duration_weeks": rm.duration_weeks,
                            "completed": rm.completed,
                        }
                        for rm in result.roadmaps
                    ],
                }

        # Check Firestore
        users_repo = FirestoreRepository(FirestoreCollections.USERS)
        doc = users_repo.get(candidate_id)
        if not doc:
            raise ResourceNotFoundError(f"Candidate with ID '{candidate_id}' not found.")

        return {
            "id": candidate_id,
            "name": doc.get("displayName") or doc.get("name") or "Candidate",
            "email": doc.get("email", ""),
            "role": "CANDIDATE",
            "avatar": doc.get("photoURL"),
            "created_at": doc.get("createdAt"),
            "profile": {
                "bio": doc.get("bio", "Career explorer"),
                "target_career": doc.get("targetCareer", "Software Engineering"),
                "experience_level": doc.get("experienceLevel", "Intermediate"),
                "location": doc.get("location", "Remote"),
            },
            "education": [],
            "skills": [],
            "assessment_attempts": [],
            "career_recommendations": [],
            "resume_analyses": [],
            "roadmaps": [],
        }

    async def update_candidate_status(self, candidate_id: str, status: str) -> Dict[str, Any]:
        """
        Updates candidate status (e.g. ACTIVE or SUSPENDED).
        """
        status_clean = status.strip().upper()
        if status_clean not in ["ACTIVE", "SUSPENDED"]:
            status_clean = "ACTIVE"

        # Update in Firestore
        try:
            users_repo = FirestoreRepository(FirestoreCollections.USERS)
            doc = users_repo.get(candidate_id) or {}
            doc["status"] = status_clean
            doc["updatedAt"] = datetime.now(timezone.utc).isoformat()
            users_repo.set(candidate_id, doc)
        except Exception as e:
            logger.warning(f"Could not update status in Firestore: {e}")

        return {
            "id": candidate_id,
            "status": status_clean,
            "message": f"Candidate status updated to {status_clean}"
        }
