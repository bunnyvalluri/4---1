import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { RoadmapService } from '@/lib/roadmapService';

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const { itemId, taskId, done, notes } = body;

    if (!itemId || !taskId || typeof done !== 'boolean') {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const updatedRoadmap = await RoadmapService.updateTaskStatus(
      session.userId,
      itemId,
      taskId,
      done,
      notes
    );

    return NextResponse.json({ success: true, roadmap: updatedRoadmap });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Roadmap task PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
