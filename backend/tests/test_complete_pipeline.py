import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.events import event_hub
from app.services.resume_service import ResumeService
from conftest import TestSessionLocal as AsyncSessionLocal
from app.models.resume import ResumeAnalysis
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.roadmap import Roadmap
from sqlalchemy import select

SAMPLE_RESUME_TEXT = """
Rahul Sharma
Email: rahul.sharma@example.com | Phone: +1-555-0199 | Location: San Francisco, CA
GitHub: github.com/rahulsharma | LinkedIn: linkedin.com/in/rahulsharma

EDUCATION
Bachelor of Technology in Computer Science
State Engineering University | 2020 - 2024 | GPA: 3.8 / 4.0

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, Bash
Frameworks & Libraries: FastAPI, Django, React.js, Next.js, Node.js
Databases: PostgreSQL, Redis, MongoDB, SQLite
Developer Tools: Git, Docker, Postman, Linux, REST APIs

EXPERIENCE
Software Engineer Intern | TechFlow Systems | June 2023 - May 2024
- Engineered high-throughput REST APIs using FastAPI and PostgreSQL, serving 50,000+ daily active requests.
- Optimized slow SQL queries with composite indexing and connection pooling, reducing p99 latency by 38%.
- Refactored legacy monolithic endpoints into decoupled asynchronous services with comprehensive pytest suites.

PROJECTS
E-Commerce Distributed API Platform
- Architected asynchronous microservices using Python, FastAPI, SQLAlchemy, and PostgreSQL.
- Implemented JWT authentication with role-based access control (RBAC) and Redis cache-aside invalidation.
- Deployed multi-stage Docker containers with automated health checks and Swagger documentation.
"""

@pytest.mark.asyncio
async def test_full_resume_pipeline():
    """Verifies end-to-end resume ingestion, AI parsing, career matching, roadmap generation, and Neon DB persistence."""
    test_user_id = "test_user_rahul"

    # 1. Register test event listener on EventHub
    queue = await event_hub.register(test_user_id)
    collected_events = []
    stop_collecting = asyncio.Event()

    async def collect_events():
        while not stop_collecting.is_set() or not queue.empty():
            try:
                evt = await asyncio.wait_for(queue.get(), timeout=0.5)
                collected_events.append(evt.get("event"))
            except asyncio.TimeoutError:
                if stop_collecting.is_set() and queue.empty():
                    break

    collector_task = asyncio.create_task(collect_events())

    # 2. Execute ResumeService pipeline
    async with AsyncSessionLocal() as session:
        service = ResumeService(session)
        analysis = await service.analyze_and_save_resume(
            user_id=test_user_id,
            file_name="Rahul_Resume.pdf",
            file_bytes=SAMPLE_RESUME_TEXT.encode("utf-8"),
        )

        assert analysis.id is not None
        assert analysis.ats_score > 70.0
        assert "Python" in analysis.extracted_skills
        assert "FastAPI" in analysis.extracted_skills
        assert "PostgreSQL" in analysis.extracted_skills
        assert len(analysis.ranked_careers) > 0
        assert analysis.ranked_careers[0]["title"] in ["Backend Developer", "Data Engineer", "Software Engineer"]
        assert analysis.ranked_careers[0]["matchScore"] >= 80.0

    stop_collecting.set()
    await collector_task
    await event_hub.unregister(test_user_id, queue)

    # 3. Verify real-time SSE events emitted
    assert "resume.uploaded" in collected_events
    assert "resume.text_extracted" in collected_events
    assert "resume.parsed" in collected_events
    assert "resume.skills_detected" in collected_events
    assert "resume.career_analysis_completed" in collected_events
    assert "roadmap.generated" in collected_events
    assert "assignments.generated" in collected_events

    # 4. Verify Assignments provisioned in Neon PostgreSQL
    async with AsyncSessionLocal() as session:
        asgn_stmt = select(Assignment).where(Assignment.career_id == analysis.career_id)
        asgns = (await session.execute(asgn_stmt)).scalars().all()
        assert len(asgns) >= 1
        assert "FastAPI" in asgns[0].skills


@pytest.mark.asyncio
async def test_assignment_submission_and_ci_evaluation():
    """Verifies assignment submission, automated test evaluation, and roadmap auto-advancement."""
    from app.core.security import create_access_token
    token = create_access_token({"sub": "test_user_rahul", "role": "USER"})
    headers = {"Authorization": f"Bearer {token}"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Fetch assignments
        res = await client.get("/api/v1/assignments", headers=headers)
        assert res.status_code == 200
        assignments = res.json()
        assert len(assignments) > 0
        target_asgn_id = assignments[0]["id"]

        # Submit assignment
        sub_res = await client.post(
            f"/api/v1/assignments/{target_asgn_id}/submit",
            headers=headers,
            json={
                "submissionType": "GITHUB",
                "repoUrl": "https://github.com/candidate/careerai-backend-assignment-01",
                "branch": "main",
                "commitSha": "a7b3c29",
                "commitMessage": "Implement production REST API & unit tests",
            },
        )
        assert sub_res.status_code == 200
        sub_data = sub_res.json()
        assert sub_data["status"] == "PASSED"
        assert sub_data["score"] >= 85.0
        assert sub_data["tests"] == "18/18 passed"
        assert sub_data["roadmapProgress"] > 0
