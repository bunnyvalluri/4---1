import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { RoadmapService } from '@/lib/roadmapService';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const { action, itemId, resourceId, notes } = body;

    if (!itemId || !resourceId) {
      return NextResponse.json(
        { error: 'itemId and resourceId are required' },
        { status: 400 }
      );
    }

    if (action === 'start') {
      const interaction = await RoadmapService.startResource(session.userId, itemId, resourceId);
      return NextResponse.json({ success: true, interaction });
    } else if (action === 'complete') {
      const result = await RoadmapService.completeResource(
        session.userId,
        itemId,
        resourceId,
        notes
      );
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "complete"' },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Roadmap resource interaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
