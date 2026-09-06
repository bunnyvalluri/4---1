import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ResumeParserService } from '@/lib/resumeParser';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const formData = await req.formData();

    const file = formData.get('file') as File | null;
    const directText = formData.get('text') as string | null;
    const careerId = (formData.get('careerId') as string) || undefined;

    let extractedText = '';
    let fileName = 'Direct Input';

    if (file) {
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      extractedText = await ResumeParserService.extractTextFromBuffer(buffer, file.type || file.name);
    } else if (directText) {
      extractedText = directText;
    } else {
      return NextResponse.json({ error: 'No file or resume text provided' }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract readable text from document' }, { status: 400 });
    }

    const analysis = await ResumeParserService.analyzeResume(
      session.userId,
      fileName,
      extractedText,
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
