# 🚀 Projects API Reference

Provides curated, resume-worthy capstone project suggestions to prove competency in target careers.

## 1. List Project Recommendations
- **Endpoint**: `GET /api/v1/projects`
- **Access**: Authenticated
- **Query Parameters**:
  - `career_id` (optional string)
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "proj_01",
      "title": "High-Throughput Distributed Rate Limiter",
      "difficulty": "ADVANCED",
      "tech_stack": ["FastAPI", "Redis", "Docker", "Prometheus"],
      "learning_objectives": [
        "Implement Token Bucket and Leaky Bucket algorithms in Redis Lua scripts",
        "Benchmark throughput under 10,000 requests/sec with Locust"
      ],
      "estimated_hours": 35
    }
  ]
  ```
