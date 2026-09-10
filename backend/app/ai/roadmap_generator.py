import uuid
from typing import Any, Dict, List, Optional
from app.core.logging import logger
from app.services.resource_catalog import ResourceSelectionEngine


class AIRoadmapGenerator:
    """
    Generates a personalized 12-week curriculum and learning milestones
    tailored to the user's specific resume evidence, verified skills,
    skill gaps, and target career.
    """

    async def generate_curriculum(
        self,
        career_title: str,
        missing_skills: List[str],
        duration_months: int = 6,
        hours_per_week: int = 10,
        learning_pace: str = "balanced",
        candidate_skills: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Generates a 12-week personalized roadmap.
        Curates verified resources from W3Schools and GeeksforGeeks
        based on candidate skill gaps and level calibration.
        """
        pace_multiplier = 1.0
        if learning_pace == "fast_track":
            pace_multiplier = 1.25
        elif learning_pace == "flexible":
            pace_multiplier = 0.8

        known_skills = {s.lower() for s in (candidate_skills or [])}

        # Normalize and filter missing skills
        active_gaps = [s for s in missing_skills if s]
        if not active_gaps:
            # If candidate already has all basic skills, generate advanced mastery gaps
            career_lower = career_title.lower()
            if "frontend" in career_lower or "web" in career_lower:
                active_gaps = ["TypeScript", "React", "State Management", "Performance Optimization", "System Design", "Testing"]
            elif "ai" in career_lower or "data" in career_lower:
                active_gaps = ["NumPy", "Pandas", "Machine Learning", "Deep Learning", "Algorithms", "Model Deployment"]
            else:
                active_gaps = ["FastAPI", "PostgreSQL", "Docker", "CI/CD", "System Design", "Testing"]

        # Weekly allocation templates customized to target career
        week_templates = self._build_12_week_templates(career_title, active_gaps, known_skills)

        phases_data = []
        items_data = []
        previous_item_id: Optional[str] = None

        # Build 6 phases (each spanning 2 weeks)
        phase_names = [
            ("Phase 1: Foundations & Language Review", "Core Syntax, Data Structures & Best Practices"),
            ("Phase 2: Architectural Frameworks & Schemas", "Modern Frameworks & Relational Data Modeling"),
            ("Phase 3: Production Engineering & Testing", "Automated Testing, Containerization & Docker"),
            ("Phase 4: Automation, CI/CD & Cloud", "GitHub Actions, Deployment Pipelines & Cloud Storage"),
            ("Phase 5: High-Scale Systems & Performance", "System Design, Microservices & Concurrency"),
            ("Phase 6: Capstone Engineering & Interview Launch", "Production Portfolio & Live Technical Defense"),
        ]

        for p_idx, (p_title, p_sub) in enumerate(phase_names):
            month_num = p_idx + 1
            phase_id = f"phase_{month_num}"

            # 2 weeks per phase
            w1_idx = p_idx * 2
            w2_idx = p_idx * 2 + 1

            w1_spec = week_templates[w1_idx] if w1_idx < len(week_templates) else week_templates[-1]
            w2_spec = week_templates[w2_idx] if w2_idx < len(week_templates) else week_templates[-1]

            # Generate item for Week 1 of phase
            item1_id = uuid.uuid4().hex[:12]
            item1_deps = [previous_item_id] if previous_item_id else []
            item1_status = "NOT_STARTED" if not item1_deps else "LOCKED"

            item1_resources = self._resolve_resources_for_skills(
                skills=w1_spec["skills"],
                current_level=w1_spec["current_level"],
                target_level=w1_spec["target_level"],
            )

            est_h1 = round(w1_spec.get("estimated_hours", 10.0) * pace_multiplier, 1)

            item1 = {
                "id": item1_id,
                "month": month_num,
                "week_number": w1_idx + 1,
                "sequence_number": w1_idx + 1,
                "phase_id": phase_id,
                "title": f"Week {w1_idx + 1}: {w1_spec['title']}",
                "description": w1_spec["description"],
                "item_type": w1_spec["item_type"],
                "priority": w1_spec["priority"],
                "status": item1_status,
                "skills": w1_spec["skills"],
                "current_level": w1_spec["current_level"],
                "target_level": w1_spec["target_level"],
                "why_matters": w1_spec["why_matters"],
                "practice_task": w1_spec["practice_task"],
                "assignment": w1_spec["assignment"],
                "verification_type": w1_spec["verification_type"],
                "tasks": w1_spec["tasks"],
                "estimated_hours": est_h1,
                "actual_hours": 0.0,
                "item_order": w1_idx + 1,
                "dependencies": item1_deps,
                "resource_links": item1_resources,
                "project_id": None,
                "is_completed": False,
                "notes": "",
            }

            # Generate item for Week 2 of phase
            item2_id = uuid.uuid4().hex[:12]
            item2_deps = [item1_id]
            item2_status = "LOCKED"

            item2_resources = self._resolve_resources_for_skills(
                skills=w2_spec["skills"],
                current_level=w2_spec["current_level"],
                target_level=w2_spec["target_level"],
            )

            est_h2 = round(w2_spec.get("estimated_hours", 10.0) * pace_multiplier, 1)

            item2 = {
                "id": item2_id,
                "month": month_num,
                "week_number": w2_idx + 1,
                "sequence_number": w2_idx + 1,
                "phase_id": phase_id,
                "title": f"Week {w2_idx + 1}: {w2_spec['title']}",
                "description": w2_spec["description"],
                "item_type": w2_spec["item_type"],
                "priority": w2_spec["priority"],
                "status": item2_status,
                "skills": w2_spec["skills"],
                "current_level": w2_spec["current_level"],
                "target_level": w2_spec["target_level"],
                "why_matters": w2_spec["why_matters"],
                "practice_task": w2_spec["practice_task"],
                "assignment": w2_spec["assignment"],
                "verification_type": w2_spec["verification_type"],
                "tasks": w2_spec["tasks"],
                "estimated_hours": est_h2,
                "actual_hours": 0.0,
                "item_order": w2_idx + 1,
                "dependencies": item2_deps,
                "resource_links": item2_resources,
                "project_id": None,
                "is_completed": False,
                "notes": "",
            }

            items_data.append(item1)
            items_data.append(item2)
            previous_item_id = item2_id

            target_phase_skills = list(dict.fromkeys(w1_spec["skills"] + w2_spec["skills"]))
            phases_data.append({
                "id": phase_id,
                "month": month_num,
                "title": p_title,
                "subtitle": p_sub,
                "description": f"Master {', '.join(target_phase_skills)} to satisfy core production criteria for {career_title}.",
                "status": "NOT_STARTED" if month_num == 1 else "LOCKED",
                "progress_percent": 0.0,
                "target_skills": target_phase_skills,
                "items_count": 2,
                "completed_items_count": 0,
            })

        milestones = [
            {"id": "m1", "title": "Language & Data Structures Verified", "month": 1, "completed": False},
            {"id": "m2", "title": "Framework & Database Architecture Cleared", "month": 2, "completed": False},
            {"id": "m3", "title": "Testing & Docker Containerization Passing", "month": 3, "completed": False},
            {"id": "m4", "title": "Automated CI/CD Deployment Verified", "month": 4, "completed": False},
            {"id": "m5", "title": "High-Scale System Architecture Designed", "month": 5, "completed": False},
            {"id": "m6", "title": "Production Capstone & Interview Certified", "month": 6, "completed": False},
        ]

        return {
            "phases": phases_data,
            "items": items_data,
            "milestones": milestones[:duration_months],
        }

    def _resolve_resources_for_skills(
        self,
        skills: List[str],
        current_level: str,
        target_level: str,
    ) -> List[Dict[str, Any]]:
        """
        Selects and deduplicates official verified resources from W3Schools and GeeksforGeeks.
        If no verified link exists, provides an explicit fallback notification.
        """
        combined: List[Dict[str, Any]] = []
        seen_urls = set()

        for skill in skills:
            matches = ResourceSelectionEngine.find_resources_for_skill(
                skill_name=skill,
                current_level=current_level,
                target_level=target_level,
                limit=2,
            )
            for m in matches:
                if m["url"] not in seen_urls:
                    seen_urls.add(m["url"])
                    combined.append(m)

        # Fallback explanation if no verified resource is found
        if not combined and skills:
            combined.append({
                "id": f"res-fallback-{uuid.uuid4().hex[:6]}",
                "provider": "CAREERAI",
                "title": f"Independent Study: {skills[0]}",
                "url": "",
                "topic": skills[0],
                "skill": skills[0],
                "skill_level": current_level,
                "resource_type": "REFERENCE",
                "description": ResourceSelectionEngine.get_fallback_message(skills[0]),
                "why_recommended": "No verified learning resource is currently available for this topic. Follow practice instructions below.",
                "is_verified": False,
            })

        return combined

    def _build_12_week_templates(
        self,
        career_title: str,
        missing_skills: List[str],
        known_skills: set,
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes 12 targeted weekly specifications grounded in candidate gaps.
        """
        career_lower = career_title.lower()
        is_frontend = "frontend" in career_lower or "web" in career_lower
        is_ai_data = "ai" in career_lower or "data" in career_lower or "machine learning" in career_lower

        # Map primary gaps
        gap1 = missing_skills[0] if len(missing_skills) > 0 else ("Python" if not is_frontend else "JavaScript")
        gap2 = missing_skills[1] if len(missing_skills) > 1 else ("SQL" if not is_frontend else "React")
        gap3 = missing_skills[2] if len(missing_skills) > 2 else ("FastAPI" if not is_frontend else "TypeScript")
        gap4 = missing_skills[3] if len(missing_skills) > 3 else ("PostgreSQL" if not is_frontend else "Next.js")
        gap5 = missing_skills[4] if len(missing_skills) > 4 else "Testing"
        gap6 = missing_skills[5] if len(missing_skills) > 5 else ("Docker" if not is_frontend else "CSS3")
        gap7 = missing_skills[6] if len(missing_skills) > 6 else "CI/CD"
        gap8 = missing_skills[7] if len(missing_skills) > 7 else ("System Design" if not is_frontend else "Performance Optimization")

        templates = [
            # Week 1
            {
                "title": f"Language Foundations & Syntax Review ({gap1})",
                "description": f"Master idiomatic syntax, data structures, and memory management for {gap1}.",
                "skills": [gap1],
                "current_level": "BEGINNER" if gap1.lower() not in known_skills else "INTERMEDIATE",
                "target_level": "INTERMEDIATE",
                "why_matters": f"{gap1} syntax fluency is a prerequisite for passing the technical screening for {career_title}.",
                "practice_task": f"Complete interactive exercises on W3Schools and build 5 modular functions with strict typing.",
                "assignment": {
                    "title": f"Build a Modular CLI Data Processor in {gap1}",
                    "description": "Construct a CLI tool handling JSON/CSV parsing, error logging, and unit tests.",
                    "repo_template": "https://github.com/careerai-starters/cli-processor",
                    "verification_criteria": "GitHub Actions passing unit tests with > 90% test coverage.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "CRITICAL",
                "item_type": "learning",
                "estimated_hours": 8.0,
                "tasks": [
                    {"id": "w1-t1", "text": f"Review official {gap1} syntax and standard library tutorials", "done": False},
                    {"id": "w1-t2", "text": "Implement unit tests asserting edge cases and boundary inputs", "done": False},
                    {"id": "w1-t3", "text": "Refactor code to conform to PEP8 / ESLint clean code standards", "done": False},
                ],
            },
            # Week 2
            {
                "title": f"Data Structures & Complexity Analysis ({gap1} & DSA)",
                "description": "Deep dive into hash tables, lists, queues, and asymptotic Big-O runtime analysis.",
                "skills": [gap1, "Data Structures"],
                "current_level": "BEGINNER",
                "target_level": "INTERMEDIATE",
                "why_matters": "Efficient data structure choices directly dictate latency SLAs and backend throughput.",
                "practice_task": "Solve 8 curated GeeksforGeeks problems focusing on array manipulation and hash maps.",
                "assignment": {
                    "title": "Implement an In-Memory LRU Cache with O(1) Eviction",
                    "description": "Architect a double-linked list and hash map hybrid cache supporting get and put in O(1).",
                    "repo_template": "https://github.com/careerai-starters/lru-cache",
                    "verification_criteria": "All concurrency and eviction unit tests passing.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "CRITICAL",
                "item_type": "practice",
                "estimated_hours": 10.0,
                "tasks": [
                    {"id": "w2-t1", "text": "Study GeeksforGeeks DSA roadmap on space-time complexity", "done": False},
                    {"id": "w2-t2", "text": "Benchmark dictionary lookups vs binary search tree implementations", "done": False},
                    {"id": "w2-t3", "text": "Submit GitHub repository with passing automated test suite", "done": False},
                ],
            },
            # Week 3
            {
                "title": f"Modern Framework Architecture ({gap3})",
                "description": f"Architect asynchronous request handlers, validation schemas, and route middleware in {gap3}.",
                "skills": [gap3, "REST APIs"],
                "current_level": "BEGINNER",
                "target_level": "INTERMEDIATE",
                "why_matters": f"{gap3} is the core framework powering production services in your target {career_title} path.",
                "practice_task": "Review GeeksforGeeks framework guide and configure strict request/response models.",
                "assignment": {
                    "title": f"Production REST API Service in {gap3}",
                    "description": "Construct CRUD endpoints with JWT authentication, rate limiting, and OpenAPI docs.",
                    "repo_template": "https://github.com/careerai-starters/api-service",
                    "verification_criteria": "All endpoints respond with correct status codes and schema validation.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "HIGH",
                "item_type": "learning",
                "estimated_hours": 10.0,
                "tasks": [
                    {"id": "w3-t1", "text": f"Study {gap3} dependency injection and route handler paradigms", "done": False},
                    {"id": "w3-t2", "text": "Implement input validation to defend against invalid payloads", "done": False},
                    {"id": "w3-t3", "text": "Set up Swagger/OpenAPI interactive API documentation", "done": False},
                ],
            },
            # Week 4
            {
                "title": f"Relational Schema Design & Query Optimization ({gap2} / {gap4})",
                "description": f"Master database indexing, foreign keys, transactions, and migration scripts with {gap4}.",
                "skills": [gap2, gap4],
                "current_level": "BEGINNER",
                "target_level": "INTERMEDIATE",
                "why_matters": "Proper indexing prevents severe database locks and p99 query degradation under load.",
                "practice_task": "Complete W3Schools SQL practice challenges and analyze query plans with EXPLAIN.",
                "assignment": {
                    "title": "Design a High-Throughput E-Commerce Database Schema",
                    "description": "Create normalized PostgreSQL schema with composite indexes, foreign keys, and seed scripts.",
                    "repo_template": "https://github.com/careerai-starters/ecommerce-schema",
                    "verification_criteria": "Database migration completes cleanly and passes query speed benchmarks.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "HIGH",
                "item_type": "practice",
                "estimated_hours": 8.0,
                "tasks": [
                    {"id": "w4-t1", "text": "Study GeeksforGeeks guide on B-Tree indexing and MVCC transactions", "done": False},
                    {"id": "w4-t2", "text": "Write migration scripts creating relational tables with constraints", "done": False},
                    {"id": "w4-t3", "text": "Optimize multi-table JOIN query to execute under 15ms", "done": False},
                ],
            },
            # Week 5
            {
                "title": f"Automated Testing & Code Quality Assurance ({gap5})",
                "description": "Write deterministic unit, integration, and contract tests with mock fixtures.",
                "skills": [gap5],
                "current_level": "BEGINNER",
                "target_level": "INTERMEDIATE",
                "why_matters": "Production hiring teams look for candidates who write testable code with high branch coverage.",
                "practice_task": "Review GeeksforGeeks software testing fundamentals and mock external network calls.",
                "assignment": {
                    "title": "Comprehensive Test Suite with Pytest / Jest Fixtures",
                    "description": "Implement automated test suite asserting database transactions and mock API responses.",
                    "repo_template": "https://github.com/careerai-starters/testing-suite",
                    "verification_criteria": "Code coverage report verifies > 85% branch coverage with zero flaky tests.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "HIGH",
                "item_type": "learning",
                "estimated_hours": 8.0,
                "tasks": [
                    {"id": "w5-t1", "text": "Study testing pyramid concepts (Unit vs Integration vs E2E)", "done": False},
                    {"id": "w5-t2", "text": "Construct parameterized test cases covering error boundaries", "done": False},
                    {"id": "w5-t3", "text": "Configure coverage reporter in local git pre-commit hook", "done": False},
                ],
            },
            # Week 6
            {
                "title": f"Containerization & Local Environment Isolation ({gap6})",
                "description": f"Master multi-stage Dockerfile creation, volume mounts, and multi-service orchestration with {gap6}.",
                "skills": [gap6],
                "current_level": "BEGINNER",
                "target_level": "INTERMEDIATE",
                "why_matters": f"{gap6} containerization ensures identical execution across development, staging, and production.",
                "practice_task": "Read GeeksforGeeks Docker tutorial and inspect container resource limits.",
                "assignment": {
                    "title": f"Dockerize your {gap3} Application with Multi-Stage Build",
                    "description": "Write a production Dockerfile minimizing image size (< 150MB) and non-root security.",
                    "repo_template": "https://github.com/careerai-starters/docker-compose-starter",
                    "verification_criteria": "Docker container boots cleanly and passes healthcheck inspection.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "HIGH",
                "item_type": "practice",
                "estimated_hours": 10.0,
                "tasks": [
                    {"id": "w6-t1", "text": f"Study {gap6} container lifecycle, layers, and caching mechanics", "done": False},
                    {"id": "w6-t2", "text": "Create docker-compose.yml coordinating backend API and PostgreSQL database", "done": False},
                    {"id": "w6-t3", "text": "Run automated security vulnerability scan against base container image", "done": False},
                ],
            },
            # Week 7
            {
                "title": f"Continuous Integration & Continuous Deployment ({gap7})",
                "description": "Configure automated GitHub Actions / GitLab CI workflows running linters, tests, and security scans.",
                "skills": [gap7, "Git"],
                "current_level": "BEGINNER",
                "target_level": "INTERMEDIATE",
                "why_matters": "CI/CD pipelines automate quality gates, allowing teams to ship multiple times daily safely.",
                "practice_task": "Review GeeksforGeeks CI/CD guide and construct a YAML workflow file.",
                "assignment": {
                    "title": "Production CI/CD Workflow with Automated Quality Gates",
                    "description": "Configure GitHub Actions pipeline running lint, unit tests, and Docker image publishing.",
                    "repo_template": "https://github.com/careerai-starters/ci-workflow",
                    "verification_criteria": "Pull request triggers workflow and produces green checkmark.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "HIGH",
                "item_type": "learning",
                "estimated_hours": 8.0,
                "tasks": [
                    {"id": "w7-t1", "text": "Study CI/CD pipeline triggers on push, pull_request, and release tags", "done": False},
                    {"id": "w7-t2", "text": "Store encrypted deployment secrets in repository settings", "done": False},
                    {"id": "w7-t3", "text": "Ensure failing unit test blocks merge to main branch", "done": False},
                ],
            },
            # Week 8
            {
                "title": "Cloud Infrastructure & Deployment Fundamentals",
                "description": "Deploy containerized services to modern cloud providers with environment configuration and HTTPS.",
                "skills": ["Cloud Architecture", "DevOps"],
                "current_level": "BEGINNER",
                "target_level": "INTERMEDIATE",
                "why_matters": "Employers require candidates who understand how code executes in real cloud environments.",
                "practice_task": "Review GeeksforGeeks cloud computing overview and configure SSL certificates.",
                "assignment": {
                    "title": "Deploy Containerized API to Cloud Staging Environment",
                    "description": "Provision cloud compute instance, configure reverse proxy with Nginx, and link custom domain.",
                    "repo_template": "https://github.com/careerai-starters/cloud-deployment",
                    "verification_criteria": "Service responds with 200 OK over HTTPS on public DNS endpoint.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "HIGH",
                "item_type": "practice",
                "estimated_hours": 8.0,
                "tasks": [
                    {"id": "w8-t1", "text": "Study cloud networking, VPC security groups, and port bindings", "done": False},
                    {"id": "w8-t2", "text": "Configure production environment variables and secrets management", "done": False},
                    {"id": "w8-t3", "text": "Validate live uptime status via automated ping monitor", "done": False},
                ],
            },
            # Week 9
            {
                "title": f"High-Scale System Design & Caching Patterns ({gap8})",
                "description": "Architect distributed caching (Redis), asynchronous background queues, and rate limiters.",
                "skills": [gap8, "System Design"],
                "current_level": "INTERMEDIATE",
                "target_level": "ADVANCED",
                "why_matters": "System design determines whether an application collapses or thrives under traffic surges.",
                "practice_task": "Study GeeksforGeeks System Design roadmap on caching strategies and write-through patterns.",
                "assignment": {
                    "title": "Architect a Distributed Sliding-Window Rate Limiter",
                    "description": "Implement an API rate limiter using Redis sorted sets supporting 10,000 requests/second.",
                    "repo_template": "https://github.com/careerai-starters/rate-limiter",
                    "verification_criteria": "Concurrency load test asserts rate limit threshold compliance.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "CRITICAL",
                "item_type": "learning",
                "estimated_hours": 10.0,
                "tasks": [
                    {"id": "w9-t1", "text": "Study Redis data structures (Strings, Hashes, Sorted Sets)", "done": False},
                    {"id": "w9-t2", "text": "Design system architecture diagram detailing caching and fallback layers", "done": False},
                    {"id": "w9-t3", "text": "Profile memory usage and TTL expiration behavior", "done": False},
                ],
            },
            # Week 10
            {
                "title": "Microservices Architecture & Event-Driven Patterns",
                "description": "Decouple services using asynchronous messaging queues, event schemas, and idempotent handlers.",
                "skills": ["Microservices", "System Design"],
                "current_level": "INTERMEDIATE",
                "target_level": "ADVANCED",
                "why_matters": "Event-driven patterns ensure individual service failures do not cascade into full outages.",
                "practice_task": "Review GeeksforGeeks microservices architecture guide and idempotency guarantees.",
                "assignment": {
                    "title": "Asynchronous Email Notification Worker with Dead-Letter Queue",
                    "description": "Build an event consumer processing transactional alerts with retry backoff and dead-letter handling.",
                    "repo_template": "https://github.com/careerai-starters/event-worker",
                    "verification_criteria": "Failed jobs safely route to dead-letter queue without message loss.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "HIGH",
                "item_type": "practice",
                "estimated_hours": 10.0,
                "tasks": [
                    {"id": "w10-t1", "text": "Study event-driven architectures and publish-subscribe models", "done": False},
                    {"id": "w10-t2", "text": "Implement exponential backoff retry policy for transient failures", "done": False},
                    {"id": "w10-t3", "text": "Verify idempotency prevents duplicate notifications", "done": False},
                ],
            },
            # Week 11
            {
                "title": f"Production Capstone Engineering Project ({career_title})",
                "description": "Synthesize all newly acquired competencies into an enterprise-grade portfolio capstone.",
                "skills": [gap1, gap3, gap4, "Docker", "CI/CD"],
                "current_level": "INTERMEDIATE",
                "target_level": "ADVANCED",
                "why_matters": "A verified production-grade repository is the strongest proof of competence for hiring managers.",
                "practice_task": "Draft technical RFC detailing architecture, database schemas, and API contracts.",
                "assignment": {
                    "title": f"Full-Lifecycle {career_title} Production Platform",
                    "description": "Deliver multi-container application with auth, database migrations, CI/CD, and live demo link.",
                    "repo_template": "https://github.com/careerai-starters/capstone-platform",
                    "verification_criteria": "Live deployment active + automated CI pipeline green + complete documentation.",
                },
                "verification_type": "GITHUB_ACTIONS",
                "priority": "CRITICAL",
                "item_type": "project",
                "estimated_hours": 12.0,
                "tasks": [
                    {"id": "w11-t1", "text": "Implement core business features and secure authorization", "done": False},
                    {"id": "w11-t2", "text": "Write comprehensive unit and integration test coverage", "done": False},
                    {"id": "w11-t3", "text": "Create architectural diagram and video walkthrough demo", "done": False},
                ],
            },
            # Week 12
            {
                "title": "Technical Interview Calibration & Recruiter Defense",
                "description": f"Master technical interview drills, system design whiteboard defense, and resume alignment for {career_title}.",
                "skills": ["Technical Interviewing", "System Design"],
                "current_level": "INTERMEDIATE",
                "target_level": "ADVANCED",
                "why_matters": "Clear technical communication and trade-off justification converts interviews into offers.",
                "practice_task": "Complete GeeksforGeeks interview preparation guide and drill 5 mock rounds on CareerAI.",
                "assignment": {
                    "title": "Resume Defense & System Design Portfolio Presentation",
                    "description": "Document architectural trade-offs made during Capstone project and defend against rubrics.",
                    "repo_template": "https://github.com/careerai-starters/interview-defense",
                    "verification_criteria": "Passed CareerAI AI Interview Simulator with composite score >= 8/10.",
                },
                "verification_type": "MANUAL_REVIEW",
                "priority": "CRITICAL",
                "item_type": "interview",
                "estimated_hours": 8.0,
                "tasks": [
                    {"id": "w12-t1", "text": "Rehearse STAR framework responses for projects on your resume", "done": False},
                    {"id": "w12-t2", "text": "Conduct live system design simulation with AI Interviewer", "done": False},
                    {"id": "w12-t3", "text": "Polish resume keywords to achieve > 90% ATS match score", "done": False},
                ],
            },
        ]

        return templates


ai_roadmap_generator = AIRoadmapGenerator()
