from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.project_service import ProjectService
from app.schemas.project import (
    ProjectResponse,
    ProjectDetailResponse,
    ProjectCreate,
    ProjectRecommendationResponse,
    ProjectMatchBreakdown,
    UserProjectResponse,
    UserProjectMilestoneResponse,
    MilestoneStartRequest,
    MilestoneCompleteRequest,
    DeliverablesUpdateRequest,
    EvidenceAddRequest,
    ConnectGithubRequest,
    TargetDateRequest,
    ResolveBlockerRequest,
    ProjectStrategyResponse,
    ProjectActivityItem,
    ProjectAssistantRequest,
    ProjectAssistantResponse,
    SavedProjectResponse,
)
from app.api.deps import get_current_user, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["Projects"])


# ==========================================================
# 1. Strategy & Recommendations
# ==========================================================
@router.get("/strategy", response_model=ProjectStrategyResponse)
async def get_project_strategy(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns candidate's career alignment strategy, project readiness %, and portfolio metrics."""
    service = ProjectService(db)
    return await service.get_project_strategy(current_user)


@router.get("/recommended", response_model=List[ProjectRecommendationResponse])
async def get_recommended_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    limit: int = Query(default=10, ge=1, le=50),
):
    """
    Returns personalized project recommendations with transparent 6-factor match score calculation,
    why recommended reasons, and addressed skill gaps.
    """
    service = ProjectService(db)
    return await service.get_recommended_projects(current_user, limit=limit)


# ==========================================================
# 2. Saved Projects
# ==========================================================
@router.get("/saved", response_model=List[SavedProjectResponse])
async def get_saved_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns all projects bookmarked by the candidate."""
    service = ProjectService(db)
    return await service.get_saved_projects(current_user)


@router.post("/{project_id}/save", status_code=status.HTTP_200_OK)
async def save_project(
    project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Bookmarks a project blueprint for the authenticated candidate."""
    service = ProjectService(db)
    await service.save_project(current_user, project_id)
    return {"success": True, "saved": True, "projectId": project_id}


@router.delete("/{project_id}/save", status_code=status.HTTP_200_OK)
async def unsave_project(
    project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Removes a project from the candidate's saved list."""
    service = ProjectService(db)
    await service.unsave_project(current_user, project_id)
    return {"success": True, "saved": False, "projectId": project_id}


# ==========================================================
# 3. User Project Workspace Lifecycle
# ==========================================================
@router.get("/user/active", response_model=List[UserProjectResponse])
async def get_active_user_projects(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns all active (IN_PROGRESS or BLOCKED) projects owned by candidate."""
    service = ProjectService(db)
    return await service.get_user_projects(current_user)


@router.get("/user/{user_project_id}", response_model=UserProjectResponse)
async def get_user_project_workspace(
    user_project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns complete interactive workspace data for an active user project."""
    service = ProjectService(db)
    return await service.get_user_project_detail(current_user, user_project_id)


@router.post("/{project_id}/start", response_model=UserProjectResponse)
async def start_project(
    project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Initializes a full project workspace:
    Provisions UserProject, creates 7 structured milestones with dependency graphs,
    links to active roadmap, emits realtime Firestore event, and creates notification.
    """
    service = ProjectService(db)
    return await service.start_project(current_user, project_id)


@router.post("/user/{user_project_id}/milestones/{milestone_id}/start", response_model=UserProjectResponse)
async def start_project_milestone(
    user_project_id: str,
    milestone_id: str,
    req: MilestoneStartRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Transitions a milestone into IN_PROGRESS."""
    service = ProjectService(db)
    return await service.start_milestone(current_user, user_project_id, milestone_id)


@router.post("/user/{user_project_id}/milestones/{milestone_id}/complete", response_model=UserProjectResponse)
async def complete_project_milestone(
    user_project_id: str,
    milestone_id: str,
    req: MilestoneCompleteRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Validates prerequisite milestone dependencies, marks milestone completed,
    recalculates server-side progress %, updates verified skill evidence,
    recalculates skill gaps, updates connected roadmap, and emits realtime notification.
    """
    service = ProjectService(db)
    return await service.complete_milestone(
        user=current_user,
        user_project_id=user_project_id,
        milestone_id=milestone_id,
        actual_hours=req.actual_hours or 0.0,
        notes=req.notes,
    )


@router.post("/user/{user_project_id}/deliverables", response_model=UserProjectResponse)
async def update_project_deliverables(
    user_project_id: str,
    req: DeliverablesUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Updates deliverables checklist (README, Architecture, Tests, Deployment, Demo)."""
    service = ProjectService(db)
    return await service.update_deliverables(current_user, user_project_id, req.deliverables)


@router.post("/user/{user_project_id}/evidence", response_model=UserProjectResponse)
async def add_project_evidence(
    user_project_id: str,
    req: EvidenceAddRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Attaches external evidence link (Live Demo, GitHub, Docs, Diagram) to project."""
    service = ProjectService(db)
    return await service.add_evidence(current_user, user_project_id, req.model_dump())


@router.post("/user/{user_project_id}/github", response_model=UserProjectResponse)
async def connect_github_repository(
    user_project_id: str,
    req: ConnectGithubRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Connects a real GitHub repository URL to the active project workspace."""
    service = ProjectService(db)
    return await service.connect_github(current_user, user_project_id, req.repository_url)


@router.post("/user/{user_project_id}/target-date", response_model=UserProjectResponse)
async def set_project_target_date(
    user_project_id: str,
    req: TargetDateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Updates candidate's target completion date for the project."""
    service = ProjectService(db)
    return await service.set_target_date(current_user, user_project_id, req.target_date)


@router.post("/user/{user_project_id}/blocker/resolve", response_model=UserProjectResponse)
async def resolve_project_blocker(
    user_project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Clears any active blocker and resumes project progress."""
    service = ProjectService(db)
    return await service.resolve_blocker(current_user, user_project_id)


@router.post("/user/{user_project_id}/complete", response_model=UserProjectResponse)
async def complete_project(
    user_project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Enforces quality gate: verifies all milestones complete before finalizing project."""
    service = ProjectService(db)
    return await service.complete_project(current_user, user_project_id)


@router.post("/user/{user_project_id}/assistant", response_model=ProjectAssistantResponse)
async def ask_project_assistant(
    user_project_id: str,
    req: ProjectAssistantRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Context-aware AI Project Mentor grounded in current milestone, blockers, and tech stack."""
    service = ProjectService(db)
    return await service.ask_project_assistant(current_user, user_project_id, req.message)


# ==========================================================
# 4. Activity Telemetry
# ==========================================================
@router.get("/activity", response_model=List[ProjectActivityItem])
async def get_project_activity(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns candidate's recent project execution activity feed."""
    service = ProjectService(db)
    return await service.get_project_activity(current_user)


# ==========================================================
# 5. Catalog Search, Filter & Detail
# ==========================================================
@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    career_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
):
    """Returns catalog of curated project blueprints with search and multi-criteria filters."""
    service = ProjectService(db)
    return await service.list_projects(
        career_id=career_id,
        difficulty=difficulty,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project_detail(
    project_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Returns comprehensive project blueprint with architecture, milestones, and deliverables."""
    service = ProjectService(db)
    return await service.get_project_detail(current_user, project_id)


@router.post("", response_model=ProjectResponse)
async def create_project(
    data: ProjectCreate,
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Admin-only: registers a new canonical project blueprint."""
    service = ProjectService(db)
    project = await service.project_repo.create(ProjectRecommendation(**data.model_dump()))
    return project
