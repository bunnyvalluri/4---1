import uuid
from typing import Any, AsyncGenerator, Dict, List, Optional
from app.firebase.firestore import FirestoreRepository, FirestoreCollections, record_audit_log, now_utc_iso
from app.ai.career_assistant import career_assistant
from app.services.career_context_service import career_context_service
from app.core.exceptions import PermissionDeniedError, ValidationError, EntityNotFoundError
from app.core.logging import logger


class FirebaseAssistantService:
    """
    Production Firestore-backed session, message, and AI consultation service.
    Guarantees strict user isolation (IDOR protection) and telemetry grounding.
    """

    def __init__(self):
        self.sessions_repo = FirestoreRepository(FirestoreCollections.CHAT_SESSIONS)
        self.messages_repo = FirestoreRepository(FirestoreCollections.CHAT_MESSAGES)

    def get_user_sessions(self, user_id: str, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves consultation sessions for user, ordered by updatedAt desc."""
        sessions = self.sessions_repo.query_by_user(user_id, limit=100)
        
        # Sort by updatedAt or createdAt descending
        sessions.sort(key=lambda s: s.get("updatedAt") or s.get("createdAt") or "", reverse=True)

        if search and search.strip():
            query_str = search.strip().lower()
            filtered = []
            for s in sessions:
                title = (s.get("title") or "").lower()
                summary = (s.get("summary") or "").lower()
                if query_str in title or query_str in summary:
                    filtered.append(s)
            return filtered

        return sessions

    def create_session(self, user_id: str, title: str = "New Consultation", mode: str = "standard") -> Dict[str, Any]:
        """Creates a new consultation session."""
        session_id = uuid.uuid4().hex
        now = now_utc_iso()
        session_doc = {
            "userId": user_id,
            "title": title.strip() or "New Consultation",
            "status": "ACTIVE",
            "mode": mode,
            "summary": "Initial career consultation session",
            "messageCount": 0,
            "createdAt": now,
            "updatedAt": now,
            "lastMessageAt": now,
        }
        created = self.sessions_repo.set(session_id, session_doc)
        record_audit_log(user_id, "CHAT_SESSION_CREATED", f"chat_sessions/{session_id}")
        return created

    def get_session_detail(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Retrieves session document and associated message history with IDOR verification."""
        session = self.sessions_repo.get(session_id)
        if not session:
            raise EntityNotFoundError("ChatSession", session_id)
        if session.get("userId") != user_id:
            raise PermissionDeniedError("Unauthorized access to chat session.")

        # Query messages for this session
        messages = self.messages_repo.query_by_field("sessionId", "==", session_id, limit=200)
        messages.sort(key=lambda m: m.get("createdAt") or "")

        result = dict(session)
        result["messages"] = messages
        return result

    def update_session(
        self,
        user_id: str,
        session_id: str,
        title: Optional[str] = None,
        status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Updates session title or status with IDOR verification."""
        session = self.sessions_repo.get(session_id)
        if not session:
            raise EntityNotFoundError("ChatSession", session_id)
        if session.get("userId") != user_id:
            raise PermissionDeniedError("Unauthorized access to chat session.")

        updates: Dict[str, Any] = {"updatedAt": now_utc_iso()}
        if title is not None and title.strip():
            updates["title"] = title.strip()
        if status in ["ACTIVE", "ARCHIVED"]:
            updates["status"] = status

        updated = self.sessions_repo.update(session_id, updates)
        record_audit_log(user_id, "CHAT_SESSION_UPDATED", f"chat_sessions/{session_id}")
        return updated or session

    def delete_session(self, user_id: str, session_id: str) -> bool:
        """Deletes session and its messages with IDOR verification."""
        session = self.sessions_repo.get(session_id)
        if not session:
            raise EntityNotFoundError("ChatSession", session_id)
        if session.get("userId") != user_id:
            raise PermissionDeniedError("Unauthorized access to chat session.")

        # Delete messages
        messages = self.messages_repo.query_by_field("sessionId", "==", session_id, limit=200)
        for m in messages:
            if "id" in m:
                self.messages_repo.delete(m["id"])

        self.sessions_repo.delete(session_id)
        record_audit_log(user_id, "CHAT_SESSION_DELETED", f"chat_sessions/{session_id}")
        return True

    async def send_message(
        self,
        user_id: str,
        user_name: str,
        email: str,
        content: str,
        session_id: Optional[str] = None,
        mode: str = "standard",
    ) -> Dict[str, Any]:
        """Non-streaming message pipeline with context synthesis and Firestore persistence."""
        clean_content = content.strip()
        if not clean_content:
            raise ValidationError("Message content cannot be empty.")

        # Ensure active session
        if session_id:
            session = self.sessions_repo.get(session_id)
            if not session or session.get("userId") != user_id:
                raise PermissionDeniedError("Unauthorized access to chat session.")
        else:
            first_words = " ".join(clean_content.split(" ")[:5])
            session = self.create_session(user_id, title=f"{first_words}...", mode=mode)
            session_id = session["id"]

        now = now_utc_iso()

        # 1. Save user message
        user_msg = {
            "sessionId": session_id,
            "userId": user_id,
            "role": "user",
            "content": clean_content,
            "status": "COMPLETED",
            "createdAt": now,
            "updatedAt": now,
        }
        self.messages_repo.create(user_msg)

        # 2. Get real career telemetry
        user_context = career_context_service.get_full_context(user_id, user_name, email)

        # 3. Generate grounded response
        messages_history = [{"role": "user", "content": clean_content}]
        ai_result = await career_assistant.get_response(
            messages=messages_history,
            user_context=user_context,
            mode=mode,
        )

        # 4. Save assistant response
        now_resp = now_utc_iso()
        ai_msg = {
            "sessionId": session_id,
            "userId": user_id,
            "role": "assistant",
            "content": ai_result["content"],
            "status": "COMPLETED",
            "actions": ai_result.get("actions", []),
            "sources": ai_result.get("sources", []),
            "createdAt": now_resp,
            "updatedAt": now_resp,
        }
        created_ai_msg = self.messages_repo.create(ai_msg)

        # 5. Update session metadata
        self.sessions_repo.update(session_id, {
            "updatedAt": now_resp,
            "lastMessageAt": now_resp,
            "messageCount": (session.get("messageCount") or 0) + 2,
        })

        return {
            "id": created_ai_msg.get("id", uuid.uuid4().hex),
            "session_id": session_id,
            "role": "assistant",
            "content": ai_result["content"],
            "actions": ai_result.get("actions", []),
            "sources": ai_result.get("sources", []),
            "created_at": now_resp,
        }

    async def stream_message(
        self,
        user_id: str,
        user_name: str,
        email: str,
        content: str,
        session_id: Optional[str] = None,
        mode: str = "standard",
    ) -> AsyncGenerator[str, None]:
        """SSE streaming generator yielding thinking stages, tokens, and action payloads."""
        clean_content = content.strip()
        if not clean_content:
            raise ValidationError("Message content cannot be empty.")

        if session_id:
            session = self.sessions_repo.get(session_id)
            if not session or session.get("userId") != user_id:
                raise PermissionDeniedError("Unauthorized access to chat session.")
        else:
            first_words = " ".join(clean_content.split(" ")[:5])
            session = self.create_session(user_id, title=f"{first_words}...", mode=mode)
            session_id = session["id"]

        now = now_utc_iso()

        # Save user message
        user_msg = {
            "sessionId": session_id,
            "userId": user_id,
            "role": "user",
            "content": clean_content,
            "status": "COMPLETED",
            "createdAt": now,
            "updatedAt": now,
        }
        self.messages_repo.create(user_msg)

        # Synthesize real candidate context
        user_context = career_context_service.get_full_context(user_id, user_name, email)

        messages_history = [{"role": "user", "content": clean_content}]

        accumulated_text = []

        async for sse_chunk in career_assistant.generate_guidance_stream(messages_history, user_context, mode):
            # Parse token to accumulate for final Firestore persistence
            if sse_chunk.startswith("data: ") and not sse_chunk.startswith("data: [THINKING:") and not sse_chunk.startswith("data: [DONE]"):
                try:
                    import json
                    json_str = sse_chunk.replace("data: ", "").strip()
                    parsed = json.loads(json_str)
                    if "token" in parsed:
                        accumulated_text.append(parsed["token"])
                except Exception:
                    pass

            yield sse_chunk

        # Save finalized assistant message
        full_response = "".join(accumulated_text).strip()
        if full_response:
            now_resp = now_utc_iso()
            ai_actions = career_assistant._generate_suggested_actions(clean_content, user_context, mode)
            ai_sources = career_assistant._get_sources_list(user_context)
            self.messages_repo.create({
                "sessionId": session_id,
                "userId": user_id,
                "role": "assistant",
                "content": full_response,
                "status": "COMPLETED",
                "actions": ai_actions,
                "sources": ai_sources,
                "createdAt": now_resp,
                "updatedAt": now_resp,
            })
            self.sessions_repo.update(session_id, {
                "updatedAt": now_resp,
                "lastMessageAt": now_resp,
                "messageCount": (session.get("messageCount") or 0) + 2,
            })


firebase_assistant_service = FirebaseAssistantService()
