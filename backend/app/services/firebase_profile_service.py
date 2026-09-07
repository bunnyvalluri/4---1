from typing import Any, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.core.exceptions import ValidationError


class FirebaseProfileService:
    """Manages candidate profile, education, experiences, and skill matrices in Firestore."""

    def __init__(self):
        self.profiles_repo = FirestoreRepository(FirestoreCollections.PROFILES)
        self.education_repo = FirestoreRepository(FirestoreCollections.EDUCATION)
        self.experience_repo = FirestoreRepository(FirestoreCollections.EXPERIENCES)
        self.user_skills_repo = FirestoreRepository(FirestoreCollections.USER_SKILLS)
        self.certifications_repo = FirestoreRepository(FirestoreCollections.CERTIFICATIONS)

    def get_profile(self, user_id: str) -> Dict[str, Any]:
        """Retrieves full candidate profile including related sub-entities."""
        profile = self.profiles_repo.get(user_id) or {}
        education = self.education_repo.query_by_user(user_id)
        experiences = self.experience_repo.query_by_user(user_id)
        skills = self.user_skills_repo.query_by_user(user_id)
        certifications = self.certifications_repo.query_by_user(user_id)

        return {
            "profile": profile,
            "education": education,
            "experiences": experiences,
            "skills": skills,
            "certifications": certifications,
        }

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates the candidate profile attributes."""
        # Clean forbidden fields
        cleaned = {k: v for k, v in updates.items() if k not in ("userId", "id", "createdAt")}
        cleaned["userId"] = user_id
        result = self.profiles_repo.set(user_id, cleaned, merge=True)
        record_audit_log(user_id, "PROFILE_UPDATED", f"profiles/{user_id}")
        return result

    def set_user_skill(self, user_id: str, skill_name: str, proficiency: int, category: str = "TECHNICAL") -> Dict[str, Any]:
        """Upserts a user skill rating (1-5) in user_skills collection."""
        if not (1 <= proficiency <= 5):
            raise ValidationError("Skill proficiency must be an integer between 1 and 5.")

        doc_id = f"{user_id}_{skill_name.lower().replace(' ', '_')}"
        skill_data = {
            "userId": user_id,
            "skillName": skill_name,
            "proficiency": proficiency,
            "category": category.upper(),
            "updatedAt": now_utc_iso(),
        }
        return self.user_skills_repo.set(doc_id, skill_data, merge=True)

    def get_user_skills_dict(self, user_id: str) -> Dict[str, int]:
        """Returns normalized skill mapping: {normalized_skill_name: proficiency}."""
        docs = self.user_skills_repo.query_by_user(user_id)
        return {d.get("skillName", "").lower().strip(): int(d.get("proficiency", 1)) for d in docs}
