from typing import Any, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections
from app.core.logging import logger


class CareerContextService:
    """
    Retrieves and synthesizes the candidate's authentic career telemetry
    across profiles, skills, gaps, recommendations, roadmaps, projects,
    and resume scans. Grounded strictly in persisted data.
    """

    def __init__(self):
        self.profiles_repo = FirestoreRepository(FirestoreCollections.PROFILES)
        self.skills_repo = FirestoreRepository(FirestoreCollections.USER_SKILLS)
        self.skill_gaps_repo = FirestoreRepository(FirestoreCollections.SKILL_GAPS)
        self.recs_repo = FirestoreRepository(FirestoreCollections.CAREER_RECOMMENDATIONS)
        self.roadmaps_repo = FirestoreRepository(FirestoreCollections.ROADMAPS)
        self.roadmap_items_repo = FirestoreRepository(FirestoreCollections.ROADMAP_ITEMS)
        self.user_projects_repo = FirestoreRepository(FirestoreCollections.USER_PROJECTS)
        self.projects_repo = FirestoreRepository(FirestoreCollections.PROJECTS)
        self.resumes_repo = FirestoreRepository(FirestoreCollections.RESUME_ANALYSES)
        self.assessments_repo = FirestoreRepository(FirestoreCollections.ASSESSMENT_ATTEMPTS)

    def get_full_context(self, user_id: str, user_name: str, email: str) -> Dict[str, Any]:
        """
        Synthesizes the live career context snapshot for a given candidate.
        Values are null or empty if not yet calculated by the user.
        """
        # 1. Profile
        profile_data = self.profiles_repo.get(user_id) or {}
        target_career = profile_data.get("careerGoals") or profile_data.get("targetRole")
        if not target_career and profile_data.get("preferredRoles"):
            roles = profile_data.get("preferredRoles")
            if isinstance(roles, list) and len(roles) > 0:
                target_career = roles[0]

        # 2. Recommendations
        recs = self.recs_repo.query_by_user(user_id, limit=5)
        top_rec = recs[0] if recs else None
        career_match_score = None
        if top_rec:
            if not target_career:
                target_career = top_rec.get("careerTitle") or top_rec.get("title")
            raw_score = top_rec.get("matchScore")
            if raw_score is not None:
                career_match_score = int(round(raw_score * 100 if raw_score <= 1.0 else raw_score))

        # 3. Verified Skills
        user_skills_docs = self.skills_repo.query_by_user(user_id, limit=50)
        top_skills = []
        for s in user_skills_docs:
            top_skills.append({
                "name": s.get("skillName") or s.get("name", "Unknown Skill"),
                "proficiency": s.get("proficiency", 1),
                "isVerified": s.get("isVerified", False),
            })

        # 4. Skill Gaps
        skill_gaps_docs = self.skill_gaps_repo.query_by_user(user_id, limit=10)
        top_skill_gaps = []
        for g in skill_gaps_docs:
            gap_name = g.get("skillName") or g.get("name")
            if gap_name:
                top_skill_gaps.append({
                    "name": gap_name,
                    "severity": g.get("severity", "MEDIUM"),
                    "requiredProficiency": g.get("requiredProficiency", 3),
                    "currentProficiency": g.get("currentProficiency", 0),
                })

        # If no explicit skill gap doc, check missing skills in top recommendation
        if not top_skill_gaps and top_rec and top_rec.get("missingSkills"):
            missing = top_rec.get("missingSkills")
            if isinstance(missing, list):
                for m in missing[:5]:
                    name = m if isinstance(m, str) else m.get("name", "Skill")
                    top_skill_gaps.append({
                        "name": name,
                        "severity": "HIGH",
                        "requiredProficiency": 3,
                        "currentProficiency": 1,
                    })

        # 5. Roadmap
        roadmaps = self.roadmaps_repo.query_by_user(user_id, limit=5)
        active_roadmap_doc = next((r for r in roadmaps if r.get("status") == "ACTIVE"), None)
        if not active_roadmap_doc and roadmaps:
            active_roadmap_doc = roadmaps[0]

        roadmap_data = None
        if active_roadmap_doc:
            roadmap_id = active_roadmap_doc.get("id")
            items = []
            if roadmap_id:
                items = self.roadmap_items_repo.query_by_field("roadmapId", "==", roadmap_id, limit=50)
            
            # Find next incomplete milestone
            incomplete_items = [i for i in items if not i.get("isCompleted", False) and i.get("status") != "COMPLETED"]
            next_milestone = incomplete_items[0].get("title") if incomplete_items else None
            
            total_items = len(items)
            completed_items = sum(1 for i in items if i.get("isCompleted") or i.get("status") == "COMPLETED")
            progress_pct = int(round((completed_items / total_items * 100))) if total_items > 0 else active_roadmap_doc.get("progressPercent", 0)

            roadmap_data = {
                "id": roadmap_id,
                "title": active_roadmap_doc.get("careerTitle", target_career or "Engineering Pathway"),
                "progressPercent": progress_pct,
                "totalMilestones": total_items,
                "completedMilestones": completed_items,
                "nextMilestone": next_milestone,
                "currentPhase": active_roadmap_doc.get("currentPhase", 1),
            }

        # 6. Active Project
        user_projects = self.user_projects_repo.query_by_user(user_id, limit=10)
        active_proj_doc = next((p for p in user_projects if p.get("status") in ["ACTIVE", "IN_PROGRESS"]), None)
        active_project_data = None
        if active_proj_doc:
            active_project_data = {
                "id": active_proj_doc.get("id"),
                "projectId": active_proj_doc.get("projectId"),
                "title": active_proj_doc.get("title", "Applied Engineering Project"),
                "status": active_proj_doc.get("status"),
                "currentMilestone": active_proj_doc.get("currentMilestone", "Initial Implementation"),
                "progressPercent": active_proj_doc.get("progressPercent", 0),
            }

        # 7. Resume Analysis
        resume_analyses = self.resumes_repo.query_by_user(user_id, limit=5)
        resume_ats_score = None
        if resume_analyses:
            latest_resume = resume_analyses[0]
            resume_ats_score = latest_resume.get("atsScore") or latest_resume.get("score")

        # 8. Assessment
        assessments = self.assessments_repo.query_by_user(user_id, limit=5)
        assessment_score = None
        if assessments:
            latest_attempt = assessments[0]
            assessment_score = latest_attempt.get("scorePercent") or latest_attempt.get("score")

        # 9. Dynamic Contextual Prompts based on actual telemetry
        suggested_prompts = self._generate_suggested_prompts(
            target_career=target_career,
            top_skill_gaps=top_skill_gaps,
            roadmap_data=roadmap_data,
            active_project_data=active_project_data,
            resume_ats_score=resume_ats_score,
        )

        return {
            "user_id": user_id,
            "user_name": user_name,
            "email": email,
            "target_career": target_career,
            "career_match_score": career_match_score,
            "top_skill_gaps": top_skill_gaps,
            "top_skills": top_skills[:10],
            "roadmap": roadmap_data,
            "active_project": active_project_data,
            "resume_ats_score": resume_ats_score,
            "assessment_score": assessment_score,
            "suggested_prompts": suggested_prompts,
        }

    def _generate_suggested_prompts(
        self,
        target_career: Optional[str],
        top_skill_gaps: List[Dict[str, Any]],
        roadmap_data: Optional[Dict[str, Any]],
        active_project_data: Optional[Dict[str, Any]],
        resume_ats_score: Optional[int],
    ) -> List[str]:
        prompts = []

        if top_skill_gaps:
            top_gap = top_skill_gaps[0].get("name")
            prompts.append(f"How can I close my {top_gap} skill gap with practical projects?")
            prompts.append(f"Teach me the core architectural patterns of {top_gap}.")

        if roadmap_data and roadmap_data.get("nextMilestone"):
            next_m = roadmap_data.get("nextMilestone")
            prompts.append(f"What should I do to complete '{next_m}' on my roadmap?")
        elif roadmap_data:
            prompts.append("What should I prioritize on my active roadmap this month?")

        if active_project_data:
            proj_title = active_project_data.get("title")
            prompts.append(f"How can I unblock milestone deliverables in {proj_title}?")

        if resume_ats_score is not None:
            prompts.append(f"How can I improve my resume ATS score from {resume_ats_score}?")

        if target_career:
            prompts.append(f"What technical interview questions should I practice for {target_career}?")
        else:
            prompts.append("What career pathway best matches my existing engineering skills?")

        # Return top 4 distinct prompts
        return prompts[:4]


career_context_service = CareerContextService()
