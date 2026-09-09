import pytest
from unittest.mock import MagicMock, patch
from httpx import AsyncClient

from app.email.renderer import template_renderer, html_to_plain_text
from app.email.providers.mock import ConsoleMockEmailProvider
from app.email.providers.smtp import SMTPEmailProvider
from app.email.providers import get_email_provider
from app.email.schemas import EmailDeliveryResult
from app.email.service import EmailService


ALL_TEMPLATES = [
    "welcome.html",
    "verification.html",
    "password_reset.html",
    "password_changed.html",
    "login_alert.html",
    "assessment_completed.html",
    "recommendations_ready.html",
    "skill_gap_ready.html",
    "roadmap_ready.html",
    "resume_analysis_ready.html",
    "milestone_completed.html",
]


class TestEmailRenderer:
    @pytest.mark.parametrize("template_name", ALL_TEMPLATES)
    def test_render_templates_exist_and_render_valid_html(self, template_name):
        context = {
            "first_name": "Alex",
            "name": "Alex Mercer",
            "email": "alex@careerai.dev",
            "verification_link": "http://localhost:3000/verify-email?token=xyz123",
            "reset_link": "http://localhost:3000/reset-password?token=abc456",
            "device": "Chrome on Windows",
            "ip_address": "127.0.0.1",
            "timestamp": "2026-09-09 15:00 UTC",
            "top_careers": [
                {"title": "Full Stack Engineer", "match_score": 94},
                {"title": "DevOps Architect", "match_score": 88},
            ],
            "recommendations": [
                {"role": "Full Stack Engineer", "match_score": 94, "primary_skill": "FastAPI & Next.js"}
            ],
            "gap_count": 3,
            "target_role": "Full Stack Engineer",
            "high_priority_gaps": ["Docker", "Kubernetes", "Redis"],
            "milestone_title": "Build FastAPI Transactional System",
            "progress_pct": 75,
            "ats_score": 88,
            "overall_score": 85,
            "key_strengths": ["Backend Architecture", "Clean Code"],
            "top_improvements": ["Add quantitative metrics", "Highlight system design"],
            "subject": f"CareerAI Notification: {template_name}",
            "preheader": "Stay up to date with CareerAI",
        }
        html_content, text_content = template_renderer.render(template_name, context)
        assert "<!DOCTYPE html" in html_content or "<html" in html_content
        assert "CareerAI" in html_content
        assert "#2563EB" in html_content or "#2563eb" in html_content

        assert len(text_content) > 10
        assert "CareerAI" in text_content


class TestEmailProviders:
    @pytest.mark.asyncio
    async def test_console_mock_provider(self):
        provider = ConsoleMockEmailProvider()
        result = await provider.send_email(
            to_email="candidate@example.com",
            subject="Test Subject",
            html_content="<p>Test Content</p>",
            text_content="Test Content",
            template_name="welcome.html",
        )
        assert result.success is True
        assert result.message_id.startswith("mock-")
        assert result.error_message is None

    @pytest.mark.asyncio
    async def test_smtp_provider_unconfigured_host_graceful_fallback(self):
        provider = SMTPEmailProvider(
            host="",
            port=587,
            username="",
            password="",
            use_tls=True,
            use_ssl=False,
            from_email="no-reply@careerai.dev",
            from_name="CareerAI",
        )
        result = await provider.send_email(
            to_email="candidate@example.com",
            subject="Test Subject",
            html_content="<p>Test</p>",
            text_content="Test",
            template_name="welcome.html",
        )
        # Should gracefully return simulated success without throwing unhandled exceptions
        assert result.success is True
        assert result.provider == "smtp_simulated"

    def test_provider_factory_mock(self):
        with patch("app.core.config.settings.EMAIL_PROVIDER", "console"):
            provider = get_email_provider()
            assert isinstance(provider, ConsoleMockEmailProvider)


class TestEmailService:
    @pytest.mark.asyncio
    async def test_send_and_record_logs_event(self):
        service = EmailService()
        service.provider = ConsoleMockEmailProvider()
        service.events_repo = MagicMock()
        service.events_repo.set = MagicMock()

        result = await service._send_and_record(
            user_id="user-xyz",
            to_email="dev@example.com",
            subject="Welcome Dev",
            template_name="welcome.html",
            context={"first_name": "Dev", "subject": "Welcome Dev", "preheader": "Welcome"},
            event_type="WELCOME_EMAIL",
        )

        assert result.success is True
        service.events_repo.set.assert_called_once()
        args = service.events_repo.set.call_args[0]
        event_data = args[1]
        assert event_data["userId"] == "user-xyz"
        assert event_data["email"] == "dev@example.com"
        assert event_data["status"] == "SENT"

    @pytest.mark.asyncio
    async def test_welcome_email_idempotency_prevents_duplicates(self):
        service = EmailService()
        service.provider = ConsoleMockEmailProvider()
        service.users_repo = MagicMock()
        service.events_repo = MagicMock()

        # Case 1: User doc already has welcomeEmailSentAt
        service.users_repo.get.return_value = {"welcomeEmailSentAt": "2026-09-09T10:00:00Z"}
        result1 = await service.send_welcome_email(
            user_id="user-already-sent",
            email="dev@example.com",
            first_name="Existing User",
        )
        assert result1 is None

        # Case 2: User doc doesn't have it, but event already exists
        service.users_repo.get.return_value = {}
        service.events_repo.query_by_user.return_value = [
            {"eventType": "WELCOME_EMAIL", "status": "SENT"}
        ]
        result2 = await service.send_welcome_email(
            user_id="user-has-event",
            email="dev@example.com",
            first_name="Existing User",
        )
        assert result2 is None

        # Case 3: Brand new user with no previous welcome email
        service.users_repo.get.return_value = {"email": "newuser@example.com"}
        service.events_repo.query_by_user.return_value = []
        result3 = await service.send_welcome_email(
            user_id="user-brand-new",
            email="newuser@example.com",
            first_name="Newbie",
        )
        assert result3 is not None
        assert result3.success is True
        service.users_repo.update.assert_called_once()


class TestEmailApiEndpoints:
    @pytest.mark.asyncio
    async def test_preview_endpoint_success(self, client: AsyncClient):
        response = await client.get("/api/v1/email/preview/welcome.html")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "CareerAI" in response.text

    @pytest.mark.asyncio
    async def test_preview_endpoint_not_found(self, client: AsyncClient):
        response = await client.get("/api/v1/email/preview/non_existent_template.html")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_list_email_events_requires_auth(self, client: AsyncClient):
        response = await client.get("/api/v1/email/events")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_list_email_events_with_auth(self, client: AsyncClient, auth_headers: dict):
        with patch("app.api.v1.email.FirestoreRepository") as mock_repo_cls:
            mock_repo = MagicMock()
            mock_repo.query_by_user.return_value = [
                {"id": "evt-1", "template": "welcome.html", "status": "SENT", "createdAt": "2026-09-09T12:00:00Z"}
            ]
            mock_repo_cls.return_value = mock_repo

            response = await client.get("/api/v1/email/events", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert "events" in data
            assert len(data["events"]) == 1
