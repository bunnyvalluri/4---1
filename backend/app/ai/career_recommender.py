from typing import Any, Dict, List
from app.core.config import settings
from app.core.logging import logger
from app.ai.prompts.career_prompt import CAREER_RECOMMENDATION_SYSTEM_PROMPT


class AICareerRecommender:
    """
    Synthesizes AI-driven qualitative reasoning for career recommendations.
    Uses Google Generative AI (Gemini) when an API key is available,
    with a rich, deterministic heuristic generator when offline.
    """

    async def generate_career_narrative(
        self,
        candidate_summary: Dict[str, Any],
        career: Dict[str, Any],
        matching_skills: List[str],
        missing_skills: List[str],
        match_score: float,
    ) -> str:
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"{CAREER_RECOMMENDATION_SYSTEM_PROMPT}\n"
                    f"Candidate has skills: {', '.join(matching_skills)}. "
                    f"Missing skills: {', '.join(missing_skills)}. "
                    f"Target Career: {career.get('title')} ({career.get('category')}). "
                    f"Match Score: {match_score}%. "
                    f"Write a 2-paragraph personalized recommendation narrative."
                )
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"External LLM generation failed, using fallback: {e}")

        # Deterministic fallback narrative
        skills_str = ", ".join(matching_skills[:4]) if matching_skills else "your technical aptitude"
        missing_str = ", ".join(missing_skills[:3]) if missing_skills else "advanced domain frameworks"
        return (
            f"Your foundational strengths in {skills_str} directly align with the core competencies of a "
            f"{career.get('title')}. With a compatibility rating of {match_score:.1f}%, you possess the logical "
            f"and analytical baseline required for success in this role.\n\n"
            f"To become a top-tier candidate in this field, focus your immediate learning sprints on {missing_str}. "
            f"Engaging with real-world open-source repositories and building an end-to-end portfolio piece will "
            f"bridge this gap effectively."
        )


ai_career_recommender = AICareerRecommender()
