from typing import Any, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.ml.scoring import calculate_career_match
from app.services.firebase_profile_service import FirebaseProfileService
from app.services.firebase_assessment_service import FirebaseAssessmentService


class FirebaseRecommendationService:
    """Computes and stores multi-factor career recommendations in Cloud Firestore."""

    def __init__(self):
        self.recs_repo = FirestoreRepository(FirestoreCollections.CAREER_RECOMMENDATIONS)
        self.careers_repo = FirestoreRepository(FirestoreCollections.CAREERS)
        self.career_skills_repo = FirestoreRepository(FirestoreCollections.CAREER_SKILLS)
        self.gaps_repo = FirestoreRepository(FirestoreCollections.SKILL_GAPS)
        self.profile_svc = FirebaseProfileService()
        self.assessment_svc = FirebaseAssessmentService()

    def generate_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Executes multi-factor recommendation pipeline against Firestore data:
        1. Fetch candidate skills, profile bio, experience, and aptitude scores.
        2. Fetch careers and prerequisites from Firestore.
        3. Execute Scikit-learn multi-factor scoring model.
        4. Persist top matches in career_recommendations collection.
        5. Persist missing skills in skill_gaps collection.
        """
        user_skills = self.profile_svc.get_user_skills_dict(user_id)
        profile_data = self.profile_svc.get_profile(user_id)
        profile_doc = profile_data.get("profile", {})
        bio = profile_doc.get("bio", "") or profile_doc.get("careerGoals", "")
        exp_years = float(profile_doc.get("workExperienceYears", 0.0))
        user_aptitude = self.assessment_svc.get_latest_user_scores(user_id)

        careers = self.careers_repo.list_all(limit=100)
        recommendations = []

        for c in careers:
            career_id = c.get("id")
            title = c.get("title", "")
            overview = c.get("overview", "")
            seniority = c.get("experienceLevel", "Mid-Level")

            # Fetch career required skills
            career_skills = self.career_skills_repo.query_by_field("careerId", "==", career_id)
            if not career_skills and "skills" in c:
                career_skills = c["skills"]

            # Format for scoring engine
            formatted_skills = []
            for cs in career_skills:
                formatted_skills.append({
                    "name": cs.get("skillName") or cs.get("name", ""),
                    "is_required": cs.get("isRequired", cs.get("is_required", True)),
                    "min_proficiency": cs.get("minProficiency", cs.get("min_proficiency", 3)),
                    "weight": cs.get("weight", 1.0),
                })

            benchmarks = c.get("aptitudeBenchmarks", {
                "LOGICAL": 70.0,
                "QUANTITATIVE": 65.0,
                "ANALYTICAL": 70.0,
                "VERBAL": 65.0,
                "PROBLEM_SOLVING": 75.0,
            })

            match_result = calculate_career_match(
                user_skills=user_skills,
                career_skills=formatted_skills,
                user_aptitude=user_aptitude,
                career_aptitude_reqs=benchmarks,
                profile_text=bio,
                career_overview=overview,
                career_title=title,
                user_experience_years=exp_years,
                career_experience_level=seniority,
            )

            rec_data = {
                "userId": user_id,
                "careerId": career_id,
                "careerTitle": title,
                "matchScore": match_result["match_score"],
                "breakdown": match_result["breakdown"],
                "matchingSkills": match_result["matching_skills"],
                "missingSkills": match_result["missing_skills"],
                "updatedAt": now_utc_iso(),
            }

            # Persist recommendation
            doc_id = f"{user_id}_{career_id}"
            saved_rec = self.recs_repo.set(doc_id, rec_data, merge=True)
            recommendations.append(saved_rec)

            # Persist skill gaps
            for ms in match_result["missing_skills"]:
                gap_id = f"{user_id}_{career_id}_{ms['name'].lower().replace(' ', '_')}"
                req_prof = ms.get("required_proficiency", 3)
                user_prof = ms.get("user_proficiency", 0)
                diff = req_prof - user_prof
                severity = "CRITICAL" if diff >= 2 and ms.get("is_required") else "HIGH" if diff >= 1 and ms.get("is_required") else "MODERATE"

                self.gaps_repo.set(gap_id, {
                    "userId": user_id,
                    "careerId": career_id,
                    "skillName": ms["name"],
                    "userProficiency": user_prof,
                    "requiredProficiency": req_prof,
                    "severity": severity,
                    "isRequired": ms.get("is_required", True),
                    "updatedAt": now_utc_iso(),
                }, merge=True)

        record_audit_log(user_id, "RECOMMENDATIONS_GENERATED", "career_recommendations")
        recommendations.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
        return recommendations

    def get_recommendations(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves stored recommendations for the user."""
        recs = self.recs_repo.query_by_user(user_id)
        if not recs:
            return self.generate_recommendations(user_id)
        recs.sort(key=lambda x: x.get("matchScore", 0), reverse=True)
        return recs
