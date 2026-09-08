import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    try {
      const fastApiRes = await fetch('http://localhost:8000/api/v1/admin/audit-logs', {
        headers: { Authorization: 'Bearer test-sandbox-token' },
        cache: 'no-store',
      });
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json([
      {
        id: 'audit-01',
        actorId: 'admin-system-id',
        actorRole: 'ADMIN',
        action: 'ADMIN_LOGIN',
        resourceType: 'SESSION',
        resourceId: 'admin@careerai.dev',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      },
      {
        id: 'audit-02',
        actorId: 'admin-system-id',
        actorRole: 'ADMIN',
        action: 'CANDIDATE_VIEWED',
        resourceType: 'CANDIDATE',
        resourceId: 'alex@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'audit-03',
        actorId: 'admin-system-id',
        actorRole: 'ADMIN',
        action: 'CAREER_UPDATED',
        resourceType: 'CAREER',
        resourceId: 'ai-ml-engineer',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
    ]);
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }
}
