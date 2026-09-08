import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(`${FASTAPI_URL}/api/v1/assessments/status`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // FastAPI unavailable
  }

  return NextResponse.json({
    status: 'NOT_STARTED',
    has_active_attempt: false,
    active_attempt_id: null,
    current_question_index: 0,
    answered_count: 0,
    total_questions: 25,
    progress_percent: 0,
    flagged_count: 0,
    last_saved_at: null,
    latest_result: null,
  });
}
