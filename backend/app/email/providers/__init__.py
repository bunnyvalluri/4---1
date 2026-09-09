from app.email.providers.base import BaseEmailProvider
from app.email.providers.smtp import SMTPEmailProvider
from app.email.providers.mock import ConsoleMockEmailProvider
from app.core.config import settings


def get_email_provider() -> BaseEmailProvider:
    """Factory creating configured transactional email provider."""
    provider_type = (settings.EMAIL_PROVIDER or "smtp").lower().strip()
    if provider_type == "smtp":
        return SMTPEmailProvider()
    return ConsoleMockEmailProvider()
