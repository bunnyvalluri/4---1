# 🗺️ Roadmap API Reference

Synthesizes dynamic 6-month learning paths and tracks milestone task completion.

## 1. Generate Learning Roadmap
- **Endpoint**: `POST /api/v1/roadmap/generate`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "career_id": "car_cloud_arch",
    "duration_months": 6
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "roadmap_id": "rdm_555",
    "career_title": "Cloud Solutions Architect",
    "duration_months": 6,
    "items": [
      {
        "id": "item_m1",
        "month": 1,
        "title": "Core Foundations & Syntax Mastery",
        "description": "Deep dive into core languages, standard libraries, and Linux systems.",
        "tasks": [
          {"id": "t1", "text": "Set up a modern linting and typechecking workflow", "done": false},
          {"id": "t2", "text": "Solve 15 foundational algorithm problems", "done": false}
        ]
      }
    ]
  }
  ```

---

## 2. Update Milestone Task Status
- **Endpoint**: `PATCH /api/v1/roadmap/items/{item_id}`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "task_id": "t1",
    "completed": true
  }
  ```
- **Response** (`200 OK`): Updated item entity with progress percentage.
