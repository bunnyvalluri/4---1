# 📚 CareerAI Documentation Hub

Welcome to the central technical documentation repository for **CareerAI: AI-Powered Career Guidance & Skill Roadmap Platform**.

CareerAI is an enterprise-grade career intelligence ecosystem featuring a **100% Python ASGI backend** (FastAPI, SQLAlchemy 2.0 Async, Scikit-Learn, PyMuPDF) coupled with a modern **Next.js 15 App Router / TypeScript** frontend.

---

## 🧭 Documentation Index

### 1. General & Architecture
- [Project Overview](./PROJECT_OVERVIEW.md) — Mission, value proposition, core pillars, and high-level platform summary.
- [Requirements](./REQUIREMENTS.md) — Functional and non-functional requirements, user personas, and acceptance criteria.
- [System Architecture](./SYSTEM_ARCHITECTURE.md) — Complete multi-tier architecture, dataflow, subsystems, and component interactions.
- [Architecture Decisions (ADRs)](./ARCHITECTURE_DECISIONS.md) — Key technical decisions, trade-offs, and rationale (e.g. 100% Python backend, asyncpg, SSE).
- [Tech Stack](./TECH_STACK.md) — Exhaustive inventory of languages, frameworks, libraries, databases, and infrastructure tools.
- [Project Structure](./PROJECT_STRUCTURE.md) — File tree breakdown across frontend, backend, database, and scripts.

### 2. Engineering & Development
- [Development Setup](./DEVELOPMENT_SETUP.md) — Step-by-step local workstation installation and onboarding guide.
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) — Comprehensive configuration reference for development, staging, and production.
- [Local Development](./LOCAL_DEVELOPMENT.md) — Day-to-day workflow, hot reload, debugging, seeding, and tooling tips.
- [Contributing Guidelines](./CONTRIBUTING.md) — Branching strategies, pull request processes, code review standards.
- [Code Standards](./CODE_STANDARDS.md) — Formatting, linting (Ruff, ESLint), typing conventions, and clean architecture principles.

### 3. Data & Persistence
- [Database Overview](./DATABASE.md) — PostgreSQL architecture, connection pooling, and ORM integration.
- [Database Schema](./DATABASE_SCHEMA.md) — 12 relational entities, tables, attributes, keys, and indexes.
- [Database Migrations](./DATABASE_MIGRATIONS.md) — Migration workflows, Alembic & Prisma strategies, zero-downtime guidelines.

### 4. API Documentation
- [API Index & Overview](./API/README.md) — RESTful conventions, authentication headers, error codes, and rate limiting.
- Endpoints: [Auth](./API/AUTH.md) | [Users](./API/USERS.md) | [Profile](./API/PROFILE.md) | [Assessments](./API/ASSESSMENTS.md) | [Careers](./API/CAREERS.md) | [Recommendations](./API/RECOMMENDATIONS.md) | [Skill Gap](./API/SKILL_GAP.md) | [Roadmap](./API/ROADMAP.md) | [Projects](./API/PROJECTS.md) | [Resume](./API/RESUME.md) | [AI Assistant](./API/AI_ASSISTANT.md) | [Notifications](./API/NOTIFICATIONS.md) | [Admin](./API/ADMIN.md)

### 5. Artificial Intelligence & Machine Learning
- [AI Architecture & Engine](./AI/README.md) — AI subsystem overview, agent workflows, and Gemini LLM integration.
- Engines: [Career Recommendation](./AI/CAREER_RECOMMENDATION_ENGINE.md) | [Skill Gap Engine](./AI/SKILL_GAP_ENGINE.md) | [Roadmap Engine](./AI/ROADMAP_ENGINE.md) | [Resume Analysis](./AI/RESUME_ANALYSIS.md) | [Project Recommendation](./AI/PROJECT_RECOMMENDATION.md) | [AI Assistant](./AI/AI_ASSISTANT.md)
- Governance: [Prompt Engineering](./AI/PROMPT_ENGINEERING.md) | [AI Safety & Guardrails](./AI/AI_SAFETY.md) | [AI Evaluation & Benchmarking](./AI/AI_EVALUATION.md)
- Machine Learning: [ML Architecture](./ML/README.md) | [Feature Matrix](./ML/FEATURES.md) | [Feature Engineering](./ML/FEATURE_ENGINEERING.md) | [Scoring Model](./ML/SCORING_MODEL.md) | [Model Evaluation](./ML/MODEL_EVALUATION.md) | [Future ML Improvements](./ML/FUTURE_ML_IMPROVEMENTS.md)

### 6. Security, Testing & DevOps
- [Security Suite](./SECURITY/SECURITY_OVERVIEW.md) — [Authentication](./SECURITY/AUTHENTICATION.md), [Authorization & RBAC](./SECURITY/AUTHORIZATION.md), [API Security](./SECURITY/API_SECURITY.md), [File Upload Audit](./SECURITY/FILE_UPLOAD_SECURITY.md), [AI Security](./SECURITY/AI_SECURITY.md), [Data Privacy & GDPR](./SECURITY/DATA_PRIVACY.md), [Checklist](./SECURITY/SECURITY_CHECKLIST.md)
- [Testing Suite](./TESTING/TESTING_STRATEGY.md) — [Unit Tests](./TESTING/UNIT_TESTING.md), [Integration Tests](./TESTING/INTEGRATION_TESTING.md), [API Tests](./TESTING/API_TESTING.md), [AI Benchmarks](./TESTING/AI_TESTING.md), [Security Tests](./TESTING/SECURITY_TESTING.md), [E2E Tests](./TESTING/E2E_TESTING.md)
- [Deployment & Cloud](./DEPLOYMENT/DEPLOYMENT_GUIDE.md) — [Production Setup](./DEPLOYMENT/PRODUCTION_SETUP.md), [Docker](./DEPLOYMENT/DOCKER.md), [Database Deployment](./DEPLOYMENT/DATABASE_DEPLOYMENT.md), [CI/CD](./DEPLOYMENT/CI_CD.md), [Monitoring](./DEPLOYMENT/MONITORING.md), [Logging](./DEPLOYMENT/LOGGING.md), [Backup](./DEPLOYMENT/BACKUP_AND_RECOVERY.md), [Rollback](./DEPLOYMENT/ROLLBACK.md)
- [Operations Guide](./OPERATIONS/OPERATIONS_GUIDE.md) — [Health Checks](./OPERATIONS/HEALTH_CHECKS.md), [Troubleshooting](./OPERATIONS/TROUBLESHOOTING.md), [Incident Response](./OPERATIONS/INCIDENT_RESPONSE.md), [Maintenance](./OPERATIONS/MAINTENANCE.md)

### 7. User Guides & Architecture Diagrams
- [Candidate User Guide](./USER_GUIDES/USER_GUIDE.md) | [Admin Guide](./USER_GUIDES/ADMIN_GUIDE.md) | [Assessment Guide](./USER_GUIDES/ASSESSMENT_GUIDE.md) | [Resume Guide](./USER_GUIDES/RESUME_GUIDE.md) | [AI Assistant Guide](./USER_GUIDES/AI_ASSISTANT_GUIDE.md)
- [Visual Architecture Diagrams](./diagrams/system-architecture.md) — [System Architecture](./diagrams/system-architecture.md), [Database ER](./diagrams/database-er.md), [Auth Flow](./diagrams/authentication-flow.md), [Recommendation Flow](./diagrams/recommendation-flow.md), [Resume Analysis Flow](./diagrams/resume-analysis-flow.md), [AI Assistant Flow](./diagrams/ai-assistant-flow.md), [Deployment Architecture](./diagrams/deployment-architecture.md)
