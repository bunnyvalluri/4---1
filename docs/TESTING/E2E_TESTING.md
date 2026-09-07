# 🏁 End-to-End Testing

Simulates the complete user lifecycle:
1. User registers via `POST /api/v1/auth/register`.
2. User updates profile and rates technical skills.
3. User completes aptitude assessment (`POST /api/v1/assessment/submit`).
4. System calculates recommendations (`POST /api/v1/recommendations/generate`).
5. User generates customized 6-month roadmap (`POST /api/v1/roadmap/generate`).
6. User completes milestone tasks and checks progress.

All steps execute synchronously in pytest suite under 2.5 seconds.
