import asyncio
import json
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Dict, Optional, Set
from app.core.logging import logger
from app.db.database import AsyncSessionLocal
from app.models.integration import CareerEvent


class EventHub:
    """
    Central event broker for real-time Server-Sent Events (SSE).
    Maintains per-user subscriber queues and persists CareerEvent records to Neon PostgreSQL.
    """
    _instance: Optional["EventHub"] = None

    def __new__(cls) -> "EventHub":
        if cls._instance is None:
            cls._instance = super(EventHub, cls).__new__(cls)
            cls._instance._subscribers = {}
            cls._instance._lock = asyncio.Lock()
        return cls._instance

    async def register(self, user_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        async with self._lock:
            if user_id not in self._subscribers:
                self._subscribers[user_id] = set()
            self._subscribers[user_id].add(queue)
            logger.info(f"[EventHub] Registered listener for user {user_id}. Total listeners: {len(self._subscribers[user_id])}")
        return queue

    async def unregister(self, user_id: str, queue: asyncio.Queue):
        async with self._lock:
            if user_id in self._subscribers:
                self._subscribers[user_id].discard(queue)
                if not self._subscribers[user_id]:
                    del self._subscribers[user_id]
            logger.info(f"[EventHub] Unregistered listener for user {user_id}")

    async def publish(
        self,
        user_id: str,
        event_type: str,
        payload: Dict[str, Any],
        persist: bool = False,
    ):
        event_data = {
            "event": event_type,
            "data": payload,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # 1. Persist to Neon PostgreSQL only if explicitly requested
        if persist:
            try:
                async with AsyncSessionLocal() as session:
                    career_event = CareerEvent(
                        user_id=user_id,
                        event_type=event_type,
                        payload=payload,
                    )
                    session.add(career_event)
                    await session.commit()
            except Exception as e:
                logger.warning(f"[EventHub] Could not persist CareerEvent to Neon DB: {e}")

        # 2. Dispatch to all active in-memory user queues
        async with self._lock:
            listeners = list(self._subscribers.get(user_id, set()))

        for queue in listeners:
            try:
                queue.put_nowait(event_data)
            except asyncio.QueueFull:
                logger.warning(f"[EventHub] Event queue full for user {user_id}, dropping event {event_type}")

        logger.info(f"[EventHub] Dispatched event '{event_type}' to {len(listeners)} listeners for user {user_id}")

    async def stream_events(self, user_id: str) -> AsyncGenerator[str, None]:
        """
        Yields formatted SSE strings for the connected user.
        Injects keepalive heartbeats every 15s to prevent connection dropouts.
        """
        queue = await self.register(user_id)
        try:
            # Yield initial connection confirmation
            welcome = {
                "event": "system.connected",
                "data": {"status": "connected", "userId": user_id},
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            yield f"event: system.connected\ndata: {json.dumps(welcome)}\n\n"

            while True:
                try:
                    event_data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    evt_name = event_data.get("event", "message")
                    data_json = json.dumps(event_data)
                    yield f"event: {evt_name}\ndata: {data_json}\n\n"
                except asyncio.TimeoutError:
                    # Send SSE heartbeat
                    yield ": ping\n\n"
        finally:
            await self.unregister(user_id, queue)


event_hub = EventHub()
