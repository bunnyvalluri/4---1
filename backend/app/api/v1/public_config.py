from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(prefix="/public", tags=["Public Configuration"])


class PublicConfigResponse(BaseModel):
    app_name: str
    environment: str
    support_email: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


@router.get("/config", response_model=PublicConfigResponse)
@router.get("/contact", response_model=PublicConfigResponse)
async def get_public_config() -> PublicConfigResponse:
    """
    Returns sanitized application-wide public metadata and contact coordinates.
    Never exposes backend keys or infrastructure secrets.
    """
    return PublicConfigResponse(
        app_name=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        support_email=settings.SUPPORT_EMAIL or None,
        contact_email=settings.CONTACT_EMAIL or None,
        phone=settings.CONTACT_PHONE or None,
        website=settings.COMPANY_WEBSITE or None,
        linkedin=settings.LINKEDIN_URL or None,
        github=settings.GITHUB_URL or None,
    )
