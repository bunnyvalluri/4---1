# 🔐 Environment Variables Reference

## 1. Backend Environment Configuration (`backend/.env`)

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PROJECT_NAME` | String | `AI Career Guidance Backend` | API title in Swagger docs |
| `API_V1_STR` | String | `/api/v1` | URL prefix for REST endpoints |
| `HOST` | String | `0.0.0.0` | Bind host address |
| `PORT` | Integer | `8000` | Port for ASGI server |
| `ENVIRONMENT` | String | `development` | `development`, `staging`, or `production` |
| `DEBUG` | Boolean | `true` | Enables detailed stack traces |
| `SECRET_KEY` | String | *Required in prod* | Secret key for signing JWT tokens |
| `ALGORITHM` | String | `HS256` | Cryptographic JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Integer | `1440` (24h) | Token validity window |
| `DATABASE_URL` | String | `sqlite+aiosqlite:///./career_guidance.db` | PostgreSQL or SQLite connection string |
| `REDIS_URL` | String | `redis://localhost:6379/0` | Cache and broker instance |
| `GEMINI_API_KEY` | String | `""` | Optional Google Gemini 1.5 Flash API Key |
| `OPENAI_API_KEY` | String | `""` | Optional OpenAI GPT-4o API Key |
| `CORS_ORIGINS` | JSON Array | `["http://localhost:3000"]` | Permitted cross-origin hosts |

---

## 2. Frontend Environment Configuration (`frontend/.env.local`)

| Variable | Default Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Target FastAPI backend endpoint |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Host URL for social shares and redirects |
