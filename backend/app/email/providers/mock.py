import uuid
from datetime import datetime, timezone
from typing import Optional
from app.email.providers.base import BaseEmailProvider
from app.email.schemas import EmailDeliveryResult
from app.core.logging import logger


class ConsoleMockEmailProvider(BaseEmailProvider):
    """
    Mock email provider for development and automated test suites.
    Logs structured delivery metadata without outbound network calls.
    """

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str,
        template_name: str,
        reply_to: Optional[str] = None,
    ) -> EmailDeliveryResult:
        message_id = f"mock-msg-{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc).isoformat()

        logger.info(
            f"[MOCK EMAIL DELIVERED] To: {to_email} | Subject: '{subject}' | "
            f"Template: {template_name} | MessageID: {message_id}"
        )

        return EmailDeliveryResult(
            success=True,
            provider="console_mock",
            message_id=message_id,
            recipient=to_email,
            template=template_name,
            subject=subject,
            sent_at=now,
        )
