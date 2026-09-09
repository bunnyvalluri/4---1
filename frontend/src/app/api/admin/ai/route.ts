import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const authHeader = req.headers.get('authorization');

    try {
      const fastApiRes = await fetch(`${FASTAPI_URL}/api/v1/admin/ai`, {
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        cache: 'no-store',
      });
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn('Backend admin AI endpoint unavailable:', e);
    }

    return NextResponse.json({
      total_requests: 0,
      successful_responses: 0,
      failed_requests: 0,
      success_rate: 0,
      average_latency_ms: 0,
      active_models: [
        {
          name: 'gemini-2.5-flash',
          provider: 'Google Generative AI',
          role: 'Primary Reasoning & Guidance',
          status: 'STANDBY',
          latency_ms: 0,
        },
        {
          name: 'text-embedding-004',
          provider: 'Google Embeddings',
          role: 'Vector Match & Skill Similarity',
          status: 'STANDBY',
          latency_ms: 0,
        },
        {
          name: 'rule-engine-v1',
          provider: 'Local Fallback Scorer',
          role: 'High-Availability Offline Fallback',
          status: 'OPERATIONAL',
          latency_ms: 0,
        },
      ],
      recent_errors: [],
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
