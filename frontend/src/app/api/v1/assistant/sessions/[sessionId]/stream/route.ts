import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RAGService } from '@/lib/ai/ragService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  // Resolve authentic user or guest fallback
  let userId = 'candidate_user_default';
  try {
    const sessionUser = await getSessionUser(req);
    if (sessionUser?.userId) {
      userId = sessionUser.userId;
    }
  } catch {
    // ignore
  }

  // Parse payload
  let content = '';
  let mode = 'standard';
  try {
    const body = await req.json();
    content = (body.content || '').trim();
    if (body.mode) mode = body.mode;
  } catch {
    content = '';
  }

  if (!content) {
    return new Response(
      `data: {"token": "Please provide a query or career question."}\n\ndata: [DONE]\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      }
    );
  }

  // Ensure ChatSession exists in Prisma
  let currentSessionId = sessionId;
  try {
    let chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!chatSession) {
      // Find default user in db if needed
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) {
        chatSession = await prisma.chatSession.create({
          data: {
            id: sessionId !== 'default' && !sessionId.startsWith('initial-') ? sessionId : undefined,
            userId,
            title: content.slice(0, 35) + '...',
          },
        });
        currentSessionId = chatSession.id;
      }
    }

    if (chatSession) {
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: 'user',
          content,
        },
      });
    }
  } catch (err) {
    console.warn('[Assistant Stream] Session/Message create fallback:', err);
  }

  // Fetch telemetry context
  let userTelemetry = null;
  try {
    userTelemetry = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
        recommendations: { include: { career: true }, orderBy: { matchScore: 'desc' }, take: 1 },
        roadmaps: { include: { career: true, items: true }, take: 1 },
      },
    });
  } catch {
    // fallback
  }

  const targetRole = userTelemetry?.recommendations?.[0]?.career?.title || 'Full Stack Developer';
  const topSkills = userTelemetry?.skills?.map((s) => s.skill.name) || ['TypeScript', 'React.js', 'Python'];
  const roadmapProgress = userTelemetry?.roadmaps?.[0]?.progressPercent || 40;

  // Build targeted structured action recommendations
  const qLower = content.toLowerCase();
  const relevantActions: Array<{
    action_type: string;
    title: string;
    description: string;
    route?: string;
    requires_confirmation?: boolean;
  }> = [];

  if (qLower.includes('roadmap') || qLower.includes('milestone') || qLower.includes('learn') || mode === 'learning') {
    relevantActions.push({
      action_type: 'navigate',
      title: 'Open Career Roadmap',
      description: 'Explore structured milestones and learning tracks',
      route: '/roadmap',
    });
    relevantActions.push({
      action_type: 'navigate',
      title: 'Analyze Skill Gaps',
      description: 'Verify current proficiencies against target role benchmarks',
      route: '/skills',
    });
  } else if (qLower.includes('interview') || qLower.includes('quiz') || mode === 'interview') {
    relevantActions.push({
      action_type: 'navigate',
      title: 'Launch Mock Interview',
      description: 'Practice real-time technical and architectural scenarios',
      route: '/interview',
    });
    relevantActions.push({
      action_type: 'navigate',
      title: 'Take Aptitude Assessment',
      description: 'Test quantitative and logical reasoning benchmarks',
      route: '/aptitude',
    });
  } else if (qLower.includes('resume') || qLower.includes('ats') || mode === 'resume') {
    relevantActions.push({
      action_type: 'navigate',
      title: 'ATS Resume Diagnostics',
      description: 'Audit resume keywords, formatting, and scoring',
      route: '/resume',
    });
    relevantActions.push({
      action_type: 'navigate',
      title: 'Track Applications',
      description: 'Review submitted applications and pipeline status',
      route: '/applications',
    });
  } else {
    relevantActions.push({
      action_type: 'navigate',
      title: 'View Career Trajectory',
      description: 'Analyze market salary projections and progression',
      route: '/trajectory',
    });
    relevantActions.push({
      action_type: 'navigate',
      title: 'Inspect Skill Gaps',
      description: 'Review high-priority skills needed for market readiness',
      route: '/skills',
    });
  }

  // Create SSE ReadableStream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Thinking state
        controller.enqueue(
          encoder.encode(`data: [THINKING: Grounding advice in ${targetRole} market telemetry...]\n\n`)
        );
        await new Promise((r) => setTimeout(r, 120));

        // 2. Fetch history and generate RAG answer
        let answer = '';
        let citations: Array<{ title: string; source: string; score: number }> = [];

        try {
          const pastMessages = await prisma.chatMessage.findMany({
            where: { sessionId: currentSessionId },
            orderBy: { createdAt: 'asc' },
            take: 8,
          });

          const chatHistory = pastMessages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

          const ragResult = await RAGService.generateGroundedAnswer(
            content,
            chatHistory,
            {
              targetRole,
              topSkills,
              topSkillGap: 'Distributed Systems & Cloud Architecture',
              roadmapProgress,
            }
          );
          answer = ragResult.answer;
          citations = ragResult.citations;
        } catch (ragErr) {
          console.warn('[Assistant Stream] RAG fallback:', ragErr);
          answer = `Based on your profile aiming for **${targetRole}**, prioritizing high-leverage skills like **System Architecture**, **Clean APIs**, and **Cloud Deployment** will yield the highest return. Follow your 6-month roadmap milestones and build portfolio-grade projects.`;
          citations = [{ title: 'Career Guidance Matrix', source: 'CareerAI System', score: 95 }];
        }

        // 3. Stream answer in token chunks for smooth live typing feel
        const words = answer.split(/(\s+)/);
        let chunk = '';
        for (let i = 0; i < words.length; i++) {
          chunk += words[i];
          if (chunk.length >= 12 || i === words.length - 1) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token: chunk })}\n\n`)
            );
            chunk = '';
            // Small delay for natural streaming cadence
            await new Promise((r) => setTimeout(r, 16));
          }
        }

        // 4. Send structured actions & citations
        const sources = citations.map((c) => `${c.source}: ${c.title}`);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ actions: relevantActions, sources })}\n\n`
          )
        );

        // 5. Persist assistant reply in Prisma
        try {
          const sessionExists = await prisma.chatSession.findUnique({
            where: { id: currentSessionId },
          });
          if (sessionExists) {
            await prisma.chatMessage.create({
              data: {
                sessionId: currentSessionId,
                role: 'assistant',
                content: answer,
                metadata: {
                  actions: relevantActions,
                  citations,
                },
              },
            });
          }
        } catch (saveErr) {
          console.warn('[Assistant Stream] Failed to save assistant message:', saveErr);
        }

        // 6. Signal stream completion
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (streamErr) {
        console.error('[Assistant Stream] Controller error:', streamErr);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ token: "\n\nI encountered an issue processing the query. Please try again." })}\n\ndata: [DONE]\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
