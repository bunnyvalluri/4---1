from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "AI Career Guidance API"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security & Tokens
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    # Default to PostgreSQL, with safe fallback to SQLite if needed
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./career_guidance.db",
    )

    # Redis & Background Tasks
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://careerai-platform-202.netlify.app",
    ]

    # External AI Services
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Firebase Infrastructure
    FIREBASE_PROJECT_ID: str = "careerai-app-9777b"
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_STORAGE_BUCKET: str = "careerai-app-9777b.firebasestorage.app"
    FIREBASE_CREDENTIALS_PATH: str = "serviceAccountKey.json"
    FIREBASE_DATABASE_URL: str = ""


    # Firebase Local Emulators
    USE_FIREBASE_EMULATOR: bool = False
    FIREBASE_AUTH_EMULATOR_HOST: str = ""
    FIRESTORE_EMULATOR_HOST: str = ""
    FIREBASE_STORAGE_EMULATOR_HOST: str = ""

    # Public Platform & Contact Configuration
    SUPPORT_EMAIL: str = os.getenv("SUPPORT_EMAIL", "")
    CONTACT_EMAIL: str = os.getenv("CONTACT_EMAIL", "")
    CONTACT_PHONE: str = os.getenv("CONTACT_PHONE", "")
    COMPANY_WEBSITE: str = os.getenv("COMPANY_WEBSITE", "https://careerai-platform-202.netlify.app")
    LINKEDIN_URL: str = os.getenv("LINKEDIN_URL", "")
    GITHUB_URL: str = os.getenv("GITHUB_URL", "https://github.com/bunnyvalluri/4---1")

    # Transactional Email Infrastructure
    EMAIL_PROVIDER: str = os.getenv("EMAIL_PROVIDER", "smtp")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "no-reply@careerai.dev")
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "CareerAI Team")
    EMAIL_REPLY_TO: str = os.getenv("EMAIL_REPLY_TO", "support@careerai.dev")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "True").lower() in ["true", "1", "yes"]
    SMTP_USE_SSL: bool = os.getenv("SMTP_USE_SSL", "False").lower() in ["true", "1", "yes"]
    APP_BASE_URL: str = os.getenv("APP_BASE_URL", "http://localhost:3000")


    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if not v:
            return "sqlite+aiosqlite:///./career_guidance.db"
        # If postgres:// or postgresql:// is given without +asyncpg, upgrade it
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)

        # Sanitize query parameters for asyncpg
        if "asyncpg" in v and "?" in v:
            base, query = v.split("?", 1)
            allowed_asyncpg_keys = {"ssl", "timeout", "command_timeout", "server_settings"}
            sanitized = []
            for item in query.split("&"):
                if not item:
                    continue
                k, *rest = item.split("=", 1)
                val = rest[0] if rest else ""
                if k == "sslmode":
                    sanitized.append(f"ssl={val}")
                elif k in allowed_asyncpg_keys:
                    sanitized.append(f"{k}={val}")
            v = f"{base}?{'&'.join(sanitized)}" if sanitized else base

        return v


settings = Settings()
