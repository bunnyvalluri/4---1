import sys
import os
import asyncio

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.db.database import AsyncSessionLocal, init_db
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.models.profile import Profile
from app.models.skill import UserSkill, Skill
from scripts.seed_skills import seed_skills
from scripts.seed_questions import seed_questions
from scripts.seed_careers import seed_careers
from app.services.recommendation_service import RecommendationService


async def seed_master_database():
    print("🚀 Starting Master 100% Python Database Seed...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Seed System Admin
        admin_email = "admin@careerai.dev"
        admin_stmt = select(User).where(User.email == admin_email)
        admin = (await session.execute(admin_stmt)).scalar_one_or_none()
        if not admin:
            admin = User(
                name="System Administrator",
                email=admin_email,
                password_hash=get_password_hash("Admin@123456"),
                role=Role.ADMIN,
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            )
            session.add(admin)
            await session.flush()
            print(f"✅ Created Admin: {admin.email}")

        # 2. Seed Demo Candidate (Alex Johnson)
        demo_email = "alex@example.com"
        demo_stmt = select(User).where(User.email == demo_email)
        demo_user = (await session.execute(demo_stmt)).scalar_one_or_none()
        if not demo_user:
            demo_user = User(
                name="Alex Johnson",
                email=demo_email,
                password_hash=get_password_hash("Password@123"),
                role=Role.USER,
                avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            )
            session.add(demo_user)
            await session.flush()

            demo_profile = Profile(
                user_id=demo_user.id,
                phone="+1 (555) 349-2810",
                location="San Francisco, CA / Remote",
                bio="Final-year Computer Science student passionate about distributed systems, cloud computing, and applied Machine Learning.",
                degree="Bachelor of Technology (B.Tech)",
                branch="Computer Science and Engineering",
                college="University Institute of Technology",
                grad_year=2026,
                cgpa=8.7,
                interests=["Artificial Intelligence", "Cloud Native Systems", "Microservices", "Open Source"],
                preferred_industries=["Enterprise Software / SaaS", "AI & Data Tech", "FinTech"],
                preferred_roles=["Full Stack Developer", "AI/ML Engineer", "Backend Engineer"],
                preferred_locations=["San Francisco", "Remote", "Seattle", "New York"],
                career_goals="To build high-scale cloud-native distributed backends and deploy machine learning models to production.",
                work_experience_years=1.0,
                github_url="https://github.com/alexjohnson-dev",
                linkedin_url="https://linkedin.com/in/alexjohnson-demo",
            )
            session.add(demo_profile)
            await session.flush()
            print(f"✅ Created Demo User: {demo_user.email} with full profile")

        # 3. Seed Skills, Questions, and Careers
        await seed_skills(session)
        await seed_questions(session)
        await seed_careers(session)

        # 4. Attach sample skills to Demo User
        if demo_user:
            sample_skills = [
                ("Python", 4),
                ("JavaScript", 4),
                ("React.js", 3),
                ("SQL", 4),
                ("FastAPI", 3),
                ("Git & GitHub", 4),
                ("Docker", 2),
            ]
            for skill_name, prof in sample_skills:
                sk_stmt = select(Skill).where(Skill.name == skill_name)
                sk_obj = (await session.execute(sk_stmt)).scalar_one_or_none()
                if sk_obj:
                    us_stmt = select(UserSkill).where(
                        UserSkill.user_id == demo_user.id,
                        UserSkill.skill_id == sk_obj.id,
                    )
                    existing_us = (await session.execute(us_stmt)).scalar_one_or_none()
                    if not existing_us:
                        us = UserSkill(
                            user_id=demo_user.id,
                            skill_id=sk_obj.id,
                            proficiency=prof,
                            verified=True,
                        )
                        session.add(us)
            await session.commit()
            print(f"✅ Seeded sample skills for demo user {demo_user.email}")

            # 5. Generate initial recommendation rankings for demo user
            rec_service = RecommendationService(session)
            recs = await rec_service.generate_recommendations_for_user(demo_user.id)
            print(f"✅ Pre-calculated {len(recs)} career recommendations for {demo_user.name}.")

    print("🎉 Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_master_database())
