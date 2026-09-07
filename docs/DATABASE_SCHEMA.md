# 📊 Complete Database Schema Reference

The platform contains **12 Relational Entities** in the persistence layer.

## 1. Entity Overview

| Table Name | Model Class | Primary Function |
| :--- | :--- | :--- |
| `users` | `User` | User accounts, password hashes, roles |
| `profiles` | `Profile` | Academic history, preferences, LinkedIn/GitHub links |
| `skills` | `Skill` | Master taxonomy of skills and categories |
| `user_skills` | `UserSkill` | Candidate self-assessed proficiency ratings (1–5) |
| `careers` | `Career` | Career profiles, salary data, industry tags |
| `career_skills` | `CareerSkill` | Skill prerequisites and minimum proficiencies |
| `aptitude_questions`| `AptitudeQuestion`| Diagnostic question bank across 5 categories |
| `aptitude_attempts` | `AptitudeAttempt` | Candidate assessment test submissions and scores |
| `career_recommendations` | `CareerRecommendation` | Computed multi-factor match results |
| `skill_gaps` | `SkillGap` | Identified skill deficits and severity ratings |
| `roadmaps` & `roadmap_items` | `Roadmap` / `RoadmapItem` | 6-month customized curricula & checklists |
| `resume_analyses` | `ResumeAnalysis` | Parsed resume text, ATS score, formatting issues |
| `chat_sessions` & `chat_messages` | `ChatSession` / `ChatMessage` | AI Assistant consultation history |
| `notifications` | `Notification` | In-app user notifications and system alerts |

---

## 2. Key Foreign Key Relationships
- `User.profile` $\leftrightarrow$ `Profile.user_id` (1-to-1, `onDelete: Cascade`)
- `User.skills` $\leftrightarrow$ `UserSkill.user_id` (1-to-Many)
- `Career.skills` $\leftrightarrow$ `CareerSkill.career_id` (1-to-Many)
- `Roadmap.items` $\leftrightarrow$ `RoadmapItem.roadmap_id` (1-to-Many)
- `ChatSession.messages` $\leftrightarrow$ `ChatMessage.session_id` (1-to-Many)
