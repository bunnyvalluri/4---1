import sys
import os
import asyncio

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.models.career import Career, CareerSkill
from app.models.skill import Skill
from app.models.project import ProjectRecommendation

CAREERS_DATA = [
    {
        "title": "Full Stack Developer",
        "slug": "full-stack-developer",
        "category": "Software Engineering",
        "description": "Architects, builds, and maintains comprehensive web applications spanning modern user interfaces, scalable backend microservices, and relational persistence layers.",
        "salary_range": "$95,000 - $160,000",
        "demand_level": "Very High",
        "experience_level": "Entry / Mid",
        "overview": "Full Stack Developers bridge client and server architectures, mastering React/Next.js frontend systems alongside high-throughput Python/FastAPI APIs and optimized PostgreSQL databases.",
        "education_reqs": "Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.",
        "aptitude_reqs": {
            "LOGICAL": 75,
            "QUANTITATIVE": 70,
            "VERBAL": 65,
            "ANALYTICAL": 80,
            "PROBLEM_SOLVING": 85,
        },
        "common_job_titles": [
            "Full Stack Software Engineer",
            "Web Applications Developer",
            "Software Development Engineer (SDE II)",
            "Product Engineer",
        ],
        "skills": [
            {"name": "Python", "is_required": True, "min_proficiency": 4, "weight": 1.5},
            {"name": "TypeScript", "is_required": True, "min_proficiency": 3, "weight": 1.3},
            {"name": "FastAPI", "is_required": True, "min_proficiency": 4, "weight": 1.4},
            {"name": "React.js", "is_required": True, "min_proficiency": 4, "weight": 1.4},
            {"name": "Next.js", "is_required": False, "min_proficiency": 3, "weight": 1.1},
            {"name": "PostgreSQL", "is_required": True, "min_proficiency": 4, "weight": 1.3},
            {"name": "Docker", "is_required": False, "min_proficiency": 3, "weight": 1.0},
            {"name": "Git & GitHub", "is_required": True, "min_proficiency": 4, "weight": 1.2},
            {"name": "Problem Solving", "is_required": True, "min_proficiency": 4, "weight": 1.5},
        ],
        "projects": [
            {
                "title": "Real-Time Collaborative Project Workspace",
                "difficulty": "Intermediate",
                "tech_stack": ["React.js", "FastAPI", "PostgreSQL", "Redis", "Docker"],
                "problem_statement": "Engineering teams require real-time task boards and concurrent document editing without conflict.",
                "expected_outcome": "Fully responsive web application with WebSockets, optimistic UI updates, and automated Docker deployment.",
                "skills_learned": ["Full Stack Integration", "WebSockets", "State Management", "SQL Optimization"],
                "estimated_duration": "4-6 weeks",
                "portfolio_value": "High - Demonstrates end-to-end full-stack mastery and concurrent state handling.",
            }
        ],
    },
    {
        "title": "AI / Machine Learning Engineer",
        "slug": "ai-ml-engineer",
        "category": "Artificial Intelligence & Data",
        "description": "Designs, trains, fine-tunes, and deploys predictive machine learning models and generative AI systems into high-throughput production infrastructure.",
        "salary_range": "$120,000 - $195,000",
        "demand_level": "Very High",
        "experience_level": "Mid / Senior",
        "overview": "Machine Learning Engineers operationalize AI, combining statistical modeling, feature engineering pipelines, PyTorch/scikit-learn algorithms, and LLM orchestration into reliable REST services.",
        "education_reqs": "Bachelor's or Master's degree in Computer Science, AI, Mathematics, or equivalent domain experience.",
        "aptitude_reqs": {
            "LOGICAL": 85,
            "QUANTITATIVE": 90,
            "VERBAL": 70,
            "ANALYTICAL": 90,
            "PROBLEM_SOLVING": 90,
        },
        "common_job_titles": [
            "Applied ML Engineer",
            "AI Systems Engineer",
            "Machine Learning Scientist",
            "LLM Solutions Architect",
        ],
        "skills": [
            {"name": "Python", "is_required": True, "min_proficiency": 5, "weight": 1.8},
            {"name": "Machine Learning", "is_required": True, "min_proficiency": 4, "weight": 1.6},
            {"name": "PyTorch", "is_required": True, "min_proficiency": 4, "weight": 1.5},
            {"name": "scikit-learn", "is_required": True, "min_proficiency": 4, "weight": 1.4},
            {"name": "Pandas & NumPy", "is_required": True, "min_proficiency": 4, "weight": 1.3},
            {"name": "Large Language Models (LLMs) & Prompt Engineering", "is_required": True, "min_proficiency": 4, "weight": 1.5},
            {"name": "Docker", "is_required": False, "min_proficiency": 3, "weight": 1.0},
            {"name": "FastAPI", "is_required": True, "min_proficiency": 3, "weight": 1.2},
        ],
        "projects": [
            {
                "title": "Retrieval-Augmented Generation (RAG) Document Intelligence Engine",
                "difficulty": "Advanced",
                "tech_stack": ["Python", "FastAPI", "PyTorch", "scikit-learn", "Docker"],
                "problem_statement": "Enterprises struggle to query across thousands of technical PDFs with factual accuracy and attribution.",
                "expected_outcome": "Vector semantic search engine with hybrid re-ranking, chunking optimizations, and an evaluation pipeline.",
                "skills_learned": ["RAG Architecture", "Vector Embeddings", "Model Evaluation", "MLOps"],
                "estimated_duration": "6-8 weeks",
                "portfolio_value": "Exceptional - Showcases cutting-edge generative AI application development.",
            }
        ],
    },
    {
        "title": "Cloud & DevOps Engineer",
        "slug": "cloud-devops-engineer",
        "category": "Cloud Infrastructure & SRE",
        "description": "Automates deployment pipelines, provisions infrastructure as code, monitors reliability, and scales distributed cloud architectures.",
        "salary_range": "$110,000 - $175,000",
        "demand_level": "High",
        "experience_level": "Mid / Senior",
        "overview": "Cloud & DevOps Engineers ensure software resilience, utilizing Docker containers, Kubernetes orchestration, CI/CD automation, and Terraform across AWS cloud environments.",
        "education_reqs": "Bachelor's degree in Computer Science, Information Technology, or relevant systems engineering background.",
        "aptitude_reqs": {
            "LOGICAL": 80,
            "QUANTITATIVE": 75,
            "VERBAL": 70,
            "ANALYTICAL": 85,
            "PROBLEM_SOLVING": 85,
        },
        "common_job_titles": [
            "Site Reliability Engineer (SRE)",
            "Cloud Infrastructure Architect",
            "Platform Engineer",
            "DevOps Specialist",
        ],
        "skills": [
            {"name": "Docker", "is_required": True, "min_proficiency": 5, "weight": 1.6},
            {"name": "Kubernetes", "is_required": True, "min_proficiency": 4, "weight": 1.5},
            {"name": "Amazon Web Services (AWS)", "is_required": True, "min_proficiency": 4, "weight": 1.5},
            {"name": "CI/CD Pipelines", "is_required": True, "min_proficiency": 4, "weight": 1.4},
            {"name": "Terraform", "is_required": True, "min_proficiency": 3, "weight": 1.3},
            {"name": "Bash / Shell Scripting", "is_required": True, "min_proficiency": 4, "weight": 1.2},
            {"name": "Python", "is_required": False, "min_proficiency": 3, "weight": 1.1},
        ],
        "projects": [
            {
                "title": "Zero-Downtime Multi-Region Kubernetes CI/CD Pipeline",
                "difficulty": "Advanced",
                "tech_stack": ["Docker", "Kubernetes", "Terraform", "AWS", "GitHub Actions"],
                "problem_statement": "Deploying frequent updates without latency spikes or user disruptions across multiple regions.",
                "expected_outcome": "Complete GitOps deployment workflow with canary releases, health probes, and automated rollback.",
                "skills_learned": ["Kubernetes", "GitOps", "Terraform IaC", "SRE Observability"],
                "estimated_duration": "5-7 weeks",
                "portfolio_value": "Very High - Directly demonstrates production-grade platform engineering.",
            }
        ],
    },
]


