# 💓 Health Checks & Liveness Probes

## 1. Liveness Probe
- **Endpoint**: `GET /api/v1/health`
- **Purpose**: Checks if ASGI web process is active and accepting connections.
- **Response** (`200 OK`):
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "production"
  }
  ```

## 2. Readiness Probe
- Verifies active database connection pool before routing ingress traffic.
