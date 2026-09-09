import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('q') || searchParams.get('search') || '';

    // 1. Try FastAPI endpoint
    try {
      const authHeader = req.headers.get('authorization') || '';
      const fastApiRes = await fetch(
        `${BACKEND_URL}/api/v1/admin/candidates?search=${encodeURIComponent(search)}`,
        {
          headers: authHeader ? { Authorization: authHeader } : {},
          cache: 'no-store',
        }
      );
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to local DB
    }

    // 2. Local Database Queries
    try {
      const users = await prisma.user.findMany({
        where: {
          role: 'USER',
          OR: search
            ? [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ]
            : undefined,
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          aptitudeAttempts: { select: { score: true } },
          recommendations: { select: { matchScore: true } },
          resumeAnalyses: { select: { atsScore: true } },
          roadmaps: { select: { id: true } },
        },
      });

      const candidates = users.map((u) => {
        const scores = u.aptitudeAttempts.map((a) => a.score).filter((s): s is number => typeof s === 'number');
        const bestScore = scores.length ? Math.max(...scores) : null;
        const recScores = u.recommendations.map((r) => r.matchScore).filter((s): s is number => typeof s === 'number');
        const topMatch = recScores.length ? `${Math.round(Math.max(...recScores))}% Match` : 'No Match';
        const resumeStatus = u.resumeAnalyses.length && u.resumeAnalyses[0].atsScore != null
          ? `${Math.round(u.resumeAnalyses[0].atsScore)}% ATS`
          : 'Not Uploaded';

        const targetCareer = u.profile?.preferredRoles?.[0] || u.profile?.careerGoals || 'Undecided';
        
        // Calculate profile completion dynamically from real fields
        const profileFields = [
          u.name,
          u.email,
          u.profile?.degree,
          u.profile?.branch,
          u.profile?.college,
          u.profile?.gradYear,
          u.profile?.location,
          u.profile?.bio,
          u.profile?.careerGoals,
        ];
        const filled = profileFields.filter(Boolean).length;
        const profileCompletion = Math.min(100, Math.round((filled / profileFields.length) * 100));

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar,
          target_career: targetCareer,
          profile_completion: profileCompletion || 20,
          assessment_score: bestScore,
          top_match: topMatch,
          has_roadmap: u.roadmaps.length > 0,
          resume_status: resumeStatus,
          last_active: u.updatedAt.toISOString(),
          created_at: u.createdAt.toISOString(),
          status: 'ACTIVE',
        };
      });

      return NextResponse.json({ candidates, total: candidates.length });
    } catch (dbErr) {
      console.warn('Database error in candidates API:', dbErr);
      return NextResponse.json({ candidates: [], total: 0 });
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Admin candidates API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve candidates.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const body = await req.json();
    const { name, email, password, targetCareer, degree, college, location, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const { hashPassword } = await import('@/lib/auth');
    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'USER',
        profile: {
          create: {
            preferredRoles: targetCareer ? [targetCareer.trim()] : ['Software Engineer'],
            degree: degree?.trim() || null,
            college: college?.trim() || null,
            location: location?.trim() || null,
            phone: phone?.trim() || null,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json({
      success: true,
      candidate: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        target_career: newUser.profile?.preferredRoles?.[0] || 'Software Engineer',
        profile_completion: 40,
        assessment_score: null,
        top_match: 'No Match',
        resume_status: 'Not Uploaded',
        has_roadmap: false,
        created_at: newUser.createdAt.toISOString(),
        status: 'ACTIVE',
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Admin create candidate error:', error);
    return NextResponse.json({ error: 'Failed to create candidate.' }, { status: 500 });
  }
}
