"""
Deterministic multi-factor project recommendation match engine.
Calculates transparent relevance scores based on:
1. Career Alignment (30%)
2. Skill Gap Coverage (30%)
3. Current Skill Compatibility (15%)
4. Roadmap Alignment (10%)
5. Experience Level Compatibility (10%)
6. Portfolio Value / ROI (5%)
"""
from typing import Any, Dict, List, Optional, Set, Tuple
from app.schemas.project import ProjectMatchBreakdown, SkillGapCoverageItem


def calculate_project_match(
    project_title: str,
    project_career_id: str,
    project_difficulty: str,
    project_tech_stack: List[str],
    project_skills_learned: List[str],
    project_portfolio_value: str,
    target_career_id: Optional[str],
    target_career_title: str,
    target_career_skills: List[str],
    user_skills: List[Dict[str, Any]],
    user_skill_gaps: List[Dict[str, Any]],
    active_roadmap: Optional[Dict[str, Any]],
    user_experience_level: str = "Entry",
) -> Tuple[int, ProjectMatchBreakdown, List[str], List[SkillGapCoverageItem]]:
    """
    Computes a deterministic, transparent 0-100 match score and explanation.
    """
    proj_skills_set = {s.strip().lower() for s in (project_skills_learned + project_tech_stack)}
    user_skill_names = {s.get("name", "").strip().lower() for s in user_skills if s.get("name")}

    # 1. Career Alignment (Max 30)
    if target_career_id and project_career_id == target_career_id:
        career_score = 30.0
    elif target_career_skills:
        tc_skills_set = {s.strip().lower() for s in target_career_skills}
        overlap = len(proj_skills_set.intersection(tc_skills_set))
        ratio = overlap / max(1, len(tc_skills_set))
        career_score = round(min(30.0, max(12.0, ratio * 30.0)), 1)
    else:
        career_score = 22.0

    # 2. Skill Gap Coverage (Max 30)
    addressed_gaps: List[SkillGapCoverageItem] = []
    if user_skill_gaps:
        gap_matches = 0
        for gap in user_skill_gaps:
            gap_name = gap.get("name", "").strip()
            if not gap_name:
                continue
            if gap_name.lower() in proj_skills_set or any(gap_name.lower() in ps for ps in proj_skills_set):
                gap_matches += 1
                addressed_gaps.append(
                    SkillGapCoverageItem(
                        skill_name=gap_name,
                        coverage_percent=gap.get("coverage", 80),
                        current_level=gap.get("current_level", "Beginner"),
                        target_level=gap.get("target_level", "Advanced"),
                    )
                )
        if gap_matches > 0:
            ratio = gap_matches / max(1, min(len(user_skill_gaps), 4))
            gap_score = round(min(30.0, max(15.0, ratio * 30.0)), 1)
        else:
            gap_score = 16.0
    else:
        # Default baseline if candidate hasn't completed diagnostic
        gap_score = 24.0
        for ps in project_skills_learned[:3]:
            addressed_gaps.append(
                SkillGapCoverageItem(
                    skill_name=ps,
                    coverage_percent=85,
                    current_level="Novice",
                    target_level="Production",
                )
            )

    # 3. Current Skill Compatibility (Max 15)
    tech_set = {t.strip().lower() for t in project_tech_stack}
    known_tech = tech_set.intersection(user_skill_names)
    if tech_set:
        compat_ratio = len(known_tech) / len(tech_set)
        # Even with zero direct overlap, 6 pts awarded for programming foundation
        compat_score = round(min(15.0, max(6.0, compat_ratio * 15.0 + 5.0)), 1)
    else:
        compat_score = 11.0

    # 4. Roadmap Alignment (Max 10)
    if active_roadmap:
        roadmap_skills = set()
        for item in active_roadmap.get("items", []):
            for sk in item.get("skills", []):
                roadmap_skills.add(sk.strip().lower())
        overlap_rm = len(proj_skills_set.intersection(roadmap_skills))
        if overlap_rm > 0:
            roadmap_score = 9.5
        else:
            roadmap_score = 7.0
    else:
        roadmap_score = 8.0

    # 5. Experience Level (Max 10)
    user_exp_clean = (user_experience_level or "Entry").lower()
    proj_diff_clean = (project_difficulty or "Intermediate").lower()

    if "senior" in user_exp_clean or "advanced" in user_exp_clean:
        if "advanced" in proj_diff_clean:
            exp_score = 10.0
        elif "intermediate" in proj_diff_clean:
            exp_score = 8.0
        else:
            exp_score = 5.0
    elif "mid" in user_exp_clean or "intermediate" in user_exp_clean:
        if "intermediate" in proj_diff_clean:
            exp_score = 10.0
        elif "advanced" in proj_diff_clean:
            exp_score = 8.5
        else:
            exp_score = 7.0
    else:  # Entry / Beginner
        if "beginner" in proj_diff_clean:
            exp_score = 10.0
        elif "intermediate" in proj_diff_clean:
            exp_score = 8.5
        else:
            exp_score = 6.5

    # 6. Portfolio Value (Max 5)
    pv_lower = (project_portfolio_value or "").lower()
    if "extreme" in pv_lower:
        port_score = 5.0
    elif "high" in pv_lower:
        port_score = 4.5
    else:
        port_score = 3.5

    total = int(round(career_score + gap_score + compat_score + roadmap_score + exp_score + port_score))
    total = max(55, min(98, total))

    breakdown = ProjectMatchBreakdown(
        career_alignment=career_score,
        skill_gap_coverage=gap_score,
        skill_compatibility=compat_score,
        roadmap_alignment=roadmap_score,
        experience_level=exp_score,
        portfolio_value=port_score,
        total_match_score=total,
    )

    # Why Recommended Narrative Bullets
    why: List[str] = []
    if addressed_gaps:
        top_gaps = ", ".join([g.skill_name for g in addressed_gaps[:2]])
        why.append(f"Directly bridges key skill gaps: {top_gaps}")
    else:
        why.append("Builds essential foundational engineering competence")

    if target_career_title:
        why.append(f"Calibrated for high-demand {target_career_title} requirements")
    else:
        why.append("Covers industry-standard backend and system design patterns")

    why.append("Generates verifiable GitHub proof with tests, docs, and deployment")
    why.append(f"Matches your current experience level ({project_difficulty} tier)")

    return total, breakdown, why, addressed_gaps
