# 🧠 Assessments API Reference

Serves the psychometric question bank and evaluates cognitive diagnostic submissions across 5 distinct axes.

## 1. Fetch Diagnostic Questions
- **Endpoint**: `GET /api/v1/assessment/questions`
- **Access**: Authenticated
- **Query Parameters**:
  - `category` (optional enum: `LOGICAL`, `QUANTITATIVE`, `VERBAL`, `ANALYTICAL`, `PROBLEM_SOLVING`)
  - `limit` (int, default: 25, max: 50)
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "q_log_01",
      "question": "If all Microservices are Distributed and some Distributed systems are Fault-tolerant, which conclusion follows?",
      "category": "LOGICAL",
      "difficulty": "MEDIUM",
      "options": [
        {"id": "A", "text": "All microservices are fault-tolerant"},
        {"id": "B", "text": "Some microservices may be fault-tolerant"},
        {"id": "C", "text": "No microservices are fault-tolerant"},
        {"id": "D", "text": "None of the above"}
      ]
    }
  ]
  ```

---

## 2. Submit Assessment Answers
- **Endpoint**: `POST /api/v1/assessment/submit`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "answers": {
      "q_log_01": "B",
      "q_quant_02": "C"
    },
    "duration_seconds": 1420
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "attempt_id": "att_987",
    "overall_score": 84.5,
    "category_scores": {
      "LOGICAL": 90.0,
      "QUANTITATIVE": 80.0,
      "ANALYTICAL": 85.0,
      "VERBAL": 82.0,
      "PROBLEM_SOLVING": 86.0
    },
    "percentile": 88.2,
    "completedAt": "2026-03-01T11:30:00Z"
  }
  ```
