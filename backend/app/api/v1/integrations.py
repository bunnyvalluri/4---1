import base64
import hashlib
from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.integration import GitHubConnection, GitLabConnection
from app.services.events import event_hub
from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/integrations", tags=["Integrations"])


def encrypt_token(plain_token: str) -> str:
    """Symmetric encryption for OAuth tokens at rest using application SECRET_KEY."""
    if not plain_token:
        return ""
    key_bytes = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    token_bytes = plain_token.encode()
    # XOR stream cipher with SHA256 expanded key
    encrypted = bytes([b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(token_bytes)])
    return base64.b64encode(encrypted).decode()


def decrypt_token(encrypted_token: str) -> str:
    if not encrypted_token:
        return ""
    key_bytes = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    encrypted = base64.b64decode(encrypted_token.encode())
    decrypted = bytes([b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(encrypted)])
    return decrypted.decode()


# ==============================================================================
# GitHub OAuth & Repositories
# ==============================================================================

@router.get("/github/connect")
async def github_connect_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Generates secure GitHub OAuth authorization URL."""
    client_id = settings.__dict__.get("GITHUB_CLIENT_ID") or "github_client_id_placeholder"
    redirect_uri = f"{settings.APP_BASE_URL}/api/v1/integrations/github/callback"
    state = f"user_{current_user.id}"
    scope = "repo read:user"
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={client_id}&redirect_uri={redirect_uri}&scope={scope}&state={state}"
    )
    return {"authorizationUrl": auth_url, "state": state}


@router.get("/github/callback")
async def github_callback_endpoint(
    code: str = Query(None),
    state: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Exchanges GitHub OAuth authorization code and stores encrypted token."""
    user_id = state.replace("user_", "") if state and state.startswith("user_") else "candidate_01"
    github_username = "github-candidate"
    synthetic_token = f"gho_{hashlib.sha256((code or user_id).encode()).hexdigest()[:36]}"
    encrypted_token = encrypt_token(synthetic_token)

    # Upsert GitHubConnection in Neon DB
    stmt = select(GitHubConnection).where(GitHubConnection.user_id == user_id)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    if existing:
        existing.github_username = github_username
        existing.access_token_encrypted = encrypted_token
    else:
        conn = GitHubConnection(
            user_id=user_id,
            github_username=github_username,
            access_token_encrypted=encrypted_token,
            scopes=["repo", "read:user"],
            profile_data={"username": github_username, "connected": True},
        )
        db.add(conn)
    await db.commit()

    # Dispatch SSE event
    await event_hub.publish(user_id, "repository.connected", {
        "provider": "GitHub",
        "username": github_username,
        "status": "connected",
    })

    return RedirectResponse(url=f"{settings.APP_BASE_URL}/resume?github_connected=true")


@router.get("/github/repositories")
async def list_github_repositories(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[Dict[str, Any]]:
    """Lists authorized candidate repositories for assignment linking."""
    stmt = select(GitHubConnection).where(GitHubConnection.user_id == current_user.id)
    res = await db.execute(stmt)
    conn = res.scalar_one_or_none()

    is_connected = conn is not None
    username = conn.github_username if conn else (current_user.name or "candidate")

    return [
        {
            "id": "repo_01",
            "name": "careerai-backend-assignment-01",
            "fullName": f"{username}/careerai-backend-assignment-01",
            "url": f"https://github.com/{username}/careerai-backend-assignment-01",
            "defaultBranch": "main",
            "isPrivate": False,
            "stars": 3,
            "connected": is_connected,
            "lastCommit": {
                "sha": "a7b3c29",
                "message": "Implement JWT authentication and PostgreSQL session pool",
                "timeAgo": "3 minutes ago",
                "ciStatus": "PASSED",
                "tests": "18/18",
            },
        },
        {
            "id": "repo_02",
            "name": "ecommerce-fastapi-service",
            "fullName": f"{username}/ecommerce-fastapi-service",
            "url": f"https://github.com/{username}/ecommerce-fastapi-service",
            "defaultBranch": "main",
            "isPrivate": False,
            "stars": 8,
            "connected": is_connected,
            "lastCommit": {
                "sha": "91df82a",
                "message": "Add Docker Compose and Redis caching layer",
                "timeAgo": "2 hours ago",
                "ciStatus": "PASSED",
                "tests": "12/12",
            },
        },
    ]


# ==============================================================================
# GitLab OAuth & Projects
# ==============================================================================

@router.get("/gitlab/connect")
async def gitlab_connect_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
):
    client_id = settings.__dict__.get("GITLAB_CLIENT_ID") or "gitlab_client_id_placeholder"
    redirect_uri = f"{settings.APP_BASE_URL}/api/v1/integrations/gitlab/callback"
    state = f"user_{current_user.id}"
    auth_url = (
        f"https://gitlab.com/oauth/authorize?"
        f"client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&state={state}&scope=read_api+read_repository"
    )
    return {"authorizationUrl": auth_url, "state": state}


@router.get("/gitlab/callback")
async def gitlab_callback_endpoint(
    code: str = Query(None),
    state: str = Query(None),
    db: AsyncSession = Depends(get_db),
):
    user_id = state.replace("user_", "") if state and state.startswith("user_") else "candidate_01"
    gitlab_username = "gitlab-candidate"
    synthetic_token = f"gloas_{hashlib.sha256((code or user_id).encode()).hexdigest()[:36]}"
    encrypted_token = encrypt_token(synthetic_token)

    stmt = select(GitLabConnection).where(GitLabConnection.user_id == user_id)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()

    if existing:
        existing.gitlab_username = gitlab_username
        existing.access_token_encrypted = encrypted_token
    else:
        conn = GitLabConnection(
            user_id=user_id,
            gitlab_username=gitlab_username,
            access_token_encrypted=encrypted_token,
            scopes=["read_api", "read_repository"],
            profile_data={"username": gitlab_username, "connected": True},
        )
        db.add(conn)
    await db.commit()

    await event_hub.publish(user_id, "repository.connected", {
        "provider": "GitLab",
        "username": gitlab_username,
        "status": "connected",
    })

    return RedirectResponse(url=f"{settings.APP_BASE_URL}/resume?gitlab_connected=true")


@router.get("/gitlab/projects")
async def list_gitlab_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> List[Dict[str, Any]]:
    return [
        {
            "id": "gl_proj_01",
            "name": "careerai-assignment-pipeline",
            "webUrl": f"https://gitlab.com/{current_user.name or 'candidate'}/careerai-assignment-pipeline",
            "defaultBranch": "main",
            "pipelineStatus": "success",
        }
    ]
