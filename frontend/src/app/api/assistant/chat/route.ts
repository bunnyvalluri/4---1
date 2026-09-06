import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RAGService } from '@/lib/ai/ragService';
import { aiRateLimiter, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    // Rate limiting defense against quota exhaustion / DoS
    const rateKey = `chat:${session.userId || getClientIp(req)}`;
    const rateCheck = aiRateLimiter.check(rateKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateCheck.resetTime} seconds before sending another message.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetTime) } }
      );
    }

    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const sanitizedMessage = message.trim();
    if (sanitizedMessage.length > 2000) {
      return NextResponse.json({ error: 'Message exceeds maximum length of 2000 characters' }, { status: 400 });
    }

    // Fetch or create chat session with strict IDOR ownership authorization
    let chatSession;
    if (sessionId) {
      const existing = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 15 } },
      });

      if (existing) {
        if (existing.userId !== session.userId) {
          return NextResponse.json({ error: 'Forbidden: Access to this chat session is denied' }, { status: 403 });
        }
        chatSession = existing;
      }
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.userId,
          title: sanitizedMessage.slice(0, 40) + '...',
        },
        include: { messages: true },
      });
    }

    // Gather Candidate Context defensively
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        skills: { include: { skill: true } },
        aptitudeAttempts: { orderBy: { completedAt: 'desc' }, take: 1 },
        recommendations: { include: { career: true }, orderBy: { matchScore: 'desc' }, take: 2 },
        roadmaps: { include: { career: true }, take: 1 },
        resumeAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const userSkills = user?.skills.map((s) => `${s.skill.name} (${s.proficiency}/5)`).join(', ') || 'None listed';
    const topCareer = user?.recommendations[0]?.career.title || 'Software Engineering';

    // Save sanitized user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: sanitizedMessage,
      },
    });

    // Format conversation history for RAG & LLM
    const conversation = chatSession.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Generate RAG grounded response with citations
    const { answer: assistantReply, citations } = await RAGService.generateGroundedAnswer(
      sanitizedMessage,
      conversation,
      {
        targetRole: topCareer,
        topSkills: user?.skills.map((s) => s.skill.name),
        topSkillGap: user?.recommendations[0]?.missingSkills ? (user.recommendations[0].missingSkills as string[])[0] : undefined,
        roadmapProgress: user?.roadmaps[0]?.progressPercent,
      }
    );

    // Save assistant message
    const savedReply = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: assistantReply,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: chatSession.id,
      message: savedReply,
      citations,
      ragEnabled: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Enforce strict ownership check against IDOR before returning messages
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (!chatSession || chatSession.userId !== session.userId) {
        return NextResponse.json({ error: 'Chat session not found or forbidden' }, { status: 404 });
      }

      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json({ messages });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
