import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

async function forwardRequest(req: NextRequest, slug: string[], method: string) {
  try {
    const authHeader = req.headers.get('authorization') || 'Bearer test-sandbox-token';
    const subpath = slug.join('/');
    const url = new URL(req.url);
    const queryString = url.search;

    const targetUrl = `${FASTAPI_URL}/api/v1/projects/${subpath}${queryString}`;

    let body: any = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await req.text();
      } catch {
        body = undefined;
      }
    }

    const res = await fetch(targetUrl, {
      method,
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: body && body.length > 0 ? body : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      const text = await res.text();
      return new NextResponse(text, { status: res.status });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gateway error' }, { status: 502 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return forwardRequest(req, slug, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return forwardRequest(req, slug, 'POST');
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return forwardRequest(req, slug, 'DELETE');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return forwardRequest(req, slug, 'PATCH');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return forwardRequest(req, slug, 'PUT');
}
