from typing import Any, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.core.exceptions import ValidationError


class FirebaseAssessmentService:
    """Psychometric & cognitive aptitude testing service backed by Cloud Firestore."""

    def __init__(self):
        self.questions_repo = FirestoreRepository(FirestoreCollections.QUESTIONS)
        self.attempts_repo = FirestoreRepository(FirestoreCollections.ASSESSMENT_ATTEMPTS)
        self.answers_repo = FirestoreRepository(FirestoreCollections.ANSWERS)

    def get_questions(self, category: Optional[str] = None, limit: int = 25) -> List[Dict[str, Any]]:
        """Retrieves diagnostic questions, optionally filtered by cognitive category."""
        if category:
            questions = self.questions_repo.query_by_field("category", "==", category.upper(), limit=limit)
        else:
            questions = self.questions_repo.list_all(limit=limit)

        # Strip correct answer from client payload
        sanitized = []
        for q in questions:
            copy_q = dict(q)
            copy_q.pop("correctAnswer", None)
            copy_q.pop("explanation", None)
            sanitized.append(copy_q)
        return sanitized

    def submit_assessment(self, user_id: str, answers: Dict[str, str], duration_seconds: int = 0) -> Dict[str, Any]:
        """
        Evaluates submitted answers, scores each category, and persists to assessment_attempts.
        """
        if not answers:
            raise ValidationError("Submission must contain answers to questions.")

        total_questions = len(answers)
        correct_count = 0
        category_totals = {}
        category_correct = {}

        for q_id, selected_opt in answers.items():
            q_doc = self.questions_repo.get(q_id)
            if not q_doc:
                continue

            category = q_doc.get("category", "LOGICAL").upper()
            category_totals[category] = category_totals.get(category, 0) + 1

            is_correct = (selected_opt.strip().upper() == q_doc.get("correctAnswer", "").strip().upper())
            if is_correct:
                correct_count += 1
                category_correct[category] = category_correct.get(category, 0) + 1

            # Store individual answer record
            self.answers_repo.create({
                "userId": user_id,
                "questionId": q_id,
                "selectedOption": selected_opt,
                "isCorrect": is_correct,
                "createdAt": now_utc_iso(),
            })

        # Calculate category percentages
        category_scores = {}
        for cat, total in category_totals.items():
            corr = category_correct.get(cat, 0)
            category_scores[cat] = round((corr / total) * 100.0, 1) if total > 0 else 50.0

        overall_score = round((correct_count / total_questions) * 100.0, 1) if total_questions > 0 else 0.0

        attempt_data = {
            "userId": user_id,
            "overallScore": overall_score,
            "categoryScores": category_scores,
            "durationSeconds": duration_seconds,
            "totalQuestions": total_questions,
            "correctCount": correct_count,
            "completedAt": now_utc_iso(),
        }

        attempt = self.attempts_repo.create(attempt_data)
        record_audit_log(user_id, "ASSESSMENT_SUBMITTED", f"assessment_attempts/{attempt['id']}")
        return attempt

    def get_latest_user_scores(self, user_id: str) -> Dict[str, float]:
        """Returns the most recent aptitude scores by category for user."""
        attempts = self.attempts_repo.query_by_user(user_id, limit=5)
        if not attempts:
            return {}
        # Sort by completedAt descending
        sorted_attempts = sorted(attempts, key=lambda x: x.get("completedAt", ""), reverse=True)
        return sorted_attempts[0].get("categoryScores", {})
