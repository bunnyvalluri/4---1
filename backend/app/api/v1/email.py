from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, Path, HTTPException
from fastapi.responses import HTMLResponse
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User, Role
from app.email.renderer import template_renderer
from app.firebase.firestore import FirestoreRepository, FirestoreCollections

router = APIRouter(prefix="/email", tags=["Email"])


@router.get("/preview/{template_name}", response_class=HTMLResponse)
async def preview_email_template(
    template_name: Annotated[str, Path(..., description="Name of template (e.g. welcome.html)")],
):
    """
    Renders visual HTML preview of transactional email template with realistic sample data.
    Safe for local browser preview.
    """
    clean_name = template_name if template_name.endswith(".html") else f"{template_name}.html"

    sample_contexts: Dict[str, Dict[str, Any]] = {
        "welcome.html": {
            "first_name": "Alex",
            "subject": "Welcome to CareerAI — Your Career Development Journey Starts Here",
            "preheader": "Your account has been created. Start your personalized career journey today.",
        },
        "verification.html": {
            "first_name": "Alex",
            "verification_link": "http://localhost:3000/verify-email?token=sample_token_12345",
            "subject": "Verify Your CareerAI Email Address",
        },
        "password_reset.html": {
            "first_name": "Alex",
            "reset_link": "http://localhost:3000/reset-password?token=sample_reset_token",
            "subject": "Reset Your CareerAI Password",
        },
        "password_changed.html": {
            "first_name": "Alex",
            "email": "alex@example.com",
            "subject": "Your CareerAI Password Was Changed",
        },
        "login_alert.html": {
            "first_name": "Alex",
            "user_agent": "Chrome 128 on macOS",
            "ip_address": "192.168.1.1 (San Francisco, CA)",
            "sign_in_time": "September 09, 2026 at 03:30 PM UTC",
            "subject": "New Sign-In to Your CareerAI Account",
        },
        "assessment_completed.html": {
            "first_name": "Alex",
            "score": 88,
            "subject": "Your CareerAI Career Assessment Is Complete",
        },
        "recommendations_ready.html": {
            "first_name": "Alex",
            "career_title": "AI / Machine Learning Engineer",
            "match_score": 92,
            "subject": "Your Personalized Career Recommendations Are Ready",
        },
        "skill_gap_ready.html": {
            "first_name": "Alex",
            "top_gap": "MLOps Deployment Pipelines",
            "subject": "Your Career Skill Gap Analysis Is Ready",
        },
        "roadmap_ready.html": {
            "first_name": "Alex",
            "roadmap_title": "Machine Learning Engineering Pathway",
            "total_milestones": 12,
            "subject": "Your Personalized Career Roadmap Is Ready",
        },
        "resume_analysis_ready.html": {
            "first_name": "Alex",
            "ats_score": 84,
            "subject": "Your CareerAI Resume Analysis Is Ready",
        },
        "milestone_completed.html": {
            "first_name": "Alex",
            "milestone_title": "Containerization with Docker & Multi-Stage Builds",
            "progress_pct": 58,
            "subject": "Great Progress — You Completed a CareerAI Milestone",
        },
    }

    context = sample_contexts.get(clean_name, {
        "first_name": "Engineer",
        "subject": f"CareerAI Notification: {clean_name}",
    })

    try:
        html, _ = template_renderer.render(clean_name, context)
        return HTMLResponse(content=html)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Template render failed: {str(e)}")


@router.get("/events")
async def list_email_events(
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(50, ge=1, le=200),
):
    """Retrieves transactional email delivery event logs from Firestore."""
    repo = FirestoreRepository(FirestoreCollections.EMAIL_EVENTS)

    user_role_str = str(getattr(current_user.role, "value", current_user.role)).upper()
    if user_role_str == "ADMIN":
        events = repo.list_all(limit=limit)
    else:
        events = repo.query_by_user(current_user.id, limit=limit)

    events.sort(key=lambda e: e.get("createdAt", ""), reverse=True)
    return {"events": events, "count": len(events)}
