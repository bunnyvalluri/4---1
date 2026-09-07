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
from app.models.skill import Skill, SkillCategory

SKILLS_DATA = [
    # Programming Languages & Core Tech
    {"name": "JavaScript", "category": SkillCategory.TECHNICAL, "description": "ECMAScript language for web & server applications"},
    {"name": "TypeScript", "category": SkillCategory.TECHNICAL, "description": "Typed superset of JavaScript providing compile-time safety"},
    {"name": "Python", "category": SkillCategory.TECHNICAL, "description": "High-level versatile language for data science, AI, and backend"},
    {"name": "Java", "category": SkillCategory.TECHNICAL, "description": "Object-oriented language for enterprise architectures and Android"},
    {"name": "C++", "category": SkillCategory.TECHNICAL, "description": "High-performance systems programming language"},
    {"name": "Go (Golang)", "category": SkillCategory.TECHNICAL, "description": "Fast, concurrent systems and cloud infrastructure language"},
    {"name": "Rust", "category": SkillCategory.TECHNICAL, "description": "Memory-safe systems programming language"},
    {"name": "SQL", "category": SkillCategory.TECHNICAL, "description": "Structured Query Language for relational database querying"},
    {"name": "HTML5 & CSS3", "category": SkillCategory.TECHNICAL, "description": "Core semantic web standards and styling specifications"},
    {"name": "Bash / Shell Scripting", "category": SkillCategory.TECHNICAL, "description": "CLI scripting for automation and UNIX administration"},

    # Frontend Frameworks & Libraries
    {"name": "React.js", "category": SkillCategory.FRAMEWORK, "description": "Component-based UI library by Meta"},
    {"name": "Next.js", "category": SkillCategory.FRAMEWORK, "description": "React production framework with SSR and App Router"},
    {"name": "Vue.js", "category": SkillCategory.FRAMEWORK, "description": "Progressive JavaScript framework for building user interfaces"},
    {"name": "Tailwind CSS", "category": SkillCategory.FRAMEWORK, "description": "Utility-first modern CSS framework"},
    {"name": "Redux / Zustand", "category": SkillCategory.FRAMEWORK, "description": "Predictable state management libraries for web apps"},

    # Backend Frameworks & Runtimes
    {"name": "Node.js", "category": SkillCategory.FRAMEWORK, "description": "Chrome V8 asynchronous event-driven JavaScript runtime"},
    {"name": "FastAPI", "category": SkillCategory.FRAMEWORK, "description": "Modern high-performance Python ASGI web framework"},
    {"name": "Django", "category": SkillCategory.FRAMEWORK, "description": "Batteries-included high-level Python web framework"},
    {"name": "Spring Boot", "category": SkillCategory.FRAMEWORK, "description": "Production-ready enterprise Java framework"},
    {"name": "GraphQL", "category": SkillCategory.FRAMEWORK, "description": "Declarative API query language and runtime"},

    # Databases & Caching
    {"name": "PostgreSQL", "category": SkillCategory.DATABASE, "description": "Advanced open-source object-relational database"},
    {"name": "MySQL", "category": SkillCategory.DATABASE, "description": "Widely used open-source relational database system"},
    {"name": "MongoDB", "category": SkillCategory.DATABASE, "description": "Document-oriented NoSQL database system"},
    {"name": "Redis", "category": SkillCategory.DATABASE, "description": "In-memory key-value data store for caching and queues"},

    # Cloud, DevOps & Infrastructure
    {"name": "Docker", "category": SkillCategory.TOOL, "description": "Containerization platform for application packaging"},
    {"name": "Kubernetes", "category": SkillCategory.TOOL, "description": "Automated container orchestration system"},
    {"name": "Amazon Web Services (AWS)", "category": SkillCategory.CLOUD, "description": "Comprehensive cloud computing infrastructure platform"},
    {"name": "CI/CD Pipelines", "category": SkillCategory.TOOL, "description": "Automated build, test, and deployment workflows"},
    {"name": "Git & GitHub", "category": SkillCategory.TOOL, "description": "Distributed version control system and collaborative workflow"},
    {"name": "Terraform", "category": SkillCategory.CLOUD, "description": "Infrastructure as Code declarative provisioning tool"},

    # AI, Machine Learning & Data Science
    {"name": "Machine Learning", "category": SkillCategory.TECHNICAL, "description": "Algorithms that learn patterns directly from empirical data"},
    {"name": "PyTorch", "category": SkillCategory.FRAMEWORK, "description": "Deep learning research and production framework"},
    {"name": "TensorFlow / Keras", "category": SkillCategory.FRAMEWORK, "description": "End-to-end open source machine learning platform"},
    {"name": "scikit-learn", "category": SkillCategory.FRAMEWORK, "description": "Python library for classical machine learning algorithms"},
    {"name": "Pandas & NumPy", "category": SkillCategory.TOOL, "description": "High-performance scientific computing and tabular data analysis"},
    {"name": "Natural Language Processing (NLP)", "category": SkillCategory.TECHNICAL, "description": "Computational linguistics and language models"},
    {"name": "Large Language Models (LLMs) & Prompt Engineering", "category": SkillCategory.TECHNICAL, "description": "Foundational AI models, fine-tuning, RAG, and prompt design"},

    # Soft Skills & Professional Competencies
    {"name": "Problem Solving", "category": SkillCategory.SOFT, "description": "Structured analytical decomposition of complex engineering problems"},
    {"name": "System Design & Architecture", "category": SkillCategory.TECHNICAL, "description": "Designing scalable, fault-tolerant distributed systems"},
    {"name": "Technical Communication", "category": SkillCategory.SOFT, "description": "Clear articulation of technical concepts and design decisions"},
    {"name": "Agile & Scrum Methodologies", "category": SkillCategory.SOFT, "description": "Iterative software development lifecycle management"},
]


async def seed_skills(session: AsyncSession):
    print("🌱 Seeding Skills catalog...")
    count = 0
    for s in SKILLS_DATA:
        stmt = select(Skill).where(Skill.name == s["name"])
        existing = (await session.execute(stmt)).scalar_one_or_none()
        if not existing:
            skill = Skill(
                name=s["name"],
                category=s["category"],
                description=s["description"],
            )
            session.add(skill)
            count += 1
    await session.commit()
    print(f"✅ Seeded {count} new skills (total catalog: {len(SKILLS_DATA)}).")


if __name__ == "__main__":
    async def main():
        async with AsyncSessionLocal() as session:
            await seed_skills(session)
    asyncio.run(main())
