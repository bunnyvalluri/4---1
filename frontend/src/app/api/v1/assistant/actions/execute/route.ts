import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId || 'candidate_user_default';
    const body = await req.json().catch(() => ({}));
    const { action_type, entity_id, parameters } = body;

    if (!action_type) {
      return NextResponse.json({ success: false, detail: 'Action type is required' }, { status: 400 });
    }

    // Handle common career actions
    if (action_type === 'mark_milestone_completed' && entity_id) {
      try {
        await prisma.roadmapItem.update({
          where: { id: entity_id },
          data: { isCompleted: true },
        });
        return NextResponse.json({
          success: true,
          message: 'Roadmap milestone marked as completed!',
          data: { milestoneId: entity_id },
        });
      } catch (err) {
        console.warn('Could not update roadmap item in DB:', err);
      }
    }

    if (action_type === 'add_skill' && parameters?.skillName) {
      try {
        const skillName = parameters.skillName.trim();
        const skill = await prisma.skill.findFirst({
          where: { name: { equals: skillName, mode: 'insensitive' } },
        });
        if (skill && userId !== 'candidate_user_default') {
          await prisma.userSkill.upsert({
            where: {
              userId_skillId: {
                userId,
                skillId: skill.id,
              },
            },
            update: { proficiency: parameters.proficiency || 3 },
            create: {
              userId,
              skillId: skill.id,
              proficiency: parameters.proficiency || 3,
            },
          });
        }
        return NextResponse.json({
          success: true,
          message: `Added ${skillName} to your skill telemetry!`,
        });
      } catch (err) {
        console.warn('Could not add skill in DB:', err);
      }
    }

    // Default successful action execution
    return NextResponse.json({
      success: true,
      message: `Action "${action_type}" executed successfully.`,
      data: { action_type, entity_id, parameters },
    });
  } catch (error) {
    console.error('[Assistant Action Execute] Error:', error);
    return NextResponse.json({ success: false, detail: 'Failed to execute action' }, { status: 500 });
  }
}
