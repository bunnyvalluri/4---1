import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const jobId = `job_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return NextResponse.json({
      job_id: jobId,
      status: 'queued',
      message: 'Career recommendation recalculation initiated',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to queue recalculation' }, { status: 500 });
  }
}
