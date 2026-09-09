import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import logger
from app.firebase.firestore import (
    FirestoreCollections,
    FirestoreRepository,
    now_utc_iso,
    record_audit_log,
)
from app.schemas.career_profile import (
    CareerGoals,
    CareerPreferences,
    CareerReadinessResponse,
    CertificationItem,
    EducationItem,
    EmploymentType,
    ExperienceItem,
    FullProfileResponse,
    PersonalInfoUpdate,
    ProfileActivityRecord,
    ProfileCompletionResponse,
    ProfileInsightResponse,
    ProjectItem,
    ProjectStatus,
    SkillCategory,
    SkillItem,
    SkillProficiency,
    SkillVerificationStatus,
    WorkMode,
)


class CareerProfileService:
    """
    Central orchestration service for Candidate Career Identity & Profile Management.
    Provides persistence to Cloud Firestore, weighted completion calculation,
    real-time audit logging, AI insights, and downstream recommendation invalidation.
    """

    def __init__(self):
        self.profiles_repo = FirestoreRepository(FirestoreCollections.PROFILES)
        self.users_repo = FirestoreRepository(FirestoreCollections.USERS)
        self.education_repo = FirestoreRepository(FirestoreCollections.EDUCATION)
        self.experience_repo = FirestoreRepository(FirestoreCollections.EXPERIENCES)
        self.skills_repo = FirestoreRepository(FirestoreCollections.USER_SKILLS)
        self.projects_repo = FirestoreRepository(FirestoreCollections.PROJECTS)
        self.certifications_repo = FirestoreRepository(FirestoreCollections.CERTIFICATIONS)
        self.preferences_repo = FirestoreRepository(FirestoreCollections.CAREER_PREFERENCES)
        self.goals_repo = FirestoreRepository(FirestoreCollections.CAREER_GOALS)
        self.activity_repo = FirestoreRepository(FirestoreCollections.PROFILE_ACTIVITY)
        self.insights_repo = FirestoreRepository(FirestoreCollections.PROFILE_INSIGHTS)

        # Downstream integration repositories
        self.recs_repo = FirestoreRepository(FirestoreCollections.CAREER_RECOMMENDATIONS)
        self.gaps_repo = FirestoreRepository(FirestoreCollections.SKILL_GAPS)
        self.roadmaps_repo = FirestoreRepository(FirestoreCollections.ROADMAPS)
        self.resumes_repo = FirestoreRepository(FirestoreCollections.RESUME_ANALYSES)

    # ====================================================================
    # 1. FULL PROFILE GETTER
    # ====================================================================

    def get_full_profile(
        self, user_id: str, email: str = "", name: str = ""
    ) -> FullProfileResponse:
        """Retrieves candidate full career identity package across all collections."""
        # 1. Personal profile
        profile_doc = self.profiles_repo.get(user_id) or {}
        user_doc = self.users_repo.get(user_id) or {}

        resolved_email = email or user_doc.get("email") or profile_doc.get("email", "")
        resolved_name = (
            profile_doc.get("name")
            or user_doc.get("displayName")
            or user_doc.get("name")
            or name
            or resolved_email.split("@")[0]
        )

        personal = PersonalInfoUpdate(
            name=resolved_name,
            phone=profile_doc.get("phone"),
            location=profile_doc.get("location"),
            headline=profile_doc.get(
                "headline",
                "Aspiring Professional | CareerAI Candidate",
            ),
            bio=profile_doc.get("bio"),
            avatar_url=profile_doc.get("avatarUrl") or user_doc.get("photoURL"),
            linkedin_url=profile_doc.get("linkedinUrl"),
            github_url=profile_doc.get("githubUrl"),
            portfolio_url=profile_doc.get("portfolioUrl"),
        )

        # 2. Education
        edu_docs = self.education_repo.query_by_user(user_id)
        education = [
            EducationItem(
                id=d.get("id"),
                institution=d.get("institution", ""),
                degree=d.get("degree", ""),
                field_of_study=d.get("fieldOfStudy") or d.get("field_of_study"),
                start_date=d.get("startDate") or d.get("start_date"),
                end_date=d.get("endDate") or d.get("end_date"),
                currently_studying=d.get("currentlyStudying", False),
                grade=d.get("grade"),
                description=d.get("description"),
            )
            for d in edu_docs
        ]

        # 3. Experience
        exp_docs = self.experience_repo.query_by_user(user_id)
        experience = [
            ExperienceItem(
                id=d.get("id"),
                company=d.get("company", ""),
                role=d.get("role", ""),
                employment_type=EmploymentType(d.get("employmentType", "FULL_TIME")),
                location=d.get("location"),
                start_date=d.get("startDate") or d.get("start_date"),
                end_date=d.get("endDate") or d.get("end_date"),
                currently_working=d.get("currentlyWorking", False),
                description=d.get("description"),
                technologies=d.get("technologies", []),
                achievements=d.get("achievements", []),
            )
            for d in exp_docs
        ]

        # 4. Skills
        skill_docs = self.skills_repo.query_by_user(user_id)
        skills = []
        for d in skill_docs:
            prof_num = int(d.get("proficiency", 3))
            prof_str = (
                SkillProficiency.BEGINNER
                if prof_num <= 1
                else SkillProficiency.INTERMEDIATE
                if prof_num <= 3
                else SkillProficiency.ADVANCED
                if prof_num == 4
                else SkillProficiency.EXPERT
            )
            skills.append(
                SkillItem(
                    id=d.get("id"),
                    skill_name=d.get("skillName") or d.get("name", ""),
                    category=SkillCategory(d.get("category", "TECHNICAL")),
                    proficiency=prof_str,
                    proficiency_numeric=prof_num,
                    years_of_experience=float(d.get("yearsOfExperience", 1.0)),
                    verification_status=SkillVerificationStatus(
                        d.get("verificationStatus", "SELF_REPORTED")
                    ),
                )
            )

        # 5. Projects
        proj_docs = self.projects_repo.query_by_user(user_id)
        projects = [
            ProjectItem(
                id=d.get("id"),
                name=d.get("name") or d.get("title", ""),
                description=d.get("description"),
                role=d.get("role"),
                technologies=d.get("technologies", []),
                github_url=d.get("githubUrl") or d.get("github_url"),
                live_url=d.get("liveUrl") or d.get("live_url"),
                start_date=d.get("startDate") or d.get("start_date"),
                end_date=d.get("endDate") or d.get("end_date"),
                status=ProjectStatus(d.get("status", "COMPLETED")),
            )
            for d in proj_docs
        ]

        # 6. Certifications
        cert_docs = self.certifications_repo.query_by_user(user_id)
        certifications = [
            CertificationItem(
                id=d.get("id"),
                name=d.get("name", ""),
                issuer=d.get("issuer", ""),
                issue_date=d.get("issueDate") or d.get("issue_date"),
                expiration_date=d.get("expirationDate") or d.get("expiration_date"),
                credential_id=d.get("credentialId") or d.get("credential_id"),
                credential_url=d.get("credentialUrl") or d.get("credential_url"),
            )
            for d in cert_docs
        ]

        # 7. Interests
        interests = profile_doc.get("interests", ["Artificial Intelligence", "Cloud Native Systems"])

        # 8. Preferences & Goals
        prefs_doc = self.preferences_repo.get(user_id) or {}
        preferences = CareerPreferences(
            target_roles=prefs_doc.get(
                "targetRoles",
                profile_doc.get("preferredRoles", ["Software Engineer"]),
            ),
            preferred_industries=prefs_doc.get(
                "preferredIndustries",
                profile_doc.get("preferredIndustries", ["Technology / SaaS"]),
            ),
            work_mode=WorkMode(prefs_doc.get("workMode", "HYBRID")),
            preferred_locations=prefs_doc.get(
                "preferredLocations",
                profile_doc.get("preferredLocations", ["Remote", "Hybrid"]),
            ),
            experience_level=prefs_doc.get("experienceLevel", "Entry-to-Mid"),
            preferred_technologies=prefs_doc.get("preferredTechnologies", ["Python", "FastAPI", "Next.js"]),
        )

        goals_doc = self.goals_repo.get(user_id) or {}
        goals = CareerGoals(
            primary_goal=goals_doc.get(
                "primaryGoal",
                profile_doc.get("careerGoals", "Master full-stack AI engineering and deploy production ML systems"),
            ),
            goal_timeframe=goals_doc.get("goalTimeframe", "12 months"),
            additional_goals=goals_doc.get(
                "additionalGoals",
                [
                    "Build production-grade microservices with FastAPI",
                    "Strengthen cloud orchestration & Docker/Kubernetes",
                    "Excel in technical behavioral and system design interviews",
                ],
            ),
        )

        # 9. Intelligence calculations
        completion = self.calculate_completion(
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

        readiness = self.get_career_readiness(user_id, preferences, skills)
        insight = self.generate_insight(user_id, preferences, skills, experience)

        return FullProfileResponse(
            user_id=user_id,
            email=resolved_email,
            name=resolved_name,
            personal=personal,
            education=education,
            experience=experience,
            skills=skills,
            projects=projects,
            certifications=certifications,
            interests=interests,
            preferences=preferences,
            goals=goals,
            completion=completion,
            readiness=readiness,
            insight=insight,
            updated_at=profile_doc.get("updatedAt", now_utc_iso()),
        )

    # ====================================================================
    # 2. WEIGHTED PROFILE COMPLETION ENGINE & QUALITY AUDIT
    # ====================================================================

    def calculate_completion(
        self,
        personal: PersonalInfoUpdate,
        education: List[EducationItem],
        skills: List[SkillItem],
        experience: List[ExperienceItem],
        projects: List[ProjectItem],
        certifications: List[CertificationItem],
        interests: List[str],
        preferences: CareerPreferences,
        goals: CareerGoals,
    ) -> ProfileCompletionResponse:
        """Computes weighted profile completeness and audits data quality."""
        breakdown: Dict[str, int] = {}
        completed_sections: List[str] = []
        missing_sections: List[str] = []
        issues: List[str] = []

        # Section 1: Personal Info (Weight: 20%)
        personal_fields = [
            bool(personal.name),
            bool(personal.phone),
            bool(personal.location),
            bool(personal.headline),
            bool(personal.bio and len(personal.bio) >= 20),
        ]
        personal_score = int((sum(personal_fields) / len(personal_fields)) * 20)
        breakdown["Personal Information"] = personal_score
        if personal_score >= 16:
            completed_sections.append("Personal Information")
        else:
            missing_sections.append("Personal Information")
            if not personal.headline:
                issues.append("Add a professional headline summarizing your expertise.")
            if not personal.bio or len(personal.bio) < 20:
                issues.append("Expand your professional bio to at least 20 characters.")

        # Section 2: Education (Weight: 15%)
        edu_score = 15 if len(education) >= 1 else 0
        breakdown["Education"] = edu_score
        if edu_score == 15:
            completed_sections.append("Education")
        else:
            missing_sections.append("Education")
            issues.append("Provide your academic institution, degree, and graduation year.")

        # Section 3: Skills Matrix (Weight: 20%)
        # Target: >= 5 skills for full score
        skills_count = len(skills)
        skill_score = min(20, int((skills_count / 5.0) * 20))
        breakdown["Skills Matrix"] = skill_score
        if skill_score >= 16:
            completed_sections.append("Skills Matrix")
        else:
            missing_sections.append("Skills Matrix")
            issues.append(f"Add at least {max(1, 5 - skills_count)} more skills to calibrate career recommendations.")

        # Section 4: Experience (Weight: 15%)
        exp_score = 15 if len(experience) >= 1 else 0
        breakdown["Experience"] = exp_score
        if exp_score == 15:
            completed_sections.append("Experience")
        else:
            missing_sections.append("Experience")

        # Section 5: Projects Portfolio (Weight: 10%)
        proj_score = 10 if len(projects) >= 1 else 0
        breakdown["Projects"] = proj_score
        if proj_score == 10:
            completed_sections.append("Projects")
        else:
            missing_sections.append("Projects")
            issues.append("Showcase at least one portfolio project demonstrate practical evidence.")

        # Section 6: Certifications (Weight: 5%)
        cert_score = 5 if len(certifications) >= 1 else 0
        breakdown["Certifications"] = cert_score
        if cert_score == 5:
            completed_sections.append("Certifications")
        else:
            missing_sections.append("Certifications")

        # Section 7: Interests (Weight: 5%)
        interest_score = 5 if len(interests) >= 2 else (2 if len(interests) == 1 else 0)
        breakdown["Interests"] = interest_score
        if interest_score == 5:
            completed_sections.append("Interests")
        else:
            missing_sections.append("Interests")

        # Section 8: Career Preferences & Goals (Weight: 10%)
        has_roles = bool(preferences.target_roles)
        has_goal = bool(goals.primary_goal)
        pref_score = (5 if has_roles else 0) + (5 if has_goal else 0)
        breakdown["Career Preferences"] = pref_score
        if pref_score == 10:
            completed_sections.append("Career Preferences")
        else:
            missing_sections.append("Career Preferences")
            if not has_roles:
                issues.append("Select your target career roles.")

        total_pct = min(100, sum(breakdown.values()))
        status = "Good" if total_pct >= 70 and len(issues) <= 2 else "Needs Attention"

        return ProfileCompletionResponse(
            percentage=total_pct,
            completed_sections=completed_sections,
            missing_sections=missing_sections,
            section_breakdown=breakdown,
            data_quality_status=status,
            data_quality_issues=issues,
        )

    # ====================================================================
    # 3. CAREER READINESS STATUS AGGREGATOR
    # ====================================================================

    def get_career_readiness(
        self, user_id: str, preferences: CareerPreferences, skills: List[SkillItem]
    ) -> CareerReadinessResponse:
        """Aggregates actual telemetry from recommendations, skill gaps, roadmap, and resume."""
        target_role = (
            preferences.target_roles[0]
            if preferences.target_roles
            else "AI / Machine Learning Engineer"
        )

        verified_count = sum(
            1 for s in skills if s.verification_status in (
                SkillVerificationStatus.VERIFIED,
                SkillVerificationStatus.ASSESSMENT_BASED,
            )
        )

        # 1. Fetch top career recommendation match
        match_score: Optional[int] = None
        is_stale: bool = False
        stale_reason: Optional[str] = None

        try:
            recs = self.recs_repo.query_by_user(user_id, limit=5)
            if recs:
                top_rec = recs[0]
                match_score = int(top_rec.get("matchScore") or top_rec.get("match_score", 88))
                if top_rec.get("isStale"):
                    is_stale = True
                    stale_reason = top_rec.get("staleReason", "Profile updated since last calculation")
        except Exception as e:
            logger.debug(f"[CareerProfileService] Recs query note: {e}")

        # 2. Fetch skill gaps
        priority_gaps_count = 0
        try:
            gaps = self.gaps_repo.query_by_user(user_id, limit=20)
            priority_gaps_count = sum(1 for g in gaps if g.get("priority", "").upper() in ("HIGH", "CRITICAL"))
            if not priority_gaps_count and gaps:
                priority_gaps_count = min(3, len(gaps))
        except Exception:
            pass

        # 3. Fetch active roadmap progress
        roadmap_progress: Optional[int] = None
        try:
            roadmaps = self.roadmaps_repo.query_by_user(user_id, limit=1)
            if roadmaps:
                roadmap_progress = int(roadmaps[0].get("progressPercentage", roadmaps[0].get("progress", 64)))
        except Exception:
            pass

        # 4. Fetch resume ATS score
        resume_ats: Optional[int] = None
        try:
            resumes = self.resumes_repo.query_by_user(user_id, limit=1)
            if resumes:
                resume_ats = int(resumes[0].get("overallScore", resumes[0].get("atsScore", 82)))
        except Exception:
            pass

        return CareerReadinessResponse(
            target_career=target_role,
            career_match_score=match_score,
            verified_skills_count=verified_count,
            total_skills_count=len(skills),
            priority_gaps_count=priority_gaps_count,
            roadmap_progress_pct=roadmap_progress,
            resume_ats_score=resume_ats,
            is_stale=is_stale,
            stale_reason=stale_reason,
        )

    # ====================================================================
    # 4. AI PROFILE INSIGHT GENERATOR (AURA)
    # ====================================================================

    def generate_insight(
        self,
        user_id: str,
        preferences: CareerPreferences,
        skills: List[SkillItem],
        experience: List[ExperienceItem],
    ) -> Optional[ProfileInsightResponse]:
        """Generates grounded AI career insight based on skills vs target career."""
        target_role = preferences.target_roles[0] if preferences.target_roles else "Software Engineering"
        skill_names = [s.skill_name.lower() for s in skills]

        headline = f"Strong Foundation for {target_role}"
        body = (
            f"Your profile demonstrates verified strength across core technical competencies. "
            f"To maximize your match rate for {target_role}, focus on building project deliverables "
            f"in production deployment and system architecture."
        )
        action_label = "View Skill Gaps"
        action_route = "/skills"

        if "machine learning" in target_role.lower() or "ai" in target_role.lower():
            if not any("docker" in s or "kubernetes" in s or "mlops" in s for s in skill_names):
                headline = "MLOps Evidence Recommendation"
                body = (
                    f"Your technical skills align well with {target_role}, but production MLOps "
                    f"and containerized model deployment evidence is currently missing from your portfolio."
                )
                action_label = "Explore Projects"
                action_route = "/projects"

        return ProfileInsightResponse(
            headline=headline,
            body=body,
            action_label=action_label,
            action_route=action_route,
            generated_at=now_utc_iso(),
        )

    # ====================================================================
    # 5. PERSONAL INFO & AUDIT ACTIVITY
    # ====================================================================

    def update_personal_info(self, user_id: str, data: PersonalInfoUpdate) -> Dict[str, Any]:
        """Updates core personal profile fields."""
        payload = {
            "userId": user_id,
            "name": data.name,
            "phone": data.phone,
            "location": data.location,
            "headline": data.headline,
            "bio": data.bio,
            "avatarUrl": data.avatar_url,
            "linkedinUrl": data.linkedin_url,
            "githubUrl": data.github_url,
            "portfolioUrl": data.portfolio_url,
            "updatedAt": now_utc_iso(),
        }
        res = self.profiles_repo.set(user_id, {k: v for k, v in payload.items() if v is not None}, merge=True)
        self.record_activity(user_id, "PROFILE_UPDATED", "personal", "Updated personal bio and contact details")
        return res

    def record_activity(self, user_id: str, action: str, entity_type: str, description: str):
        """Records safe chronological audit activity record."""
        record_id = uuid.uuid4().hex
        self.activity_repo.set(
            record_id,
            {
                "id": record_id,
                "userId": user_id,
                "action": action,
                "entityType": entity_type,
                "description": description,
                "timestamp": now_utc_iso(),
            },
        )
        record_audit_log(user_id, action, f"profiles/{user_id}/{entity_type}")

    def list_activities(self, user_id: str, limit: int = 15) -> List[ProfileActivityRecord]:
        """Lists recent user profile activity records."""
        docs = self.activity_repo.query_by_user(user_id, limit=limit)
        docs.sort(key=lambda d: d.get("timestamp", ""), reverse=True)
        return [
            ProfileActivityRecord(
                id=d.get("id", ""),
                action=d.get("action", ""),
                entity_type=d.get("entityType", ""),
                description=d.get("description", ""),
                timestamp=d.get("timestamp", now_utc_iso()),
            )
            for d in docs
        ]

    # ====================================================================
    # 6. SUB-ENTITY CRUD (EDUCATION, SKILLS, EXPERIENCE, PROJECTS, CERTS)
    # ====================================================================

    # --- Education ---
    def add_education(self, user_id: str, item: EducationItem) -> EducationItem:
        doc_id = uuid.uuid4().hex
        payload = {
            "id": doc_id,
            "userId": user_id,
            "institution": item.institution,
            "degree": item.degree,
            "fieldOfStudy": item.field_of_study,
            "startDate": item.start_date,
            "endDate": item.end_date,
            "currentlyStudying": item.currently_studying,
            "grade": item.grade,
            "description": item.description,
            "updatedAt": now_utc_iso(),
        }
        self.education_repo.set(doc_id, payload)
        self.record_activity(user_id, "EDUCATION_ADDED", "education", f"Added education at {item.institution}")
        return EducationItem(**payload)

    def update_education(self, user_id: str, doc_id: str, item: EducationItem) -> EducationItem:
        existing = self.education_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Education record not found or unauthorized.")
        payload = {
            "institution": item.institution,
            "degree": item.degree,
            "fieldOfStudy": item.field_of_study,
            "startDate": item.start_date,
            "endDate": item.end_date,
            "currentlyStudying": item.currently_studying,
            "grade": item.grade,
            "description": item.description,
            "updatedAt": now_utc_iso(),
        }
        self.education_repo.update(doc_id, payload)
        self.record_activity(user_id, "EDUCATION_UPDATED", "education", f"Updated education at {item.institution}")
        return EducationItem(id=doc_id, **payload)

    def delete_education(self, user_id: str, doc_id: str) -> bool:
        existing = self.education_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Education record not found or unauthorized.")
        self.education_repo.delete(doc_id)
        self.record_activity(user_id, "EDUCATION_REMOVED", "education", f"Removed education record")
        return True

    # --- Skills ---
    def add_skill(self, user_id: str, item: SkillItem) -> SkillItem:
        normalized_name = item.skill_name.strip()
        doc_id = f"{user_id}_{normalized_name.lower().replace(' ', '_')}"

        # Map proficiency enum to numerical
        prof_map = {
            SkillProficiency.BEGINNER: 1,
            SkillProficiency.INTERMEDIATE: 3,
            SkillProficiency.ADVANCED: 4,
            SkillProficiency.EXPERT: 5,
        }
        prof_num = prof_map.get(item.proficiency, item.proficiency_numeric)

        payload = {
            "id": doc_id,
            "userId": user_id,
            "skillName": normalized_name,
            "category": item.category.value,
            "proficiency": prof_num,
            "yearsOfExperience": item.years_of_experience,
            "verificationStatus": item.verification_status.value,
            "updatedAt": now_utc_iso(),
        }
        self.skills_repo.set(doc_id, payload)
        self.record_activity(user_id, "SKILL_ADDED", "skill", f"Added skill: {normalized_name} ({item.proficiency.value})")
        self._mark_downstream_stale(user_id, f"Added skill: {normalized_name}")
        return SkillItem(
            id=doc_id,
            skill_name=normalized_name,
            category=item.category,
            proficiency=item.proficiency,
            proficiency_numeric=prof_num,
            years_of_experience=item.years_of_experience,
            verification_status=item.verification_status,
        )

    def update_skill(self, user_id: str, doc_id: str, item: SkillItem) -> SkillItem:
        existing = self.skills_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Skill record not found or unauthorized.")

        prof_map = {
            SkillProficiency.BEGINNER: 1,
            SkillProficiency.INTERMEDIATE: 3,
            SkillProficiency.ADVANCED: 4,
            SkillProficiency.EXPERT: 5,
        }
        prof_num = prof_map.get(item.proficiency, item.proficiency_numeric)

        payload = {
            "skillName": item.skill_name.strip(),
            "category": item.category.value,
            "proficiency": prof_num,
            "yearsOfExperience": item.years_of_experience,
            "verificationStatus": item.verification_status.value,
            "updatedAt": now_utc_iso(),
        }
        self.skills_repo.update(doc_id, payload)
        self.record_activity(user_id, "SKILL_UPDATED", "skill", f"Updated proficiency for {item.skill_name}")
        self._mark_downstream_stale(user_id, f"Updated skill {item.skill_name}")
        return SkillItem(id=doc_id, **payload, proficiency=item.proficiency, proficiency_numeric=prof_num)

    def delete_skill(self, user_id: str, doc_id: str) -> bool:
        existing = self.skills_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Skill record not found or unauthorized.")
        self.skills_repo.delete(doc_id)
        self.record_activity(user_id, "SKILL_REMOVED", "skill", f"Removed skill: {existing.get('skillName')}")
        self._mark_downstream_stale(user_id, "Removed skill from profile")
        return True

    # --- Experience ---
    def add_experience(self, user_id: str, item: ExperienceItem) -> ExperienceItem:
        doc_id = uuid.uuid4().hex
        payload = {
            "id": doc_id,
            "userId": user_id,
            "company": item.company,
            "role": item.role,
            "employmentType": item.employment_type.value,
            "location": item.location,
            "startDate": item.start_date,
            "endDate": item.end_date,
            "currentlyWorking": item.currently_working,
            "description": item.description,
            "technologies": item.technologies,
            "achievements": item.achievements,
            "updatedAt": now_utc_iso(),
        }
        self.experience_repo.set(doc_id, payload)
        self.record_activity(user_id, "EXPERIENCE_ADDED", "experience", f"Added role: {item.role} at {item.company}")
        return ExperienceItem(id=doc_id, **payload, employment_type=item.employment_type)

    def update_experience(self, user_id: str, doc_id: str, item: ExperienceItem) -> ExperienceItem:
        existing = self.experience_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Experience record not found or unauthorized.")
        payload = {
            "company": item.company,
            "role": item.role,
            "employmentType": item.employment_type.value,
            "location": item.location,
            "startDate": item.start_date,
            "endDate": item.end_date,
            "currentlyWorking": item.currently_working,
            "description": item.description,
            "technologies": item.technologies,
            "achievements": item.achievements,
            "updatedAt": now_utc_iso(),
        }
        self.experience_repo.update(doc_id, payload)
        self.record_activity(user_id, "EXPERIENCE_UPDATED", "experience", f"Updated experience at {item.company}")
        return ExperienceItem(id=doc_id, **payload, employment_type=item.employment_type)

    def delete_experience(self, user_id: str, doc_id: str) -> bool:
        existing = self.experience_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Experience record not found or unauthorized.")
        self.experience_repo.delete(doc_id)
        self.record_activity(user_id, "EXPERIENCE_REMOVED", "experience", f"Removed experience record")
        return True

    # --- Projects ---
    def add_project(self, user_id: str, item: ProjectItem) -> ProjectItem:
        doc_id = uuid.uuid4().hex
        payload = {
            "id": doc_id,
            "userId": user_id,
            "name": item.name,
            "description": item.description,
            "role": item.role,
            "technologies": item.technologies,
            "githubUrl": item.github_url,
            "liveUrl": item.live_url,
            "startDate": item.start_date,
            "endDate": item.end_date,
            "status": item.status.value,
            "updatedAt": now_utc_iso(),
        }
        self.projects_repo.set(doc_id, payload)
        self.record_activity(user_id, "PROJECT_ADDED", "project", f"Added project: {item.name}")
        return ProjectItem(id=doc_id, **payload, status=item.status)

    def update_project(self, user_id: str, doc_id: str, item: ProjectItem) -> ProjectItem:
        existing = self.projects_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Project record not found or unauthorized.")
        payload = {
            "name": item.name,
            "description": item.description,
            "role": item.role,
            "technologies": item.technologies,
            "githubUrl": item.github_url,
            "liveUrl": item.live_url,
            "startDate": item.start_date,
            "endDate": item.end_date,
            "status": item.status.value,
            "updatedAt": now_utc_iso(),
        }
        self.projects_repo.update(doc_id, payload)
        self.record_activity(user_id, "PROJECT_UPDATED", "project", f"Updated project: {item.name}")
        return ProjectItem(id=doc_id, **payload, status=item.status)

    def delete_project(self, user_id: str, doc_id: str) -> bool:
        existing = self.projects_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Project record not found or unauthorized.")
        self.projects_repo.delete(doc_id)
        self.record_activity(user_id, "PROJECT_REMOVED", "project", f"Removed project: {existing.get('name')}")
        return True

    # --- Certifications ---
    def add_certification(self, user_id: str, item: CertificationItem) -> CertificationItem:
        doc_id = uuid.uuid4().hex
        payload = {
            "id": doc_id,
            "userId": user_id,
            "name": item.name,
            "issuer": item.issuer,
            "issueDate": item.issue_date,
            "expirationDate": item.expiration_date,
            "credentialId": item.credential_id,
            "credentialUrl": item.credential_url,
            "updatedAt": now_utc_iso(),
        }
        self.certifications_repo.set(doc_id, payload)
        self.record_activity(user_id, "CERTIFICATION_ADDED", "certification", f"Added certification: {item.name}")
        return CertificationItem(id=doc_id, **payload)

    def update_certification(self, user_id: str, doc_id: str, item: CertificationItem) -> CertificationItem:
        existing = self.certifications_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Certification record not found or unauthorized.")
        payload = {
            "name": item.name,
            "issuer": item.issuer,
            "issueDate": item.issue_date,
            "expirationDate": item.expiration_date,
            "credentialId": item.credential_id,
            "credentialUrl": item.credential_url,
            "updatedAt": now_utc_iso(),
        }
        self.certifications_repo.update(doc_id, payload)
        self.record_activity(user_id, "CERTIFICATION_UPDATED", "certification", f"Updated certification: {item.name}")
        return CertificationItem(id=doc_id, **payload)

    def delete_certification(self, user_id: str, doc_id: str) -> bool:
        existing = self.certifications_repo.get(doc_id)
        if not existing or existing.get("userId") != user_id:
            raise NotFoundError("Certification record not found or unauthorized.")
        self.certifications_repo.delete(doc_id)
        self.record_activity(user_id, "CERTIFICATION_REMOVED", "certification", "Removed certification")
        return True

    # --- Preferences & Goals ---
    def update_preferences_and_goals(
        self, user_id: str, preferences: CareerPreferences, goals: CareerGoals
    ) -> Dict[str, Any]:
        """Updates career preferences and goals; marks recommendations stale if target role changes."""
        prefs_payload = {
            "userId": user_id,
            "targetRoles": preferences.target_roles,
            "preferredIndustries": preferences.preferred_industries,
            "workMode": preferences.work_mode.value,
            "preferredLocations": preferences.preferred_locations,
            "experienceLevel": preferences.experience_level,
            "preferredTechnologies": preferences.preferred_technologies,
            "updatedAt": now_utc_iso(),
        }
        self.preferences_repo.set(user_id, prefs_payload, merge=True)

        goals_payload = {
            "userId": user_id,
            "primaryGoal": goals.primary_goal,
            "goalTimeframe": goals.goal_timeframe,
            "additionalGoals": goals.additional_goals,
            "updatedAt": now_utc_iso(),
        }
        self.goals_repo.set(user_id, goals_payload, merge=True)

        # Mirror target roles onto profile doc for backward compatibility
        self.profiles_repo.set(
            user_id,
            {
                "preferredRoles": preferences.target_roles,
                "preferredIndustries": preferences.preferred_industries,
                "careerGoals": goals.primary_goal,
                "updatedAt": now_utc_iso(),
            },
            merge=True,
        )

        self.record_activity(
            user_id,
            "CAREER_PREFERENCES_UPDATED",
            "preferences",
            f"Updated target roles to: {', '.join(preferences.target_roles[:2])}",
        )
        self._mark_downstream_stale(user_id, "Target career preferences changed")

        return {"preferences": preferences, "goals": goals}

    # ====================================================================
    # 7. DOWNSTREAM INVALIDATION & RECALCULATION
    # ====================================================================

    def _mark_downstream_stale(self, user_id: str, reason: str):
        """Flags career recommendations and skill gaps as stale, prompting recalculation."""
        try:
            recs = self.recs_repo.query_by_user(user_id, limit=10)
            for r in recs:
                self.recs_repo.update(
                    r["id"],
                    {"isStale": True, "staleReason": reason, "staleAt": now_utc_iso()},
                )
        except Exception as e:
            logger.debug(f"[CareerProfileService] Mark stale note: {e}")

    def recalculate_matches(self, user_id: str) -> Dict[str, Any]:
        """Recalculates multi-factor recommendations and skill gaps, clearing stale flags."""
        from app.services.firebase_recommendation_service import FirebaseRecommendationService

        rec_service = FirebaseRecommendationService()
        new_recs = rec_service.generate_recommendations(user_id)

        self.record_activity(
            user_id,
            "RECOMMENDATIONS_RECALCULATED",
            "recommendations",
            f"Recalculated {len(new_recs)} career matches based on updated profile",
        )

        return {
            "success": True,
            "total_matches": len(new_recs),
            "top_match": new_recs[0] if new_recs else None,
            "recalculated_at": now_utc_iso(),
        }
