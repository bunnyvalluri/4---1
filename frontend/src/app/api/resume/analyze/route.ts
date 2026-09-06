import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ResumeParserService } from '@/lib/resumeParser';
import { uploadRateLimiter, getClientIp } from '@/lib/rateLimit';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB upload ceiling
const MAX_TEXT_LENGTH = 100000; // 100,000 characters ceiling
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'application/octet-stream', // Often sent by browsers for .docx/.pdf
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt']);

function sanitizeFileName(rawName: string): string {
  // Strip paths, null bytes, control chars, and limit length
  const baseName = rawName.replace(/[\/\\]/g, '').replace(/\0/g, '').trim();
  const cleaned = baseName.replace(/[^a-zA-Z0-9._\- ]/g, '_');
  return cleaned.slice(0, 120) || 'resume_document';
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    // Rate limiting defense against DoS / storage exhaustion
    const rateKey = `resume:${session.userId || getClientIp(req)}`;
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

    let extractedText = '';
    let sanitizedName = 'Direct Input';

    if (file) {
      // 1. File size enforcement
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'File size exceeds maximum allowed limit of 5MB' },
          { status: 413 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
      }

      // 2. File extension & MIME type validation
      const ext = getFileExtension(file.name);
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: 'Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.' },
          { status: 400 }
        );
      }

      if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: 'Invalid document MIME type detected.' },
          { status: 400 }
        );
      }

      sanitizedName = sanitizeFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      extractedText = await ResumeParserService.extractTextFromBuffer(buffer, file.type || file.name);
    } else if (directText) {
      if (typeof directText !== 'string') {
        return NextResponse.json({ error: 'Invalid text payload' }, { status: 400 });
      }

      if (directText.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          { error: `Direct resume text exceeds maximum character limit of ${MAX_TEXT_LENGTH}` },
          { status: 400 }
        );
      }
      extractedText = directText;
    } else {
      return NextResponse.json({ error: 'No file or resume text provided' }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract readable text from document' }, { status: 400 });
    }

    // Bound maximum text passed into parser to prevent regex algorithmic complexity DoS
    const boundedText = extractedText.slice(0, MAX_TEXT_LENGTH);

    const analysis = await ResumeParserService.analyzeResume(
      session.userId,
      sanitizedName,
      boundedText,
      careerId
    );

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Resume analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
