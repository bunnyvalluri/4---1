import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

async function forwardRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path ? resolvedParams.path.join('/') : '';
  const search = req.nextUrl.search;
  const targetUrl = `${FASTAPI_URL}/api/v1/${path}${search}`;

  const headers = new Headers(req.headers);
  headers.delete('host');

  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = null;

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (contentType.includes('multipart/form-data')) {
        body = await req.formData();
      } else if (contentType.includes('application/json')) {
        body = await req.text();
      } else {
        body = await req.arrayBuffer();
      }
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: contentType.includes('multipart/form-data') ? undefined : headers,
      body: body,
      cache: 'no-store',
    };

    // If it's multipart, don't set Content-Type so fetch sets boundary automatically
    if (contentType.includes('multipart/form-data') && body instanceof FormData) {
      const forwardedHeaders = new Headers();
      const authHeader = req.headers.get('authorization');
      if (authHeader) forwardedHeaders.set('authorization', authHeader);
      fetchOptions.headers = forwardedHeaders;
      fetchOptions.body = body;
    }

    const response = await fetch(targetUrl, fetchOptions);

    // If response is SSE event stream, stream it back directly
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    const data = await response.arrayBuffer();
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch (err: any) {
    console.error(`[FastAPI Proxy Error] ${req.method} ${targetUrl}:`, err.message);
    return NextResponse.json({ error: 'Backend service communication failure', detail: err.message }, { status: 502 });
  }
}

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const DELETE = forwardRequest;
