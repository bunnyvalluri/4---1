# 🎯 Recommendations API Reference

Powers the core ML recommendation engine, computing personalized fit scores across career targets.

## 1. Get Cached Recommendations
- **Endpoint**: `GET /api/v1/recommendations`
- **Access**: Authenticated
- **Response** (`200 OK`): List of ranked career recommendations for current user.

---

## 2. Re-compute Recommendations
- **Endpoint**: `POST /api/v1/recommendations/generate`
- **Access**: Authenticated
- **Response** (`200 OK`):
  ```json
  [
    {
      "career_id": "car_cloud_arch",
      "career_title": "Cloud Solutions Architect",
      "match_score": 91.4,
      "breakdown": {
        "skill_score": 88.0,
        "aptitude_score": 92.5,
        "interest_score": 95.0,
        "experience_score": 90.0
      },
      "matching_skills": [
        {"name": "Docker", "user_proficiency": 4, "required_proficiency": 4}
      ],
      "missing_skills": [
        {"name": "Kubernetes", "user_proficiency": 2, "required_proficiency": 4}
      ]
    }
  ]
  ```