async def seed_careers(session: AsyncSession):
    print("🌱 Seeding Careers & Project Recommendations...")
    for c_data in CAREERS_DATA:
        stmt = select(Career).where(Career.slug == c_data["slug"])
        career = (await session.execute(stmt)).scalar_one_or_none()

        if not career:
            career = Career(
                title=c_data["title"],
                slug=c_data["slug"],
                category=c_data["category"],
                description=c_data["description"],
                salary_range=c_data["salary_range"],
                demand_level=c_data["demand_level"],
                experience_level=c_data["experience_level"],
                overview=c_data["overview"],
                education_reqs=c_data["education_reqs"],
                aptitude_reqs=c_data["aptitude_reqs"],
                common_job_titles=c_data["common_job_titles"],
            )
            session.add(career)
            await session.flush()
            print(f"  -> Created career: {career.title}")

        # Seed career skills
        for s_info in c_data["skills"]:
            skill_stmt = select(Skill).where(Skill.name == s_info["name"])
            skill = (await session.execute(skill_stmt)).scalar_one_or_none()
            if skill:
                cs_stmt = select(CareerSkill).where(
                    CareerSkill.career_id == career.id,
                    CareerSkill.skill_id == skill.id,
                )
                existing_cs = (await session.execute(cs_stmt)).scalar_one_or_none()
                if not existing_cs:
                    cs = CareerSkill(
                        career_id=career.id,
                        skill_id=skill.id,
                        is_required=s_info["is_required"],
                        min_proficiency=s_info["min_proficiency"],
                        weight=s_info["weight"],
                    )
                    session.add(cs)

        # Seed project suggestions
        for p_info in c_data.get("projects", []):
            proj_stmt = select(ProjectRecommendation).where(
                ProjectRecommendation.career_id == career.id,
                ProjectRecommendation.title == p_info["title"],
            )
            existing_proj = (await session.execute(proj_stmt)).scalar_one_or_none()
            if not existing_proj:
                proj = ProjectRecommendation(
                    career_id=career.id,
                    title=p_info["title"],
                    difficulty=p_info["difficulty"],
                    tech_stack=p_info["tech_stack"],
                    problem_statement=p_info["problem_statement"],
                    expected_outcome=p_info["expected_outcome"],
                    skills_learned=p_info["skills_learned"],
                    estimated_duration=p_info["estimated_duration"],
                    portfolio_value=p_info["portfolio_value"],
                )
                session.add(proj)

    await session.commit()
    print("✅ Seeded Careers, Skills mappings, and Project suggestions successfully.")


if __name__ == "__main__":
    async def main():
        async with AsyncSessionLocal() as session:
            await seed_careers(session)
    asyncio.run(main())
