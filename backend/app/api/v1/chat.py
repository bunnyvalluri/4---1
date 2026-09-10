from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, Query, Path
from fastapi.responses import StreamingResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.services.firebase_assistant_service import firebase_assistant_service
from app.services.career_context_service import career_context_service
from app.services.tool_service import tool_service
from app.schemas.assistant import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionUpdate,
    ChatSessionResponse,
    CareerContextResponse,
    ChatActionExecuteRequest,
    ChatActionExecuteResponse,
)

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.get("/context", response_model=CareerContextResponse)
async def get_career_context(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Retrieves real-time aggregated career context and telemetry for the authenticated candidate."""
    context = career_context_service.get_full_context(
        user_id=current_user.id,
        user_name=current_user.name,
        email=current_user.email,
    )
    return CareerContextResponse.model_validate(context)


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    q: Optional[str] = Query(None, description="Search query across session titles"),
):
    """Retrieves all active consultation sessions for the candidate with optional keyword search."""
    sessions = firebase_assistant_service.get_user_sessions(current_user.id, search=q)
    return [
        ChatSessionResponse(
            id=s.get("id"),
            user_id=s.get("userId"),
            title=s.get("title", "Career Consultation"),
            status=s.get("status", "ACTIVE"),
            summary=s.get("summary"),
            message_count=s.get("messageCount", 0),
            created_at=s.get("createdAt"),
            updated_at=s.get("updatedAt"),
            last_message_at=s.get("lastMessageAt"),
        )
        for s in sessions
    ]


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    req: ChatSessionCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Creates a new consultation session for the authenticated candidate."""
    created = firebase_assistant_service.create_session(
        user_id=current_user.id,
        title=req.title or "New Consultation",
        mode=req.mode or "standard",
    )
    return ChatSessionResponse(
        id=created.get("id"),
        user_id=created.get("userId"),
        title=created.get("title"),
        status=created.get("status", "ACTIVE"),
        summary=created.get("summary"),
        message_count=created.get("messageCount", 0),
        created_at=created.get("createdAt"),
        updated_at=created.get("updatedAt"),
        last_message_at=created.get("lastMessageAt"),
    )


@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_chat_session_detail(
    session_id: Annotated[str, Path(..., description="ID of consultation session")],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Retrieves session details and its chronological message history with IDOR verification."""
    detail = firebase_assistant_service.get_session_detail(current_user.id, session_id)
    raw_messages = detail.get("messages", [])
    messages = [
        ChatMessageResponse(
            id=m.get("id", ""),
            session_id=session_id,
            role=m.get("role", "assistant"),
            content=m.get("content", ""),
            status=m.get("status", "COMPLETED"),
            actions=m.get("actions"),
            sources=m.get("sources"),
        )
        for m in raw_messages
    ]
    return ChatSessionResponse(
        id=detail.get("id"),
        user_id=detail.get("userId"),
        title=detail.get("title"),
        status=detail.get("status", "ACTIVE"),
        summary=detail.get("summary"),
        message_count=len(messages),
        created_at=detail.get("createdAt"),
        updated_at=detail.get("updatedAt"),
        last_message_at=detail.get("lastMessageAt"),
        messages=messages,
    )


@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def update_chat_session(
    session_id: Annotated[str, Path(..., description="ID of consultation session")],
    req: ChatSessionUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Renames or updates status (e.g. ARCHIVED) of a session."""
    updated = firebase_assistant_service.update_session(
        user_id=current_user.id,
        session_id=session_id,
        title=req.title,
        status=req.status,
    )
    return ChatSessionResponse(
        id=updated.get("id"),
        user_id=updated.get("userId"),
        title=updated.get("title"),
        status=updated.get("status", "ACTIVE"),
        summary=updated.get("summary"),
        message_count=updated.get("messageCount", 0),
        created_at=updated.get("createdAt"),
        updated_at=updated.get("updatedAt"),
        last_message_at=updated.get("lastMessageAt"),
    )


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: Annotated[str, Path(..., description="ID of consultation session")],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Deletes a consultation session and associated messages."""
    firebase_assistant_service.delete_session(current_user.id, session_id)
    return {"success": True, "message": "Session deleted successfully"}


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    req: ChatMessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session_id: Optional[str] = None,
):
    """Non-streaming message exchange returning full structured content."""
    target_session_id = session_id or req.session_id
    res = await firebase_assistant_service.send_message(
        user_id=current_user.id,
        user_name=current_user.name,
        email=current_user.email,
        content=req.content,
        session_id=target_session_id,
        mode=req.mode or "standard",
    )
    return ChatMessageResponse(
        id=res.get("id"),
        session_id=res.get("session_id"),
        role=res.get("role"),
        content=res.get("content"),
        actions=res.get("actions"),
        sources=res.get("sources"),
    )


@router.get("/sessions/{session_id}/stream")
@router.post("/sessions/{session_id}/stream")
@router.post("/message/stream")
async def stream_chat_message(
    req: ChatMessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session_id: Optional[str] = None,
):
    """Streams token chunks and thinking states via Server-Sent Events (SSE)."""
    target_session_id = session_id or req.session_id

    async def event_generator():
        async for chunk in firebase_assistant_service.stream_message(
            user_id=current_user.id,
            user_name=current_user.name,
            email=current_user.email,
            content=req.content,
            session_id=target_session_id,
            mode=req.mode or "standard",
        ):
            yield chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/actions/execute", response_model=ChatActionExecuteResponse)
async def execute_career_action(
    req: ChatActionExecuteRequest,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Executes a confirmed career action (e.g. activating project, adding milestone to roadmap)."""
    result = await tool_service.execute_action(
        user_id=current_user.id,
        action_type=req.action_type,
        entity_id=req.entity_id,
        parameters=req.parameters,
    )
    return ChatActionExecuteResponse.model_validate(result)
