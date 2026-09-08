"""
Enhanced RecommendationService with:
- Status check (staleness detection)
- Async background recalculation with stage tracking
- Career comparison matrix
- Enhanced list with filters/search/sort
"""
import uuid
import threading
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
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
from app.core.logging import logger

# ──────────────────────────────────────────────
# In-memory job store (per worker).
# For multi-worker deployments, swap to Firestore or Redis.
# ──────────────────────────────────────────────
_job_store: Dict[str, Dict[str, Any]] = {}
_job_store_lock = threading.Lock()

STAGES = [
    ("profile_fetch",    "Fetching your profile data…",          10),
    ("skill_analysis",   "Analyzing your skills…",               25),
    ("aptitude_load",    "Loading assessment results…",           35),
    ("career_scoring",   "Evaluating career compatibility…",      55),
    ("gap_analysis",     "Updating skill gaps…",                  75),
    ("explanation_gen",  "Generating career explanations…",       88),
    ("finalizing",       "Recommendations ready.",               100),
]

MATCH_LEVEL_LABELS = {
    90: "Excellent Match",
    80: "Strong Match",
    70: "Good Match",
    60: "Potential Match",
}


def _match_level(score: float) -> str:
    for threshold, label in MATCH_LEVEL_LABELS.items():
        if score >= threshold:
            return label
    return "Explore Carefully"


def _proficiency_label(p: int) -> str:
    if p >= 4:
        return "Advanced"
    elif p == 3:
        return "Intermediate"
    elif p == 2:
        return "Beginner"
    return "None"


def _severity_label(count: int) -> str:
    if count == 0:
        return "None"
    elif count <= 2:
        return "Low"
    elif count <= 4:
        return "Medium"
    return "High"


