# 🤖 AI Career Assistant Architecture

## 1. Overview
The AI Assistant (`backend/app/ai/career_assistant.py`) provides real-time conversational career guidance, interview preparation strategies, and resume critique.

---

## 2. Server-Sent Events (SSE) Streaming
The assistant streams responses via `/api/v1/assistant/message/stream`:
```python
async def stream_response(messages, user_context):
    full_text = await get_response(messages, user_context)
    words = full_text.split(" ")
    for i in range(0, len(words), 3):
        chunk = " ".join(words[i : i + 3]) + " "
        yield chunk
        await asyncio.sleep(0.03)
```
