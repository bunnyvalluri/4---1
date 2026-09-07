import numpy as np
from typing import Dict, Any, List


def extract_user_features(
    profile_data: Dict[str, Any],
    skills_map: Dict[str, int],  # skill_name -> proficiency (1-5)
    aptitude_scores: Dict[str, float],  # category -> percentage (0-100)
) -> Dict[str, Any]:
    """
    Extract structured numerical and textual features from a user's data.
    """
    work_exp = float(profile_data.get("work_experience_years") or 0.0)
    cgpa = float(profile_data.get("cgpa") or 7.0)

    # Average skill proficiency
    avg_skill_prof = (
        float(np.mean(list(skills_map.values()))) if skills_map else 0.0
    )

    # Average aptitude score
    avg_aptitude = (
        float(np.mean(list(aptitude_scores.values())))
        if aptitude_scores
        else 60.0
    )

    # Text summary for semantic matching
    interests_text = " ".join(profile_data.get("interests", []))
    industries_text = " ".join(profile_data.get("preferred_industries", []))
    roles_text = " ".join(profile_data.get("preferred_roles", []))
    bio = profile_data.get("bio", "")
    goals = profile_data.get("career_goals", "")

    aggregated_profile_text = f"{bio} {goals} {interests_text} {industries_text} {roles_text} {' '.join(skills_map.keys())}"

    return {
        "work_experience_years": work_exp,
        "cgpa": cgpa,
        "avg_skill_proficiency": avg_skill_prof,
        "avg_aptitude_score": avg_aptitude,
        "aptitude_scores": aptitude_scores,
        "skills_map": skills_map,
        "aggregated_profile_text": aggregated_profile_text,
    }
