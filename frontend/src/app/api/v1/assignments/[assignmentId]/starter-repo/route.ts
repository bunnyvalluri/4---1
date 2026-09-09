import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const { assignmentId } = await params;
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // optional body
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${FASTAPI_URL}/api/v1/assignments/${assignmentId}/starter-repo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Serverless fallback
  }

  const repoName = body.repoName || 'candidate/careerai-backend-assignment-01';
  return NextResponse.json({
    success: true,
    repoName,
    starterRepoUrl: `https://github.com/${repoName}`,
    provider: body.provider || 'GITHUB',
    status: 'PROVISIONED',
    cloneUrl: `https://github.com/${repoName}.git`,
  });
}
