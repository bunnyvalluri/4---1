import { prisma } from './db';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}

export class RoadmapService {
  public static async generateRoadmapForCareer(userId: string, careerId: string) {
    const career = await prisma.career.findUnique({
      where: { id: careerId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!career) throw new Error('Career not found');

    // Fetch user's current skill gaps for this career
    const skillGaps = await prisma.skillGap.findMany({
      where: { userId, careerId },
      include: { skill: true },
      orderBy: { priority: 'asc' },
    });

    const missingOrWeakSkills = skillGaps
      .filter((g) => g.currentProficiency < g.requiredProficiency)
      .map((g) => g.skill.name);

    const title = `${career.title} Mastery Roadmap`;
    const description = `Tailored 6-month engineering roadmap designed to bridge ${missingOrWeakSkills.length} identified competency gaps and achieve interview readiness for ${career.title}.`;

    // Partition missing skills across months
    const month1Skills = missingOrWeakSkills.slice(0, 2);
    const month2Skills = missingOrWeakSkills.slice(2, 4);
    const month3Skills = missingOrWeakSkills.slice(4, 6);
    const remainingSkills = missingOrWeakSkills.slice(6);

    const roadmapData = [
      {
        month: 1,
        title: 'Core Foundations & Architectural Tooling',
        description: 'Establish deep familiarity with essential languages, environment tooling, and clean code standards.',
        skills: month1Skills.length > 0 ? month1Skills : ['Modern Toolchains', 'Version Control & Git'],
        tasks: [
          { id: 'm1-t1', text: `Deep dive into syntax and paradigm best practices for ${month1Skills[0] || 'Core Language'}`, done: false },
          { id: 'm1-t2', text: 'Set up strict linter, formatter, and modular package architecture in a starter repo', done: false },
          { id: 'm1-t3', text: 'Solve 15 focused algorithmic exercises and data structure challenges', done: false },
        ],
      },
      {
        month: 2,
        title: 'Advanced Frameworks & Database Schemas',
        description: 'Transition from basic syntax to scalable framework patterns, relational modeling, and API integrations.',
        skills: month2Skills.length > 0 ? month2Skills : ['Database Design', 'Backend Architecture'],
        tasks: [
          { id: 'm2-t1', text: `Build an idiomatic CRUD service using ${month2Skills[0] || 'Modern Backend Framework'}`, done: false },
          { id: 'm2-t2', text: 'Implement normalized schema with indexes, transactions, and migration scripts', done: false },
          { id: 'm2-t3', text: 'Write automated unit tests asserting controller routes and business logic', done: false },
        ],
      },
      {
        month: 3,
        title: 'Domain Specialization & Production Toolchains',
        description: 'Master industry-standard production tools, caching, containerization, and authentication mechanisms.',
        skills: month3Skills.length > 0 ? month3Skills : ['Docker & Cloud Deployments', 'State Management'],
        tasks: [
          { id: 'm3-t1', text: `Implement stateful architecture and caching using ${month3Skills[0] || 'Modern Cloud Systems'}`, done: false },
          { id: 'm3-t2', text: 'Containerize multi-container architecture using Docker & Docker Compose', done: false },
          { id: 'm3-t3', text: 'Enforce secure authentication (JWT/OAuth2) with role-based authorization', done: false },
        ],
      },
      {
        month: 4,
        title: 'Capstone Engineering Portfolio Project',
        description: 'Synthesize newly acquired skills into a production-grade, highly polished capstone application.',
        skills: remainingSkills.length > 0 ? remainingSkills : ['Applied System Design', 'Full-Lifecycle Deployment'],
        tasks: [
          { id: 'm4-t1', text: `Design system architecture diagram and technical spec for ${career.title} portfolio capstone`, done: false },
          { id: 'm4-t2', text: 'Implement core user journeys with responsive UI and robust API error handling', done: false },
          { id: 'm4-t3', text: 'Setup automated CI/CD pipeline running tests and building deployment artifacts', done: false },
        ],
      },
      {
        month: 5,
        title: 'Performance Optimization & Deployment Telemetry',
        description: 'Optimize load times, queries, and observability, followed by public cloud deployment with custom domain.',
        skills: ['Performance Auditing', 'Monitoring & Telemetry'],
        tasks: [
          { id: 'm5-t1', text: 'Audit application performance: minimize bundle size, optimize DB queries, add telemetry', done: false },
          { id: 'm5-t2', text: 'Deploy to staging/production cloud with SSL, environment secrets, and monitoring', done: false },
          { id: 'm5-t3', text: 'Write professional README with architecture diagram, video demo, and setup steps', done: false },
        ],
      },
      {
        month: 6,
        title: 'ATS Resume Polish & Technical Interview Drills',
        description: 'Finalize technical portfolio, optimize ATS keywords for target roles, and drill system design and coding.',
        skills: ['Technical Interviewing', 'System Design', 'Communication'],
        tasks: [
          { id: 'm6-t1', text: 'Upload updated resume to Career Platform ATS Analyzer and achieve 85%+ score', done: false },
          { id: 'm6-t2', text: 'Complete 10 mock technical interview sessions focusing on live coding & architecture', done: false },
          { id: 'm6-t3', text: 'Apply to 15 targeted positions with personalized pitch matching the job specs', done: false },
        ],
      },
    ];

    // Upsert Roadmap in database
    const roadmap = await prisma.roadmap.upsert({
      where: {
        userId_careerId: {
          userId,
          careerId,
        },
      },
      update: {
        title,
        description,
        status: 'IN_PROGRESS',
      },
      create: {
        userId,
        careerId,
        title,
        description,
        durationMonths: 6,
        progressPercent: 0,
        status: 'IN_PROGRESS',
      },
    });

    // Replace or update items
    await prisma.roadmapItem.deleteMany({ where: { roadmapId: roadmap.id } });

    for (const item of roadmapData) {
      await prisma.roadmapItem.create({
        data: {
          roadmapId: roadmap.id,
          month: item.month,
          title: item.title,
          description: item.description,
          skills: item.skills,
          tasks: item.tasks,
          isCompleted: false,
        },
      });
    }

    return await prisma.roadmap.findUnique({
      where: { id: roadmap.id },
      include: {
        items: {
          orderBy: { month: 'asc' },
        },
        career: true,
      },
    });
  }

  public static async updateTaskStatus(
    userId: string,
    itemId: string,
    taskId: string,
    done: boolean,
    notes?: string
  ) {
    const item = await prisma.roadmapItem.findUnique({
      where: { id: itemId },
      include: { roadmap: true },
    });

    if (!item || item.roadmap.userId !== userId) {
      throw new Error('Roadmap item not found or unauthorized');
    }

    const tasks = (item.tasks as unknown as TaskItem[]) || [];
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, done } : t));

    const allTasksCompleted = updatedTasks.every((t) => t.done);

    await prisma.roadmapItem.update({
      where: { id: itemId },
      data: {
        tasks: updatedTasks as any,
        isCompleted: allTasksCompleted,
        notes: notes !== undefined ? notes : item.notes,
        completedAt: allTasksCompleted ? new Date() : null,
      },
    });

    // Recalculate overall roadmap progress
    const allItems = await prisma.roadmapItem.findMany({
      where: { roadmapId: item.roadmapId },
    });

    let totalTasks = 0;
    let completedTasks = 0;

    for (const it of allItems) {
      const itTasks = (it.tasks as unknown as TaskItem[]) || [];
      totalTasks += itTasks.length;
      completedTasks += itTasks.filter((t) => t.done).length;
    }

    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const roadmapStatus = progressPercent === 100 ? 'COMPLETED' : 'IN_PROGRESS';

    const updatedRoadmap = await prisma.roadmap.update({
      where: { id: item.roadmapId },
      data: {
        progressPercent,
        status: roadmapStatus,
      },
      include: {
        items: { orderBy: { month: 'asc' } },
        career: true,
      },
    });

    return updatedRoadmap;
  }
}
