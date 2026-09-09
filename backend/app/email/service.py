import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import BackgroundTasks
from app.email.providers import get_email_provider
from app.email.renderer import template_renderer
from app.email.schemas import EmailDeliveryResult
from app.firebase.firestore import (
    FirestoreRepository,
    FirestoreCollections,
    now_utc_iso,
    record_audit_log,
)
from app.core.logging import logger


class EmailService:
    """
    Production-grade transactional email service.
    Orchestrates templating, background delivery, duplicate protection,
    and Firestore delivery event logging.
    """

    def __init__(self):
        self.events_repo = FirestoreRepository(FirestoreCollections.EMAIL_EVENTS)
        self.users_repo = FirestoreRepository(FirestoreCollections.USERS)
        self.provider = get_email_provider()
        self.renderer = template_renderer

    async def _send_and_record(
        self,
        user_id: str,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        event_type: str,
    ) -> EmailDeliveryResult:
        """Renders template, dispatches via configured provider, and records audit event."""
        # 1. Render template
        try:
            html_content, text_content = self.renderer.render(template_name, context)
        except Exception as e:
            logger.error(f"[EmailService] Template render error ({template_name}): {e}")
            event_id = uuid.uuid4().hex
            self.events_repo.set(event_id, {
                "userId": user_id,
                "email": to_email,
                "template": template_name,
                "eventType": event_type,
                "subject": subject,
                "provider": "renderer",
                "status": "FAILED",
                "errorCode": f"RENDER_ERROR: {str(e)}",
                "createdAt": now_utc_iso(),
                "failedAt": now_utc_iso(),
            })
            return EmailDeliveryResult(
                success=False,
                provider="renderer",
                recipient=to_email,
                template=template_name,
                subject=subject,
                error_message=str(e),
            )

        # 2. Dispatch via email provider
        result = await self.provider.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            template_name=template_name,
        )

        # 3. Record email event in Firestore
        event_id = uuid.uuid4().hex
        now = now_utc_iso()
        event_doc = {
            "userId": user_id,
            "email": to_email,
            "template": template_name,
            "eventType": event_type,
            "subject": subject,
            "provider": result.provider,
            "status": "SENT" if result.success else "FAILED",
            "providerMessageId": result.message_id,
            "errorCode": result.error_message,
            "createdAt": now,
            "sentAt": now if result.success else None,
            "failedAt": None if result.success else now,
        }
        self.events_repo.set(event_id, event_doc)

        record_audit_log(
            user_id=user_id,
            action=f"EMAIL_{event_type}_{'SENT' if result.success else 'FAILED'}",
            resource=f"email_events/{event_id}",
            metadata={"recipient": to_email, "subject": subject},
        )

        return result

    def _queue_or_send(
        self,
        user_id: str,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        event_type: str,
        background_tasks: Optional[BackgroundTasks] = None,
    ):
        """Sends immediately in async context or defers to FastAPI BackgroundTasks."""
        if background_tasks:
            background_tasks.add_task(
                self._send_and_record,
                user_id,
                to_email,
                subject,
                template_name,
                context,
                event_type,
            )
            return None
        else:
            return self._send_and_record(
                user_id,
                to_email,
                subject,
                template_name,
                context,
                event_type,
            )

    # ==========================================================
    # 1. NEW USER WELCOME EMAIL (Triggered exactly ONCE)
    # ==========================================================

    async def send_welcome_email(
        self,
        user_id: str,
        email: str,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        """
        Sends the official Welcome email upon first-time account registration.
        Protected by strict idempotency to prevent duplicate sends on normal logins.
        """
        # Idempotency check: check user document in Firestore
        user_doc = self.users_repo.get(user_id)
        if user_doc and user_doc.get("welcomeEmailSentAt"):
            logger.info(f"[EmailService] Welcome email already sent to {email}. Skipping duplicate.")
            return None

        # Check existing events in Firestore
        existing_events = self.events_repo.query_by_user(user_id, limit=20)
        has_welcome = any(e.get("eventType") == "WELCOME_EMAIL" and e.get("status") == "SENT" for e in existing_events)
        if has_welcome:
            logger.info(f"[EmailService] Found existing WELCOME_EMAIL event for {email}. Skipping duplicate.")
            return None

        subject = "Welcome to CareerAI — Your Career Development Journey Starts Here"
        context = {
            "first_name": first_name or "there",
            "subject": subject,
            "preheader": "Your account has been created. Start your personalized career journey today.",
        }

        # Mark user doc first to establish idempotent lock
        now = now_utc_iso()
        if user_doc:
            self.users_repo.update(user_id, {"welcomeEmailSentAt": now})

        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="welcome.html",
            context=context,
            event_type="WELCOME_EMAIL",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 2. EMAIL VERIFICATION
    # ==========================================================

    async def send_verification_email(
        self,
        user_id: str,
        email: str,
        verification_link: str,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Verify Your CareerAI Email Address"
        context = {
            "first_name": first_name or "there",
            "verification_link": verification_link,
            "subject": subject,
            "preheader": "Please confirm your email address to secure your CareerAI account.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="verification.html",
            context=context,
            event_type="VERIFICATION_EMAIL",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 3. PASSWORD RESET
    # ==========================================================

    async def send_password_reset_email(
        self,
        user_id: str,
        email: str,
        reset_link: str,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Reset Your CareerAI Password"
        context = {
            "first_name": first_name or "there",
            "reset_link": reset_link,
            "subject": subject,
            "preheader": "Use this secure link to reset your CareerAI password.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="password_reset.html",
            context=context,
            event_type="PASSWORD_RESET",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 4. PASSWORD CHANGED SECURITY ALERT
    # ==========================================================

    async def send_password_changed_email(
        self,
        user_id: str,
        email: str,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Your CareerAI Password Was Changed"
        context = {
            "first_name": first_name or "there",
            "email": email,
            "subject": subject,
            "preheader": "Your CareerAI account password was recently updated.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="password_changed.html",
            context=context,
            event_type="PASSWORD_CHANGED",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 5. NEW LOGIN SECURITY ALERT
    # ==========================================================

    async def send_login_alert_email(
        self,
        user_id: str,
        email: str,
        user_agent: str,
        ip_address: str,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "New Sign-In to Your CareerAI Account"
        context = {
            "first_name": first_name or "there",
            "user_agent": user_agent,
            "ip_address": ip_address,
            "sign_in_time": datetime.now(timezone.utc).strftime("%B %d, %Y at %I:%M %p UTC"),
            "subject": subject,
            "preheader": "A new sign-in was detected for your CareerAI account.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="login_alert.html",
            context=context,
            event_type="LOGIN_ALERT",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 6. ASSESSMENT COMPLETED
    # ==========================================================

    async def send_assessment_completed_email(
        self,
        user_id: str,
        email: str,
        score: Optional[int] = None,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Your CareerAI Career Assessment Is Complete"
        context = {
            "first_name": first_name or "there",
            "score": score,
            "subject": subject,
            "preheader": "Your diagnostic assessment results are now available in your dashboard.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="assessment_completed.html",
            context=context,
            event_type="ASSESSMENT_COMPLETED",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 7. CAREER RECOMMENDATIONS READY
    # ==========================================================

    async def send_recommendations_ready_email(
        self,
        user_id: str,
        email: str,
        career_title: str,
        match_score: Optional[int] = None,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Your Personalized Career Recommendations Are Ready"
        context = {
            "first_name": first_name or "there",
            "career_title": career_title,
            "match_score": match_score,
            "subject": subject,
            "preheader": f"Your career match results are ready. Top Match: {career_title}.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="recommendations_ready.html",
            context=context,
            event_type="RECOMMENDATIONS_READY",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 8. SKILL GAP ANALYSIS READY
    # ==========================================================

    async def send_skill_gap_ready_email(
        self,
        user_id: str,
        email: str,
        top_gap: str,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Your Career Skill Gap Analysis Is Ready"
        context = {
            "first_name": first_name or "there",
            "top_gap": top_gap,
            "subject": subject,
            "preheader": f"Review your verified skill gaps and highest-leverage learning milestones: {top_gap}.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="skill_gap_ready.html",
            context=context,
            event_type="SKILL_GAP_READY",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 9. ROADMAP READY
    # ==========================================================

    async def send_roadmap_ready_email(
        self,
        user_id: str,
        email: str,
        roadmap_title: str,
        total_milestones: Optional[int] = None,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Your Personalized Career Roadmap Is Ready"
        context = {
            "first_name": first_name or "there",
            "roadmap_title": roadmap_title,
            "total_milestones": total_milestones,
            "subject": subject,
            "preheader": f"Your structured 6-month roadmap for {roadmap_title} is ready.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="roadmap_ready.html",
            context=context,
            event_type="ROADMAP_READY",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 10. RESUME ANALYSIS READY
    # ==========================================================

    async def send_resume_analysis_email(
        self,
        user_id: str,
        email: str,
        ats_score: Optional[int] = None,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Your CareerAI Resume Analysis Is Ready"
        context = {
            "first_name": first_name or "there",
            "ats_score": ats_score,
            "subject": subject,
            "preheader": "Your ATS resume scan, detected skills, and keyword analysis are ready.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="resume_analysis_ready.html",
            context=context,
            event_type="RESUME_ANALYSIS_READY",
            background_tasks=background_tasks,
        )

    # ==========================================================
    # 11. ROADMAP MILESTONE COMPLETED
    # ==========================================================

    async def send_milestone_completed_email(
        self,
        user_id: str,
        email: str,
        milestone_title: str,
        progress_pct: Optional[int] = None,
        first_name: Optional[str] = None,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> Optional[EmailDeliveryResult]:
        subject = "Great Progress — You Completed a CareerAI Milestone"
        context = {
            "first_name": first_name or "there",
            "milestone_title": milestone_title,
            "progress_pct": progress_pct,
            "subject": subject,
            "preheader": f"Milestone completed: {milestone_title}. Keep advancing your roadmap.",
        }
        return await self._queue_or_send(
            user_id=user_id,
            to_email=email,
            subject=subject,
            template_name="milestone_completed.html",
            context=context,
            event_type="MILESTONE_COMPLETED",
            background_tasks=background_tasks,
        )


email_service = EmailService()
