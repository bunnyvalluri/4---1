from fastapi import APIRouter
from app.api.v1 import (
    auth,
    users,
    profiles,
    assessments,
    careers,
    recommendations,
    skills,
    roadmap,
    projects,
    resumes,
    assistant,
    notifications,
    admin,
    dashboard,
    public_config,
    email,
    events,
    assignments,
    integrations,
    webhooks,
)

api_router = APIRouter()

# Register public configuration & contact router
api_router.include_router(public_config.router)

# Register all v1 feature routers
api_router.include_router(dashboard.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(profiles.router)
api_router.include_router(assessments.router, prefix="/assessments")
api_router.include_router(assessments.router, prefix="/assessment")
api_router.include_router(careers.router)
api_router.include_router(recommendations.router)
api_router.include_router(skills.router)
api_router.include_router(roadmap.router, prefix="/roadmaps")
api_router.include_router(roadmap.router, prefix="/roadmap")
api_router.include_router(projects.router)
api_router.include_router(resumes.router)
api_router.include_router(resumes.legacy_router)
api_router.include_router(events.router)
api_router.include_router(assignments.router)
api_router.include_router(integrations.router)
api_router.include_router(webhooks.router)
api_router.include_router(assistant.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
api_router.include_router(email.router)
