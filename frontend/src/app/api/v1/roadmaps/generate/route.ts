import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/api/v1/roadmaps/generate`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        user_id: session?.userId,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(
      errData || { error: 'Failed to generate roadmap from career intelligence service.' },
      { status: res.status || 500 }
    );
  } catch (err) {
    console.error('Roadmap generate error:', err);
    return NextResponse.json(
      { error: 'Roadmap generation service is currently unavailable. Please retry shortly.' },
      { status: 503 }
    );
  }
}
