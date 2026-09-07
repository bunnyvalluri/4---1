from typing import AsyncGenerator, Dict, Any, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.chat import ChatSession, ChatMessage
from app.ai.career_assistant import career_assistant
from app.core.exceptions import EntityNotFoundError


class AssistantService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_session(
        self,
        user_id: str,
        session_id: Optional[str] = None,
        title: str = "Career Consultation",
    ) -> ChatSession:
        if session_id:
            stmt = (
                select(ChatSession)
                .where(ChatSession.id == session_id, ChatSession.user_id == user_id)
                .options(selectinload(ChatSession.messages))
            )
            sess = (await self.session.execute(stmt)).scalar_one_or_none()
            if sess:
                return sess

        new_sess = ChatSession(user_id=user_id, title=title)
        self.session.add(new_sess)
        await self.session.flush()
        return new_sess

    async def send_message(
        self,
        user_id: str,
        content: str,
        session_id: Optional[str] = None,
        user_context: Dict[str, Any] = None,
    ) -> ChatMessage:
        session = await self.get_or_create_session(user_id, session_id)

        # 1. Save user message
        user_msg = ChatMessage(
            session_id=session.id,
            role="user",
            content=content,
        )
        self.session.add(user_msg)
        await self.session.flush()

        # 2. Get AI response
        msg_stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at.asc())
        )
        existing_msgs = (await self.session.execute(msg_stmt)).scalars().all()
        messages_history = [
            {"role": m.role, "content": m.content}
            for m in existing_msgs
        ]

        ai_reply_text = await career_assistant.get_response(
            messages=messages_history,
            user_context=user_context,
        )

        ai_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=ai_reply_text,
        )
        self.session.add(ai_msg)
        await self.session.flush()
        await self.session.refresh(ai_msg)

        return ai_msg

    async def stream_message(
        self,
        user_id: str,
        content: str,
        session_id: Optional[str] = None,
        user_context: Dict[str, Any] = None,
    ) -> AsyncGenerator[str, None]:
        session = await self.get_or_create_session(user_id, session_id)
        user_msg = ChatMessage(
            session_id=session.id,
            role="user",
            content=content,
        )
        self.session.add(user_msg)
        await self.session.flush()

        msg_stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session.id)
            .order_by(ChatMessage.created_at.asc())
        )
        existing_msgs = (await self.session.execute(msg_stmt)).scalars().all()
        messages_history = [
            {"role": m.role, "content": m.content}
            for m in existing_msgs
        ]

        collected_text = []
        async for chunk in career_assistant.stream_response(messages_history, user_context):
            collected_text.append(chunk)
            yield chunk

        full_reply = "".join(collected_text).strip()
        ai_msg = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=full_reply,
        )
        self.session.add(ai_msg)
        await self.session.flush()

    async def get_user_sessions(self, user_id: str) -> List[ChatSession]:
        stmt = (
            select(ChatSession)
            .where(ChatSession.user_id == user_id)
            .options(selectinload(ChatSession.messages))
            .order_by(ChatSession.updated_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
