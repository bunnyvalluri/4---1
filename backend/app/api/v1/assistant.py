from typing import Annotated, List
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.assistant_service import AssistantService
from app.schemas.assistant import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionResponse,
)

router = APIRouter(prefix="/assistant", tags=["Assistant"])


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def get_chat_sessions(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssistantService(db)
    return await service.get_user_sessions(current_user.id)


@router.post("/message", response_model=ChatMessageResponse)
async def send_chat_message(
    req: ChatMessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssistantService(db)
    user_context = {
        "user_name": current_user.name,
        "email": current_user.email,
    }
    return await service.send_message(
        user_id=current_user.id,
        content=req.content,
        session_id=req.session_id,
        user_context=user_context,
    )


@router.post("/message/stream")
async def stream_chat_message(
    req: ChatMessageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    service = AssistantService(db)
    user_context = {
        "user_name": current_user.name,
        "email": current_user.email,
    }

    async def event_generator():
        async for chunk in service.stream_message(
            user_id=current_user.id,
            content=req.content,
            session_id=req.session_id,
            user_context=user_context,
        ):
            yield f"data: {chunk}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
