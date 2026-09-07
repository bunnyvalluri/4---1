from typing import Any, Dict, List
import pandas as pd
from app.ml.scoring import calculate_career_match


class CareerRecommendationEngine:
    """
    ML Recommendation Engine combining rule-based feature vectors,
    TF-IDF text similarity, and weighted multi-factor scoring.
    """

    def rank_careers(
        self,
        user_data: Dict[str, Any],
        careers: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Rank all available careers for a user.
        """
        user_skills = user_data.get("skills_map", {})
        user_aptitude = user_data.get("aptitude_scores", {})
        profile_text = user_data.get("aggregated_profile_text", "")
        experience_years = float(user_data.get("work_experience_years", 0.0))

        results = []
        for career in careers:
            match_res = calculate_career_match(
                user_skills=user_skills,
                career_skills=career.get("skills", []),
                user_aptitude=user_aptitude,
                career_aptitude_reqs=career.get("aptitude_reqs", {}),
                profile_text=profile_text,
                career_overview=career.get("overview", "") + " " + career.get("description", ""),
                career_title=career.get("title", ""),
                user_experience_years=experience_years,
                career_experience_level=career.get("experience_level", "Entry / Mid"),
            )

            # Assemble explainable reasoning
            matched_names = [s["name"] for s in match_res["matching_skills"][:3]]
            missing_names = [s["name"] for s in match_res["missing_skills"][:3]]

            reasoning = f"Strong alignment with your profile based on your proficiency in {', '.join(matched_names) if matched_names else 'core foundational areas'}."
            if missing_names:
                reasoning += f" To excel in this role, prioritize mastering {', '.join(missing_names)}."

            actions = [
                f"Review learning materials for {missing_names[0]}" if missing_names else "Build a production capstone project",
                "Practice relevant technical interview and system design problems",
                "Update your resume to emphasize matching competencies",
            ]

            results.append({
                "career_id": career["id"],
                "career_title": career["title"],
                "match_score": match_res["match_score"],
                "matching_skills": match_res["matching_skills"],
                "missing_skills": match_res["missing_skills"],
                "breakdown": match_res["breakdown"],
                "reasoning": reasoning,
                "recommended_actions": actions,
            })

        # Sort by match_score descending
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results


recommender_engine = CareerRecommendationEngine()
