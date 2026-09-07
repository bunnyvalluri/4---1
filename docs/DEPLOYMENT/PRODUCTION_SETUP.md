# 🏭 Production Setup & Host Hardening

## 1. Production Architecture Overview
- **Reverse Proxy**: Nginx handling TLS termination (Let's Encrypt / Certbot), HTTP/2, and gzip compression.
- **Backend Application**: Uvicorn running FastAPI behind Gunicorn process manager:
  ```bash
  gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
  ```
- **Frontend Application**: Next.js Node.js server or standalone output running on port 3000.
