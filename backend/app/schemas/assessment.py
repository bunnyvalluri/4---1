from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.assessment import AptitudeCategory


class AptitudeQuestionResponse(BaseModel):
    id: str
    category: AptitudeCategory
    question: str
    options: List[str]
    difficulty: str
    order: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class AptitudeQuestionDetailResponse(BaseModel):
    id: str
    category: AptitudeCategory
    question: str
    options: List[str]
    correct_option: int
    explanation: str
    difficulty: str
    order: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class StartAssessmentRequest(BaseModel):
    restart: bool = False


class StartAssessmentResponse(BaseModel):
    attempt_id: str
    status: str
    current_question_index: int
    answers: Dict[str, int]
    flagged_questions: List[str]
    total_questions: int
    started_at: Optional[datetime] = None


class SaveAnswerRequest(BaseModel):
    question_id: str
    selected_option: int  # 0-indexed
    current_question_index: Optional[int] = None
    time_spent_seconds: Optional[int] = None


class ToggleFlagRequest(BaseModel):
    question_id: str
    flagged: bool


class QuestionReviewStatus(BaseModel):
    question_id: str
    order: int
    category: str
    is_answered: bool
    is_flagged: bool
    selected_option: Optional[int] = None


class AssessmentReviewResponse(BaseModel):
    attempt_id: str
    total_questions: int
    answered_count: int
    unanswered_count: int
    flagged_count: int
    section_summary: Dict[str, Dict[str, int]]
    questions: List[QuestionReviewStatus]


class AptitudeAnswerSubmission(BaseModel):
    question_id: str
    selected_option: int  # 0-indexed


class SubmitAssessmentRequest(BaseModel):
    answers: Optional[List[AptitudeAnswerSubmission]] = None
    time_spent_seconds: Optional[int] = None


class CareerImpactItem(BaseModel):
    career_id: Optional[str] = None
    career_title: str
    match_percentage: float
    fit_level: str
    rationale: str


class AIInsightsSummary(BaseModel):
    summary: str
    strengths: List[str]
    development_areas: List[str]
    career_implications: List[str]
    recommended_actions: List[str]
    ai_confidence: float = 0.95


class ReviewQuestionItem(BaseModel):
    question_id: str
    category: str
    question: str
    options: List[str]
    selected_option: Optional[int] = None
    correct_option: int
    is_correct: bool
    explanation: str
    difficulty: str


class AssessmentResultResponse(BaseModel):
    id: str
    user_id: str
    status: str = "COMPLETED"
    score: float
    performance_tier: str = "Tier 2 • Proficient"
    total_questions: int
    correct_count: int
    category_scores: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    career_impacts: List[CareerImpactItem] = []
    ai_insights: Optional[Dict[str, Any]] = None
    review_items: Optional[List[ReviewQuestionItem]] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AssessmentStatusResponse(BaseModel):
    status: str  # "NOT_STARTED", "IN_PROGRESS", "COMPLETED", "PAUSED"
    has_active_attempt: bool
    active_attempt_id: Optional[str] = None
    current_question_index: int = 0
    answered_count: int = 0
    total_questions: int = 25
    progress_percent: int = 0
    flagged_count: int = 0
    last_saved_at: Optional[datetime] = None
    latest_result: Optional[AssessmentResultResponse] = None
