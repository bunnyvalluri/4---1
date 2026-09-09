import asyncio
import smtplib
import ssl
import uuid
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from typing import Optional
from app.email.providers.base import BaseEmailProvider
from app.email.schemas import EmailDeliveryResult
from app.core.config import settings
from app.core.logging import logger


class SMTPEmailProvider(BaseEmailProvider):
    """
    Production-grade SMTP provider supporting SSL/TLS encryption,
    MIME multipart (HTML + Plain-Text fallback), and controlled retry logic.
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        use_tls: Optional[bool] = None,
        use_ssl: Optional[bool] = None,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
    ):
        self.host = host or settings.SMTP_HOST
        self.port = port or settings.SMTP_PORT
        self.username = username or settings.SMTP_USERNAME
        self.password = password or settings.SMTP_PASSWORD
        self.use_tls = use_tls if use_tls is not None else settings.SMTP_USE_TLS
        self.use_ssl = use_ssl if use_ssl is not None else settings.SMTP_USE_SSL
        self.from_email = from_email or settings.EMAIL_FROM
        self.from_name = from_name or settings.EMAIL_FROM_NAME

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str,
        template_name: str,
        reply_to: Optional[str] = None,
    ) -> EmailDeliveryResult:
        """Asynchronously dispatches email via SMTP server with retry handling."""
        if not self.host:
            logger.warning(
                f"[SMTP Provider] SMTP_HOST is not configured. Falling back to simulated delivery for {to_email}."
            )
            return EmailDeliveryResult(
                success=True,
                provider="smtp_simulated",
                message_id=f"sim-{uuid.uuid4().hex[:12]}",
                recipient=to_email,
                template=template_name,
                subject=subject,
                sent_at=datetime.now(timezone.utc).isoformat(),
            )

        # Execute SMTP delivery in worker thread to avoid blocking the asyncio event loop
        max_retries = 2
        last_error = None

        for attempt in range(1, max_retries + 1):
            try:
                msg_id = await asyncio.to_thread(
                    self._send_smtp_sync,
                    to_email,
                    subject,
                    html_content,
                    text_content,
                    reply_to,
                )
                now = datetime.now(timezone.utc).isoformat()
                logger.info(
                    f"[SMTP SENT] Recipient: {to_email} | Subject: '{subject}' | MessageID: {msg_id}"
                )
                return EmailDeliveryResult(
                    success=True,
                    provider="smtp",
                    message_id=msg_id,
                    recipient=to_email,
                    template=template_name,
                    subject=subject,
                    sent_at=now,
                )
            except Exception as e:
                last_error = e
                logger.warning(
                    f"[SMTP ATTEMPT {attempt}/{max_retries} FAILED] {to_email}: {str(e)}"
                )
                if attempt < max_retries:
                    await asyncio.sleep(1.0 * attempt)

        return EmailDeliveryResult(
            success=False,
            provider="smtp",
            recipient=to_email,
            template=template_name,
            subject=subject,
            error_message=str(last_error),
        )

    def _send_smtp_sync(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str,
        reply_to: Optional[str] = None,
    ) -> str:
        # Build MIME multipart message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = to_email
        msg["Date"] = formatdate(localtime=True)
        message_id = make_msgid(domain="careerai.dev")
        msg["Message-ID"] = message_id

        if reply_to:
            msg["Reply-To"] = reply_to
        elif settings.EMAIL_REPLY_TO:
            msg["Reply-To"] = settings.EMAIL_REPLY_TO

        # Attach text and html alternatives (text first, html second per RFC 2046)
        part_text = MIMEText(text_content, "plain", "utf-8")
        part_html = MIMEText(html_content, "html", "utf-8")
        msg.attach(part_text)
        msg.attach(part_html)

        # Context for TLS
        context = ssl.create_default_context()

        if self.use_ssl:
            with smtplib.SMTP_SSL(self.host, self.port, context=context, timeout=15) as server:
                if self.username and self.password:
                    server.login(self.username, self.password)
                server.sendmail(self.from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(self.host, self.port, timeout=15) as server:
                server.ehlo()
                if self.use_tls:
                    server.starttls(context=context)
                    server.ehlo()
                if self.username and self.password:
                    server.login(self.username, self.password)
                server.sendmail(self.from_email, [to_email], msg.as_string())

        return str(message_id)
