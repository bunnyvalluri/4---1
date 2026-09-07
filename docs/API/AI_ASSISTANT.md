# 🤖 AI Assistant API Reference

Interactive conversational career advisor supporting both standard JSON requests and Server-Sent Events (SSE).

## 1. Standard Synchronous Message
- **Endpoint**: `POST /api/v1/assistant/message`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "message": "How should I structure my backend engineering resume for senior roles?"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "response": "For senior roles, prioritize system design complexity and measurable business outcomes...",
    "session_id": "sess_888"
  }
  ```

---

## 2. Server-Sent Events (SSE) Streaming
- **Endpoint**: `POST /api/v1/assistant/message/stream`
- **Access**: Authenticated
- **Headers**:
  ```http
  Accept: text/event-stream
  ```
- **Stream Output**:
  ```text
  data: {"chunk": "For "}
  data: {"chunk": "senior roles, "}
  data: {"chunk": "focus on "}
  data: {"chunk": "[DONE]"}
  ```