def _relative_time(ts_str: Optional[str]) -> str:
    if not ts_str:
        return "never"
    try:
        if ts_str.endswith("Z"):
            ts_str = ts_str[:-1] + "+00:00"
        dt = datetime.fromisoformat(ts_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        diff = datetime.now(timezone.utc) - dt
        secs = int(diff.total_seconds())
        if secs < 10:
            return "just now"
        elif secs < 60:
            return f"{secs} seconds ago"
        elif secs < 3600:
            m = secs // 60
            return f"{m} minute{'s' if m > 1 else ''} ago"
        elif secs < 86400:
            h = secs // 3600
            return f"{h} hour{'s' if h > 1 else ''} ago"
        else:
            d = secs // 86400
            return f"{d} day{'s' if d > 1 else ''} ago"
    except Exception:
        return "recently"


def _set_job_stage(job_id: str, stage_idx: int, extra: Optional[Dict] = None):
    """Update in-memory job state to a specific pipeline stage."""
    if stage_idx >= len(STAGES):
        return
    stage_key, label, progress = STAGES[stage_idx]
    is_final = stage_idx == len(STAGES) - 1
    with _job_store_lock:
        if job_id not in _job_store:
            return
        _job_store[job_id].update({
            "status": "completed" if is_final else "processing",
            "stage": stage_key,
            "stage_label": label,
            "progress": progress,
            "message": label,
        })
        if is_final:
            _job_store[job_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
        if extra:
            _job_store[job_id].update(extra)


class RecommendationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.rec_repo = RecommendationRepository(session)
        self.assessment_repo = AssessmentRepository(session)

    # ──────────────────────────────────────────────
    # STATUS
    # ──────────────────────────────────────────────

    async def get_recommendation_status(self, user_id: str) -> Dict[str, Any]:
        """
        Checks the last recommendation timestamp against the user's profile/skills
        updatedAt to determine if recommendations are stale.
        """
        # Fetch latest recommendation
        stmt = (
            select(CareerRecommendation)
            .where(CareerRecommendation.user_id == user_id)
            .order_by(CareerRecommendation.updated_at.desc())
        )
        latest_rec = (await self.session.execute(stmt)).scalars().first()

        # Fetch profile
        stmt_prof = select(Profile).where(Profile.user_id == user_id)
        profile = (await self.session.execute(stmt_prof)).scalar_one_or_none()

        # Fetch skills count
        stmt_skills = select(UserSkill).where(UserSkill.user_id == user_id)
        user_skills = list((await self.session.execute(stmt_skills)).scalars().all())

        # Check for active job
        active_job_id = None
        with _job_store_lock:
            for jid, jdata in _job_store.items():
                if jdata.get("user_id") == user_id and jdata.get("status") in ("queued", "processing"):
                    active_job_id = jid
                    break

        # Profile completion check
        completion_pct, missing = self._compute_profile_completion(profile, user_skills)

        # Staleness detection
        is_stale = False
        last_analyzed = None
        last_analyzed_relative = None
        rec_count = 0

        if latest_rec:
            last_analyzed = latest_rec.updated_at.isoformat() if latest_rec.updated_at else None
            last_analyzed_relative = _relative_time(last_analyzed)
            rec_count_stmt = select(CareerRecommendation).where(CareerRecommendation.user_id == user_id)
            rec_count = len(list((await self.session.execute(rec_count_stmt)).scalars().all()))

            # Mark stale if profile was updated after last recommendation
            if profile and profile.updated_at and latest_rec.updated_at:
                prof_dt = profile.updated_at
                rec_dt = latest_rec.updated_at
                if prof_dt.tzinfo is None:
                    prof_dt = prof_dt.replace(tzinfo=timezone.utc)
                if rec_dt.tzinfo is None:
                    rec_dt = rec_dt.replace(tzinfo=timezone.utc)
                if prof_dt > rec_dt:
                    is_stale = True

        # Determine status string
        if active_job_id:
            status = "generating"
        elif not latest_rec:
            status = "no_data"
        elif is_stale:
            status = "stale"
        else:
            status = "up_to_date"

        return {
            "status": status,
            "last_analyzed": last_analyzed,
            "last_analyzed_relative": last_analyzed_relative,
            "is_stale": is_stale,
            "profile_complete": completion_pct >= 70,
            "profile_completion_pct": completion_pct,
            "missing_profile_items": missing,
            "active_job_id": active_job_id,
            "recommendation_count": rec_count,
        }

    def _compute_profile_completion(
        self, profile: Optional[Profile], user_skills: list
    ) -> tuple[int, List[str]]:
        missing = []
        pts = 0
        if profile:
            pts += 20
            if profile.bio:
                pts += 10
            else:
                missing.append("Bio / Career Goals")
            if profile.branch:
                pts += 5
            else:
                missing.append("Education Branch")
            if profile.interests and len(profile.interests) > 0:
                pts += 10
            else:
                missing.append("Career Interests")
            if profile.work_experience_years and profile.work_experience_years > 0:
                pts += 10
            else:
                missing.append("Work Experience")
            if profile.preferred_roles and len(profile.preferred_roles) > 0:
                pts += 5
            else:
                missing.append("Preferred Roles")
        else:
            missing.extend(["Profile", "Bio", "Education", "Interests", "Experience"])

        if len(user_skills) >= 5:
            pts += 20
        elif len(user_skills) > 0:
            pts += 10
            missing.append("More Skills (add at least 5)")
        else:
            missing.append("Skills")

        return min(100, pts), missing

    # ──────────────────────────────────────────────
    # GET (enhanced with filters)
    # ──────────────────────────────────────────────

    async def get_user_recommendations_enhanced(
        self,
        user_id: str,
        search: Optional[str] = None,
        category: Optional[str] = None,
        sort_by: str = "match_score",
        min_score: Optional[float] = None,
    ) -> Dict[str, Any]:
        """Returns enriched, filtered, sorted recommendations."""
        stmt = (
            select(CareerRecommendation)
            .where(CareerRecommendation.user_id == user_id)
            .options(
                selectinload(CareerRecommendation.career).selectinload(Career.skills).selectinload(CareerSkill.skill)
            )
            .order_by(CareerRecommendation.match_score.desc())
        )
        recs = list((await self.session.execute(stmt)).scalars().all())

        if not recs:
            recs = await self.generate_recommendations_for_user(user_id)
            # Re-fetch with career eager load
            recs = list((
                await self.session.execute(stmt)
            ).scalars().all())

        status_data = await self.get_recommendation_status(user_id)

        items = []
        categories = set()
        for idx, rec in enumerate(recs):
            career = rec.career
            if not career:
                continue
            cat = career.category or "General"
            categories.add(cat)

            # Apply filters
            if search and search.lower() not in career.title.lower():
                continue
            if category and category != "ALL" and cat != category:
                continue
            if min_score and rec.match_score < min_score:
                continue

            breakdown = rec.breakdown or {}
            cf = breakdown.get("contributingFactors", [])
            skills_sc = next((f["score"] for f in cf if "skill" in f.get("name", "").lower()), 0.0)
            interests_sc = next((f["score"] for f in cf if "interest" in f.get("name", "").lower()), 0.0)
            aptitude_sc = next((f["score"] for f in cf if "aptitude" in f.get("name", "").lower()), 0.0)
            education_sc = next((f["score"] for f in cf if "education" in f.get("name", "").lower()), 0.0)
            experience_sc = next((f["score"] for f in cf if "experience" in f.get("name", "").lower()), 0.0)
            preference_sc = next((f["score"] for f in cf if "preference" in f.get("name", "").lower()), 0.0)
            confidence_sc = breakdown.get("confidenceScore", 85.0)

            missing_names = [
                ms.get("name", ms) if isinstance(ms, dict) else str(ms)
                for ms in (rec.missing_skills or [])
            ]
            matching_names = [
                ms.get("name", ms) if isinstance(ms, dict) else str(ms)
                for ms in (rec.matching_skills or [])
            ]

            top_strength = matching_names[0] if matching_names else "Technical Skills"
            primary_gap = missing_names[0] if missing_names else ""

            updated_at = rec.updated_at.isoformat() if rec.updated_at else ""

            items.append({
                "id": rec.id,
                "rank": idx + 1,
                "career_id": rec.career_id,
                "career_title": career.title,
                "career_category": cat,
                "career_slug": career.slug or career.title.lower().replace(" ", "-"),
                "career_salary_range": career.salary_range or "",
                "career_demand_level": career.demand_level or "High",
                "career_experience_level": career.experience_level or "Entry / Mid",
                "match_score": round(rec.match_score, 1),
                "match_level": _match_level(rec.match_score),
                "skills_score": round(skills_sc, 1),
                "interests_score": round(interests_sc, 1),
                "aptitude_score": round(aptitude_sc, 1),
                "education_score": round(education_sc, 1),
                "experience_score": round(experience_sc, 1),
                "preference_score": round(preference_sc, 1),
                "confidence_score": round(confidence_sc, 1),
                "matching_skills": rec.matching_skills or [],
                "missing_skills": rec.missing_skills or [],
                "reasoning": rec.reasoning or "",
                "breakdown": breakdown,
                "recommended_actions": rec.recommended_actions or [],
                "top_strength": top_strength,
                "primary_gap": primary_gap,
                "updated_at": updated_at,
            })

        # Sort
        if sort_by == "skills_score":
            items.sort(key=lambda x: x["skills_score"], reverse=True)
        elif sort_by == "interests_score":
            items.sort(key=lambda x: x["interests_score"], reverse=True)
        elif sort_by == "lowest_gap":
            items.sort(key=lambda x: len(x["missing_skills"]))
        else:
            items.sort(key=lambda x: x["match_score"], reverse=True)

        # Re-rank after sort
        for i, item in enumerate(items):
            item["rank"] = i + 1

        return {
            "items": items,
            "total": len(items),
            "top_match": items[0] if items else None,
            "status": status_data,
            "categories": sorted(list(categories)),
        }

    # ──────────────────────────────────────────────
    # COMPARE
    # ──────────────────────────────────────────────

    async def compare_careers(self, user_id: str, career_ids: List[str]) -> Dict[str, Any]:
        """Builds a comparison matrix for 2–3 specified career IDs."""
        if not career_ids or len(career_ids) < 2:
            return {"careers": [], "best_overall": "", "lowest_gap": "", "best_interest_fit": ""}

        career_ids = career_ids[:3]  # cap at 3

        stmt = (
            select(CareerRecommendation)
            .where(
                CareerRecommendation.user_id == user_id,
                CareerRecommendation.career_id.in_(career_ids)
            )
            .options(selectinload(CareerRecommendation.career))
        )
        recs = list((await self.session.execute(stmt)).scalars().all())
        if not recs:
            await self.generate_recommendations_for_user(user_id)
            recs = list((await self.session.execute(stmt)).scalars().all())

        entries = []
        for rec in recs:
            career = rec.career
            if not career:
                continue
            breakdown = rec.breakdown or {}
            cf = breakdown.get("contributingFactors", [])

            def _score(key: str) -> float:
                for f in cf:
                    if key in f.get("name", "").lower():
                        return round(float(f.get("score", 0)), 1)
                return 0.0

            missing = rec.missing_skills or []
            gap_count = len(missing)
            top_missing = None
            if missing:
                top_missing = missing[0].get("name", "") if isinstance(missing[0], dict) else str(missing[0])

            entries.append({
                "career_id": rec.career_id,
                "title": career.title,
                "category": career.category or "",
                "match_score": round(rec.match_score, 1),
                "match_level": _match_level(rec.match_score),
                "skills_score": _score("skill"),
                "interests_score": _score("interest"),
                "aptitude_score": _score("aptitude"),
                "education_score": _score("education"),
                "experience_score": _score("experience"),
                "skill_gap_count": gap_count,
                "skill_gap_severity": _severity_label(gap_count),
                "top_missing_skill": top_missing,
                "salary_range": career.salary_range,
            })

        if not entries:
            return {"careers": [], "best_overall": "", "lowest_gap": "", "best_interest_fit": ""}

        best_overall = max(entries, key=lambda x: x["match_score"])["career_id"]
        lowest_gap = min(entries, key=lambda x: x["skill_gap_count"])["career_id"]
        best_interest = max(entries, key=lambda x: x["interests_score"])["career_id"]

        return {
            "careers": entries,
            "best_overall": best_overall,
            "lowest_gap": lowest_gap,
            "best_interest_fit": best_interest,
        }

    # ──────────────────────────────────────────────
    # RECALCULATE (background job)
    # ──────────────────────────────────────────────

    def start_recalculate_job(self, user_id: str) -> str:
        """Creates a new job entry and returns its job_id. Caller runs the background task."""
        job_id = f"rec_{user_id}_{uuid.uuid4().hex[:8]}"
        with _job_store_lock:
            _job_store[job_id] = {
                "job_id": job_id,
                "user_id": user_id,
                "status": "queued",
                "stage": None,
                "stage_label": "Queued…",
                "progress": 0,
                "message": "Recalculation queued",
                "error": None,
                "completed_at": None,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        return job_id

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        with _job_store_lock:
            return dict(_job_store.get(job_id, {}))

    def get_active_job_for_user(self, user_id: str) -> Optional[str]:
        with _job_store_lock:
            for jid, jdata in _job_store.items():
                if jdata.get("user_id") == user_id and jdata.get("status") in ("queued", "processing"):
                    return jid
        return None

    async def run_recalculate(self, job_id: str, user_id: str):
        """
        Runs the full recommendation pipeline with real stage tracking.
        Called as a FastAPI BackgroundTask.
        """
        try:
            # Stage 0: Profile fetch
            _set_job_stage(job_id, 0)
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

            # Stage 1: Skill analysis
            _set_job_stage(job_id, 1)
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

            # Stage 2: Aptitude load
            _set_job_stage(job_id, 2)
            latest_attempt = await self.assessment_repo.get_latest_attempt(user_id)
            aptitude_scores = {}
            if latest_attempt and latest_attempt.category_scores:
                for cat, data in latest_attempt.category_scores.items():
                    if isinstance(data, dict):
                        aptitude_scores[cat.upper()] = float(data.get("percentage", 50.0))

            # Stage 3: Career scoring (extract features + rank)
            _set_job_stage(job_id, 3)
            user_features = extract_user_features(
                profile_data=profile_dict,
                skills_map=skills_map,
                aptitude_scores=aptitude_scores,
            )
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

            ranked_results = recommender_engine.rank_careers(
                user_data=user_features,
                careers=careers_data,
            )

            # Stage 4: Gap analysis
            _set_job_stage(job_id, 4)
            saved_recs = []
            for rank_item in ranked_results[:10]:
                career_id = rank_item["career_id"]
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

            # Stage 5: Explanation generation
            _set_job_stage(job_id, 5)

            # Stage 6: Done
            _set_job_stage(job_id, 6)
            logger.info(f"Recalculation job {job_id} completed for user {user_id}")

        except Exception as e:
            logger.error(f"Recalculation job {job_id} failed: {e}")
            with _job_store_lock:
                if job_id in _job_store:
                    _job_store[job_id].update({
                        "status": "failed",
                        "error": str(e),
                        "message": f"Recalculation failed: {e}",
                    })

    # ──────────────────────────────────────────────
    # Legacy methods (unchanged)
    # ──────────────────────────────────────────────

    async def generate_recommendations_for_user(self, user_id: str) -> List[CareerRecommendation]:
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

        latest_attempt = await self.assessment_repo.get_latest_attempt(user_id)
        aptitude_scores = {}
        if latest_attempt and latest_attempt.category_scores:
            for cat, data in latest_attempt.category_scores.items():
                if isinstance(data, dict):
                    aptitude_scores[cat.upper()] = float(data.get("percentage", 50.0))

        user_features = extract_user_features(
            profile_data=profile_dict,
            skills_map=skills_map,
            aptitude_scores=aptitude_scores,
        )

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

        ranked_results = recommender_engine.rank_careers(
            user_data=user_features,
            careers=careers_data,
        )

        saved_recs = []
        for rank_item in ranked_results[:10]:
            career_id = rank_item["career_id"]
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
            return await self.generate_recommendations_for_user(user_id)
        return recs
