# 💼 Careers API Reference

Retrieves curated career profiles, required competencies, salary projections, and market growth forecasts.

## 1. List Career Catalog
- **Endpoint**: `GET /api/v1/careers`
- **Access**: Public / Authenticated
- **Query Parameters**:
  - `search` (string)
  - `industry` (string)
  - `experience_level` (string: `ENTRY`, `MID`, `SENIOR`)
- **Response** (`200 OK`): Array of career summaries.

---

## 2. Get Career By Slug
- **Endpoint**: `GET /api/v1/careers/slug/{slug}`
- **Access**: Public / Authenticated
- **Example**: `GET /api/v1/careers/slug/cloud-solutions-architect`
- **Response** (`200 OK`):
  ```json
  {
    "id": "car_cloud_arch",
    "title": "Cloud Solutions Architect",
    "slug": "cloud-solutions-architect",
    "overview": "Architects resilient, multi-region cloud infrastructures using container orchestration and microservices.",
    "averageSalary": "$145,000 - $185,000",
    "growthRate": "+22% (Next 5 Years)",
    "skills": [
      {"name": "Docker", "min_proficiency": 4, "is_required": true, "weight": 1.2},
      {"name": "Kubernetes", "min_proficiency": 4, "is_required": true, "weight": 1.5},
      {"name": "AWS", "min_proficiency": 4, "is_required": true, "weight": 1.4}
    ]
  }
  ```
