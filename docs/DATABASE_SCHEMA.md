# CareerAI Database Schema & Relational Models

## Database Configuration
- **Database**: PostgreSQL
- **ORM**: Prisma Client (`@prisma/client`)
- **Schema File**: `database/schema.prisma`
- **Seed File**: `database/seed.ts`

## Relational Models
1. **User**: Candidate authentication, bcrypt salted password hash, role (`USER` or `ADMIN`).
2. **Profile**: Degree, branch, college, graduation year, CGPA, experience, target roles, location, bio.
3. **Skill**: Technical, Soft, Tool, Framework, Database, and Cloud skills.
4. **UserSkill**: Many-to-many relationship mapping candidate verified skills and proficiency levels (1-5).
5. **Career**: Active tech career tracks (overview, description, education reqs, salary range, demand level).
6. **CareerSkill**: Many-to-many relationship mapping required/preferred skills to career tracks with importance weights.
7. **AptitudeQuestion**: Cognitive diagnostic questions across 5 categories (Logical, Quantitative, Verbal, Analytical, Problem Solving).
8. **AptitudeAttempt**: Candidate test submissions with category percentage breakdown and overall aptitude score.
9. **CareerRecommendation**: Hybrid ML recommendations with match score, reasoning, and 7-factor breakdown.
10. **SkillGap**: Detected skill gaps with severity level and recommended resources.
11. **Roadmap & RoadmapItem**: Interactive 6-month milestone learning plan with task completion tracking.
12. **ResumeAnalysis**: ATS compatibility score (0-100), extracted skills, missing skills, and weak bullet-point enhancements.
13. **ChatSession & ChatMessage**: Persistent conversation history with Aura AI Assistant.
