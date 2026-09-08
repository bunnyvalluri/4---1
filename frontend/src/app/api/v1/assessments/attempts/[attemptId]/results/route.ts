import { NextRequest, NextResponse } from 'next/server';
import { evaluateSubmission } from '@/lib/assessmentFallback';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;

  try {
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(`${FASTAPI_URL}/api/v1/assessments/attempts/${attemptId}/results`, {
      headers,
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  const evaluated = evaluateSubmission({}, 180);
  return NextResponse.json({ ...evaluated, id: attemptId });
}
