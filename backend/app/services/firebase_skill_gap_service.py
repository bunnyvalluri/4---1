from typing import Any, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections


class FirebaseSkillGapService:
    """Queries and manages skill gap assessments stored in Cloud Firestore."""

    def __init__(self):
        self.gaps_repo = FirestoreRepository(FirestoreCollections.SKILL_GAPS)

    def get_skill_gaps(self, user_id: str, career_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Queries skill gaps for a user, optionally filtered by careerId."""
        if career_id:
            all_user_gaps = self.gaps_repo.query_by_user(user_id)
            return [g for g in all_user_gaps if g.get("careerId") == career_id]
        return self.gaps_repo.query_by_user(user_id)
