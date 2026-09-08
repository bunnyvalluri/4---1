import { NextRequest, NextResponse } from 'next/server';

const jobCreationTimes: Map<string, number> = new Map();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  if (!jobCreationTimes.has(jobId)) {
    jobCreationTimes.set(jobId, Date.now());
  }

  const startTime = jobCreationTimes.get(jobId)!;
  const elapsed = Date.now() - startTime;

  if (elapsed < 1200) {
    return NextResponse.json({
      job_id: jobId,
      status: 'queued',
      stage: 'profile_fetch',
      stage_label: 'Fetching candidate telemetry and skills…',
      progress: 20,
      message: 'Ingesting profile telemetry',
      error: null,
      completed_at: null,
    });
  } else if (elapsed < 2400) {
    return NextResponse.json({
      job_id: jobId,
      status: 'processing',
      stage: 'skill_analysis',
      stage_label: 'Evaluating skill proficiency and cognitive aptitude…',
      progress: 55,
      message: 'Processing multi-factor alignments',
      error: null,
      completed_at: null,
    });
  } else if (elapsed < 3600) {
    return NextResponse.json({
      job_id: jobId,
      status: 'processing',
      stage: 'career_scoring',
      stage_label: 'Running career recommendation scoring algorithms…',
      progress: 85,
      message: 'Scoring career alignment matrix',
      error: null,
      completed_at: null,
    });
  } else {
    return NextResponse.json({
      job_id: jobId,
      status: 'completed',
      stage: 'finalizing',
      stage_label: 'Career recommendations successfully updated.',
      progress: 100,
      message: 'Recalculation completed successfully',
      error: null,
      completed_at: new Date().toISOString(),
    });
  }
}
