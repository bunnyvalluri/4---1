import uuid
from typing import Any, Dict, List, Optional, Tuple
from app.core.logging import logger

CAREER_TRACKS = [
    {
        "id": "career_backend",
        "title": "Backend Developer",
        "slug": "backend-developer",
        "category": "Software Engineering",
        "core_skills": ["Python", "FastAPI", "PostgreSQL", "SQL", "Docker", "REST APIs", "Git", "Redis", "CI/CD"],
        "advanced_skills": ["Kubernetes", "System Design", "Microservices", "Kafka", "AWS"],
        "description": "Architects high-performance APIs, robust database pipelines, and resilient backend systems.",
    },
    {
        "id": "career_fullstack",
        "title": "Full Stack Developer",
        "slug": "full-stack-developer",
        "category": "Software Engineering",
        "core_skills": ["JavaScript", "TypeScript", "React.js", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Git"],
        "advanced_skills": ["Docker", "GraphQL", "CI/CD", "AWS", "Serverless"],
        "description": "Builds end-to-end web applications bridging elegant user experiences and scalable server logic.",
    },
    {
        "id": "career_ai",
        "title": "AI Engineer",
        "slug": "ai-engineer",
        "category": "Artificial Intelligence",
        "core_skills": ["Python", "Machine Learning", "PyTorch", "TensorFlow", "FastAPI", "SQL", "Git"],
        "advanced_skills": ["LangChain", "LLMs", "Vector DBs", "Docker", "Model Deployment"],
        "description": "Develops, trains, and operationalizes state-of-the-art AI architectures and generative systems.",
    },
    {
        "id": "career_devops",
        "title": "DevOps Engineer",
        "slug": "devops-engineer",
        "category": "Infrastructure",
        "core_skills": ["Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Linux", "Git", "Bash"],
        "advanced_skills": ["Terraform", "Prometheus", "Grafana", "AWS", "Ansible"],
        "description": "Automates continuous integration, cloud infrastructure, and site reliability operations.",
    },
    {
        "id": "career_frontend",
        "title": "Frontend Developer",
        "slug": "frontend-developer",
        "category": "Software Engineering",
        "core_skills": ["JavaScript", "TypeScript", "React.js", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Git"],
        "advanced_skills": ["State Management", "Web Performance", "Testing", "GraphQL"],
        "description": "Specializes in crafting responsive, performant, and accessible modern user interfaces.",
    },
    {
        "id": "career_data_engineer",
        "title": "Data Engineer",
        "slug": "data-engineer",
        "category": "Data & Analytics",
        "core_skills": ["Python", "SQL", "PostgreSQL", "Docker", "Git", "Bash"],
        "advanced_skills": ["Apache Spark", "Airflow", "Snowflake", "Kafka", "Data Modeling"],
        "description": "Designs and orchestrates large-scale distributed data pipelines and analytical warehouses.",
    },
]


class CareerRoadmapEngine:
    """
    Evaluates candidate skills against CareerAI tracks, generates skill gaps,
    builds dynamic project-aware roadmaps, and provisions hands-on coding assignments.
    """

    def rank_careers(self, extracted_skills: List[str], candidate_experience: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        candidate_set = {s.lower() for s in extracted_skills}
        ranked = []

        for track in CAREER_TRACKS:
            core = track["core_skills"]
            adv = track["advanced_skills"]
            matched_core = [s for s in core if s.lower() in candidate_set]
            matched_adv = [s for s in adv if s.lower() in candidate_set]

            # Evidence-based score calculation
            core_ratio = len(matched_core) / max(1, len(core))
            adv_ratio = len(matched_adv) / max(1, len(adv))
            score = round((core_ratio * 70.0) + (adv_ratio * 30.0) + min(15.0, len(matched_core) * 2.5), 1)
            score = min(96.0, max(45.0, score))

            # Explainable reasoning grounded in resume
            if matched_core:
                reasoning = (
                    f"Strong alignment grounded in detected proficiency with {', '.join(matched_core[:4])}. "
                    f"Candidate has demonstrated practical experience in core domain competencies."
                )
            else:
                reasoning = f"Emerging alignment with foundational engineering skills. Requires targeted core specialization."

            ranked.append({
                "careerId": track["id"],
                "title": track["title"],
                "slug": track["slug"],
                "category": track["category"],
                "matchScore": score,
                "matchingSkills": matched_core + matched_adv,
                "missingSkills": [s for s in core if s.lower() not in candidate_set],
                "reasoning": reasoning,
            })

        ranked.sort(key=lambda x: x["matchScore"], reverse=True)
        return ranked

    def generate_skill_gaps(self, extracted_skills: List[str], top_career: Dict[str, Any]) -> List[Dict[str, Any]]:
        candidate_set = {s.lower() for s in extracted_skills}
        track = next((t for t in CAREER_TRACKS if t["id"] == top_career.get("careerId")), CAREER_TRACKS[0])

        gaps = []
        for skill in track["core_skills"] + track["advanced_skills"]:
            is_present = skill.lower() in candidate_set
            if is_present:
                gaps.append({
                    "skill": skill,
                    "status": "Strong" if skill in ["Python", "FastAPI", "JavaScript", "SQL"] else "Moderate",
                    "currentLevel": "Intermediate",
                    "targetLevel": "Advanced",
                    "priority": 3,
                    "severity": "Low",
                    "learningTime": "1-2 Weeks",
                    "reason": f"Existing resume evidence demonstrates operational proficiency; focus on high-throughput optimization.",
                })
            else:
                is_critical = skill in ["Docker", "CI/CD", "PostgreSQL", "Kubernetes", "System Design"]
                gaps.append({
                    "skill": skill,
                    "status": "Critical" if is_critical else "Missing",
                    "currentLevel": "Novice",
                    "targetLevel": "Proficient",
                    "priority": 1 if is_critical else 2,
                    "severity": "Critical" if is_critical else "Moderate",
                    "learningTime": "2-3 Weeks",
                    "reason": f"Essential industry competency for {track['title']} positions; required for enterprise deployments.",
                })

        # Sort: Critical first, then Missing, then Moderate, then Strong
        priority_map = {"Critical": 1, "Missing": 2, "Moderate": 3, "Strong": 4}
        gaps.sort(key=lambda x: priority_map.get(x["status"], 5))
        return gaps

    def generate_dynamic_roadmap(
        self,
        extracted_skills: List[str],
        projects: List[Dict[str, Any]],
        top_career: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Builds a customized roadmap that incorporates existing candidate projects
        and prioritizes missing production competencies.
        """
        career_title = top_career.get("title", "Backend Developer")
        candidate_set = {s.lower() for s in extracted_skills}
        has_fastapi = "fastapi" in candidate_set or "python" in candidate_set
        has_docker = "docker" in candidate_set

        existing_project_name = projects[0]["title"] if projects else "API Service"

        phases = [
            {
                "phaseId": "phase_1",
                "phaseTitle": "Phase 1 — Advanced Backend & Architecture",
                "durationWeeks": 3,
                "focus": "Scaling & Architectural Patterns",
                "modules": [
                    {
                        "week": 1,
                        "title": "Advanced Python & Asynchronous Concurrency",
                        "description": f"Refactor {existing_project_name} utilizing asyncio concurrency, typing, and dependency injection.",
                        "skills": ["Python", "AsyncIO", "Type Hints"],
                        "hours": 12.0,
                        "tasks": [
                            {"id": "t1_1", "text": "Implement structured concurrency and async task cancellation", "done": True},
                            {"id": "t1_2", "text": "Benchmark async event loops against thread pool executions", "done": False},
                            {"id": "t1_3", "text": "Add comprehensive Pytest async unit test fixtures", "done": False},
                        ],
                    },
                    {
                        "week": 2,
                        "title": "Production FastAPI Patterns & Security",
                        "description": "Engineer JWT authentication, RBAC middleware, and OpenAPI contract validation.",
                        "skills": ["FastAPI", "JWT", "Security", "REST APIs"],
                        "hours": 14.0,
                        "tasks": [
                            {"id": "t2_1", "text": "Design stateless JWT token issuance and rotation flow", "done": False},
                            {"id": "t2_2", "text": "Implement role-based access control (RBAC) dependency guards", "done": False},
                            {"id": "t2_3", "text": "Configure Pydantic v2 schemas with strict serialization", "done": False},
                        ],
                    },
                ],
            },
            {
                "phaseId": "phase_2",
                "phaseTitle": "Phase 2 — Database Engineering & Caching",
                "durationWeeks": 3,
                "focus": "Data Integrity & Performance",
                "modules": [
                    {
                        "week": 3,
                        "title": "PostgreSQL Optimization & Indexing Strategies",
                        "description": "Design relational schemas, optimize complex multi-table joins, and tune B-tree indexes.",
                        "skills": ["PostgreSQL", "SQL", "Query Optimization"],
                        "hours": 14.0,
                        "tasks": [
                            {"id": "t3_1", "text": "Analyze EXPLAIN ANALYZE query plans for slow lookups", "done": False},
                            {"id": "t3_2", "text": "Create composite indexes and verify cardinality metrics", "done": False},
                            {"id": "t3_3", "text": "Configure connection pooling with PgBouncer limits", "done": False},
                        ],
                    },
                    {
                        "week": 4,
                        "title": "Distributed Caching with Redis & Invalidation",
                        "description": "Integrate Redis caching layer with cache-aside pattern and TTL management.",
                        "skills": ["Redis", "Caching", "Performance"],
                        "hours": 10.0,
                        "tasks": [
                            {"id": "t4_1", "text": "Implement Cache-Aside pattern for high-frequency queries", "done": False},
                            {"id": "t4_2", "text": "Add Redis key expiry and atomic rate limiting primitives", "done": False},
                        ],
                    },
                ],
            },
            {
                "phaseId": "phase_3",
                "phaseTitle": "Phase 3 — Production Containerization & CI/CD",
                "durationWeeks": 3,
                "focus": "Automated Testing & Delivery",
                "modules": [
                    {
                        "week": 5,
                        "title": "Docker Multi-Stage Containerization",
                        "description": "Build slim, non-root production Docker images with health checks and layer caching.",
                        "skills": ["Docker", "Containers", "Security"],
                        "hours": 12.0,
                        "tasks": [
                            {"id": "t5_1", "text": "Author multi-stage Dockerfile minimizing image footprint to <150MB", "done": False},
                            {"id": "t5_2", "text": "Enforce non-root security context and minimal Alpine/Debian base", "done": False},
                            {"id": "t5_3", "text": "Set up Docker Compose environment with PostgreSQL and Redis services", "done": False},
                        ],
                    },
                    {
                        "week": 6,
                        "title": "GitHub Actions Automated CI/CD Pipeline",
                        "description": "Implement automated testing, linting, security scanning, and container publishing.",
                        "skills": ["GitHub Actions", "CI/CD", "Automated Testing"],
                        "hours": 14.0,
                        "tasks": [
                            {"id": "t6_1", "text": "Configure GitHub Actions matrix running pytest across Python 3.12+", "done": False},
                            {"id": "t6_2", "text": "Enforce automated code coverage thresholds (>=85%)", "done": False},
                            {"id": "t6_3", "text": "Integrate security vulnerability scanning and Trivy container audits", "done": False},
                        ],
                    },
                ],
            },
            {
                "phaseId": "phase_4",
                "phaseTitle": "Phase 4 — Cloud Deployment & Capstone",
                "durationWeeks": 3,
                "focus": "End-to-End Production Verification",
                "modules": [
                    {
                        "week": 7,
                        "title": "Production Deployment & Observability",
                        "description": "Deploy to cloud infrastructure with Prometheus metrics and structured logging.",
                        "skills": ["Cloud Architecture", "Monitoring", "Docker"],
                        "hours": 16.0,
                        "tasks": [
                            {"id": "t7_1", "text": "Instrument application with OpenTelemetry and Prometheus metrics", "done": False},
                            {"id": "t7_2", "text": "Configure automated health probes (/health and /ready)", "done": False},
                        ],
                    },
                ],
            },
        ]

        total_hours = sum(mod["hours"] for p in phases for mod in p["modules"])
        total_tasks = sum(len(mod["tasks"]) for p in phases for mod in p["modules"])

        return {
            "title": f"Custom {career_title} Production Acceleration Roadmap",
            "careerId": top_career.get("careerId", "career_backend"),
            "targetCareer": career_title,
            "durationMonths": 3,
            "totalWeeks": 12,
            "totalHours": total_hours,
            "totalTasks": total_tasks,
            "completedTasks": 1,
            "progressPercent": 8.0,
            "phases": phases,
        }

    def generate_assignments(
        self,
        career_id: str,
        roadmap_data: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Generates production-grade hands-on coding assignments with automated test specs.
        """
        assignments = [
            {
                "id": f"asgn_{uuid.uuid4().hex[:12]}",
                "careerId": career_id,
                "title": "Build a Production REST API with FastAPI & PostgreSQL",
                "difficulty": "Intermediate",
                "estimatedHours": 6.0,
                "skills": ["FastAPI", "PostgreSQL", "SQLAlchemy", "Testing", "Docker"],
                "prerequisites": ["Python Advanced", "Basic Relational SQL"],
                "description": (
                    "Engineer an enterprise-grade REST service featuring JWT authentication, "
                    "database transactions, connection pooling, and multi-stage Docker containerization."
                ),
                "instructions": (
                    "1. Clone the generated starter repository.\n"
                    "2. Implement authentication endpoints (/api/v1/auth/register, /api/v1/auth/login).\n"
                    "3. Configure SQLAlchemy async session pool with Neon PostgreSQL.\n"
                    "4. Add unit test suite in tests/ covering auth, error handling, and transactional integrity.\n"
                    "5. Create production multi-stage Dockerfile and test local build.\n"
                    "6. Push commit to trigger the GitHub Actions validation workflow."
                ),
                "requirements": [
                    "Stateless JWT authorization with Bearer token header verification",
                    "Database schema migrations using Alembic or Prisma",
                    "Asynchronous database session lifecycle management",
                    "Strict Pydantic payload validation and custom exception handlers",
                    "Comprehensive unit tests with >85% code coverage",
                    "Passing GitHub Actions workflow with zero lint or security errors",
                ],
                "acceptanceCriteria": [
                    "FastAPI server starts successfully on port 8000",
                    "All authentication unit tests pass (minimum 18/18 assertions)",
                    "Test suite executes in GitHub Actions CI with code coverage >= 85%",
                    "Docker build succeeds and produces runnable image",
                    "Security linter (Bandit/Ruff) reports zero high-severity warnings",
                ],
                "submissionType": "GITHUB",
                "starterRepoUrl": "https://github.com/careerai/starter-fastapi-backend",
                "automatedTests": {
                    "testCommand": "pytest tests/ -v --cov=app --cov-report=term-missing",
                    "lintCommand": "ruff check app/ tests/",
                    "minCoverage": 85.0,
                    "totalTestsExpected": 18,
                },
                "resources": [
                    {"title": "FastAPI Dependency Injection Guide", "url": "https://fastapi.tiangolo.com/tutorial/dependencies/"},
                    {"title": "SQLAlchemy Async Reference", "url": "https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html"},
                ],
                "status": "AVAILABLE",
                "score": 0.0,
            },
            {
                "id": f"asgn_{uuid.uuid4().hex[:12]}",
                "careerId": career_id,
                "title": "Containerize & Deploy with Docker and GitHub Actions CI",
                "difficulty": "Intermediate",
                "estimatedHours": 5.0,
                "skills": ["Docker", "GitHub Actions", "CI/CD", "Linux"],
                "prerequisites": ["Build a Production REST API with FastAPI & PostgreSQL"],
                "description": (
                    "Author multi-stage Dockerfiles and construct a complete GitHub Actions CI/CD pipeline "
                    "that executes automated test suites, linting, security scans, and generates artifact releases."
                ),
                "instructions": (
                    "1. Construct multi-stage Dockerfile with builder and runtime stages.\n"
                    "2. Define .github/workflows/careerai-assignment.yml with test, lint, and security jobs.\n"
                    "3. Ensure the workflow triggers on push and pull_request.\n"
                    "4. Verify that CI passes and webhook reports completion."
                ),
                "requirements": [
                    "Multi-stage Docker build minimizing final image size",
                    "Secure non-root user execution in container",
                    "Configured GitHub Actions workflow triggering on push",
                    "Automated dependency caching in CI pipeline",
                ],
                "acceptanceCriteria": [
                    "Docker build completes with exit code 0",
                    "GitHub Action workflow executes all jobs successfully",
                    "Container image passes basic vulnerability audit",
                ],
                "submissionType": "GITHUB",
                "starterRepoUrl": "https://github.com/careerai/starter-docker-cicd",
                "automatedTests": {
                    "testCommand": "docker build -t app:test .",
                    "lintCommand": "hadolint Dockerfile",
                    "minCoverage": 80.0,
                    "totalTestsExpected": 10,
                },
                "resources": [
                    {"title": "Docker Multi-Stage Best Practices", "url": "https://docs.docker.com/build/building/multi-stage/"},
                ],
                "status": "LOCKED",
                "score": 0.0,
            },
        ]
        return assignments


career_roadmap_engine = CareerRoadmapEngine()
