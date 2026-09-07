from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.assessment import AptitudeAttempt, AptitudeCategory, AptitudeQuestion
from app.repositories.assessment_repository import AssessmentRepository
from app.schemas.assessment import SubmitAssessmentRequest, AssessmentResultResponse


class AssessmentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.assessment_repo = AssessmentRepository(session)

    async def get_assessment_questions(
        self,
        category: AptitudeCategory = None,
        limit: int = 25,
    ) -> List[AptitudeQuestion]:
        return await self.assessment_repo.get_questions(category=category, limit=limit)

    async def evaluate_submission(
        self,
        user_id: str,
        submission: SubmitAssessmentRequest,
    ) -> AptitudeAttempt:
        category_stats: Dict[str, Dict[str, int]] = {}
        correct_count = 0
        total_questions = len(submission.answers)

        for ans in submission.answers:
            q = await self.assessment_repo.get_question_by_id(ans.question_id)
            if not q:
                continue

            cat_str = q.category.value if hasattr(q.category, "value") else str(q.category)
            if cat_str not in category_stats:
                category_stats[cat_str] = {"score": 0, "total": 0}

            category_stats[cat_str]["total"] += 1
            if q.correct_option == ans.selected_option:
                correct_count += 1
                category_stats[cat_str]["score"] += 1

        overall_percentage = (
            (correct_count / total_questions) * 100.0 if total_questions > 0 else 0.0
        )

        # Process strengths & weaknesses
        strengths = []
        weaknesses = []
        formatted_category_scores = {}

        for cat, stats in category_stats.items():
            pct = (stats["score"] / stats["total"]) * 100.0 if stats["total"] > 0 else 0.0
            formatted_category_scores[cat] = {
                "score": stats["score"],
                "total": stats["total"],
                "percentage": round(pct, 1),
            }
            if pct >= 70.0:
                strengths.append(cat)
            else:
                weaknesses.append(cat)

        attempt = AptitudeAttempt(
            user_id=user_id,
            score=round(overall_percentage, 1),
            total_questions=total_questions,
            correct_count=correct_count,
            category_scores=formatted_category_scores,
            strengths=strengths,
            weaknesses=weaknesses,
        )
        return await self.assessment_repo.create_attempt(attempt)

    async def get_user_attempts(self, user_id: str) -> List[AptitudeAttempt]:
        return await self.assessment_repo.get_user_attempts(user_id)
