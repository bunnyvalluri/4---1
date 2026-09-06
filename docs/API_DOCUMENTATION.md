# CareerAI API Reference

All endpoints return JSON and use standard HTTP status codes. Authenticated endpoints require a valid JWT cookie or `Authorization: Bearer <token>` header.

## Authentication Endpoints
- `POST /api/auth/register`: Register new candidate (`name`, `email`, `password`).
- `POST /api/auth/login`: Authenticate and receive signed JWT session token.
- `POST /api/auth/logout`: Clear authentication session cookie.
- `GET /api/auth/me`: Get current authenticated user profile and permissions.

## Career Recommendations & ML
- `GET /api/recommendations`: Trigger multi-factor hybrid recommendation engine (invokes Python scikit-learn model via IPC bridge).
- `GET /api/careers`: List all active tech career tracks.
- `GET /api/careers/[slug]`: Retrieve deep-dive career details, required skills, and benchmark prerequisites.

## Assessment & Diagnostics
- `GET /api/assessment/questions`: Retrieve cognitive aptitude questions (without leaking correct answers).
- `POST /api/assessment/submit`: Submit test answers; computes category percentages (Logical, Quantitative, Verbal, Analytical, Problem Solving).

## Learning Roadmap
- `GET /api/roadmap`: Retrieve personalized 6-month learning roadmap.
- `POST /api/roadmap/task`: Toggle milestone task completion status and recalculate progress percentage.

## Resume Intelligence
- `POST /api/resume/analyze`: Upload PDF/DOCX resume for ATS parsing, keyword extraction, and bullet-point optimization.
- `GET /api/resume/history`: Retrieve past resume analysis scans.

## AI Assistant & RAG
- `POST /api/assistant/chat`: Interact with Aura AI Career Advisor (uses RAG vector search over career catalog with explicit citations).

## Administrative Portal
- `GET /api/admin/analytics`: Aggregated platform telemetry, top matches, and system health.
- `GET /api/admin/users`: Search candidate directory.
- `PATCH /api/admin/users`: Elevate/demote user access roles (`USER` <-> `ADMIN`).
- `POST /api/admin/careers`: Provision new career tracks.
- `GET /api/admin/skills`: Query skill taxonomy with demand weighting.
- `POST /api/admin/questions`: Add diagnostic questions to cognitive assessment bank.
