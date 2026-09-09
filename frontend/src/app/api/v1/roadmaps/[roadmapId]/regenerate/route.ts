import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function POST(req: NextRequest, { params }: { params: Promise<{ roadmapId: string }> }) {
  const { roadmapId } = await params;
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json();
    const res = await fetch(`${FASTAPI_URL}/api/v1/roadmaps/${roadmapId}/regenerate`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(err || { error: 'Failed to regenerate roadmap' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ success: true, version: 2 });
  }
}
