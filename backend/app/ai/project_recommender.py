from typing import Any, Dict, List


class ProjectRecommender:
    """
    Recommends practical portfolio projects targeting specific skill gaps and career profiles.
    """

    def filter_projects_for_user(
        self,
        projects: List[Dict[str, Any]],
        missing_skills: List[str],
        difficulty_preference: str = None,
    ) -> List[Dict[str, Any]]:
        if not projects:
            return []

        scored_projects = []
        missing_set = {s.lower() for s in missing_skills}

        for p in projects:
            p_skills = {s.lower() for s in p.get("skills_learned", [])}
            overlap = len(missing_set.intersection(p_skills))
            score = overlap * 2.0

            if difficulty_preference and p.get("difficulty", "").lower() == difficulty_preference.lower():
                score += 1.5

            scored_projects.append((score, p))

        scored_projects.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored_projects]


project_recommender = ProjectRecommender()
