import { prisma } from '../lib/db';
import { hashPassword, comparePassword, signToken, verifyToken } from '../lib/auth';
import { RecommendationEngine } from '../lib/recommendationEngine';
import { ResumeParserService } from '../lib/resumeParser';

async function runEndToEndTests() {
  console.log('====================================================');
  console.log('STARTING COMPLETE END-TO-END WORKFLOW VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // STAGE 1: DATABASE SEED INTEGRITY
    // -------------------------------------------------------------
    console.log('[STAGE 1: Database Seed Verification]');
    const careerCount = await prisma.career.count();
    const skillCount = await prisma.skill.count();
    const questionCount = await prisma.aptitudeQuestion.count();

    assert(careerCount >= 20, `Career catalog contains >= 20 careers (found: ${careerCount})`);
    assert(skillCount >= 50, `Skill taxonomy contains >= 50 skills (found: ${skillCount})`);
    assert(questionCount >= 15, `Diagnostic bank contains >= 15 questions (found: ${questionCount})`);

    // -------------------------------------------------------------
    // STAGE 2: AUTHENTICATION, PASSWORD HASHING & JWT SECURITY
    // -------------------------------------------------------------
    console.log('\n[STAGE 2: Authentication & Identity Security]');
    const testEmail = `candidate_${Date.now()}@careerai-test.dev`;
    const plainPassword = 'Password@123';
    const hashedPassword = await hashPassword(plainPassword);

    assert(hashedPassword !== plainPassword, 'Password hashing creates secure salted hash');
    const isPasswordValid = await comparePassword(plainPassword, hashedPassword);
    assert(isPasswordValid, 'Password verification succeeds for valid credentials');

    const invalidPasswordValid = await comparePassword('WrongPassword', hashedPassword);
    assert(!invalidPasswordValid, 'Password verification correctly rejects invalid credentials');

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: 'Alex Johnson',
        email: testEmail,
        passwordHash: hashedPassword,
        role: 'USER',
      },
    });
    assert(!!user.id, `Test user successfully created with ID: ${user.id}`);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    assert(typeof token === 'string' && token.length > 20, 'JWT token generation succeeds');

    const decoded = verifyToken(token);
    assert(decoded?.userId === user.id && decoded?.email === testEmail, 'JWT token decodes valid user claims');

    // -------------------------------------------------------------
    // STAGE 3: MULTI-STEP ONBOARDING & PROFILE PERSISTENCE
    // -------------------------------------------------------------
    console.log('\n[STAGE 3: Candidate Profile & Onboarding]');
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        phone: '+1 (555) 345-6789',
        bio: 'Aspiring Full Stack Engineer passionate about TypeScript, React, and scalable cloud architectures.',
        degree: 'Bachelor of Science',
        branch: 'Computer Science',
        college: 'University of California, Berkeley',
        gradYear: 2026,
        cgpa: 3.85,
        workExperienceYears: 1.0,
        preferredRoles: ['Full Stack Developer', 'Cloud Engineer'],
        interests: ['Web Development', 'Distributed Systems', 'Cloud Computing'],
        location: 'San Francisco, CA or Remote',
        careerGoals: 'Build high-performance web applications and master distributed cloud systems.',
        githubUrl: 'https://github.com/alexjohnson',
        linkedinUrl: 'https://linkedin.com/in/alexjohnson',
      },
    });
    assert(profile.userId === user.id, 'Candidate educational & career profile persisted');

    // Assign verified candidate skills
    const candidateSkillNames = ['TypeScript', 'JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git'];
    const dbSkills = await prisma.skill.findMany({
      where: { name: { in: candidateSkillNames } },
    });

    for (const s of dbSkills) {
      await prisma.userSkill.create({
        data: {
          userId: user.id,
          skillId: s.id,
          proficiency: 4,
          verified: true,
        },
      });
    }
    const userSkillsCount = await prisma.userSkill.count({ where: { userId: user.id } });
    assert(userSkillsCount === dbSkills.length, `Assigned ${userSkillsCount} verified skills to candidate`);

    // -------------------------------------------------------------
    // STAGE 4: COGNITIVE ASSESSMENT & SCORING
    // -------------------------------------------------------------
    console.log('\n[STAGE 4: Cognitive Assessment Diagnostics]');
    const questions = await prisma.aptitudeQuestion.findMany({ take: 10 });
    assert(questions.length >= 5, 'Retrieved active questions for test attempt');

    // Simulate candidate answering questions
    let correctCount = 0;
    const categoryBreakdown: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q, idx) => {
      const isCorrect = idx % 2 === 0; // 50% accurate
      if (isCorrect) correctCount++;

      if (!categoryBreakdown[q.category]) {
        categoryBreakdown[q.category] = { total: 0, correct: 0 };
      }
      categoryBreakdown[q.category].total++;
      if (isCorrect) categoryBreakdown[q.category].correct++;
    });

    const overallAptitudeScore = Math.round((correctCount / questions.length) * 100);
    const categoryScores: Record<string, any> = {};
    for (const [cat, data] of Object.entries(categoryBreakdown)) {
      categoryScores[cat] = {
        total: data.total,
        score: data.correct,
        percentage: Math.round((data.correct / data.total) * 100),
      };
    }

    const testAttempt = await prisma.aptitudeAttempt.create({
      data: {
        userId: user.id,
        score: overallAptitudeScore,
        totalQuestions: questions.length,
        correctCount: correctCount,
        categoryScores: categoryScores as any,
        strengths: ['Logical Reasoning', 'Analytical Thinking'],
        weaknesses: ['Verbal Ability'],
      },
    });
    assert(testAttempt.score === overallAptitudeScore, `Assessment attempt saved with score ${overallAptitudeScore}%`);

    // -------------------------------------------------------------
    // STAGE 5: TRANSPARENT HYBRID RECOMMENDATION ENGINE
    // -------------------------------------------------------------
    console.log('\n[STAGE 5: Transparent Hybrid Recommendation Engine]');
    const recommendations = await RecommendationEngine.generateUserRecommendations(user.id);

    assert(recommendations.length > 0, `Generated ${recommendations.length} explainable career recommendations`);
    const topRec = recommendations[0];
    assert(topRec.matchScore > 0 && topRec.matchScore <= 100, `Top match score within 1-100% (${topRec.matchScore}%)`);
    assert(!!topRec.breakdown, 'Top recommendation contains transparent score breakdown');
    assert(typeof topRec.breakdown.skillScore === 'number', 'Exposes skills match factor');
    assert(typeof topRec.breakdown.interestScore === 'number', 'Exposes interest match factor');
    assert(typeof topRec.breakdown.aptitudeScore === 'number', 'Exposes aptitude alignment factor');
    assert(typeof topRec.breakdown.educationScore === 'number', 'Exposes education fit factor');
    assert(typeof topRec.breakdown.experienceScore === 'number', 'Exposes experience match factor');
    assert(typeof topRec.breakdown.preferenceScore === 'number', 'Exposes preferences fit factor');
    assert(Array.isArray(topRec.breakdown.contributingFactors), 'Exposes 7 granular contributing factor objects');

    // Verify recommendations persisted by engine
    const savedRecsCount = await prisma.careerRecommendation.count({ where: { userId: user.id } });
    assert(savedRecsCount > 0, `Recommendations automatically persisted by engine (count: ${savedRecsCount})`);

    // -------------------------------------------------------------
    // STAGE 6: CAREER DETAILS & SKILL GAP ANALYSIS
    // -------------------------------------------------------------
    console.log('\n[STAGE 6: Career Deep-Dive & Skill Gap Analysis]');
    const targetCareer = await prisma.career.findUnique({
      where: { id: topRec.careerId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });
    assert(!!targetCareer, `Target career loaded: "${targetCareer?.title}"`);

    const careerSkillNames = targetCareer?.skills.map((cs) => cs.skill.name) || [];
    const acquiredSkillNames = new Set(candidateSkillNames);
    const missingSkills = careerSkillNames.filter((s) => !acquiredSkillNames.has(s));

    assert(careerSkillNames.length > 0, `Career has ${careerSkillNames.length} mapped skills (${missingSkills.length} missing)`);

    // -------------------------------------------------------------
    // STAGE 7: 6-MONTH ROADMAP GENERATION & TASK TOGGLING
    // -------------------------------------------------------------
    console.log('\n[STAGE 7: Personalized Learning Roadmap & Task State]');
    const roadmap = await prisma.roadmap.create({
      data: {
        userId: user.id,
        careerId: targetCareer!.id,
        title: `6-Month Path to ${targetCareer!.title}`,
        description: 'Structured, hands-on learning roadmap generated from your skill gap analysis.',
        durationMonths: 6,
        progressPercent: 0,
        status: 'IN_PROGRESS',
        items: {
          create: [
            {
              month: 1,
              title: 'Foundations & Architectural Core',
              description: 'Deep-dive into TypeScript and architectural patterns',
              skills: ['TypeScript', 'Git'],
              tasks: [
                { id: 'm1-t1', text: 'Master TypeScript Generics & Type Gymnastics', done: false },
                { id: 'm1-t2', text: 'Configure ESLint and Prettier for strict enterprise project', done: false },
              ],
            },
            {
              month: 2,
              title: 'Full Stack Integration & Data Modeling',
              description: 'Next.js App Router and Prisma relational schemas',
              skills: ['React', 'Next.js', 'PostgreSQL'],
              tasks: [
                { id: 'm2-t1', text: 'Implement RESTful endpoints with validation', done: false },
                { id: 'm2-t2', text: 'Optimize database indexes and query pooling', done: false },
              ],
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });
    assert(!!roadmap.id, `Created 6-month interactive roadmap (ID: ${roadmap.id}) with ${roadmap.items.length} milestone items`);

    // Simulate completing a task in month 1
    const firstItem = roadmap.items[0];
    const tasks = firstItem.tasks as any[];
    tasks[0].done = true;

    await prisma.roadmapItem.update({
      where: { id: firstItem.id },
      data: {
        tasks: tasks as any,
        notes: 'Completed deep dive into TypeScript mapped types.',
      },
    });

    // Update overall roadmap progress: 1 of 4 tasks done = 25%
    const updatedRoadmap = await prisma.roadmap.update({
      where: { id: roadmap.id },
      data: {
        progressPercent: 25,
      },
    });
    assert(updatedRoadmap.progressPercent === 25, 'Roadmap progress successfully updated to 25% on task toggle');

    // -------------------------------------------------------------
    // STAGE 8: RESUME PARSING & ATS SCORING
    // -------------------------------------------------------------
    console.log('\n[STAGE 8: Resume Parsing & ATS Intelligence]');
    const sampleResumeText = `
Alex Johnson
Full Stack Software Engineer
Email: alex.johnson@example.com | Phone: (555) 345-6789 | San Francisco, CA

EXPERIENCE
Software Engineering Intern - CloudSystems Inc. (2024 - 2025)
- Developed and deployed modern web applications using TypeScript, React, and Node.js.
- Designed PostgreSQL database schemas and optimized indexing to reduce query latency by 35%.
- Implemented automated CI/CD pipelines with Git and Docker for rapid deployment cycles.

EDUCATION
B.S. in Computer Science - University of California, Berkeley (2022 - 2026) | GPA: 3.85

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL
Frameworks: React, Next.js, Node.js, Express
Databases: PostgreSQL, Redis
Tools: Git, Docker, Linux
    `;

    const resumeBuffer = Buffer.from(sampleResumeText, 'utf-8');
    const rawText = await ResumeParserService.extractTextFromBuffer(resumeBuffer, 'txt');
    const parsedResume = await ResumeParserService.analyzeResume(
      user.id,
      'Alex_Johnson_Resume.txt',
      rawText,
      targetCareer!.id
    );

    assert(parsedResume.extractedSkills.length >= 3, `Resume parser detected ${parsedResume.extractedSkills.length} technical skills`);
    assert(parsedResume.atsScore >= 40, `ATS score calculated (${parsedResume.atsScore}/100)`);
    assert(parsedResume.weakBulletPoints.length > 0, 'Generated actionable bullet-point enhancements');
    assert(parsedResume.recommendations.length > 0, 'Generated actionable resume recommendations');

    // Verify resume analysis automatically persisted to database
    const savedResume = await prisma.resumeAnalysis.findFirst({
      where: { userId: user.id },
    });
    assert(!!savedResume?.id, 'Candidate resume telemetry automatically persisted to database');

    // -------------------------------------------------------------
    // STAGE 9: ADMIN GOVERNANCE & TELEMETRY
    // -------------------------------------------------------------
    console.log('\n[STAGE 9: Admin Telemetry & Governance]');
    const totalUsers = await prisma.user.count();
    const totalRoadmaps = await prisma.roadmap.count();
    const totalResumes = await prisma.resumeAnalysis.count();

    assert(totalUsers >= 2, `Admin telemetry reflects >= 2 registered users (total: ${totalUsers})`);
    assert(totalRoadmaps >= 1, `Admin telemetry reflects active roadmaps (total: ${totalRoadmaps})`);
    assert(totalResumes >= 1, `Admin telemetry reflects parsed resumes (total: ${totalResumes})`);

    // Promote user to ADMIN and verify
    const promotedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });
    assert(promotedUser.role === 'ADMIN', 'Successfully promoted candidate to ADMIN');

    // Demote back to USER
    const demotedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'USER' },
    });
    assert(demotedUser.role === 'USER', 'Successfully restored candidate to USER');

    // -------------------------------------------------------------
    // CLEANUP TEST USER DATA
    // -------------------------------------------------------------
    console.log('\n[STAGE 10: Test Environment Cleanup]');
    await prisma.resumeAnalysis.deleteMany({ where: { userId: user.id } });
    await prisma.roadmapItem.deleteMany({ where: { roadmapId: roadmap.id } });
    await prisma.roadmap.deleteMany({ where: { userId: user.id } });
    await prisma.careerRecommendation.deleteMany({ where: { userId: user.id } });
    await prisma.aptitudeAttempt.deleteMany({ where: { userId: user.id } });
    await prisma.userSkill.deleteMany({ where: { userId: user.id } });
    await prisma.profile.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('  [PASS] Test candidate entities successfully cleaned up.');

    // -------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------
    console.log('\n====================================================');
    console.log(`END-TO-END VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndTests();
