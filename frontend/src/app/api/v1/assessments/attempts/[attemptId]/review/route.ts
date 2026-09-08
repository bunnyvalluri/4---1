import { NextRequest, NextResponse } from 'next/server';

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

    const res = await fetch(`${FASTAPI_URL}/api/v1/assessments/attempts/${attemptId}/review`, {
      headers,
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    attempt_id: attemptId,
    total_questions: 25,
    answered_count: 0,
    unanswered_count: 25,
    flagged_count: 0,
    section_summary: {
      LOGICAL: { answered: 0, total: 5 },
      QUANTITATIVE: { answered: 0, total: 5 },
      VERBAL: { answered: 0, total: 5 },
      ANALYTICAL: { answered: 0, total: 5 },
      PROBLEM_SOLVING: { answered: 0, total: 5 },
    },
    questions: [],
  });
}
