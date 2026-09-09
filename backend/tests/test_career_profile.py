import pytest
from unittest.mock import MagicMock, patch
from httpx import AsyncClient

from app.schemas.career_profile import (
    CareerGoals,
    CareerPreferences,
    CertificationItem,
    EducationItem,
    EmploymentType,
    ExperienceItem,
    PersonalInfoUpdate,
    ProjectItem,
    ProjectStatus,
    SkillCategory,
    SkillItem,
    SkillProficiency,
    SkillVerificationStatus,
    WorkMode,
)
from app.services.career_profile_service import CareerProfileService


@pytest.fixture
def mock_profile_service():
    service = CareerProfileService()
    service.profiles_repo = MagicMock()
    service.users_repo = MagicMock()
    service.education_repo = MagicMock()
    service.experience_repo = MagicMock()
    service.skills_repo = MagicMock()
    service.projects_repo = MagicMock()
    service.certifications_repo = MagicMock()
    service.preferences_repo = MagicMock()
    service.goals_repo = MagicMock()
    service.activity_repo = MagicMock()
    service.insights_repo = MagicMock()
    service.recs_repo = MagicMock()
    service.gaps_repo = MagicMock()
    service.roadmaps_repo = MagicMock()
    service.resumes_repo = MagicMock()
    return service


class TestCareerProfileServiceUnit:
    def test_calculate_completion_weighted_scoring(self, mock_profile_service):
        personal = PersonalInfoUpdate(
            name="Alex Mercer",
            phone="+1234567890",
            location="San Francisco, CA",
            headline="Full Stack AI Engineer",
            bio="Building high-performance distributed systems with FastAPI and Next.js.",
        )
        education = [
            EducationItem(institution="Stanford", degree="B.S.", field_of_study="CS")
        ]
        skills = [
            SkillItem(skill_name="Python", proficiency=SkillProficiency.EXPERT),
            SkillItem(skill_name="FastAPI", proficiency=SkillProficiency.ADVANCED),
            SkillItem(skill_name="Docker", proficiency=SkillProficiency.INTERMEDIATE),
            SkillItem(skill_name="TypeScript", proficiency=SkillProficiency.ADVANCED),
            SkillItem(skill_name="PyTorch", proficiency=SkillProficiency.INTERMEDIATE),
        ]
        experience = [
            ExperienceItem(company="AI Labs", role="ML Intern", employment_type=EmploymentType.INTERNSHIP)
        ]
        projects = [
            ProjectItem(name="CareerAI", status=ProjectStatus.COMPLETED)
        ]
        certifications = [
            CertificationItem(name="AWS Solutions Architect", issuer="Amazon")
        ]
        interests = ["Artificial Intelligence", "Cloud Native Systems"]
        preferences = CareerPreferences(target_roles=["AI Engineer"])
        goals = CareerGoals(primary_goal="Lead an applied ML team")

        completion = mock_profile_service.calculate_completion(
            personal=personal,
            education=education,
            skills=skills,
            experience=experience,
            projects=projects,
            certifications=certifications,
            interests=interests,
            preferences=preferences,
            goals=goals,
        )

        assert completion.percentage == 100
        assert completion.data_quality_status == "Good"
        assert len(completion.completed_sections) >= 7

    def test_education_crud(self, mock_profile_service):
        user_id = "test-user-123"
        item = EducationItem(
            institution="MIT",
            degree="M.S.",
            field_of_study="Computer Science",
            start_date="2022",
            end_date="2024",
            grade="3.9",
        )

        # Add
        mock_profile_service.education_repo.set = MagicMock()
        mock_profile_service.activity_repo.set = MagicMock()
        added = mock_profile_service.add_education(user_id, item)
        assert added.institution == "MIT"
        mock_profile_service.education_repo.set.assert_called_once()

        # Update
        mock_profile_service.education_repo.get = MagicMock(return_value={"userId": user_id})
        mock_profile_service.education_repo.update = MagicMock()
        updated = mock_profile_service.update_education(user_id, added.id, item)
        assert updated.institution == "MIT"

        # Delete
        mock_profile_service.education_repo.delete = MagicMock()
        assert mock_profile_service.delete_education(user_id, added.id) is True

    def test_skills_crud_and_stale_invalidation(self, mock_profile_service):
        user_id = "test-user-123"
        skill = SkillItem(
            skill_name="Rust",
            category=SkillCategory.TECHNICAL,
            proficiency=SkillProficiency.ADVANCED,
            years_of_experience=2.0,
        )

        mock_profile_service.skills_repo.set = MagicMock()
        mock_profile_service.activity_repo.set = MagicMock()
        mock_profile_service.recs_repo.query_by_user = MagicMock(return_value=[{"id": "rec-1"}])
        mock_profile_service.recs_repo.update = MagicMock()

        added = mock_profile_service.add_skill(user_id, skill)
        assert added.skill_name == "Rust"
        # Verify recommendation stale invalidation triggered
        mock_profile_service.recs_repo.update.assert_called_once()
        update_args = mock_profile_service.recs_repo.update.call_args[0]
        assert update_args[1]["isStale"] is True


class TestCareerProfileApi:
    @pytest.mark.asyncio
    async def test_get_profile_requires_auth(self, client: AsyncClient):
        response = await client.get("/api/v1/profile")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_profile_with_auth(self, client: AsyncClient, auth_headers: dict):
        with patch("app.api.v1.profiles.CareerProfileService") as mock_svc_cls:
            mock_svc = MagicMock()
            mock_svc_cls.return_value = mock_svc
            mock_svc.get_full_profile.return_value = {
                "user_id": "test-id",
                "email": "test@careerai.dev",
                "name": "Test User",
                "personal": {
                    "name": "Test User",
                    "headline": "Software Engineer",
                    "bio": "Bio content here",
                },
                "education": [],
                "experience": [],
                "skills": [],
                "projects": [],
                "certifications": [],
                "interests": ["AI"],
                "preferences": {"target_roles": ["Engineer"], "work_mode": "REMOTE"},
                "goals": {"primary_goal": "Grow as engineer"},
                "completion": {
                    "percentage": 65,
                    "completed_sections": ["Personal Information"],
                    "missing_sections": ["Education"],
                    "section_breakdown": {},
                    "data_quality_status": "Good",
                    "data_quality_issues": [],
                },
                "readiness": {
                    "target_career": "Engineer",
                    "career_match_score": 85,
                    "verified_skills_count": 0,
                    "total_skills_count": 0,
                    "priority_gaps_count": 0,
                    "roadmap_progress_pct": None,
                    "resume_ats_score": None,
                    "is_stale": False,
                },
                "insight": {
                    "headline": "Profile Insight",
                    "body": "Keep your skills fresh",
                    "generated_at": "2026-09-09T10:00:00Z",
                },
                "updated_at": "2026-09-09T10:00:00Z",
            }

            response = await client.get("/api/v1/profile", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Test User"
            assert "completion" in data
            assert data["completion"]["percentage"] == 65
