import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || 'Bearer test-sandbox-token';
    const res = await fetch(`${FASTAPI_URL}/api/v1/roadmaps`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Failed to fetch roadmaps' }, { status: res.status });
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
