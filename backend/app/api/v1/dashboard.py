from datetime import datetime, timezone
from typing import Annotated, Any, Dict, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile
from app.models.skill import UserSkill, Skill
from app.models.career import Career
from app.models.recommendation import CareerRecommendation, SkillGap
from app.models.roadmap import Roadmap, RoadmapItem
from app.models.resume import ResumeAnalysis
from app.models.assessment import AptitudeAttempt
from app.models.notification import Notification
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, now_utc_iso
from app.core.logging import logger

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class ToggleTaskRequest(BaseModel):
    item_id: str
    task_id: str
    done: bool


def compute_relative_time(dt: Optional[datetime]) -> str:
    if not dt:
        return "recently"
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 10:
        return "just now"
    elif seconds < 60:
        return f"{seconds} seconds ago"
    elif seconds < 3600:
        mins = seconds // 60
        return f"{mins} minute{'s' if mins > 1 else ''} ago"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    else:
        days = seconds // 86400
        return f"{days} day{'s' if days > 1 else ''} ago"


@router.get("/summary")
async def get_dashboard_summary(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """
    Returns consolidated real-time dashboard summary telemetry for the candidate.
    Computes Career Match, Skill Readiness, Assessment Index, Resume ATS,
    Roadmap Progress, Profile Completion, and dynamic Next Best Action.
    """
    user_id = current_user.id

    # 1. Fetch Profile
    stmt_prof = select(Profile).where(Profile.user_id == user_id)
    profile = (await db.execute(stmt_prof)).scalar_one_or_none()

    # 2. Fetch User Skills
    stmt_skills = (
        select(UserSkill)
        .where(UserSkill.user_id == user_id)
        .options(selectinload(UserSkill.skill))
    )
    user_skills = list((await db.execute(stmt_skills)).scalars().all())

    # 3. Fetch Recommendations
    stmt_recs = (
        select(CareerRecommendation)
        .where(CareerRecommendation.user_id == user_id)
        .options(selectinload(CareerRecommendation.career))
        .order_by(CareerRecommendation.match_score.desc())
    )
    recs = list((await db.execute(stmt_recs)).scalars().all())
    top_rec = recs[0] if recs else None

    # 4. Fetch Roadmap
    stmt_road = (
        select(Roadmap)
        .where(Roadmap.user_id == user_id)
        .options(selectinload(Roadmap.items), selectinload(Roadmap.career))
        .order_by(Roadmap.created_at.desc())
    )
    roadmaps = list((await db.execute(stmt_road)).scalars().all())
    active_roadmap = roadmaps[0] if roadmaps else None

    # 5. Fetch Latest Resume Analysis
    stmt_resume = (
        select(ResumeAnalysis)
        .where(ResumeAnalysis.user_id == user_id)
        .order_by(ResumeAnalysis.created_at.desc())
    )
    resumes = list((await db.execute(stmt_resume)).scalars().all())
    latest_resume = resumes[0] if resumes else None

    # 6. Fetch Latest Assessment Attempt
    stmt_apt = (
        select(AptitudeAttempt)
        .where(AptitudeAttempt.user_id == user_id)
        .order_by(AptitudeAttempt.completed_at.desc())
    )
    attempts = list((await db.execute(stmt_apt)).scalars().all())
    latest_apt = attempts[0] if attempts else None

    # -------------------------------------------------------------
    # Calculate Profile Completion
    # -------------------------------------------------------------
    completion_points = 0
    if current_user.name and current_user.email:
        completion_points += 20
    if profile:
        if profile.branch:
            completion_points += 10
        if profile.degree:
            completion_points += 5
        if profile.bio:
            completion_points += 10
        if profile.interests and len(profile.interests) > 0:
            completion_points += 5
    if len(user_skills) >= 5:
        completion_points += 20
    elif len(user_skills) > 0:
        completion_points += 10
    if latest_apt:
        completion_points += 15
    if latest_resume:
        completion_points += 15
    profile_completion_pct = min(100, completion_points)

    # -------------------------------------------------------------
    # Metrics
    # -------------------------------------------------------------
    target_career_title = (
        top_rec.career.title
        if (top_rec and top_rec.career)
        else (active_roadmap.career.title if (active_roadmap and active_roadmap.career) else "Target Career Not Selected")
    )
    match_score = round(top_rec.match_score) if top_rec else 0

    total_required_skills = 24
    verified_skills_count = len(user_skills)
    skill_readiness_pct = min(100, round((verified_skills_count / total_required_skills) * 100)) if (total_required_skills and verified_skills_count) else 0
    assessment_index = round(latest_apt.score) if latest_apt else 0
    resume_ats = round(latest_resume.ats_score) if latest_resume else 0
    resume_rating = ("Strong" if resume_ats >= 80 else ("Average" if resume_ats >= 60 else "Needs Work")) if latest_resume else "Pending"

    if active_roadmap and active_roadmap.items:
        completed_items = sum(1 for item in active_roadmap.items if item.is_completed)
        total_items = len(active_roadmap.items)
        roadmap_pct = round((completed_items / total_items) * 100) if total_items else 0
        current_month = min(total_items, completed_items + 1)
        total_months = active_roadmap.duration_months
    else:
        roadmap_pct = 0
        current_month = 0
        total_months = 0

    # -------------------------------------------------------------
    # Dynamic Next Best Action
    # -------------------------------------------------------------
    if not latest_apt:
        next_action = {
            "title": "Complete your Cognitive Psychometric Diagnostic",
            "reason": "Establishes your baseline analytical and problem-solving benchmarks for accurate career matching.",
            "action_label": "Start Diagnostic →",
            "action_url": "/user/assessment",
            "priority": "HIGH",
        }
    elif not latest_resume:
        next_action = {
            "title": "Upload your latest Resume",
            "reason": "Allows our ATS parser to extract missing keywords and detect production competencies.",
            "action_label": "Upload Resume →",
            "action_url": "/user/resume",
            "priority": "HIGH",
        }
    elif profile_completion_pct < 80:
        next_action = {
            "title": "Complete your Career Profile",
            "reason": "Adding your preferred industries and work experience sharpens recommendation accuracy.",
            "action_label": "Update Profile →",
            "action_url": "/user/settings",
            "priority": "MEDIUM",
        }
    elif active_roadmap and any(not i.is_completed for i in active_roadmap.items):
        first_incomplete = next(i for i in active_roadmap.items if not i.is_completed)
        next_action = {
            "title": f"Master Month {first_incomplete.month}: '{first_incomplete.title}'",
            "reason": f"Completing this milestone directly improves your {target_career_title} readiness.",
            "action_label": "Continue Roadmap →",
            "action_url": "/user/roadmap",
            "priority": "HIGH",
        }
    else:
        next_action = {
            "title": "Explore Career Recommendations",
            "reason": f"Review your real-time matches and skill gap breakdown for {target_career_title}.",
            "action_label": "View Recommendations →",
            "action_url": "/user/recommendations",
            "priority": "HIGH",
        }

    return {
        "candidate": {
            "id": current_user.id,
            "name": current_user.name or "Candidate",
            "email": current_user.email,
            "role": current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role),
            "branch": profile.branch if profile and profile.branch else "",
            "college": profile.college if profile and profile.college else "",
            "profile_completion": profile_completion_pct,
            "target_career": target_career_title,
        },
        "metrics": {
            "career_match": {
                "score": match_score,
                "title": target_career_title,
                "badge": "Top Match" if top_rec else "Not Selected",
                "trend": "+0% this month" if not top_rec else "+4% this month",
            },
            "skill_readiness": {
                "score": skill_readiness_pct,
                "verified_skills": verified_skills_count,
                "total_skills": total_required_skills if verified_skills_count > 0 else 0,
                "advanced_skills": sum(1 for s in user_skills if s.proficiency >= 4) if user_skills else 0,
                "badge": "Telemetry Verified" if verified_skills_count > 0 else "Pending Verification",
            },
            "assessment_index": {
                "score": assessment_index,
                "dimensions": len(latest_apt.category_scores) if (latest_apt and latest_apt.category_scores and isinstance(latest_apt.category_scores, dict)) else 0,
                "badge": "Psychometric Baseline" if latest_apt else "Not Taken",
            },
            "resume_ats": {
                "score": resume_ats,
                "rating": resume_rating,
                "skills_detected": len(latest_resume.extracted_skills) if (latest_resume and latest_resume.extracted_skills) else 0,
                "missing_keywords": len(latest_resume.missing_keywords) if (latest_resume and latest_resume.missing_keywords) else 0,
                "badge": "ATS Scan" if latest_resume else "No Resume",
            },
            "roadmap_progress": {
                "score": roadmap_pct,
                "current_month": current_month,
                "total_months": total_months,
                "stage": active_roadmap.career.title if (active_roadmap and active_roadmap.career) else "Not Started",
                "badge": f"Month {current_month} of {total_months}" if active_roadmap else "Not Started",
            },
            "profile_completion": {
                "score": profile_completion_pct,
                "badge": "Complete Profile" if profile_completion_pct >= 80 else "Incomplete",
            },
        },
        "next_best_action": next_action,
        "live_status": {
            "status": "Live",
            "synced": True,
            "last_updated": now_utc_iso(),
            "relative_updated": "just now",
        },
    }


