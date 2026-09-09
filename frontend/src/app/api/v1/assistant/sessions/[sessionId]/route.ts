import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getSessionUser(req);
    const userId = session?.userId || 'candidate_user_default';

    let messages: any[] = [];
    let chatSession = null;

    try {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (chatSession) {
        messages = chatSession.messages.map((m) => ({
          id: m.id,
          session_id: m.sessionId,
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
          status: 'COMPLETED',
          created_at: m.createdAt.toISOString(),
        }));
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      id: sessionId,
      user_id: userId,
      title: chatSession?.title || 'Consultation Session',
      status: 'ACTIVE',
      message_count: messages.length,
      messages: messages,
      created_at: chatSession?.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: chatSession?.updatedAt?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Assistant Session Detail GET] Error:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const { title, status } = body;

    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          ...(title ? { title } : {}),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      id: sessionId,
      title: title || 'Consultation Session',
      status: status || 'ACTIVE',
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Assistant Session PATCH] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    try {
      await prisma.chatMessage.deleteMany({
        where: { sessionId },
      });
      await prisma.chatSession.delete({
        where: { id: sessionId },
      });
    } catch {
      // ignore
    }
    return NextResponse.json({ success: true, message: 'Session deleted' });
  } catch (error) {
    console.error('[Assistant Session DELETE] Error:', error);
    return NextResponse.json({ success: true });
  }
}
