# 🌐 CareerAI REST API Specifications

The CareerAI platform exposes a high-performance RESTful API powered by **Python 3.12+ FastAPI**. All endpoints are versioned under `/api/v1` and adhere to modern OpenAPI 3.1 specifications.

---

## 🧭 Global Endpoints Directory

| Resource | Base Path | Description |
| :--- | :--- | :--- |
| [Authentication](./AUTH.md) | `/api/v1/auth` | User registration, login, JWT token issuance |
| [Users](./USERS.md) | `/api/v1/users` | User management and role governance |
| [Profile](./PROFILE.md) | `/api/v1/profile` | Candidate profile, education, links |
| [Assessments](./ASSESSMENTS.md) | `/api/v1/assessment` | Aptitude diagnostic questions and scoring |
| [Careers](./CAREERS.md) | `/api/v1/careers` | Career taxonomy, prerequisites, salaries |
| [Recommendations](./RECOMMENDATIONS.md) | `/api/v1/recommendations` | Multi-factor ML career suitability rankings |
| [Skill Gap](./SKILL_GAP.md) | `/api/v1/recommendations/skill-gaps` | Severity-graded missing skill analysis |
| [Roadmap](./ROADMAP.md) | `/api/v1/roadmap` | Personalized 6-month milestone curricula |
| [Projects](./PROJECTS.md) | `/api/v1/projects` | Tailored portfolio capstone projects |
| [Resume](./RESUME.md) | `/api/v1/resume` | PyMuPDF ATS audit, keyword density |
| [AI Assistant](./AI_ASSISTANT.md) | `/api/v1/assistant` | Gemini career consultation & SSE streams |
| [Notifications](./NOTIFICATIONS.md) | `/api/v1/notifications` | User notifications and status updates |
| [Admin](./ADMIN.md) | `/api/v1/admin` | Platform analytics and telemetry metrics |

---

## 🔒 Authentication Standard
All protected endpoints require an HTTP `Authorization` header containing a valid Bearer token:
```http
Authorization: Bearer <jwt_access_token>
```
Tokens are signed using `HS256` with a standard 24-hour expiration window.

---

## 📦 Standard Error Responses
All API errors return standardized JSON envelopes:
```json
{
  "detail": "Descriptive error message indicating reason for failure"
}
```

| HTTP Code | Meaning | Example |
| :--- | :--- | :--- |
| `400 Bad Request` | Malformed payload or validation error | Invalid email syntax |
| `401 Unauthorized`| Missing or invalid JWT Bearer token | Expired token |
| `403 Forbidden` | Insufficient role permissions | Non-admin accessing telemetry |
| `404 Not Found` | Requested entity does not exist | Career slug not found |
| `422 Unprocessable`| Pydantic schema validation failure | Missing required body attribute |
