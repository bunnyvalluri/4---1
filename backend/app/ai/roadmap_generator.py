import uuid
from typing import Any, Dict, List
from app.core.config import settings
from app.core.logging import logger


class AIRoadmapGenerator:
    """
    Generates personalized learning milestones and month-by-month tasks
    tailored to the user's specific skill gaps for a target career.
    """

    async def generate_roadmap_items(
        self,
        career_title: str,
        missing_skills: List[str],
        duration_months: int = 6,
    ) -> List[Dict[str, Any]]:
        items = []

        # Standard curriculum phases
        phase_templates = [
            (
                "Core Foundations & Syntax Mastery",
                "Deep dive into the core languages, syntax, memory models, and standard libraries.",
                [
                    {"id": uuid.uuid4().hex[:8], "text": "Review language specifications and best practices", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Set up a modern linting and typechecking workflow", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Solve 15 foundational algorithm and data structure problems", "done": False},
                ],
            ),
            (
                "Architecture, Frameworks & Tooling",
                "Build proficiency with industry-standard frameworks and development environments.",
                [
                    {"id": uuid.uuid4().hex[:8], "text": "Build a multi-tier CRUD application with relational persistence", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Implement secure authentication with JWT and password hashing", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Configure environment variables and automated testing suites", "done": False},
                ],
            ),
            (
                "Data Persistence, Caching & Performance",
                "Master relational schema design, indexing, async querying, and caching layers.",
                [
                    {"id": uuid.uuid4().hex[:8], "text": "Write optimized database queries with joins and index strategies", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Integrate in-memory caching with Redis for hot read queries", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Perform load testing and benchmark API response latencies", "done": False},
                ],
            ),
            (
                "Cloud, Microservices & Containerization",
                "Learn containerization with Docker and deployment onto modern cloud providers.",
                [
                    {"id": uuid.uuid4().hex[:8], "text": "Create multi-stage Dockerfile images optimized for production", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Set up CI/CD pipelines with GitHub Actions", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Deploy services to a cloud container environment", "done": False},
                ],
            ),
            (
                "Production Capstone Development",
                "Design and construct an end-to-end full-scale project showcasing core competencies.",
                [
                    {"id": uuid.uuid4().hex[:8], "text": "Draft system design architecture diagram and data models", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Implement core business logic and background processing", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Write comprehensive unit and integration test coverage", "done": False},
                ],
            ),
            (
                "Interview Preparation & Portfolio Finalization",
                "Finalize resume bullet points, polish GitHub documentation, and mock interview practice.",
                [
                    {"id": uuid.uuid4().hex[:8], "text": "Record demo walkthrough video and publish live deployment link", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Conduct 5 mock technical behavioral and system design interviews", "done": False},
                    {"id": uuid.uuid4().hex[:8], "text": "Tailor resume and LinkedIn profile for target job listings", "done": False},
                ],
            ),
        ]

        num_phases = min(duration_months, len(phase_templates))
        for month_idx in range(1, num_phases + 1):
            title, desc, tasks = phase_templates[month_idx - 1]
            skills_chunk = missing_skills[
                (month_idx - 1) * 2 : (month_idx - 1) * 2 + 2
            ] if missing_skills else ["Domain Fundamentals"]

            items.append({
                "month": month_idx,
                "title": f"Month {month_idx}: {title}",
                "description": desc,
                "skills": skills_chunk if skills_chunk else ["Practical Application"],
                "tasks": tasks,
                "is_completed": False,
                "notes": "",
            })

        return items


ai_roadmap_generator = AIRoadmapGenerator()
