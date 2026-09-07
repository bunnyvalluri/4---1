from typing import Any, Dict, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.firebase.auth import verify_firebase_token, get_firebase_user, set_user_role
from app.core.exceptions import AuthenticationError, ValidationError


class FirebaseAuthService:
    """Authentication and identity lifecycle service backed by Firebase Auth & Firestore."""

    def __init__(self):
        self.users_repo = FirestoreRepository(FirestoreCollections.USERS)
        self.profiles_repo = FirestoreRepository(FirestoreCollections.PROFILES)

    def sync_user_session(self, id_token: str) -> Dict[str, Any]:
        """
        Verifies the Firebase ID token and ensures the user record exists in Firestore.
        Returns user identity profile.
        """
        decoded = verify_firebase_token(id_token)
        uid = decoded["uid"]
        email = decoded.get("email", "")
        display_name = decoded.get("name", "")

        user_doc = self.users_repo.get(uid)
        if not user_doc:
            user_doc = self.users_repo.set(uid, {
                "uid": uid,
                "email": email,
                "displayName": display_name,
                "role": "USER",
                "emailVerified": decoded.get("email_verified", False),
                "createdAt": now_utc_iso(),
                "updatedAt": now_utc_iso(),
            })
            # Initialize empty profile document
            self.profiles_repo.set(uid, {
                "userId": uid,
                "bio": "",
                "degree": "",
                "careerGoals": "",
                "interests": [],
                "workExperienceYears": 0.0,
                "createdAt": now_utc_iso(),
                "updatedAt": now_utc_iso(),
            })
            record_audit_log(uid, "USER_REGISTERED", "users")
        else:
            record_audit_log(uid, "USER_LOGIN_SYNC", "users")

        return user_doc

    def get_user_profile(self, uid: str) -> Optional[Dict[str, Any]]:
        """Retrieves user profile and account information."""
        user = self.users_repo.get(uid)
        if not user:
            raise AuthenticationError("User account not found.")
        profile = self.profiles_repo.get(uid)
        return {
            "user": user,
            "profile": profile or {},
        }

    def assign_role(self, admin_uid: str, target_uid: str, role: str) -> Dict[str, Any]:
        """Administrative role assignment with custom claims and audit trail."""
        role_upper = role.upper()
        if role_upper not in ("USER", "ADMIN"):
            raise ValidationError("Invalid role specified. Supported: USER, ADMIN.")

        set_user_role(target_uid, role_upper)
        updated = self.users_repo.update(target_uid, {"role": role_upper})
        record_audit_log(admin_uid, "ROLE_ASSIGNED", f"users/{target_uid}", {"assigned_role": role_upper})
        return updated or {}
