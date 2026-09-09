from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.core.security import decode_token
from app.firebase.auth import verify_firebase_token
from app.core.exceptions import AuthenticationError
from app.services.events import event_hub

router = APIRouter(prefix="/events", tags=["Realtime Events"])


async def get_user_from_header_or_query(
    request: Request,
    token: Optional[str] = Query(None),
) -> str:
    """
    Extracts authenticated user ID from Authorization header or 'token' query param
    to support standard browser EventSource connections.
    """
    auth_header = request.headers.get("Authorization")
    raw_token = None
    if auth_header and auth_header.startswith("Bearer "):
        raw_token = auth_header.split(" ", 1)[1]
    elif token:
        raw_token = token

    if not raw_token:
        # For public demo or unauthenticated state, provide fallback guest ID
        return "guest_candidate"

    try:
        decoded_fb = verify_firebase_token(raw_token)
        uid = decoded_fb.get("uid")
        if uid:
            return uid
    except Exception:
        pass

    try:
        payload = decode_token(raw_token)
        user_id = payload.get("sub")
        if user_id:
            return user_id
    except Exception:
        pass

    return "guest_candidate"


@router.get("/stream")
async def sse_event_stream(
    user_id: Annotated[str, Depends(get_user_from_header_or_query)],
):
    """
    Server-Sent Events (SSE) stream delivering real-time lifecycle updates
    for resume parsing, career analysis, skill gap recalculations,
    assignment submissions, and CI workflow completions.
    """
    return StreamingResponse(
        event_hub.stream_events(user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Content-Type": "text/event-stream; charset=utf-8",
        },
    )
