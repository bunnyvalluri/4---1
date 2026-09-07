# 🛡️ Admin API Reference

Provides system telemetry, user growth statistics, assessment distributions, and career metrics.

## 1. Platform Telemetry Metrics
- **Endpoint**: `GET /api/v1/admin/metrics`
- **Access**: Admin Role Only (`role == ADMIN`)
- **Response** (`200 OK`):
  ```json
  {
    "total_users": 1420,
    "total_assessments_taken": 3150,
    "average_assessment_score": 76.4,
    "total_resumes_analyzed": 980,
    "top_recommended_careers": [
      {"career": "Cloud Solutions Architect", "count": 482},
      {"career": "Full Stack Engineer", "count": 395}
    ],
    "system_health": {
      "db_latency_ms": 4.2,
      "uptime_seconds": 864000
    }
  }
  ```
