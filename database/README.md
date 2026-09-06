# CareerAI Database Layer

This directory contains the database schema, relational models, and seeding scripts for the **CareerAI** platform.

## Architecture
- **ORM**: Prisma Client (`@prisma/client`)
- **Database Engine**: PostgreSQL
- **Schema**: `database/schema.prisma`
- **Seed Script**: `database/seed.ts`

## Key Entities
1. **User & Identity**: `User`, `Role`, `Profile`
2. **Skills & Taxonomy**: `Skill`, `SkillCategory`, `UserSkill`, `CareerSkill`
3. **Career Catalog**: `Career`, `CareerRecommendation`, `SkillGap`
4. **Learning Roadmaps**: `Roadmap`, `RoadmapItem`
5. **Aptitude Diagnostics**: `AptitudeQuestion`, `AptitudeAttempt`
6. **Resume Intelligence**: `ResumeAnalysis`
7. **AI Assistant**: `ChatSession`, `ChatMessage`

## Commands
```bash
# Validate database schema
npx prisma validate

# Push schema changes to database
npx prisma db push

# Seed initial career catalog, skills, and questions
npx prisma db seed
```
