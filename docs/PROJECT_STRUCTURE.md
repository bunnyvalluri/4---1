# 📂 Complete Project Structure

```
c:/4-1/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint & middleware
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic BaseSettings environment config
│   │   │   ├── security.py             # Bcrypt hashing & JWT token handling
│   │   │   ├── logging.py              # Structured logging configuration
│   │   │   └── exceptions.py           # Global HTTP exception handlers
│   │   ├── db/
│   │   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   │   └── database.py             # Async engine & sessionmaker generator
│   │   ├── models/                     # 12 SQLAlchemy ORM Relational Models
│   │   │   ├── user.py                 # User and Role models
│   │   │   ├── profile.py              # Extended candidate profile
│   │   │   ├── education.py            # Academic credentials
│   │   │   ├── skill.py                # Skills, categories & user ratings
│   │   │   ├── career.py               # Careers & required skill relations
│   │   │   ├── assessment.py           # Aptitude questions & attempts
│   │   │   ├── recommendation.py       # Career recommendations & skill gaps
│   │   │   ├── roadmap.py              # Curricula & milestone checklist items
│   │   │   ├── project.py              # Capstone project recommendations
│   │   │   ├── resume.py               # ATS audit results & extracted text
│   │   │   ├── chat.py                 # AI advisor sessions & messages
│   │   │   └── notification.py         # System alerts & notifications
│   │   ├── schemas/                    # Pydantic v2 Request/Response validation
│   │   ├── repositories/               # Decoupled database data access layer
│   │   ├── services/                   # Business domain services
│   │   ├── ml/                         # Multi-factor scoring & feature models
│   │   ├── ai/                         # PyMuPDF, Roadmap & AI Assistant engines
│   │   ├── workers/                    # Celery asynchronous tasks
│   │   ├── utils/                      # Text normalization and validators
│   │   └── api/
│   │       ├── router.py               # Central v1 router registry
│   │       └── v1/                     # 13 REST API Endpoint Controllers
│   ├── tests/                          # 11 passing async Pytest test modules
│   ├── scripts/                        # Database seeders (careers, skills, questions)
│   ├── requirements.txt                # Pinned backend dependencies
│   ├── Dockerfile                      # Production Docker container
│   └── README.md                       # Backend guide
├── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js 15 App Router pages
│   │   └── components/                 # Reusable UI component library
│   ├── package.json                    # Frontend dependencies & scripts
│   └── tailwind.config.js              # Theme configuration
├── database/
│   ├── schema.prisma                   # Canonical Prisma relational schema
│   └── seed.ts                         # Historical seed data source
├── docs/                               # 88 comprehensive system documentation files
└── README.md                           # Master platform README
```
