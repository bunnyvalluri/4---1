import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connected event to notify useCareerEvents hook
      const initialPayload = JSON.stringify({
        status: 'connected',
        engine: 'CareerAI Real-Time Engine (Neon DB + SSE)',
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`event: system.connected\ndata: ${initialPayload}\n\n`));

      // 2. Periodic keep-alive ping every 15 seconds to prevent browser or proxy timeout
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
