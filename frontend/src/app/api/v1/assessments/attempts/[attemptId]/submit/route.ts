import { NextRequest, NextResponse } from 'next/server';
import { evaluateSubmission } from '@/lib/assessmentFallback';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const { attemptId } = await params;
  let body: any = {};
  try {
    body = await req.json();
  } catch {}

  try {
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(`${FASTAPI_URL}/api/v1/assessments/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  // Fallback evaluation if FastAPI is offline
  const answers = body.answers
    ? Object.fromEntries(body.answers.map((a: any) => [a.question_id, a.selected_option]))
    : body.answers_data || {};

  const evaluated = evaluateSubmission(answers, body.time_spent_seconds || 180);
  return NextResponse.json({ ...evaluated, id: attemptId });
}
