import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function POST(req: NextRequest) {
  let body = {};
  try {
    body = await req.json();
  } catch {}

  try {
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(`${FASTAPI_URL}/api/v1/assessments/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // FastAPI unavailable
  }

  // Fallback start response
  return NextResponse.json({
    attempt_id: `att_${Date.now()}`,
    status: 'IN_PROGRESS',
    current_question_index: 0,
    answers: {},
    flagged_questions: [],
    total_questions: 25,
    started_at: new Date().toISOString(),
  });
}
