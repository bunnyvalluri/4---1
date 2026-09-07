from typing import Any, Dict, List
from app.models.recommendation import SkillGap


class SkillAnalyzer:
    """
    Analyzes gaps between candidate current proficiency and career requirements.
    Calculates severity (Low, Moderate, High, Critical) and priority ranking.
    """

    def analyze_gaps(
        self,
        user_id: str,
        career_id: str,
        missing_skills_data: List[Dict[str, Any]],
        career_skills: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        gaps = []
        for item in missing_skills_data:
            skill_id = item.get("skill_id")
            skill_name = item.get("name", "")
            is_req = item.get("is_required", True)
            min_prof = item.get("required_proficiency", 3)
            user_prof = item.get("user_proficiency", 0)

            diff = min_prof - user_prof

            if is_req and diff >= 3:
                severity = "Critical"
                priority = 1
            elif is_req:
                severity = "High"
                priority = 2
            elif diff >= 3:
                severity = "Moderate"
                priority = 3
            else:
                severity = "Low"
                priority = 4

            suggested_resource = (
                f"Official documentation and practical course roadmap for {skill_name}"
            )

            gaps.append({
                "user_id": user_id,
                "career_id": career_id,
                "skill_id": skill_id,
                "current_proficiency": user_prof,
                "required_proficiency": min_prof,
                "gap_severity": severity,
                "priority": priority,
                "suggested_resource": suggested_resource,
            })

        # Sort by priority ascending (1 is highest priority)
        gaps.sort(key=lambda x: x["priority"])
        return gaps


skill_analyzer = SkillAnalyzer()
