import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.ai.career_assistant import career_assistant
from app.services.firebase_profile_service import FirebaseProfileService
from app.core.exceptions import PermissionDeniedError, ValidationError


class FirebaseAssistantService:
    """Conversational AI career advisor backed by Cloud Firestore sessions and messages."""

    def __init__(self):
        self.sessions_repo = FirestoreRepository(FirestoreCollections.CHAT_SESSIONS)
        self.messages_repo = FirestoreRepository(FirestoreCollections.CHAT_MESSAGES)
        self.profile_svc = FirebaseProfileService()

    def get_or_create_session(self, user_id: str, title: str = "Career Advisory Session") -> Dict[str, Any]:
        """Gets the most recent session or creates a new one for the user."""
        sessions = self.sessions_repo.query_by_user(user_id, limit=1)
        if sessions:
            return sessions[0]

        session_id = uuid.uuid4().hex
        session_doc = {
            "userId": user_id,
            "title": title,
            "createdAt": now_utc_iso(),
            "updatedAt": now_utc_iso(),
        }
        return self.sessions_repo.set(session_id, session_doc)

    async def send_message(self, user_id: str, message_text: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Processes candidate message, queries AI assistant, and persists conversation."""
        if not message_text.strip():
            raise ValidationError("Message text cannot be empty.")

        if session_id:
            session = self.sessions_repo.get(session_id)
            if not session or session.get("userId") != user_id:
                raise PermissionDeniedError("Unauthorized access to chat session.")
        else:
            session = self.get_or_create_session(user_id)
            session_id = session["id"]

        # 1. Save user message
        user_msg = {
            "sessionId": session_id,
            "userId": user_id,
            "role": "user",
            "content": message_text,
            "createdAt": now_utc_iso(),
        }
        self.messages_repo.create(user_msg)

        # 2. Retrieve user context from Firestore profile
        profile_data = self.profile_svc.get_profile(user_id)
        user_context = {
            "bio": profile_data.get("profile", {}).get("bio", ""),
            "skills": list(self.profile_svc.get_user_skills_dict(user_id).keys()),
        }

        # 3. Generate AI response
        ai_response_text = await career_assistant.get_response(
            messages=[{"role": "user", "content": message_text}],
            user_context=user_context,
        )

        # 4. Save AI message
        ai_msg = {
            "sessionId": session_id,
            "userId": user_id,
            "role": "assistant",
            "content": ai_response_text,
            "createdAt": now_utc_iso(),
        }
        self.messages_repo.create(ai_msg)

        self.sessions_repo.update(session_id, {"updatedAt": now_utc_iso()})
        record_audit_log(user_id, "CHAT_MESSAGE_SENT", f"chat_sessions/{session_id}")

        return {
            "sessionId": session_id,
            "response": ai_response_text,
            "createdAt": ai_msg["createdAt"],
        }

    async def stream_message(self, user_id: str, message_text: str, session_id: Optional[str] = None) -> AsyncGenerator[str, None]:
        """Streams AI assistant token chunks via Server-Sent Events (SSE)."""
        if session_id:
            session = self.sessions_repo.get(session_id)
            if not session or session.get("userId") != user_id:
                raise PermissionDeniedError("Unauthorized access to chat session.")
        else:
            session = self.get_or_create_session(user_id)
            session_id = session["id"]

        profile_data = self.profile_svc.get_profile(user_id)
        user_context = {
            "bio": profile_data.get("profile", {}).get("bio", ""),
            "skills": list(self.profile_svc.get_user_skills_dict(user_id).keys()),
        }

        async for chunk in career_assistant.stream_response(
            messages=[{"role": "user", "content": message_text}],
            user_context=user_context,
        ):
            yield chunk
