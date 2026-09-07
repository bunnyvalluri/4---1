from typing import Any, Dict, List, Tuple
from app.ml.preprocessing import normalize_skill_name
from app.ml.similarity import compute_text_similarity


def compute_skill_match(
    user_skills: Dict[str, int],  # normalized skill name -> proficiency (1-5)
    career_skills: List[Dict[str, Any]],  # list of {name, is_required, min_proficiency, weight}
) -> Tuple[float, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Computes weighted skill match score (0-100), matching skills, and missing skills.
    """
    if not career_skills:
        return 80.0, [], []

    total_weight = 0.0
    accumulated_score = 0.0
    matching_skills = []
    missing_skills = []

    for cs in career_skills:
        name = cs.get("name", "")
        norm_name = normalize_skill_name(name)
        weight = float(cs.get("weight", 1.0))
        if cs.get("is_required", True):
            weight *= 1.5
        min_prof = int(cs.get("min_proficiency", 3))

        total_weight += weight

        user_prof = user_skills.get(norm_name, 0)
        if user_prof > 0:
            # Ratio of user proficiency to required proficiency
            prof_ratio = min(1.0, user_prof / min_prof)
            accumulated_score += weight * prof_ratio
            matching_skills.append({
                "name": name,
                "user_proficiency": user_prof,
                "required_proficiency": min_prof,
                "is_required": cs.get("is_required", True),
                "matched": True,
            })
        else:
            missing_skills.append({
                "name": name,
                "user_proficiency": 0,
                "required_proficiency": min_prof,
                "is_required": cs.get("is_required", True),
                "matched": False,
            })

    score = (accumulated_score / total_weight) * 100.0 if total_weight > 0 else 0.0
    return round(score, 1), matching_skills, missing_skills


def compute_aptitude_match(
    user_aptitude: Dict[str, float],  # category -> percentage (0-100)
    career_reqs: Dict[str, float],  # benchmark scores per category
) -> float:
    """Computes aptitude match score (0-100) comparing user scores to career requirements."""
    if not career_reqs or not user_aptitude:
        return 75.0  # neutral baseline if no assessment or reqs

    ratios = []
    for cat, benchmark in career_reqs.items():
        user_score = user_aptitude.get(cat.upper(), 50.0)
        benchmark_val = float(benchmark) if benchmark else 60.0
        ratio = min(1.2, user_score / benchmark_val)
        ratios.append(ratio)

    avg_ratio = sum(ratios) / len(ratios) if ratios else 1.0
    score = min(100.0, avg_ratio * 80.0)
    return round(score, 1)


def compute_interest_match(
    profile_text: str,
    career_overview: str,
    career_title: str,
) -> float:
    """Computes semantic interest alignment score (0-100)."""
    text_score = compute_text_similarity(profile_text, f"{career_title} {career_overview}")
    # Scaled to 0-100 with generous curve
    score = min(100.0, max(40.0, text_score * 120.0 + 30.0))
    return round(score, 1)


def compute_experience_match(
    user_experience_years: float,
    experience_level_str: str,
) -> float:
    """Computes experience alignment score (0-100)."""
    level_lower = experience_level_str.lower()
    if "entry" in level_lower:
        # Ideal for 0-2 years
        return 95.0 if user_experience_years <= 3 else 80.0
    elif "mid" in level_lower:
        if user_experience_years >= 2.0:
            return 90.0
        return 70.0 + (user_experience_years * 10.0)
    elif "senior" in level_lower:
        if user_experience_years >= 5.0:
            return 95.0
        return 50.0 + (user_experience_years * 8.0)
    return 80.0


def calculate_career_match(
    user_skills: Dict[str, int],
    career_skills: List[Dict[str, Any]],
    user_aptitude: Dict[str, float],
    career_aptitude_reqs: Dict[str, float],
    profile_text: str,
    career_overview: str,
    career_title: str,
    user_experience_years: float,
    career_experience_level: str,
) -> Dict[str, Any]:
    """
    Weighted composite scoring:
    - Skills: 40%
    - Aptitude: 25%
    - Interests & Goals: 20%
    - Experience: 15%
    """
    skill_score, matching_skills, missing_skills = compute_skill_match(user_skills, career_skills)
    aptitude_score = compute_aptitude_match(user_aptitude, career_aptitude_reqs)
    interest_score = compute_interest_match(profile_text, career_overview, career_title)
    experience_score = compute_experience_match(user_experience_years, career_experience_level)

    total_score = (
        skill_score * 0.40
        + aptitude_score * 0.25
        + interest_score * 0.20
        + experience_score * 0.15
    )
    total_score = round(min(99.0, max(20.0, total_score)), 1)

    return {
        "match_score": total_score,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "breakdown": {
            "skill_score": skill_score,
            "aptitude_score": aptitude_score,
            "interest_score": interest_score,
            "experience_score": experience_score,
        },
    }
