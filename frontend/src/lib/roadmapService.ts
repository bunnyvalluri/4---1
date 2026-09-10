import { prisma } from './db';
import { ResourceSelectionEngine, VerifiedResource } from './resourceCatalog';

export interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ResourceLinkItem {
  id: string;
  provider: 'W3SCHOOLS' | 'GEEKSFORGEEKS';
  title: string;
  url: string;
  topic?: string;
  skill?: string;
  skillLevel?: string;
  resourceType: string;
  description?: string;
  whyRecommended: string;
  isVerified: boolean;
  isCompleted?: boolean;
}

export interface AssignmentSpec {
  title: string;
  description: string;
  repoTemplate: string;
  verificationCriteria: string[];
}

export class RoadmapService {
  /**
   * Generates a 12-Week dynamic engineering roadmap from the candidate's actual uploaded resume
   * and target career skill gaps, integrating verified external resources from W3Schools and GeeksforGeeks.
   */
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

    // Fetch user's uploaded resume / profile context
    const resume = await prisma.resumeAnalysis.findFirst({
      where: { userId, isCurrent: true },
      orderBy: { updatedAt: 'desc' },
    });

    const userProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    // Fetch user's current skill gaps for this career
    const skillGaps = await prisma.skillGap.findMany({
      where: { userId, careerId },
      include: { skill: true },
      orderBy: { priority: 'asc' },
    });

    const candidateTargetSkills = skillGaps.map((g) => ({
      name: g.skill.name,
      currentProficiency: g.currentProficiency,
      requiredProficiency: g.requiredProficiency,
      severity: g.gapSeverity,
    }));

    const missingOrWeakSkills = candidateTargetSkills
      .filter((g) => g.currentProficiency < g.requiredProficiency)
      .map((g) => g.name);

    // Determine candidate experience base
    const careerSignals = (resume?.careerSignals as Record<string, any>) || {};
    const yearsExperience = careerSignals.yearsOfExperience || (userProfile?.gradYear ? Math.max(0, 2026 - userProfile.gradYear) : 0);
    const isJunior = yearsExperience < 2;

