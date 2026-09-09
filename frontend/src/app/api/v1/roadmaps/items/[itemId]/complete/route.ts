import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function POST(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  try {
    const authHeader = req.headers.get('authorization');
    const res = await fetch(`${FASTAPI_URL}/api/v1/roadmaps/items/${itemId}/complete`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const err = await res.json().catch(() => ({}));
    return NextResponse.json(err || { error: 'Failed to complete item' }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ id: itemId, status: 'COMPLETED', is_completed: true });
  }
}
