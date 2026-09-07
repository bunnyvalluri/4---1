# 🔔 Notifications API Reference

Manages candidate system notifications, roadmap reminders, and assessment alerts.

## 1. Get User Notifications
- **Endpoint**: `GET /api/v1/notifications`
- **Access**: Authenticated
- **Query Parameters**:
  - `unread_only` (bool, default: false)
- **Response** (`200 OK`): List of notifications.

---

## 2. Mark Notification as Read
- **Endpoint**: `PATCH /api/v1/notifications/{notification_id}/read`
- **Access**: Authenticated
- **Response** (`200 OK`):
  ```json
  {
    "id": "notif_123",
    "read": true
  }
  ```
