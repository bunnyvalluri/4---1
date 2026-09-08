import uuid
from typing import Any, Dict, List, Optional
from app.core.logging import logger


class AIRoadmapGenerator:
    """
    Generates personalized learning milestones, phases, and structured items
    tailored to the user's specific skill gaps, assessment diagnostic, and target career.
    """

    # Verified, high-quality, safe documentation links
    RESOURCE_CATALOG = {
        "Python": [
            {"id": "res-py-1", "title": "Official Python 3 Documentation & Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "Documentation"},
            {"id": "res-py-2", "title": "Real Python: Python Best Practices & OOP", "url": "https://realpython.com/", "type": "Tutorial"},
        ],
        "JavaScript": [
            {"id": "res-js-1", "title": "MDN Web Docs: JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "Documentation"},
            {"id": "res-js-2", "title": "JavaScript.info: Modern JS from Basics to Advanced", "url": "https://javascript.info/", "type": "Tutorial"},
        ],
        "TypeScript": [
            {"id": "res-ts-1", "title": "TypeScript Handbook & Type System", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "Documentation"},
        ],
        "FastAPI": [
            {"id": "res-fa-1", "title": "FastAPI Official Documentation & Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "Documentation"},
        ],
        "React": [
            {"id": "res-rc-1", "title": "React.dev Official Documentation", "url": "https://react.dev/learn", "type": "Documentation"},
        ],
        "Machine Learning": [
            {"id": "res-ml-1", "title": "Scikit-Learn User Guide & Supervised Models", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "Documentation"},
            {"id": "res-ml-2", "title": "Google Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "Course"},
        ],
        "Deep Learning": [
            {"id": "res-dl-1", "title": "PyTorch Official Tutorials & Deep Learning with PyTorch", "url": "https://pytorch.org/tutorials/", "type": "Documentation"},
        ],
        "Docker": [
            {"id": "res-dk-1", "title": "Docker Getting Started Guide & Multi-Stage Builds", "url": "https://docs.docker.com/get-started/", "type": "Documentation"},
        ],
        "SQL": [
            {"id": "res-sql-1", "title": "PostgreSQL Documentation & Query Optimization", "url": "https://www.postgresql.org/docs/current/tutorial.html", "type": "Documentation"},
        ],
        "Testing": [
            {"id": "res-test-1", "title": "Pytest Documentation & Automated Testing", "url": "https://docs.pytest.org/en/stable/", "type": "Documentation"},
        ],
        "Portfolio": [
            {"id": "res-port-1", "title": "GitHub Profile & README Best Practices", "url": "https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile", "type": "Article"},
        ],
    }

    async def generate_curriculum(
        self,
        career_title: str,
        missing_skills: List[str],
        duration_months: int = 6,
        hours_per_week: int = 10,
        learning_pace: str = "balanced",
    ) -> Dict[str, Any]:
        """
        Generates structured phases, milestone items, and dependencies
        grounded in the user's missing skills and career destination.
        """
        # Determine pace multiplier for hours
        pace_multiplier = 1.0
        if learning_pace == "fast_track":
            pace_multiplier = 1.25
        elif learning_pace == "flexible":
            pace_multiplier = 0.8

        # Segment missing skills into phases
        skills_p1 = [s for s in missing_skills if any(k in s.lower() for k in ["python", "java", "script", "foundation", "syntax", "basic"])] or ["Language Syntax & Standard Library", "Data Structures"]
        skills_p2 = [s for s in missing_skills if any(k in s.lower() for k in ["fastapi", "react", "sql", "database", "orm", "statistic", "numpy", "pandas"])] or ["Framework Architecture", "Relational Persistence"]
        skills_p3 = [s for s in missing_skills if any(k in s.lower() for k in ["machine learning", "deep learning", "system", "cache", "async", "security", "microservice"])] or ["Advanced Engineering Paradigms", "Performance Optimization"]
        skills_p4 = [s for s in missing_skills if any(k in s.lower() for k in ["docker", "cloud", "aws", "gcp", "ci/cd", "deployment", "mlops", "kubernetes"])] or ["Containerization & CI/CD", "Cloud Deployment"]
        skills_p5 = ["System Architecture Design", "Full Stack Capstone Engineering"]
        skills_p6 = ["Technical Interview Algorithms", "System Design & Recruiter Portfolio"]

        # Default fallback missing skill allocations
        if missing_skills:
            # Spread missing skills across phases 1-4 if not matched
            for i, skill in enumerate(missing_skills):
                if skill not in skills_p1 and skill not in skills_p2 and skill not in skills_p3 and skill not in skills_p4:
                    if i % 4 == 0 and skill not in skills_p1:
                        skills_p1.append(skill)
                    elif i % 4 == 1 and skill not in skills_p2:
                        skills_p2.append(skill)
                    elif i % 4 == 2 and skill not in skills_p3:
                        skills_p3.append(skill)
                    elif skill not in skills_p4:
                        skills_p4.append(skill)

        phase_configs = [
            {
                "id": "phase_1",
                "month": 1,
                "title": "Phase 1: Foundation",
                "subtitle": "Core Language Mastery & Software Paradigms",
                "description": f"Master core languages, memory management, data structures, and testing best practices required for {career_title}.",
                "target_skills": skills_p1[:3],
                "milestone": "Programming & Computational Foundations Certified",
            },
            {
                "id": "phase_2",
                "month": 2,
                "title": "Phase 2: Core Skills",
                "subtitle": "Framework Architecture & Data Workflows",
                "description": f"Build end-to-end multi-tier architectures, schema optimization, and validation pipelines tailored to {career_title}.",
                "target_skills": skills_p2[:3],
                "milestone": "Core Architectural Competency Verified",
            },
            {
                "id": "phase_3",
                "month": 3,
                "title": "Phase 3: Advanced",
                "subtitle": "Domain Algorithms & Deep System Design",
                "description": f"Implement high-concurrency systems, asynchronous background workflows, caching, and specialized algorithms.",
                "target_skills": skills_p3[:3],
                "milestone": "Advanced System Implementation Cleared",
            },
            {
                "id": "phase_4",
                "month": 4,
                "title": "Phase 4: Deployment & Tooling",
                "subtitle": "Containerization, Cloud & Production MLOps/DevOps",
                "description": "Package production artifacts with Docker, configure automated CI/CD validation suites, and deploy to modern cloud infrastructure.",
                "target_skills": skills_p4[:3],
                "milestone": "Production Infrastructure Verified",
            },
            {
                "id": "phase_5",
                "month": 5,
                "title": "Phase 5: Portfolio Projects",
                "subtitle": "Production Capstone & Proof of Competence",
                "description": f"Design and deliver an enterprise-grade portfolio project showcasing end-to-end {career_title} qualifications.",
                "target_skills": skills_p5,
                "milestone": "Production Capstone Deliverable Finalized",
            },
            {
                "id": "phase_6",
                "month": 6,
                "title": "Phase 6: Career Launch",
                "subtitle": "Interview Calibration & Technical Defense",
                "description": "Polish technical resume bullet points, rehearse system design simulations, and finalize live GitHub demo repositories.",
                "target_skills": skills_p6,
                "milestone": "Candidate Interview Readiness Certified",
            },
        ]

        phases_data = []
        items_data = []
        previous_item_id: Optional[str] = None
        item_counter = 1

        for p_idx, p_cfg in enumerate(phase_configs[:duration_months]):
            phase_id = p_cfg["id"]
            month_num = p_cfg["month"]

            # Construct 2 curated items per phase
            item1_id = uuid.uuid4().hex[:12]
            item2_id = uuid.uuid4().hex[:12]

            # Dependencies: item1 depends on previous phase's last item; item2 depends on item1
            item1_deps = [previous_item_id] if previous_item_id else []
            item2_deps = [item1_id]

            # Status: Only the very first item in Phase 1 starts as NOT_STARTED; others with dependencies start as LOCKED
            item1_status = "NOT_STARTED" if not item1_deps else "LOCKED"
            item2_status = "LOCKED"

            skills_for_item1 = p_cfg["target_skills"][:2] if p_cfg["target_skills"] else ["Core Fundamentals"]
            skills_for_item2 = p_cfg["target_skills"][2:] if len(p_cfg["target_skills"]) > 2 else [skills_for_item1[0]]

            # Resources matching skills
            res_item1 = self._get_resources_for_skills(skills_for_item1)
            res_item2 = self._get_resources_for_skills(skills_for_item2)

            est_h1 = round(20.0 * pace_multiplier, 1)
            est_h2 = round(20.0 * pace_multiplier, 1)

            # Define specific tasks per phase
            tasks1, tasks2 = self._build_phase_tasks(p_idx + 1, career_title, skills_for_item1, skills_for_item2)

            item1 = {
                "id": item1_id,
                "month": month_num,
                "phase_id": phase_id,
                "title": f"Month {month_num}: {p_cfg['subtitle'].split('&')[0].strip()} Fundamentals",
                "description": f"Master the theoretical concepts and practical foundations of {', '.join(skills_for_item1)}.",
                "item_type": "learning" if month_num <= 4 else ("project" if month_num == 5 else "interview"),
                "priority": "CRITICAL" if month_num <= 2 else "HIGH",
                "status": item1_status,
                "skills": skills_for_item1,
                "tasks": tasks1,
                "estimated_hours": est_h1,
                "actual_hours": 0.0,
                "item_order": item_counter,
                "dependencies": item1_deps,
                "resource_links": res_item1,
                "project_id": None,
                "is_completed": False,
                "notes": "",
            }
            item_counter += 1

            item2 = {
                "id": item2_id,
                "month": month_num,
                "phase_id": phase_id,
                "title": f"Month {month_num} Lab: {p_cfg['subtitle'].split('&')[-1].strip()} Application",
                "description": f"Hands-on exercises and implementation challenges applying {', '.join(skills_for_item2)}.",
                "item_type": "practice" if month_num <= 4 else ("project" if month_num == 5 else "resume"),
                "priority": "HIGH",
                "status": item2_status,
                "skills": skills_for_item2,
                "tasks": tasks2,
                "estimated_hours": est_h2,
                "actual_hours": 0.0,
                "item_order": item_counter,
                "dependencies": item2_deps,
                "resource_links": res_item2,
                "project_id": None,
                "is_completed": False,
                "notes": "",
            }
            item_counter += 1

            items_data.append(item1)
            items_data.append(item2)
            previous_item_id = item2_id

            phases_data.append({
                "id": phase_id,
                "month": month_num,
                "title": p_cfg["title"],
                "subtitle": p_cfg["subtitle"],
                "description": p_cfg["description"],
                "status": "NOT_STARTED" if month_num == 1 else "LOCKED",
                "progress_percent": 0.0,
                "target_skills": p_cfg["target_skills"],
                "items_count": 2,
                "completed_items_count": 0,
            })

        milestones = [
            {"id": "m1", "title": "Foundations Complete", "month": 1, "completed": False},
            {"id": "m2", "title": "Core Architectural Mastery", "month": 2, "completed": False},
            {"id": "m3", "title": "Advanced Engineering Ready", "month": 3, "completed": False},
            {"id": "m4", "title": "Production Deployment Cleared", "month": 4, "completed": False},
            {"id": "m5", "title": "Portfolio Deliverable Built", "month": 5, "completed": False},
            {"id": "m6", "title": "Career Readiness Certified", "month": 6, "completed": False},
        ]

        return {
            "phases": phases_data,
            "items": items_data,
            "milestones": milestones[:duration_months],
        }

    def _get_resources_for_skills(self, skills: List[str]) -> List[Dict[str, Any]]:
        links = []
        for skill in skills:
            for cat_key, resources in self.RESOURCE_CATALOG.items():
                if cat_key.lower() in skill.lower() or skill.lower() in cat_key.lower():
                    links.extend(resources)
        if not links:
            links = [
                {"id": "res-def-1", "title": "Official Language Specification & Best Practices", "url": "https://docs.python.org/3/", "type": "Documentation"},
                {"id": "res-def-2", "title": "System Architecture & Design Patterns Reference", "url": "https://developer.mozilla.org/", "type": "Tutorial"},
            ]
        # De-duplicate by URL
        seen_urls = set()
        deduped = []
        for l in links:
            if l["url"] not in seen_urls:
                seen_urls.add(l["url"])
                deduped.append({**l, "is_completed": False})
        return deduped[:3]

    def _build_phase_tasks(
        self,
        phase_num: int,
        career_title: str,
        skills1: List[str],
        skills2: List[str],
    ) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        if phase_num == 1:
            tasks1 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Review modern {skills1[0]} language idioms and type annotations", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Set up strict linting, formatting, and test-driven scaffolding", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Implement 10 core algorithmic and memory layout exercises", "done": False},
            ]
            tasks2 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Construct data structure modules for {skills2[0]}", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Write comprehensive unit tests with 90%+ code coverage", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Benchmark time and space complexities using profilers", "done": False},
            ]
        elif phase_num == 2:
            tasks1 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Design relational schemas and queries for {skills1[0]}", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Implement asynchronous API endpoints with strict input validation", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Integrate JWT authentication and security headers", "done": False},
            ]
            tasks2 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Build automated data processing pipelines for {skills2[0]}", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Write integration test suites with mocked external services", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Optimize slow database queries using composite indexes", "done": False},
            ]
        elif phase_num == 3:
            tasks1 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Design high-throughput asynchronous handlers for {skills1[0]}", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Incorporate Redis caching for low-latency read paths", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Perform concurrency benchmarks under simulated load", "done": False},
            ]
            tasks2 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Implement specialized domain logic for {skills2[0]}", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Establish structured JSON logging and error telemetry", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Document architecture decisions in formal ADR markdown", "done": False},
            ]
        elif phase_num == 4:
            tasks1 = [
                {"id": uuid.uuid4().hex[:8], "text": "Create multi-stage Dockerfiles optimizing image size under 150MB", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Configure GitHub Actions CI/CD for automated linting & tests", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Deploy containerized services to a secure cloud runtime", "done": False},
            ]
            tasks2 = [
                {"id": uuid.uuid4().hex[:8], "text": "Set up health check endpoints and uptime monitoring", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Configure environment variable management and secrets injection", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Execute rolling deployment simulation with zero downtime", "done": False},
            ]
        elif phase_num == 5:
            tasks1 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Draft end-to-end architecture specification for {career_title} capstone", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Build core business logic and full data persistence layer", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Create interactive user interface with real-time feedback", "done": False},
            ]
            tasks2 = [
                {"id": uuid.uuid4().hex[:8], "text": "Write end-to-end test suites verifying critical user journeys", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Deploy live working demo with publicly accessible URL", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Draft comprehensive GitHub README with architecture diagrams", "done": False},
            ]
        else:
            tasks1 = [
                {"id": uuid.uuid4().hex[:8], "text": f"Calibrate resume bullet points highlighting {career_title} stack", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Complete 15 LeetCode medium technical algorithm problems", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Conduct mock system design interview covering data partitioning", "done": False},
            ]
            tasks2 = [
                {"id": uuid.uuid4().hex[:8], "text": "Record 3-minute video walkthrough showcasing capstone portfolio", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Tailor LinkedIn headline, summary, and verified skill badges", "done": False},
                {"id": uuid.uuid4().hex[:8], "text": "Submit 5 targeted applications to verified hiring companies", "done": False},
            ]

        return tasks1, tasks2


ai_roadmap_generator = AIRoadmapGenerator()
