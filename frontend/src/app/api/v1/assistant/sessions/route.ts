import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId || 'candidate_user_default';
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase();

    let sessions: any[] = [];
    try {
      sessions = await prisma.chatSession.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { select: { id: true } },
        },
      });
    } catch {
      // fallback
    }

    if (sessions.length === 0) {
      // Seed default consultation session if none exist
      return NextResponse.json([
        {
          id: 'initial-consultation-1',
          user_id: userId,
          title: 'Career Strategy & Roadmap',
          status: 'ACTIVE',
          summary: 'Initial consultation with Aura Copilot',
          message_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: new Date().toISOString(),
        },
      ]);
    }

    if (q) {
      sessions = sessions.filter(
        (s) => s.title.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      sessions.map((s) => ({
        id: s.id,
        user_id: s.userId,
        title: s.title,
        status: 'ACTIVE',
        summary: s.title,
        message_count: s.messages?.length || 0,
        created_at: s.createdAt.toISOString(),
        updated_at: s.updatedAt.toISOString(),
        last_message_at: s.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('[Assistant Sessions GET] Error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId || 'candidate_user_default';
    const body = await req.json().catch(() => ({}));
    const title = (body.title || 'New Consultation').trim();

    let createdSession = null;
    try {
      createdSession = await prisma.chatSession.create({
        data: {
          userId,
          title,
        },
      });
    } catch {
      // Memory fallback if DB unavailable
      createdSession = {
        id: 'session-' + Date.now(),
        userId,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return NextResponse.json({
      id: createdSession.id,
      user_id: userId,
      title: createdSession.title,
      status: 'ACTIVE',
      summary: createdSession.title,
      message_count: 0,
      created_at: createdSession.createdAt.toISOString(),
      updated_at: createdSession.updatedAt.toISOString(),
      last_message_at: createdSession.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('[Assistant Sessions POST] Error:', error);
    const now = new Date().toISOString();
    return NextResponse.json({
      id: 'session-' + Date.now(),
      user_id: 'default_user',
      title: 'New Consultation',
      status: 'ACTIVE',
      message_count: 0,
      created_at: now,
      updated_at: now,
    });
  }
}
