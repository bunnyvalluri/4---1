from datetime import datetime
from typing import Any, Dict, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.assessment import AptitudeCategory


class AptitudeQuestionResponse(BaseModel):
    id: str
    category: AptitudeCategory
    question: str
    options: List[str]
    difficulty: str

    model_config = ConfigDict(from_attributes=True)


class AptitudeAnswerSubmission(BaseModel):
    question_id: str
    selected_option: int  # 0-indexed


class SubmitAssessmentRequest(BaseModel):
    answers: List[AptitudeAnswerSubmission]


class CategoryScoreDetail(BaseModel):
    score: int
    total: int
    percentage: float


class AssessmentResultResponse(BaseModel):
    id: str
    user_id: str
    score: float
    total_questions: int
    correct_count: int
    category_scores: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
