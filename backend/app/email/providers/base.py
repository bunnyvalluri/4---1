from abc import ABC, abstractmethod
from typing import Optional
from app.email.schemas import EmailDeliveryResult


class BaseEmailProvider(ABC):
    """Abstract transactional email provider contract."""

    @abstractmethod
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str,
        template_name: str,
        reply_to: Optional[str] = None,
    ) -> EmailDeliveryResult:
        """Sends email to recipient and returns delivery outcome."""
        pass