    // Archive previous roadmap for this career if one exists
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: { userId, careerId, isCurrent: true },
      orderBy: { version: 'desc' },
    });

    let nextVersion = 1;
    if (existingRoadmap) {
      nextVersion = existingRoadmap.version + 1;
      await prisma.roadmap.update({
        where: { id: existingRoadmap.id },
        data: {
          isCurrent: false,
          status: 'ARCHIVED',
        },
      });
    }

    const title = `${career.title} 12-Week Production Mastery (V${nextVersion})`;
    const description = `12-week verified roadmap synthesized from your resume evidence to bridge ${
      missingOrWeakSkills.length > 0 ? missingOrWeakSkills.length : 'critical'
    } technical gaps for ${career.title}. Combines curated official tutorials from W3Schools and GeeksforGeeks with CI/CD-tested assignments.`;

    // Create the new Roadmap version
    const newRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        careerId,
        title,
        description,
        durationMonths: 6,
        progressPercent: 0,
        status: 'CURRENT',
        version: nextVersion,
        isCurrent: true,
        hoursPerWeek: 12,
        learningPace: 'balanced',
      },
    });

    // Fallback skill pool if gaps are empty
    const defaultSkills = [
      'Python',
      'REST APIs',
      'FastAPI',
      'SQL',
      'PostgreSQL',
      'Database Design',
      'Docker',
      'CI/CD',
      'Data Structures & Algorithms',
      'System Design',
      'Testing',
      'Technical Interviewing',
    ];

    const plannedSkills = missingOrWeakSkills.length >= 6
      ? missingOrWeakSkills
      : Array.from(new Set([...missingOrWeakSkills, ...defaultSkills]));

    // 12 Weeks across 6 Phases (2 weeks per phase)
    const phases = [
      {
        phase: 1,
        month: 1,
        theme: 'Core Foundations & Idiomatic Syntax',
        weeks: [
          {
            week: 1,
            skill: plannedSkills[0] || 'Python',
            currLevel: isJunior ? 'BEGINNER' : 'INTERMEDIATE',
            targetLevel: 'INTERMEDIATE',
            whyMatters: 'Writing idiomatic, clean code eliminates syntax hurdles and enables rapid prototype delivery.',
            practiceTask: 'Build 5 algorithmic validation routines and pass all local test cases with zero lint errors.',
            assignment: {
              title: 'Clean Syntax & Data Structures Starter',
              description: 'Implement a modular Python/TS library with full typing, unit tests, and GitHub Actions test suite.',
              repoTemplate: 'https://github.com/careerai-starter/syntax-foundations-ci',
              verificationCriteria: ['100% typecheck passing', 'Pytest suite passing with >80% branch coverage', 'Flake8/ESLint zero warnings'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
          {
            week: 2,
            skill: plannedSkills[1] || 'Data Structures & Algorithms',
            currLevel: 'BEGINNER',
            targetLevel: 'INTERMEDIATE',
            whyMatters: 'Optimal time and space complexity choices prevent major performance bottlenecks in production APIs.',
            practiceTask: 'Solve 10 curated array, hash map, and two-pointer challenges on GeeksforGeeks interactive compiler.',
            assignment: {
              title: 'Algorithmic Complexity & Benchmark Suite',
              description: 'Benchmark search and sort algorithms across 100k records, logging memory and CPU execution times.',
              repoTemplate: 'https://github.com/careerai-starter/dsa-benchmarking-ci',
              verificationCriteria: ['Sub-millisecond lookup on 50,000 keys', 'Automated memory profile within 32MB constraint'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
        ],
      },
      {
        phase: 2,
        month: 2,
        theme: 'Framework Architecture & Web APIs',
        weeks: [
          {
            week: 3,
            skill: plannedSkills[2] || 'REST APIs',
            currLevel: 'BEGINNER',
            targetLevel: 'INTERMEDIATE',
            whyMatters: 'Predictable, idempotent HTTP REST contracts allow seamless frontend-backend integration.',
            practiceTask: 'Draft OpenAPI 3.0 specifications for user, authentication, and resource endpoints.',
            assignment: {
              title: 'Production OpenAPI Contract & Mock Gateway',
              description: 'Generate and serve fully documented REST endpoints adhering to RFC 7807 problem details.',
              repoTemplate: 'https://github.com/careerai-starter/rest-api-standards-ci',
              verificationCriteria: ['All HTTP status codes match idempotent semantics', 'Swagger UI interactive playground generated'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
          {
            week: 4,
            skill: plannedSkills[3] || 'FastAPI',
            currLevel: 'INTERMEDIATE',
            targetLevel: 'ADVANCED',
            whyMatters: 'Asynchronous event loops and Pydantic validation deliver sub-10ms response times at high concurrency.',
            practiceTask: 'Build an async FastAPI service with dependency injection and JWT bearer token authentication.',
            assignment: {
              title: 'Async Microservice with OAuth2 Security',
              description: 'Implement secure auth endpoints with rate-limiting, CORS configuration, and asynchronous middleware.',
              repoTemplate: 'https://github.com/careerai-starter/fastapi-microservice-ci',
              verificationCriteria: ['JWT validation on protected routes', 'Automated pytest-asyncio tests with 100% route coverage'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
        ],
      },
      {
        phase: 3,
        month: 3,
        theme: 'Relational Schemas & Query Optimization',
        weeks: [
          {
            week: 5,
            skill: plannedSkills[4] || 'SQL',
            currLevel: 'BEGINNER',
            targetLevel: 'INTERMEDIATE',
            whyMatters: 'Mastery of relational queries and ACID guarantees protects mission-critical business transactions.',
            practiceTask: 'Complete W3Schools and GeeksforGeeks multi-table JOIN and aggregation challenges.',
            assignment: {
              title: 'Relational Normalization & Query Analytics',
              description: 'Write complex window functions and CTEs to aggregate user retention metrics.',
              repoTemplate: 'https://github.com/careerai-starter/sql-analytics-ci',
              verificationCriteria: ['Queries execute without Cartesian products', 'Zero unindexed sequential scans on test datasets'],
            },
            verificationType: 'MANUAL_CODE_REVIEW',
          },
          {
            week: 6,
            skill: plannedSkills[5] || 'PostgreSQL',
            currLevel: 'INTERMEDIATE',
            targetLevel: 'ADVANCED',
            whyMatters: 'Understanding execution plans (EXPLAIN ANALYZE) and indexes reduces p99 query latency by orders of magnitude.',
            practiceTask: 'Inspect query execution plans for slow queries and replace seq-scans with composite B-Tree indexes.',
            assignment: {
              title: 'PostgreSQL Indexing & Migration Pipeline',
              description: 'Implement reversible database schema migrations with connection pooling and index benchmark logs.',
              repoTemplate: 'https://github.com/careerai-starter/postgres-indexing-ci',
              verificationCriteria: ['Automated rollback migration test passing', 'Execution plan confirms index scan usage'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
        ],
      },
      {
        phase: 4,
        month: 4,
        theme: 'Containers, Automation & CI/CD Pipelines',
        weeks: [
          {
            week: 7,
            skill: plannedSkills[6] || 'Docker',
            currLevel: 'BEGINNER',
            targetLevel: 'INTERMEDIATE',
            whyMatters: 'Isolated container runtimes eliminate "it works on my machine" issues across development and production.',
            practiceTask: 'Write a multi-stage Dockerfile that compiles source code and produces an unprivileged alpine image under 80MB.',
            assignment: {
              title: 'Multi-Stage Docker & Compose Orchestration',
              description: 'Configure Docker Compose uniting API server, PostgreSQL database, and Redis cache with health checks.',
              repoTemplate: 'https://github.com/careerai-starter/docker-orchestration-ci',
              verificationCriteria: ['Container starts successfully with curl healthcheck', 'Non-root user execution confirmed'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
          {
            week: 8,
            skill: plannedSkills[7] || 'CI/CD',
            currLevel: 'INTERMEDIATE',
            targetLevel: 'ADVANCED',
            whyMatters: 'Automated test runners and lint gates ensure only verified, secure code reaches deployment staging.',
            practiceTask: 'Author a GitHub Actions workflow that executes tests on pull requests and blocks merging on failures.',
            assignment: {
              title: 'Enterprise CI/CD Quality Gate Pipeline',
              description: 'Build complete CI workflow running security scanners (Trivy), linters, test matrices, and build artifacts.',
              repoTemplate: 'https://github.com/careerai-starter/enterprise-cicd-workflow',
              verificationCriteria: ['Workflow completes green in under 3 minutes', 'Fails automatically if any unit test fails'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
        ],
      },
      {
        phase: 5,
        month: 5,
        theme: 'Distributed Systems & Scalable Architecture',
        weeks: [
          {
            week: 9,
            skill: plannedSkills[8] || 'System Design',
            currLevel: 'INTERMEDIATE',
            targetLevel: 'ADVANCED',
            whyMatters: 'Designing for horizontal scaling and fault tolerance separates senior software engineers from junior coders.',
            practiceTask: 'Review GeeksforGeeks System Design tutorial on rate-limiting, caching layers, and database sharding.',
            assignment: {
              title: 'High-Scale URL Shortener / Rate Limiter Design',
              description: 'Deliver architectural specification document with mermaid diagrams, capacity math, and caching tiers.',
              repoTemplate: 'https://github.com/careerai-starter/system-design-specs',
              verificationCriteria: ['Calculates QPS, storage for 10M DAU', 'Includes distributed cache failure fallback strategy'],
            },
            verificationType: 'MANUAL_CODE_REVIEW',
          },
          {
            week: 10,
            skill: plannedSkills[9] || 'Testing',
            currLevel: 'INTERMEDIATE',
            targetLevel: 'ADVANCED',
            whyMatters: 'Robust end-to-end and integration test suites prevent critical production downtime.',
            practiceTask: 'Set up automated fixtures and database rollbacks for integration testing with Pytest or Jest.',
            assignment: {
              title: 'Full-Spectrum Testing Suite (Unit + Integration)',
              description: 'Write integration test suite simulating race conditions and database connection dropouts.',
              repoTemplate: 'https://github.com/careerai-starter/full-spectrum-testing',
              verificationCriteria: ['90%+ code coverage verified via lcov', 'Simulated DB failure graceful degradation test passing'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
        ],
      },
      {
        phase: 6,
        month: 6,
        theme: 'Capstone Engineering Portfolio & Technical Interviews',
        weeks: [
          {
            week: 11,
            skill: 'Cloud Architecture',
            currLevel: 'INTERMEDIATE',
            targetLevel: 'ADVANCED',
            whyMatters: 'A live, publicly deployed full-stack system provides unassailable portfolio proof to hiring managers.',
            practiceTask: 'Deploy containerized web app with TLS certificates, environment secrets, and real-time monitoring.',
            assignment: {
              title: 'Production Portfolio Capstone Deployment',
              description: 'Deploy full-stack cloud project on AWS/Vercel/Neon with custom domain, health endpoint, and monitoring.',
              repoTemplate: 'https://github.com/careerai-starter/production-capstone-portfolio',
              verificationCriteria: ['Public HTTPS URL live and reachable', 'Automated uptime monitor passing with 200 OK'],
            },
            verificationType: 'GITHUB_ACTIONS',
          },
          {
            week: 12,
            skill: 'Technical Interviewing',
            currLevel: 'ADVANCED',
            targetLevel: 'ADVANCED',
            whyMatters: 'Articulating architectural trade-offs under live pressure turns technical skill into signed job offers.',
            practiceTask: 'Complete 3 mock technical interviews on GeeksforGeeks interview platform covering system design and live coding.',
            assignment: {
              title: 'Interview Simulator & STAR Behavioral Portfolio',
              description: 'Submit recorded behavioral STAR responses and complete 5 company-level coding assessments.',
              repoTemplate: 'https://github.com/careerai-starter/interview-readiness-drills',
              verificationCriteria: ['5/5 coding problems solved within time limits', 'ATS-optimized resume ready for submission'],
            },
            verificationType: 'MANUAL_CODE_REVIEW',
          },
        ],
      },
    ];

    // Persist all 12 weekly RoadmapItems with verified W3Schools / GeeksforGeeks resources attached
    for (const phase of phases) {
      for (const w of phase.weeks) {
        // Retrieve level-calibrated verified resources
        const verifiedResources = ResourceSelectionEngine.findResourcesForSkill(
          w.skill,
          w.currLevel,
          w.targetLevel,
          2
        );

        const resourceLinks: ResourceLinkItem[] = verifiedResources.map((res) => ({
          id: res.id,
          provider: res.provider,
          title: res.title,
          url: res.url,
          topic: res.topic,
          skill: res.skill,
          skillLevel: res.skillLevel,
          resourceType: res.resourceType,
          description: res.description,
          whyRecommended: res.whyRecommended,
          isVerified: true,
          isCompleted: false,
        }));

        const tasks: TaskItem[] = [
          {
            id: `w${w.week}-t1`,
            text: `Study verified external tutorial: ${verifiedResources[0]?.title || w.skill + ' Foundations'}`,
            done: false,
          },
          {
            id: `w${w.week}-t2`,
            text: `Complete practice drill: ${w.practiceTask}`,
            done: false,
          },
          {
            id: `w${w.week}-t3`,
            text: `Build and submit verified assignment: ${w.assignment.title}`,
            done: false,
          },
        ];

        await prisma.roadmapItem.create({
          data: {
            roadmapId: newRoadmap.id,
            month: phase.month,
            weekNumber: w.week,
            sequenceNumber: w.week,
            title: `Week ${w.week}: ${w.skill} - ${phase.theme}`,
            description: `${w.whyMatters} Practice: ${w.practiceTask}`,
            skills: [w.skill],
            currentLevel: w.currLevel,
            targetLevel: w.targetLevel,
            priority: w.week <= 4 ? 'CRITICAL' : w.week <= 8 ? 'HIGH' : 'MEDIUM',
            whyMatters: w.whyMatters,
            estimatedHours: 10.0,
            tasks: tasks as any,
            practiceTask: w.practiceTask,
            assignment: w.assignment as any,
            verificationType: w.verificationType,
            resourceLinks: resourceLinks as any,
            isCompleted: false,
          },
        });
      }
    }

    return await prisma.roadmap.findUnique({
      where: { id: newRoadmap.id },
      include: {
        items: {
          orderBy: { weekNumber: 'asc' },
        },
        career: true,
      },
    });
  }

  /**
   * Tracks candidate clicking 'Start Learning' on a verified external tutorial
   */
  public static async startResource(userId: string, itemId: string, resourceId: string) {
    const item = await prisma.roadmapItem.findUnique({
      where: { id: itemId },
      include: { roadmap: true },
    });

    if (!item || item.roadmap.userId !== userId) {
      throw new Error('Roadmap item not found or unauthorized');
    }

    // Check existing interaction
    const existing = await prisma.resourceInteraction.findFirst({
      where: { userId, roadmapItemId: itemId, resourceId },
    });

    if (!existing) {
      return await prisma.resourceInteraction.create({
        data: {
          userId,
          roadmapItemId: itemId,
          resourceId,
          startedAt: new Date(),
        },
      });
    }

    return existing;
  }

  /**
   * Records candidate completion of a resource (USER_MARKED_COMPLETE)
   */
  public static async completeResource(
    userId: string,
    itemId: string,
    resourceId: string,
    notes?: string
  ) {
    const item = await prisma.roadmapItem.findUnique({
      where: { id: itemId },
      include: { roadmap: true },
    });

    if (!item || item.roadmap.userId !== userId) {
      throw new Error('Roadmap item not found or unauthorized');
    }

    // Upsert interaction
    const existing = await prisma.resourceInteraction.findFirst({
      where: { userId, roadmapItemId: itemId, resourceId },
    });

    if (existing) {
      await prisma.resourceInteraction.update({
        where: { id: existing.id },
        data: {
          completedAt: new Date(),
          completionType: 'USER_MARKED_COMPLETE',
          notes: notes || existing.notes,
        },
      });
    } else {
      await prisma.resourceInteraction.create({
        data: {
          userId,
          roadmapItemId: itemId,
          resourceId,
          startedAt: new Date(),
          completedAt: new Date(),
          completionType: 'USER_MARKED_COMPLETE',
          notes,
        },
      });
    }

    // Update resourceLinks JSON in roadmapItem to mark isCompleted = true
    const resourceLinks = ((item.resourceLinks as unknown as ResourceLinkItem[]) || []).map((r) =>
      r.id === resourceId ? { ...r, isCompleted: true } : r
    );

    await prisma.roadmapItem.update({
      where: { id: itemId },
      data: {
        resourceLinks: resourceLinks as any,
      },
    });

    return { success: true, resourceId, completionType: 'USER_MARKED_COMPLETE' };
  }

  /**
   * Retrieves the candidate's active roadmap for a career or the latest active roadmap
   */
  public static async getCurrentRoadmap(userId: string, careerId?: string) {
    const whereClause: any = { userId, isCurrent: true };
    if (careerId) {
      whereClause.careerId = careerId;
    }

    return await prisma.roadmap.findFirst({
      where: whereClause,
      include: {
        items: {
          orderBy: { weekNumber: 'asc' },
        },
        career: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Retrieves all historical versions of candidate roadmaps
   */
  public static async getRoadmapHistory(userId: string, careerId?: string) {
    const whereClause: any = { userId };
    if (careerId) {
      whereClause.careerId = careerId;
    }

    return await prisma.roadmap.findMany({
      where: whereClause,
      include: {
        career: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { version: 'desc' },
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
    const roadmapStatus = progressPercent === 100 ? 'COMPLETED' : 'CURRENT';

    const updatedRoadmap = await prisma.roadmap.update({
      where: { id: item.roadmapId },
      data: {
        progressPercent,
        status: roadmapStatus,
      },
      include: {
        items: { orderBy: { weekNumber: 'asc' } },
        career: true,
      },
    });

    return updatedRoadmap;
  }
}