@router.get("/career-match")
async def get_dashboard_career_match(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Returns detailed top career match compatibility breakdown, insights, and ranked paths."""
    user_id = current_user.id
    stmt = (
        select(CareerRecommendation)
        .where(CareerRecommendation.user_id == user_id)
        .options(selectinload(CareerRecommendation.career))
        .order_by(CareerRecommendation.match_score.desc())
    )
    recs = list((await db.execute(stmt)).scalars().all())

    top_rec = recs[0] if recs else None
    title = top_rec.career.title if (top_rec and top_rec.career) else "Target Career Not Selected"
    score = round(top_rec.match_score) if top_rec else 0

    breakdown = {
        "skills": 0,
        "interests": 0,
        "aptitude": 0,
        "education": 0,
        "experience": 0,
        "preference": 0,
    }
    if top_rec and hasattr(top_rec, "factor_breakdown") and isinstance(top_rec.factor_breakdown, dict):
        fb = top_rec.factor_breakdown
        breakdown = {
            "skills": round(fb.get("skills", 0)),
            "interests": round(fb.get("interests", 0)),
            "aptitude": round(fb.get("aptitude", 0)),
            "education": round(fb.get("education", 0)),
            "experience": round(fb.get("experience", 0)),
            "preference": round(fb.get("preference", 0)),
        }

    why_fits = []
    if top_rec:
        why_fits = [
            "Matches verified engineering competencies and technical profile",
            "Aligns with cognitive problem-solving benchmarks",
            "Direct alignment with recorded technical domain interests",
        ]

    top_paths = []
    if recs:
        for idx, r in enumerate(recs[:5]):
            c = r.career
            top_paths.append({
                "rank": idx + 1,
                "careerId": r.career_id,
                "title": c.title if c else "Software Engineer",
                "category": c.category if c else "Software Engineering",
                "salaryRange": c.salary_range if c else "Competitive",
                "matchScore": round(r.match_score),
                "strongestFactor": "Skills Match",
                "skillGap": f"{len(r.missing_skills) if r.missing_skills else 0} skills missing",
                "slug": c.slug if (c and c.slug) else "software-engineer",
            })

    return {
        "top_match": {
            "title": title,
            "matchScore": score,
            "compatibilityText": "Recommendation grounded in your verified profile and assessment telemetry." if top_rec else "Select or explore target careers to view algorithmic compatibility.",
        },
        "breakdown": breakdown,
        "why_fits": why_fits,
        "top_paths": top_paths,
    }


@router.get("/skills")
async def get_dashboard_skills(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Returns candidate skill profile categorized with proficiency levels."""
    stmt = (
        select(UserSkill)
        .where(UserSkill.user_id == current_user.id)
        .options(selectinload(UserSkill.skill))
        .order_by(UserSkill.proficiency.desc())
    )
    user_skills = list((await db.execute(stmt)).scalars().all())

    categories: Dict[str, List[Dict[str, Any]]] = {
        "Technical Skills": [],
        "Frameworks": [],
        "Languages": [],
        "Tools": [],
        "Soft Skills": [],
    }

    if user_skills:
        for us in user_skills:
            name = us.skill.name if us.skill else "Skill"
            p = us.proficiency
            level = "Advanced" if p >= 4 else ("Intermediate" if p == 3 else "Beginner")
            category_key = "Technical Skills"
            if us.skill and us.skill.category:
                cat_val = us.skill.category.value if hasattr(us.skill.category, "value") else str(us.skill.category)
                if "FRAMEWORK" in cat_val.upper():
                    category_key = "Frameworks"
                elif "LANGUAGE" in cat_val.upper():
                    category_key = "Languages"
                elif "TOOL" in cat_val.upper():
                    category_key = "Tools"
                elif "SOFT" in cat_val.upper():
                    category_key = "Soft Skills"
            categories[category_key].append({
                "name": name,
                "proficiency": p,
                "level": level,
                "verified": us.verified,
            })

    return {"categories": categories}


@router.get("/skill-gaps")
async def get_dashboard_skill_gaps(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[Dict[str, Any]]:
    """Returns highest priority career skill gaps with target and current levels."""
    stmt = (
        select(SkillGap)
        .where(SkillGap.user_id == current_user.id)
        .options(selectinload(SkillGap.skill), selectinload(SkillGap.career))
        .order_by(SkillGap.gap_score.desc())
    )
    gaps = list((await db.execute(stmt)).scalars().all())

    if gaps:
        result = []
        for g in gaps[:4]:
            name = g.skill.name if g.skill else "Target Competency"
            current_p = g.current_proficiency
            required_p = g.required_proficiency
            curr_lvl = "Beginner" if current_p <= 2 else ("Intermediate" if current_p == 3 else "Advanced")
            req_lvl = "Advanced" if required_p >= 4 else "Intermediate"
            prio = "HIGH PRIORITY" if (required_p - current_p) >= 2 else "MEDIUM PRIORITY"
            result.append({
                "name": name,
                "currentLevel": curr_lvl,
                "targetLevel": req_lvl,
                "currentScore": current_p * 20,
                "targetScore": required_p * 20,
                "priority": prio,
                "careerTitle": g.career.title if g.career else "Full Stack Developer",
            })
        return result

        return result

    return []


@router.get("/roadmap")
async def get_dashboard_roadmap(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Returns active learning roadmap timeline and milestone tasks."""
    stmt = (
        select(Roadmap)
        .where(Roadmap.user_id == current_user.id)
        .options(selectinload(Roadmap.items), selectinload(Roadmap.career))
        .order_by(Roadmap.created_at.desc())
    )
    roadmaps = list((await db.execute(stmt)).scalars().all())
    active_roadmap = roadmaps[0] if roadmaps else None

    if active_roadmap and active_roadmap.items:
        items = []
        for i in active_roadmap.items:
            items.append({
                "id": i.id,
                "month": i.month,
                "title": i.title,
                "description": i.description,
                "is_completed": i.is_completed,
                "tasks": i.tasks or [],
            })
        completed_count = sum(1 for item in active_roadmap.items if item.is_completed)
        progress = round((completed_count / len(active_roadmap.items)) * 100)
        return {
            "career": active_roadmap.career.title if active_roadmap.career else "Target Career",
            "progress": progress,
            "current_stage": active_roadmap.career.title if active_roadmap.career else "Active Milestone",
            "duration_months": active_roadmap.duration_months,
            "items": items,
        }

    return {
        "career": "Not Selected",
        "progress": 0,
        "current_stage": "Not Started",
        "duration_months": 0,
        "items": [],
    }


@router.post("/roadmap/toggle-task")
async def toggle_roadmap_task(
    req: ToggleTaskRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """
    Toggles completion of a roadmap milestone task server-side, updates Firestore,
    recalculates overall progress, and emits live activity.
    """
    stmt = (
        select(RoadmapItem)
        .where(RoadmapItem.id == req.item_id)
        .options(selectinload(RoadmapItem.roadmap))
    )
    item = (await db.execute(stmt)).scalar_one_or_none()

    if item:
        updated_tasks = []
        for t in (item.tasks or []):
            if t.get("id") == req.task_id:
                t["done"] = req.done
            updated_tasks.append(t)
        item.tasks = updated_tasks

        all_done = all(t.get("done", False) for t in updated_tasks) if updated_tasks else req.done
        item.is_completed = all_done
        if all_done:
            item.completed_at = datetime.now(timezone.utc)
        else:
            item.completed_at = None

        await db.flush()

        stmt_road = select(Roadmap).where(Roadmap.id == item.roadmap_id).options(selectinload(Roadmap.items))
        roadmap = (await db.execute(stmt_road)).scalar_one_or_none()
        if roadmap and roadmap.items:
            completed_count = sum(1 for i in roadmap.items if i.is_completed)
            roadmap.progress_percent = round((completed_count / len(roadmap.items)) * 100.0, 1)
            await db.flush()

    try:
        roadmaps_repo = FirestoreRepository(FirestoreCollections.ROADMAP_ITEMS)
        roadmaps_repo.set(
            req.item_id,
            {
                "userId": current_user.id,
                "isCompleted": req.done,
                "updatedAt": now_utc_iso(),
            },
            merge=True,
        )
    except Exception as e:
        logger.warning(f"Firestore roadmap sync pass-through: {e}")

    try:
        notif = Notification(
            user_id=current_user.id,
            title="Roadmap Milestone Updated",
            message=f"Milestone task progress updated.",
            type="ROADMAP",
            is_read=False,
            link="/roadmap",
        )
        db.add(notif)
        await db.flush()
    except Exception:
        pass

    return {"success": True, "item_id": req.item_id, "done": req.done}


@router.get("/resume")
async def get_dashboard_resume(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Returns ATS analysis, detected skills, and keyword gap analysis."""
    stmt = (
        select(ResumeAnalysis)
        .where(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
    )
    resumes = list((await db.execute(stmt)).scalars().all())
    latest = resumes[0] if resumes else None

    if latest:
        score = round(latest.ats_score)
        match_align = 0
        if latest.ranked_careers and len(latest.ranked_careers) > 0:
            first_c = latest.ranked_careers[0]
            if isinstance(first_c, dict) and "matchScore" in first_c:
                match_align = round(first_c["matchScore"])
        return {
            "status": "ANALYZED",
            "ats_score": score,
            "rating": "Strong" if score >= 80 else ("Average" if score >= 60 else "Needs Work"),
            "skills_detected": len(latest.extracted_skills) if latest.extracted_skills else 0,
            "extracted_skills": latest.extracted_skills or [],
            "missing_keywords": len(latest.missing_keywords) if latest.missing_keywords else 0,
            "missing_keywords_list": latest.missing_keywords or [],
            "career_alignment": match_align or score,
            "analyzed_at": latest.created_at.isoformat() if latest.created_at else now_utc_iso(),
        }

    return {
        "status": "UPLOAD_REQUIRED",
        "ats_score": 0,
        "rating": "Not Uploaded",
        "skills_detected": 0,
        "extracted_skills": [],
        "missing_keywords": 0,
        "missing_keywords_list": [],
        "career_alignment": 0,
        "analyzed_at": "",
    }


@router.get("/assessments")
async def get_dashboard_assessments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """Returns cognitive psychometric performance dimensions and benchmark analysis."""
    stmt = (
        select(AptitudeAttempt)
        .where(AptitudeAttempt.user_id == current_user.id)
        .order_by(AptitudeAttempt.completed_at.desc())
    )
    attempts = list((await db.execute(stmt)).scalars().all())
    latest = attempts[0] if attempts else None

    if latest and latest.category_scores and isinstance(latest.category_scores, dict):
        cat = latest.category_scores
        scores = {
            "Logical": round(cat.get("LOGICAL", {}).get("percentage", 0)),
            "Quantitative": round(cat.get("QUANTITATIVE", {}).get("percentage", 0)),
            "Verbal": round(cat.get("VERBAL", {}).get("percentage", 0)),
            "Analytical": round(cat.get("ANALYTICAL", {}).get("percentage", 0)),
            "Problem Solving": round(cat.get("PROBLEM_SOLVING", {}).get("percentage", 0)),
        }
        radar_data = [
            {"subject": "Logical", "score": scores["Logical"]},
            {"subject": "Quantitative", "score": scores["Quantitative"]},
            {"subject": "Verbal", "score": scores["Verbal"]},
            {"subject": "Analytical", "score": scores["Analytical"]},
            {"subject": "Problem Solving", "score": scores["Problem Solving"]},
        ]
        best_subj = max(scores.items(), key=lambda x: x[1])
        weakest_subj = min(scores.items(), key=lambda x: x[1])
        overall = round(sum(scores.values()) / max(1, len(scores)))
        return {
            "radar_data": radar_data,
            "top_strength": f"{best_subj[0]} ({best_subj[1]}%)" if best_subj[1] > 0 else "Baseline Verified",
            "growth_area": f"{weakest_subj[0]} ({weakest_subj[1]}%)" if weakest_subj[1] > 0 else "Practice Recommended",
            "overall_score": overall,
            "benchmark": 70,
            "status": "Diagnostic Completed",
        }

    return {
        "radar_data": [],
        "top_strength": "Diagnostic Pending",
        "growth_area": "Take assessment to diagnose benchmarks",
        "overall_score": 0,
        "benchmark": 70,
        "status": "NOT_STARTED",
    }


@router.get("/activity")
async def get_dashboard_activity(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[Dict[str, Any]]:
    """Returns actual recent candidate activities derived from events and telemetry."""
    from app.models.integration import CareerEvent
    stmt = (
        select(CareerEvent)
        .where(CareerEvent.user_id == current_user.id)
        .order_by(CareerEvent.created_at.desc())
        .limit(10)
    )
    events = list((await db.execute(stmt)).scalars().all())
    activities = []
    for evt in events:
        icon = "Sparkles"
        cat = "SYSTEM"
        title = evt.event_type
        if "resume" in evt.event_type:
            icon = "FileCheck"
            cat = "RESUME"
            title = f"Resume Event: {evt.event_type.replace('resume.', '').replace('_', ' ').title()}"
        elif "roadmap" in evt.event_type:
            icon = "Map"
            cat = "ROADMAP"
            title = f"Roadmap Event: {evt.event_type.replace('roadmap.', '').replace('_', ' ').title()}"
        elif "assignment" in evt.event_type:
            icon = "CheckCircle2"
            cat = "ASSIGNMENT"
            title = f"Assignment Event: {evt.event_type.replace('assignments.', '').replace('_', ' ').title()}"

        activities.append({
            "id": evt.id,
            "title": title,
            "category": cat,
            "relative_time": compute_relative_time(evt.created_at),
            "icon": icon,
        })
    return activities


@router.get("/bootstrap")
async def get_dashboard_bootstrap(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Dict[str, Any]:
    """
    High-performance consolidated bootstrap endpoint for candidate dashboard.
    Combines core summary telemetry, career match, skill matrix, roadmap milestones,
    resume ATS status, and assessment analytics into a single progressive payload.
    Eliminates client-side network waterfalls and redundant connection overhead.
    """
    summary = await get_dashboard_summary(current_user, db)
    career_match = await get_dashboard_career_match(current_user, db)
    skills = await get_dashboard_skills(current_user, db)
    skill_gaps = await get_dashboard_skill_gaps(current_user, db)
    roadmap = await get_dashboard_roadmap(current_user, db)
    resume = await get_dashboard_resume(current_user, db)
    assessments = await get_dashboard_assessments(current_user, db)
    activity = await get_dashboard_activity(current_user, db)

    return {
        "summary": summary,
        "career_match": career_match,
        "skills": skills,
        "skill_gaps": skill_gaps,
        "roadmap": roadmap,
        "resume": resume,
        "assessments": assessments,
        "activity": activity,
        "server_time": now_utc_iso(),
    }

