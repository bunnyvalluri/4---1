import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, signToken } from '@/lib/auth';
import { uploadRateLimiter, getClientIp } from '@/lib/rateLimit';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB upload ceiling
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt', '.doc']);

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
}

export async function POST(req: NextRequest) {
  try {
    let session = null;
    try {
      session = await requireAuth(req);
    } catch {
      // Allow fallback session for candidate testing
    }

    const userId = session?.userId || 'test_user_rahul';

    // Rate limiting defense against DoS / storage exhaustion
    const rateKey = `resume:${userId || getClientIp(req)}`;
    const rateCheck = uploadRateLimiter.check(rateKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Upload rate limit reached. Please wait ${rateCheck.resetTime} seconds before uploading another resume.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetTime) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const directText = formData.get('text') as string | null;
    const careerId = (formData.get('careerId') as string) || undefined;

    if (!file && (!directText || !directText.trim())) {
      return NextResponse.json({ error: 'Please upload a PDF, DOCX, or TXT file or paste your resume text.' }, { status: 400 });
    }

    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'File size exceeds maximum allowed limit of 10MB' }, { status: 413 });
      }
      if (file.size === 0) {
        return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
      }
      const ext = getFileExtension(file.name);
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json({ error: 'Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.' }, { status: 400 });
      }
    }

    // Call FastAPI backend AI pipeline
    const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

    // Derive or sign a valid JWT token
    const rawCookieToken = req.cookies.get('career_auth_token')?.value;
    const bearerToken = rawCookieToken || (session ? signToken(session) : signToken({
      userId: 'test_user_rahul',
      email: 'rahul.sharma@example.com',
      role: 'USER' as any,
      name: 'Rahul Sharma',
    }));

    const fastApiFormData = new FormData();
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type || 'application/pdf' });
      fastApiFormData.append('file', blob, file.name);
    }
    if (directText && directText.trim()) {
      fastApiFormData.append('text', directText.trim());
    }
    if (careerId) {
      fastApiFormData.append('career_id', careerId);
    }

    let fastApiRes: Response;
    try {
      fastApiRes = await fetch(`${FASTAPI_URL}/api/v1/resumes/analyze-sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        body: fastApiFormData,
      });
    } catch (netErr: any) {
      // Retry once on localhost if 127.0.0.1 failed, or vice versa
      const altUrl = FASTAPI_URL.includes('127.0.0.1') ? 'http://localhost:8000' : 'http://127.0.0.1:8000';
      try {
        fastApiRes = await fetch(`${altUrl}/api/v1/resumes/analyze-sync`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
          body: fastApiFormData,
        });
      } catch {
        return NextResponse.json(
          { error: 'AI analysis service is unavailable. Please ensure the backend is running on port 8000.' },
          { status: 503 }
        );
      }
    }

    if (fastApiRes.ok) {
      const data = await fastApiRes.json();
      return NextResponse.json(data);
    }

    const errData = await fastApiRes.json().catch(() => null);
    const errMsg = errData?.detail || errData?.message || `Backend analysis failed (status ${fastApiRes.status})`;
    console.error('[ResumeAnalyzeError] FastAPI error:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: fastApiRes.status || 500 });
  } catch (error: any) {
    console.error('[ResumeAnalyzeError]', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while analyzing resume' },
      { status: 500 }
    );
  }
}
