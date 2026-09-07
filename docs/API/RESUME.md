# 📄 Resume Intelligence API Reference

Handles PDF/DOCX document uploads, PyMuPDF text extraction, and comprehensive ATS readability audits.

## 1. Upload & Audit Resume
- **Endpoint**: `POST /api/v1/resume/upload`
- **Access**: Authenticated
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Resume document (`.pdf`, `.docx`, max 10MB)
  - `career_id` (optional string): Target career path for skill extraction comparison
- **Response** (`200 OK`):
  ```json
  {
    "ats_score": 86.5,
    "summary": "Strong technical background with solid metric-driven accomplishments.",
    "extracted_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
    "missing_skills": ["Kubernetes", "Redis", "Kafka"],
    "formatting_issues": [],
    "weak_bullet_points": [
      {
        "original": "Worked on the backend API database queries.",
        "suggestion": "Engineered optimized backend SQL queries, accelerating response latency by 35%."
      }
    ],
    "recommendations": [
      "Add quantifiable throughput metrics to project bullet points.",
      "Integrate missing target keywords: Kubernetes, Redis."
    ]
  }
  ```
