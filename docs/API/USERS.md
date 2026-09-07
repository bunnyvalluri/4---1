# 👤 Users API Reference

Provides user administration, role assignment, and directory queries.

## 1. List Users (Admin Only)
- **Endpoint**: `GET /api/v1/users`
- **Access**: Admin Role
- **Query Parameters**:
  - `skip` (int, default: 0)
  - `limit` (int, default: 20)
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": "cuid_user_123",
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "role": "USER",
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ]
  ```

---

## 2. Update User Role
- **Endpoint**: `PUT /api/v1/users/{user_id}/role`
- **Access**: Admin Role
- **Request Body**:
  ```json
  {
    "role": "ADMIN"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "id": "cuid_user_123",
    "role": "ADMIN",
    "updatedAt": "2026-03-01T12:00:00Z"
  }
  ```
