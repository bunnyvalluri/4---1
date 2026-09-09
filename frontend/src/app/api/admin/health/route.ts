import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const authHeader = req.headers.get('authorization') || '';
    const fastApiRes = await fetch(`${BACKEND_URL}/api/v1/admin/health`, {
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    if (fastApiRes.ok) {
      const data = await fastApiRes.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({
      status: 'DEGRADED',
      systems: {
        api: { status: 'DEGRADED', error: `Backend returned status ${fastApiRes.status}` },
        firebase_auth: { status: 'UNKNOWN' },
        firestore: { status: 'UNKNOWN' },
        storage: { status: 'UNKNOWN' },
        ai_service: { status: 'UNKNOWN' },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    return NextResponse.json({
      status: 'DEGRADED',
      systems: {
        api: { status: 'DEGRADED', error: 'Backend server connection failed or timed out.' },
        firebase_auth: { status: 'UNKNOWN' },
        firestore: { status: 'UNKNOWN' },
        storage: { status: 'UNKNOWN' },
        ai_service: { status: 'UNKNOWN' },
      },
      timestamp: new Date().toISOString(),
    });
  }
}
