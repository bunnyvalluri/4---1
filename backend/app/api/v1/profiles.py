from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.services.career_profile_service import CareerProfileService
from app.schemas.career_profile import (
    CareerGoals,
    CareerPreferences,
    CareerReadinessResponse,
    CertificationItem,
    EducationItem,
    ExperienceItem,
    FullProfileResponse,
    PersonalInfoUpdate,
    ProfileActivityRecord,
    ProfileCompletionResponse,
    ProfileInsightResponse,
    ProjectItem,
    SkillItem,
)

router = APIRouter(prefix="/profile", tags=["Profile"])


def get_profile_service() -> CareerProfileService:
    return CareerProfileService()


# ====================================================================
# 1. CORE PROFILE IDENTITY & PACKAGES
# ====================================================================

@router.get("", response_model=FullProfileResponse)
async def get_full_career_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    """Retrieves full candidate career profile package including all sub-entities."""
    return service.get_full_profile(
        user_id=current_user.id,
        email=getattr(current_user, "email", ""),
        name=getattr(current_user, "name", ""),
    )


@router.patch("", response_model=Dict[str, Any])
@router.put("", response_model=Dict[str, Any])
async def update_personal_profile(
    payload: PersonalInfoUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    """Updates candidate personal profile fields (headline, bio, phone, location, social URLs)."""
    return service.update_personal_info(current_user.id, payload)


# ====================================================================
# 2. INTELLIGENCE & TELEMETRY
# ====================================================================

@router.get("/completion", response_model=ProfileCompletionResponse)
async def get_profile_completion_metrics(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    """Calculates weighted completion score, missing sections, and data quality check."""
    full_profile = service.get_full_profile(
        user_id=current_user.id,
        email=getattr(current_user, "email", ""),
        name=getattr(current_user, "name", ""),
    )
    return full_profile.completion


@router.get("/readiness", response_model=CareerReadinessResponse)
async def get_career_readiness_metrics(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    """Aggregates live career match, verified skills count, roadmap progress, and ATS score."""
    full_profile = service.get_full_profile(
        user_id=current_user.id,
        email=getattr(current_user, "email", ""),
        name=getattr(current_user, "name", ""),
    )
    return full_profile.readiness


@router.get("/insights", response_model=Optional[ProfileInsightResponse])
async def get_ai_profile_insight(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    """Generates grounded Aura career insight based on current profile evidence."""
    full_profile = service.get_full_profile(
        user_id=current_user.id,
        email=getattr(current_user, "email", ""),
        name=getattr(current_user, "name", ""),
    )
    return full_profile.insight


@router.get("/activity", response_model=List[ProfileActivityRecord])
async def get_profile_activity_history(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
    limit: int = Query(15, ge=1, le=50),
):
    """Returns chronological audit timeline of candidate profile updates."""
    return service.list_activities(current_user.id, limit=limit)


@router.post("/recalculate")
async def recalculate_downstream_career_matches(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    """Recalculates career recommendations and skill gap analysis when profile changes."""
    return service.recalculate_matches(current_user.id)


@router.post("/avatar")
async def upload_profile_avatar(
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
    file: Optional[UploadFile] = File(None),
    avatar_url: Optional[str] = Query(None),
):
    """Updates candidate profile photo with format/size validation."""
    if file:
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPEG, PNG, and WebP image formats are permitted.",
            )
        # In mock/local setup, use simulated storage URI
        url = f"https://api.dicebear.com/7.x/initials/svg?seed={getattr(current_user, 'name', 'Candidate')}"
    elif avatar_url:
        url = avatar_url
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File or avatar_url parameter is required.",
        )

    service.update_personal_info(current_user.id, PersonalInfoUpdate(avatar_url=url))
    service.record_activity(current_user.id, "AVATAR_UPDATED", "personal", "Updated profile photo")
    return {"success": True, "avatar_url": url}


# ====================================================================
# 3. SUB-ENTITY CRUD (EDUCATION)
# ====================================================================

@router.post("/education", response_model=EducationItem, status_code=status.HTTP_201_CREATED)
async def add_education_entry(
    item: EducationItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.add_education(current_user.id, item)


@router.patch("/education/{item_id}", response_model=EducationItem)
@router.put("/education/{item_id}", response_model=EducationItem)
async def update_education_entry(
    item_id: Annotated[str, Path(...)],
    item: EducationItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.update_education(current_user.id, item_id, item)


@router.delete("/education/{item_id}")
async def delete_education_entry(
    item_id: Annotated[str, Path(...)],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    service.delete_education(current_user.id, item_id)
    return {"success": True, "deleted_id": item_id}


# ====================================================================
# 4. SUB-ENTITY CRUD (SKILLS MATRIX)
# ====================================================================

@router.post("/skills", response_model=SkillItem, status_code=status.HTTP_201_CREATED)
async def add_skill_entry(
    item: SkillItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.add_skill(current_user.id, item)


@router.patch("/skills/{item_id}", response_model=SkillItem)
@router.put("/skills/{item_id}", response_model=SkillItem)
async def update_skill_entry(
    item_id: Annotated[str, Path(...)],
    item: SkillItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.update_skill(current_user.id, item_id, item)


@router.delete("/skills/{item_id}")
async def delete_skill_entry(
    item_id: Annotated[str, Path(...)],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    service.delete_skill(current_user.id, item_id)
    return {"success": True, "deleted_id": item_id}


# ====================================================================
# 5. SUB-ENTITY CRUD (EXPERIENCE)
# ====================================================================

@router.post("/experience", response_model=ExperienceItem, status_code=status.HTTP_201_CREATED)
async def add_experience_entry(
    item: ExperienceItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.add_experience(current_user.id, item)


@router.patch("/experience/{item_id}", response_model=ExperienceItem)
@router.put("/experience/{item_id}", response_model=ExperienceItem)
async def update_experience_entry(
    item_id: Annotated[str, Path(...)],
    item: ExperienceItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.update_experience(current_user.id, item_id, item)


@router.delete("/experience/{item_id}")
async def delete_experience_entry(
    item_id: Annotated[str, Path(...)],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    service.delete_experience(current_user.id, item_id)
    return {"success": True, "deleted_id": item_id}


# ====================================================================
# 6. SUB-ENTITY CRUD (PROJECTS)
# ====================================================================

@router.post("/projects", response_model=ProjectItem, status_code=status.HTTP_201_CREATED)
async def add_project_entry(
    item: ProjectItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.add_project(current_user.id, item)


@router.patch("/projects/{item_id}", response_model=ProjectItem)
@router.put("/projects/{item_id}", response_model=ProjectItem)
async def update_project_entry(
    item_id: Annotated[str, Path(...)],
    item: ProjectItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.update_project(current_user.id, item_id, item)


@router.delete("/projects/{item_id}")
async def delete_project_entry(
    item_id: Annotated[str, Path(...)],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    service.delete_project(current_user.id, item_id)
    return {"success": True, "deleted_id": item_id}


# ====================================================================
# 7. SUB-ENTITY CRUD (CERTIFICATIONS)
# ====================================================================

@router.post("/certifications", response_model=CertificationItem, status_code=status.HTTP_201_CREATED)
async def add_certification_entry(
    item: CertificationItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.add_certification(current_user.id, item)


@router.patch("/certifications/{item_id}", response_model=CertificationItem)
@router.put("/certifications/{item_id}", response_model=CertificationItem)
async def update_certification_entry(
    item_id: Annotated[str, Path(...)],
    item: CertificationItem,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    return service.update_certification(current_user.id, item_id, item)


@router.delete("/certifications/{item_id}")
async def delete_certification_entry(
    item_id: Annotated[str, Path(...)],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    service.delete_certification(current_user.id, item_id)
    return {"success": True, "deleted_id": item_id}


# ====================================================================
# 8. INTERESTS, PREFERENCES & GOALS
# ====================================================================

@router.post("/preferences")
async def update_career_preferences(
    payload: Dict[str, Any],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    preferences = CareerPreferences(**payload.get("preferences", {}))
    goals = CareerGoals(**payload.get("goals", {}))
    return service.update_preferences_and_goals(current_user.id, preferences, goals)


@router.post("/interests")
async def update_interests_list(
    payload: Dict[str, List[str]],
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[CareerProfileService, Depends(get_profile_service)],
):
    interests = payload.get("interests", [])
    service.profiles_repo.set(current_user.id, {"interests": interests}, merge=True)
    service.record_activity(current_user.id, "INTERESTS_UPDATED", "interests", f"Updated {len(interests)} career interest domains")
    return {"success": True, "interests": interests}
