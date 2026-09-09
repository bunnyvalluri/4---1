import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const authHeader = req.headers.get('authorization') || '';
    const fastApiRes = await fetch(`${BACKEND_URL}/api/v1/admin/audit-logs`, {
      headers: authHeader ? { Authorization: authHeader } : {},
      cache: 'no-store',
    });

    if (fastApiRes.ok) {
      const data = await fastApiRes.json();
      return NextResponse.json(data);
    }

    // Return real empty array if no audit records exist yet
    return NextResponse.json([]);
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Audit logs API error:', error);
    return NextResponse.json({ error: 'Failed to load audit logs.' }, { status: 500 });
  }
}
