import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AIService } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 15 } },
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.userId,
          title: message.slice(0, 40) + '...',
        },
        include: { messages: true },
      });
    }

    // Gather Candidate Context
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
    const matchScore = user?.recommendations[0]?.matchScore || 'N/A';
    const aptitudeScore = user?.aptitudeAttempts[0]?.score ? `${user.aptitudeAttempts[0].score}%` : 'Not taken';
    const roadmapProgress = user?.roadmaps[0] ? `${user.roadmaps[0].progressPercent}% (${user.roadmaps[0].status})` : 'Not started';
    const resumeScore = user?.resumeAnalyses[0] ? `${user.resumeAnalyses[0].atsScore}/100` : 'Not analyzed';

    const userContext = `Candidate: ${user?.name || 'User'}
Degree & Branch: ${user?.profile?.degree || 'N/A'} - ${user?.profile?.branch || 'N/A'}
Identified Skills: ${userSkills}
Top Recommended Career: ${topCareer} (Match Score: ${matchScore}%)
Aptitude Assessment: ${aptitudeScore}
Roadmap Progress: ${roadmapProgress}
Resume ATS Score: ${resumeScore}
Interests: ${user?.profile?.interests.join(', ') || 'Technology'}`;

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message,
      },
    });

    // Format conversation history
    const conversation = chatSession.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    conversation.push({ role: 'user', content: message });

    // Generate AI response
    const assistantReply = await AIService.chatAssistant(conversation, userContext);

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
