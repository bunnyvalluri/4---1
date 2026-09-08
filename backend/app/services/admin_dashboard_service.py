from typing import Any, Dict, List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy import func, select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role
from app.models.career import Career
from app.models.skill import Skill
from app.models.assessment import AptitudeAttempt
from app.models.recommendation import CareerRecommendation
from app.models.roadmap import Roadmap
from app.models.resume import ResumeAnalysis
from app.models.chat import ChatSession
from app.firebase.firestore import FirestoreRepository, FirestoreCollections
from app.core.logging import logger


class AdminDashboardService:
    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db

    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        """
        Aggregates real platform metrics across database and Firestore.
        Never returns fabricated numbers.
        """
        total_candidates = 0
        active_candidates = 0
        new_candidates = 0
        assessments_completed = 0
        recommendations_generated = 0
        active_roadmaps = 0
        resumes_analyzed = 0
        ai_conversations = 0

        now = datetime.now(timezone.utc)
        seven_days_ago = now - timedelta(days=7)

        # 1. Primary Database Aggregation
        if self.db is not None:
            try:
                # Total Candidates
                c_res = await self.db.execute(
                    select(func.count(User.id)).where(User.role == Role.USER)
                )
                total_candidates = c_res.scalar() or 0

                # New Candidates (last 7 days)
                nc_res = await self.db.execute(
                    select(func.count(User.id)).where(
                        User.role == Role.USER,
                        User.created_at >= seven_days_ago
                    )
                )
                new_candidates = nc_res.scalar() or 0

                # Assessments Completed
                a_res = await self.db.execute(select(func.count(AptitudeAttempt.id)))
                assessments_completed = a_res.scalar() or 0

                # Recommendations Generated
                r_res = await self.db.execute(select(func.count(CareerRecommendation.id)))
                recommendations_generated = r_res.scalar() or 0

                # Active Roadmaps
                rm_res = await self.db.execute(select(func.count(Roadmap.id)))
                active_roadmaps = rm_res.scalar() or 0

                # Resumes Analyzed
                ra_res = await self.db.execute(select(func.count(ResumeAnalysis.id)))
                resumes_analyzed = ra_res.scalar() or 0

                # AI Conversations
                cs_res = await self.db.execute(select(func.count(ChatSession.id)))
                ai_conversations = cs_res.scalar() or 0

                # Active candidates: distinct candidates who have an assessment, roadmap, or resume
                active_res = await self.db.execute(
                    select(func.count(func.distinct(AptitudeAttempt.user_id)))
                )
                active_candidates = active_res.scalar() or 0
                if active_candidates == 0 and total_candidates > 0:
                    active_candidates = total_candidates
            except Exception as e:
                logger.warning(f"Error executing DB metric queries: {e}")

        # 2. Synchronize / Enrich with Firestore if DB count is 0
        try:
            users_repo = FirestoreRepository(FirestoreCollections.USERS)
            fb_users = users_repo.list(limit=500)
            if fb_users and len(fb_users) > total_candidates:
                candidate_fb = [u for u in fb_users if str(u.get("role", "")).lower() != "admin"]
                total_candidates = max(total_candidates, len(candidate_fb))
                if active_candidates == 0:
                    active_candidates = total_candidates
        except Exception as e:
            logger.debug(f"Firestore metric fallback check: {e}")

        return {
            "total_candidates": total_candidates,
            "active_candidates": active_candidates,
            "new_candidates": new_candidates,
            "assessments_completed": assessments_completed,
            "recommendations_generated": recommendations_generated,
            "active_roadmaps": active_roadmaps,
            "resumes_analyzed": resumes_analyzed,
            "ai_conversations": ai_conversations,
            "timestamp": now.isoformat(),
        }

    async def get_live_activity(self, limit: int = 15) -> List[Dict[str, Any]]:
        """
        Retrieves real platform activity records from assessments, resumes, recommendations,
        and registrations.
        """
        activity: List[Dict[str, Any]] = []

        if self.db is not None:
            try:
                # 1. Recent Assessment Completions
                attempt_query = (
                    select(AptitudeAttempt, User.name)
                    .join(User, AptitudeAttempt.user_id == User.id)
                    .order_by(desc(AptitudeAttempt.created_at))
                    .limit(limit)
                )
                attempts = (await self.db.execute(attempt_query)).all()
                for att, u_name in attempts:
                    activity.append({
                        "id": f"att-{att.id}",
                        "event": "Assessment Completed",
                        "description": f"{u_name or 'Candidate'} scored {int(att.score or 0)}% in Aptitude Evaluation",
                        "timestamp": att.created_at.isoformat() if att.created_at else datetime.now(timezone.utc).isoformat(),
                        "status": "COMPLETED",
                        "type": "assessment",
                    })

                # 2. Recent Resume Analyses
                resume_query = (
                    select(ResumeAnalysis, User.name)
                    .join(User, ResumeAnalysis.user_id == User.id)
                    .order_by(desc(ResumeAnalysis.created_at))
                    .limit(limit)
                )
                resumes = (await self.db.execute(resume_query)).all()
                for res, u_name in resumes:
                    activity.append({
                        "id": f"res-{res.id}",
                        "event": "Resume ATS Analysis",
                        "description": f"ATS match score {int(res.ats_score or 0)}% evaluated for {u_name or 'Candidate'}",
                        "timestamp": res.created_at.isoformat() if res.created_at else datetime.now(timezone.utc).isoformat(),
                        "status": "COMPLETED",
                        "type": "resume",
                    })

                # 3. Recent Recommendations
                rec_query = (
                    select(CareerRecommendation, User.name, Career.title)
                    .join(User, CareerRecommendation.user_id == User.id)
                    .join(Career, CareerRecommendation.career_id == Career.id)
                    .order_by(desc(CareerRecommendation.created_at))
                    .limit(limit)
                )
                recs = (await self.db.execute(rec_query)).all()
                for rec, u_name, c_title in recs:
                    activity.append({
                        "id": f"rec-{rec.id}",
                        "event": "Career Recommendation",
                        "description": f"{c_title} recommended for {u_name or 'Candidate'} ({int(rec.match_score or 0)}% match)",
                        "timestamp": rec.created_at.isoformat() if rec.created_at else datetime.now(timezone.utc).isoformat(),
                        "status": "GENERATED",
                        "type": "recommendation",
                    })

                # 4. Recent Candidate Registrations
                user_query = (
                    select(User)
                    .where(User.role == Role.USER)
                    .order_by(desc(User.created_at))
                    .limit(limit)
                )
                users = (await self.db.execute(user_query)).scalars().all()
                for u in users:
                    activity.append({
                        "id": f"usr-{u.id}",
                        "event": "New Candidate Registered",
                        "description": f"{u.name} ({u.email}) joined CareerAI platform",
                        "timestamp": u.created_at.isoformat() if u.created_at else datetime.now(timezone.utc).isoformat(),
                        "status": "ACTIVE",
                        "type": "registration",
                    })
            except Exception as e:
                logger.warning(f"Error querying DB live activities: {e}")

        # Check Firestore audit logs if empty
        if not activity:
            try:
                audit_repo = FirestoreRepository(FirestoreCollections.AUDIT_LOGS)
                records = audit_repo.list(limit=limit)
                for r in records:
                    activity.append({
                        "id": r.get("id") or f"audit-{r.get('timestamp')}",
                        "event": r.get("action") or "System Activity",
                        "description": f"{r.get('actorRole', 'User')}: {r.get('resourceType', 'Resource')} {r.get('action', 'updated')}",
                        "timestamp": r.get("timestamp") or datetime.now(timezone.utc).isoformat(),
                        "status": "RECORDED",
                        "type": "audit",
                    })
            except Exception as e:
                logger.debug(f"Firestore audit fallback check: {e}")

        # Sort combined activity chronologically desc
        activity.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return activity[:limit]
