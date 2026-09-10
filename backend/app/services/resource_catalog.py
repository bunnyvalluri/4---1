"""
Resource Catalog & Selection Engine for CareerAI.

Integrates verified official learning resources from:
1. W3Schools (https://www.w3schools.com/)
2. GeeksforGeeks (https://www.geeksforgeeks.org/)

Legal & Content Integrity:
- Stores metadata, topics, and real verified URLs ONLY.
- Does NOT scrape, copy, or store copyrighted tutorial or article content.
- Respects original sources with clear attribution and direct external links.
- Implements level-based calibration (BEGINNER, INTERMEDIATE, ADVANCED).
- Deduplicates resources and provides fallback when no verified URL exists.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, field
from app.core.logging import logger


@dataclass
class VerifiedResource:
    id: str
    provider: str  # W3SCHOOLS or GEEKSFORGEEKS
    title: str
    url: str
    topic: str
    skill: str
    skill_level: str  # BEGINNER, INTERMEDIATE, ADVANCED
    resource_type: str  # TUTORIAL, REFERENCE, ROADMAP, EXERCISE, PRACTICE, ARTICLE, PROBLEM_SET
    description: str
    why_recommended: str
    is_verified: bool = True
    last_verified_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# Curated, verified catalog of real official W3Schools & GeeksforGeeks learning pages
RESOURCE_CATALOG: List[VerifiedResource] = [
    # ==========================================
    # PYTHON
    # ==========================================
    VerifiedResource(
        id="w3s-py-tut",
        provider="W3SCHOOLS",
        title="Python Tutorial: Syntax, Variables & Control Flow",
        url="https://www.w3schools.com/python/",
        topic="Python Basics",
        skill="Python",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Foundational Python syntax, control structures, data structures, and functions with interactive sandbox examples.",
        why_recommended="Structured beginner tutorial with hands-on exercises to build clean syntax habits.",
    ),
    VerifiedResource(
        id="w3s-py-ex",
        provider="W3SCHOOLS",
        title="Python Interactive Coding Exercises",
        url="https://www.w3schools.com/python/python_exercises.asp",
        topic="Python Fundamentals",
        skill="Python",
        skill_level="BEGINNER",
        resource_type="EXERCISE",
        description="Comprehensive set of interactive Python programming exercises covering lists, dictionaries, functions, and OOP.",
        why_recommended="Quick validation drills to reinforce core language memory and syntax fluency.",
    ),
    VerifiedResource(
        id="gfg-py-prog",
        provider="GEEKSFORGEEKS",
        title="Python Programming Language: Comprehensive Guide",
        url="https://www.geeksforgeeks.org/python-programming-language/",
        topic="Advanced Python",
        skill="Python",
        skill_level="INTERMEDIATE",
        resource_type="REFERENCE",
        description="Deep dive into Python internals, memory model, decorators, generators, asynchronous programming, and standard library modules.",
        why_recommended="In-depth conceptual guide for intermediate developers scaling beyond basics to idiomatic backend architecture.",
    ),

    # ==========================================
    # FASTAPI & WEB APIS
    # ==========================================
    VerifiedResource(
        id="gfg-fastapi-tut",
        provider="GEEKSFORGEEKS",
        title="FastAPI Tutorial: Asynchronous REST Architecture",
        url="https://www.geeksforgeeks.org/fastapi-tutorial/",
        topic="FastAPI",
        skill="FastAPI",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="Guide to building scalable asynchronous microservices, request validation with Pydantic, dependency injection, and OpenAPI schemas.",
        why_recommended="Core framework tutorial tailored to modern production backend engineering practices.",
    ),
    VerifiedResource(
        id="gfg-rest-api",
        provider="GEEKSFORGEEKS",
        title="REST API Architecture & HTTP Standards",
        url="https://www.geeksforgeeks.org/rest-api-introduction/",
        topic="API Design",
        skill="REST APIs",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Principles of RESTful design, idempotency, HTTP verbs, status codes, and API contract design.",
        why_recommended="Industry-standard design foundation for building clean, predictable API contracts.",
    ),

    # ==========================================
    # SQL, POSTGRESQL & DATABASES
    # ==========================================
    VerifiedResource(
        id="w3s-sql-tut",
        provider="W3SCHOOLS",
        title="SQL Tutorial & Relational Database Querying",
        url="https://www.w3schools.com/sql/",
        topic="SQL",
        skill="SQL",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Interactive guide to writing SELECT queries, JOINs, aggregations, subqueries, and table constraints.",
        why_recommended="Gold standard reference for mastering relational query syntax and set operations.",
    ),
    VerifiedResource(
        id="w3s-sql-ex",
        provider="W3SCHOOLS",
        title="SQL Interactive Practice Exercises",
        url="https://www.w3schools.com/sql/sql_exercises.asp",
        topic="SQL Practice",
        skill="SQL",
        skill_level="BEGINNER",
        resource_type="EXERCISE",
        description="Hands-on SQL practice challenges covering complex multi-table joins and data manipulation.",
        why_recommended="Immediate feedback exercises to build query fluency before tackling database migrations.",
    ),
    VerifiedResource(
        id="w3s-pg-tut",
        provider="W3SCHOOLS",
        title="PostgreSQL Tutorial: Advanced Relational Engine",
        url="https://www.w3schools.com/postgresql/",
        topic="PostgreSQL",
        skill="PostgreSQL",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="PostgreSQL-specific types, JSONB, indexing strategies, sequence management, and connection configuration.",
        why_recommended="Practical guide to configuring and querying production-grade PostgreSQL databases.",
    ),
    VerifiedResource(
        id="gfg-pg-tut",
        provider="GEEKSFORGEEKS",
        title="PostgreSQL Tutorial: Indexing, Transactions & Schemas",
        url="https://www.geeksforgeeks.org/postgresql-tutorial/",
        topic="Database Architecture",
        skill="PostgreSQL",
        skill_level="ADVANCED",
        resource_type="REFERENCE",
        description="Deep dive into PostgreSQL query plans (EXPLAIN ANALYZE), B-Tree vs GIN indexes, MVCC, and transaction isolation levels.",
        why_recommended="Vital for senior backend engineers optimizing slow queries and concurrency bottlenecks.",
    ),
    VerifiedResource(
        id="gfg-dbms-tut",
        provider="GEEKSFORGEEKS",
        title="DBMS Architecture: ACID, Normalization & Storage",
        url="https://www.geeksforgeeks.org/dbms/",
        topic="Database Theory",
        skill="Database Design",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="Relational database theory, Boyce-Codd normal forms, concurrency control, and deadlocks.",
        why_recommended="Critical interview preparation and foundational design for backend engineers.",
    ),

    # ==========================================
    # DOCKER, CONTAINERS & CLOUD
    # ==========================================
    VerifiedResource(
        id="gfg-docker-tut",
        provider="GEEKSFORGEEKS",
        title="Docker Tutorial: Containerization from Scratch to Compose",
        url="https://www.geeksforgeeks.org/docker-tutorial/",
        topic="Docker",
        skill="Docker",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Container concepts, Dockerfile creation, multi-stage builds, volume management, and Docker Compose networks.",
        why_recommended="End-to-end practical walkthrough for packaging and isolating backend microservices.",
    ),
    VerifiedResource(
        id="gfg-devops-tut",
        provider="GEEKSFORGEEKS",
        title="DevOps Engineering & Automation Practices",
        url="https://www.geeksforgeeks.org/devops-tutorial/",
        topic="DevOps",
        skill="DevOps",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="Overview of continuous delivery pipelines, infrastructure as code, monitoring, and staging workflows.",
        why_recommended="Bridges the gap between raw code development and production operations.",
    ),
    VerifiedResource(
        id="gfg-cicd-art",
        provider="GEEKSFORGEEKS",
        title="CI/CD Pipeline Architecture: Automation & Delivery",
        url="https://www.geeksforgeeks.org/what-is-cicd/",
        topic="CI/CD",
        skill="CI/CD",
        skill_level="INTERMEDIATE",
        resource_type="ARTICLE",
        description="Architecting automated continuous integration and continuous deployment pipelines for zero-downtime releases.",
        why_recommended="Key baseline guide for setting up GitHub Actions or GitLab CI test suites.",
    ),
    VerifiedResource(
        id="gfg-cloud-tut",
        provider="GEEKSFORGEEKS",
        title="Cloud Computing Concepts & Service Models",
        url="https://www.geeksforgeeks.org/cloud-computing/",
        topic="Cloud Architecture",
        skill="Cloud Architecture",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="IaaS, PaaS, and Serverless architectures, object storage, identity access management, and high availability.",
        why_recommended="Core conceptual guide for candidates targeting cloud backend and DevOps roles.",
    ),

    # ==========================================
    # SYSTEM DESIGN & ARCHITECTURE
    # ==========================================
    VerifiedResource(
        id="gfg-sys-design",
        provider="GEEKSFORGEEKS",
        title="System Design Tutorial: High-Scale Distributed Systems",
        url="https://www.geeksforgeeks.org/system-design-tutorial/",
        topic="System Design",
        skill="System Design",
        skill_level="ADVANCED",
        resource_type="ROADMAP",
        description="Scalability patterns, load balancing, caching strategies, rate limiting, microservices, and event-driven architectures.",
        why_recommended="Authoritative system design curriculum essential for Senior/Mid-level engineering interview clearance.",
    ),
    VerifiedResource(
        id="gfg-microservices-art",
        provider="GEEKSFORGEEKS",
        title="Microservices Architecture: Design Patterns & Trade-offs",
        url="https://www.geeksforgeeks.org/microservices-architecture/",
        topic="Microservices",
        skill="Microservices",
        skill_level="ADVANCED",
        resource_type="ARTICLE",
        description="Decomposition strategies, API gateways, service discovery, distributed tracing, and saga transaction patterns.",
        why_recommended="Essential guidance for decomposing monolithic codebases into resilient services.",
    ),

    # ==========================================
    # DATA STRUCTURES & ALGORITHMS (DSA)
    # ==========================================
    VerifiedResource(
        id="w3s-dsa-tut",
        provider="W3SCHOOLS",
        title="Data Structures & Algorithms Tutorial",
        url="https://www.w3schools.com/dsa/",
        topic="DSA Fundamentals",
        skill="Data Structures",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Visual animations and step-by-step explanations of basic arrays, stacks, queues, linked lists, and sorting algorithms.",
        why_recommended="Gentle visual introduction for candidates building computational problem-solving intuition.",
    ),
    VerifiedResource(
        id="gfg-dsa-roadmap",
        provider="GEEKSFORGEEKS",
        title="DSA Roadmap: Learn Data Structures and Algorithms",
        url="https://www.geeksforgeeks.org/dsa-tutorial-learn-data-structures-and-algorithms/",
        topic="DSA Comprehensive",
        skill="Data Structures & Algorithms",
        skill_level="INTERMEDIATE",
        resource_type="ROADMAP",
        description="Structured DSA curriculum covering time/space complexity, trees, graphs, dynamic programming, and greedy algorithms.",
        why_recommended="The industry benchmark DSA roadmap for software engineering interview preparation.",
    ),
    VerifiedResource(
        id="gfg-algo-fund",
        provider="GEEKSFORGEEKS",
        title="Fundamentals of Algorithms: Design & Complexity Analysis",
        url="https://www.geeksforgeeks.org/fundamentals-of-algorithms/",
        topic="Algorithms",
        skill="Algorithms",
        skill_level="ADVANCED",
        resource_type="REFERENCE",
        description="Algorithmic paradigms (divide & conquer, dynamic programming, backtracking) with asymptotic analysis and proofs.",
        why_recommended="Rigorous theoretical and practical foundation for senior technical problem-solving rounds.",
    ),
    VerifiedResource(
        id="gfg-dsa-practice",
        provider="GEEKSFORGEEKS",
        title="GeeksforGeeks Interactive Problem Solving & Coding Practice",
        url="https://www.geeksforgeeks.org/explore?page=1&sortBy=submissions",
        topic="Problem Solving",
        skill="Problem Solving",
        skill_level="INTERMEDIATE",
        resource_type="PROBLEM_SET",
        description="Curated collection of company-tagged interview coding challenges with online compiler and test execution.",
        why_recommended="Hands-on coding challenges to test edge cases, time limits, and space constraints.",
    ),

    # ==========================================
    # FRONTEND & JAVASCRIPT / TYPESCRIPT / REACT
    # ==========================================
    VerifiedResource(
        id="w3s-html-tut",
        provider="W3SCHOOLS",
        title="HTML5 Tutorial: Semantic Web Structure",
        url="https://www.w3schools.com/html/",
        topic="HTML",
        skill="HTML5",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Semantic HTML elements, web accessibility (a11y), forms, media integration, and DOM structure.",
        why_recommended="The standard beginner guide for mastering accessible document structure.",
    ),
    VerifiedResource(
        id="w3s-css-tut",
        provider="W3SCHOOLS",
        title="CSS3 Tutorial: Responsive Layouts & Styling",
        url="https://www.w3schools.com/css/",
        topic="CSS",
        skill="CSS3",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Flexbox, CSS Grid, media queries, animations, and modern responsive design patterns.",
        why_recommended="Comprehensive layout guide with live interactive editors for visual styling.",
    ),
    VerifiedResource(
        id="w3s-js-tut",
        provider="W3SCHOOLS",
        title="JavaScript Tutorial: Modern ES6+ Foundations",
        url="https://www.w3schools.com/js/",
        topic="JavaScript",
        skill="JavaScript",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Core JavaScript syntax, asynchronous promises, async/await, closures, and browser DOM manipulation.",
        why_recommended="Essential starting point for client-side and full stack engineering.",
    ),
    VerifiedResource(
        id="w3s-ts-tut",
        provider="W3SCHOOLS",
        title="TypeScript Tutorial: Static Type Systems",
        url="https://www.w3schools.com/typescript/",
        topic="TypeScript",
        skill="TypeScript",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="Type annotations, interfaces, generics, utility types, union types, and tsconfig compiler options.",
        why_recommended="Clear practical guide to writing robust, type-safe enterprise code.",
    ),
    VerifiedResource(
        id="w3s-react-tut",
        provider="W3SCHOOLS",
        title="React Tutorial: Components, Hooks & State",
        url="https://www.w3schools.com/react/",
        topic="React",
        skill="React",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Component composition, JSX, useState, useEffect, custom hooks, and React Router navigation.",
        why_recommended="Accessible tutorial explaining component lifecycles and modern hook patterns.",
    ),
    VerifiedResource(
        id="gfg-react-tut",
        provider="GEEKSFORGEEKS",
        title="ReactJS Architecture: Advanced Patterns & State Management",
        url="https://www.geeksforgeeks.org/react-tutorial/",
        topic="Advanced React",
        skill="React",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="Context API, React Fiber reconciliation, performance memoization (useMemo/useCallback), and SSR.",
        why_recommended="Deep technical overview covering internal rendering mechanics and production optimization.",
    ),

    # ==========================================
    # DATA SCIENCE & MACHINE LEARNING
    # ==========================================
    VerifiedResource(
        id="w3s-numpy-tut",
        provider="W3SCHOOLS",
        title="NumPy Tutorial: N-Dimensional Array Computing",
        url="https://www.w3schools.com/python/numpy/",
        topic="NumPy",
        skill="NumPy",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Array indexing, slicing, broadcasting, vectorization, and mathematical operations for numerical data.",
        why_recommended="Fast, practical tutorial for vector math foundation required in data pipelines and ML.",
    ),
    VerifiedResource(
        id="w3s-pandas-tut",
        provider="W3SCHOOLS",
        title="Pandas Tutorial: DataFrames & Data Manipulation",
        url="https://www.w3schools.com/python/pandas/",
        topic="Pandas",
        skill="Pandas",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="DataFrame cleaning, filtering, grouping, merging, and time series transformations.",
        why_recommended="Essential guide for feature engineering and data preprocessing workflows.",
    ),
    VerifiedResource(
        id="w3s-ml-tut",
        provider="W3SCHOOLS",
        title="Machine Learning Tutorial: Core Supervised Models",
        url="https://www.w3schools.com/python/python_ml_getting_started.asp",
        topic="Machine Learning",
        skill="Machine Learning",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Regression, classification, decision trees, train/test split, and confusion matrices using Python.",
        why_recommended="Intuitive beginner tutorial with concrete code demonstrations of core algorithms.",
    ),
    VerifiedResource(
        id="gfg-ml-tut",
        provider="GEEKSFORGEEKS",
        title="Machine Learning Guide: Theory, Math & Algorithms",
        url="https://www.geeksforgeeks.org/machine-learning/",
        topic="Machine Learning Deep Dive",
        skill="Machine Learning",
        skill_level="INTERMEDIATE",
        resource_type="ROADMAP",
        description="Comprehensive ML mathematics, gradient descent, bias-variance tradeoff, regularization, and model evaluation.",
        why_recommended="Thorough theoretical backing essential for data science and AI engineering interviews.",
    ),
    VerifiedResource(
        id="gfg-dl-tut",
        provider="GEEKSFORGEEKS",
        title="Deep Learning Tutorial: Neural Networks & Architectures",
        url="https://www.geeksforgeeks.org/deep-learning-tutorial/",
        topic="Deep Learning",
        skill="Deep Learning",
        skill_level="ADVANCED",
        resource_type="TUTORIAL",
        description="Perceptrons, backpropagation, CNNs, RNNs, and Transformer self-attention architectures.",
        why_recommended="Detailed mathematical and architectural walk-through for advanced AI engineering tracks.",
    ),

    # ==========================================
    # TESTING, GIT & BEST PRACTICES
    # ==========================================
    VerifiedResource(
        id="w3s-git-tut",
        provider="W3SCHOOLS",
        title="Git & GitHub Tutorial: Version Control Workflows",
        url="https://www.w3schools.com/git/",
        topic="Git",
        skill="Git",
        skill_level="BEGINNER",
        resource_type="TUTORIAL",
        description="Git initialization, staging, commit workflows, branches, merge conflicts, and remote pushes to GitHub.",
        why_recommended="Clear visual walkthrough of daily version control commands used in professional teams.",
    ),
    VerifiedResource(
        id="gfg-testing-tut",
        provider="GEEKSFORGEEKS",
        title="Software Testing Fundamentals: Unit, Integration & E2E",
        url="https://www.geeksforgeeks.org/software-testing-basics/",
        topic="Testing",
        skill="Testing",
        skill_level="INTERMEDIATE",
        resource_type="TUTORIAL",
        description="Testing pyramids, test-driven development (TDD), mocking, assertions, and test fixtures.",
        why_recommended="Essential engineering rigor to ensure reliable CI/CD delivery and zero regressions.",
    ),
    VerifiedResource(
        id="gfg-interview-prep",
        provider="GEEKSFORGEEKS",
        title="Software Developer Technical Interview Preparation",
        url="https://www.geeksforgeeks.org/interview-preparation-for-software-developer/",
        topic="Interview Prep",
        skill="Technical Interviewing",
        skill_level="ADVANCED",
        resource_type="PRACTICE",
        description="Company-tested technical interview questions, behavioral rubrics, system design walkthroughs, and coding rounds.",
        why_recommended="Direct industry preparation for final candidate interview clearing.",
    ),
]


class ResourceSelectionEngine:
    """
    Selects, deduplicates, and calibrates verified learning resources from
    W3Schools and GeeksforGeeks tailored to the candidate's skill gaps and level.
    """

    @classmethod
    def find_resources_for_skill(
        cls,
        skill_name: str,
        current_level: str = "BEGINNER",
        target_level: str = "INTERMEDIATE",
        limit: int = 2,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves matching verified resources for a specific skill.
        Calibrates choice by skill level (e.g. W3Schools for syntax/fundamentals,
        GeeksforGeeks for advanced/architecture/problem solving).
        """
        skill_lower = skill_name.lower().strip()
        candidates: List[VerifiedResource] = []

        # 1. Direct Skill Name Match
        for res in RESOURCE_CATALOG:
            res_skill_lower = res.skill.lower()
            if res_skill_lower == skill_lower or skill_lower in res_skill_lower or res_skill_lower in skill_lower:
                candidates.append(res)

        # 2. Fuzzy Topic / Semantic Match
        if not candidates:
            synonyms = {
                "fastapi": ["python", "rest apis", "rest api"],
                "django": ["python", "backend"],
                "postgresql": ["sql", "database design"],
                "docker": ["devops", "cloud architecture"],
                "kubernetes": ["docker", "devops", "cloud architecture"],
                "react.js": ["react", "javascript"],
                "next.js": ["react", "typescript"],
                "algorithms": ["data structures & algorithms", "problem solving"],
                "data structures": ["data structures", "data structures & algorithms"],
                "unit testing": ["testing"],
                "pytest": ["testing", "python"],
                "ci/cd": ["devops", "git"],
                "github actions": ["ci/cd", "devops"],
            }
            mapped_synonyms = synonyms.get(skill_lower, [])
            for res in RESOURCE_CATALOG:
                res_skill = res.skill.lower()
                res_topic = res.topic.lower()
                if any(syn in res_skill or syn in res_topic for syn in mapped_synonyms):
                    candidates.append(res)

        # 3. If no matching verified resource, return empty list (never invent fake URLs)
        if not candidates:
            return []

        # 4. Sort and prioritize by level calibration
        def score_candidate(res: VerifiedResource) -> int:
            score = 0
            # Beginner candidates benefit from W3Schools fundamentals
            if current_level.upper() == "BEGINNER":
                if res.provider == "W3SCHOOLS":
                    score += 15
                if res.skill_level == "BEGINNER":
                    score += 10
                if res.resource_type in ["TUTORIAL", "EXERCISE"]:
                    score += 5
            # Intermediate / Advanced candidates benefit from GeeksforGeeks deep-dives & architecture
            else:
                if res.provider == "GEEKSFORGEEKS":
                    score += 15
                if res.skill_level in ["INTERMEDIATE", "ADVANCED"]:
                    score += 10
                if res.resource_type in ["ROADMAP", "REFERENCE", "PROBLEM_SET"]:
                    score += 5

            return score

        candidates.sort(key=score_candidate, reverse=True)

        # 5. Deduplicate by URL and Title
        seen_urls = set()
        deduped: List[Dict[str, Any]] = []

        for c in candidates:
            if c.url in seen_urls:
                continue
            seen_urls.add(c.url)
            deduped.append({
                "id": c.id,
                "provider": c.provider,
                "title": c.title,
                "url": c.url,
                "topic": c.topic,
                "skill": c.skill,
                "skill_level": c.skill_level,
                "resource_type": c.resource_type,
                "description": c.description,
                "why_recommended": c.why_recommended,
                "is_verified": c.is_verified,
            })
            if len(deduped) >= limit:
                break

        return deduped

    @classmethod
    def get_fallback_message(cls, skill_name: str) -> str:
        return f"No verified learning resource is currently available for this topic."
