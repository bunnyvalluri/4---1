import { prisma } from './db';
import { AIService } from './gemini';
import { PythonRecommenderBridge } from './pythonBridge';

export interface ContributingFactor {
  id: string;
  name: string;
  score: number;
  weightPercent: number;
  weightedPoints: number;
  status: 'positive' | 'neutral' | 'growth_area';
  insight: string;
}

export interface ScoreBreakdown {
  skillScore: number;
  aptitudeScore: number;
  interestScore: number;
  educationScore: number;
  experienceScore: number;
  preferenceScore: number;
  resumeScore: number;
  confidenceScore: number;
  contributingFactors: ContributingFactor[];
}

export interface RecommendationResult {
  careerId: string;
  careerTitle: string;
  slug: string;
  category: string;
  salaryRange: string;
  demandLevel?: string;
  matchScore: number;
  confidenceScore: number;
  breakdown: ScoreBreakdown;
  matchingSkills: {
    name: string;
    userProficiency: number;
    requiredProficiency: number;
    verified?: boolean;
    source?: 'profile' | 'resume' | 'transfer';
  }[];
  missingSkills: string[];
  reasoning: string;
  recommendedActions: string[];
}

export interface CandidateProfileInput {
  userId?: string;
  name?: string;
  degree?: string | null;
  branch?: string | null;
  cgpa?: number | null;
  workExperienceYears?: number | null;
  interests?: string[];
  preferredIndustries?: string[];
  preferredRoles?: string[];
  preferredLocations?: string[];
  careerGoals?: string | null;
  skills: { name: string; proficiency: number; verified?: boolean }[];
  aptitudeScores?: {
    overall?: number;
    categoryScores?: Record<string, { total?: number; correct?: number; percentage: number }>;
  } | null;
  resumeData?: {
    extractedSkills: string[];
    atsScore?: number;
    summary?: string;
  } | null;
}

export interface CareerTargetInput {
  id: string;
  title: string;
  slug: string;
  category: string;
  overview: string;
  description: string;
  educationReqs: string;
  experienceLevel: string;
  salaryRange: string;
  demandLevel?: string;
  aptitudeReqs?: Record<string, number> | unknown;
  commonJobTitles?: string[];
  skills: {
    skill: { name: string };
    isRequired: boolean;
    minProficiency: number;
    weight: number;
  }[];
}

// Semantic cross-skill transfer graph
const SKILL_TRANSFER_GRAPH: Record<string, string[]> = {
  typescript: ['javascript'],
  javascript: ['typescript', 'html5 & css3'],
  python: ['machine learning', 'deep learning', 'pandas & numpy', 'scikit-learn'],
  'deep learning': ['machine learning', 'pytorch', 'tensorflow / keras'],
  pytorch: ['deep learning', 'machine learning', 'python'],
  'tensorflow / keras': ['deep learning', 'machine learning', 'python'],
  'react.js': ['next.js', 'javascript', 'typescript', 'html5 & css3'],
  'next.js': ['react.js', 'typescript', 'javascript', 'node.js'],
  postgresql: ['sql', 'mysql'],
  mysql: ['sql', 'postgresql'],
  sql: ['postgresql', 'mysql'],
  docker: ['kubernetes', 'cloud & infrastructure'],
  kubernetes: ['docker', 'aws (amazon web services)'],
  'aws (amazon web services)': ['cloud', 'docker', 'kubernetes'],
  figma: ['design systems & wireframing', 'user research & usability testing', 'ui/ux'],
  'design systems & wireframing': ['figma'],
  'network security': ['cybersecurity', 'cryptography', 'linux administration'],
  cryptography: ['cybersecurity', 'network security'],
  flutter: ['mobile app development', 'dart', 'react native'],
  'react native': ['mobile app development', 'react.js', 'javascript', 'typescript'],
};

export class RecommendationEngine {
  /**
   * Evaluates candidate skills (from profile, resume, and transfer credits) against career requirements.
   */
  public static calculateSkillCompatibility(
    candidate: CandidateProfileInput,
    career: CareerTargetInput
  ): {
    score: number;
    matchingSkills: RecommendationResult['matchingSkills'];
    missingSkills: string[];
    insight: string;
  } {
    const userSkillsMap = new Map<string, { proficiency: number; verified: boolean; source: 'profile' | 'resume' }>();

    // 1. Ingest profile skills
    for (const us of candidate.skills) {
      userSkillsMap.set(us.name.toLowerCase().trim(), {
        proficiency: Math.max(1, Math.min(5, us.proficiency)),
        verified: !!us.verified,
        source: 'profile',
      });
    }

    // 2. Ingest resume-derived skills as corroborating or complementary skills
    const resumeSkills = (candidate.resumeData?.extractedSkills || []).map((s) => s.toLowerCase().trim());
    for (const rs of resumeSkills) {
      if (!userSkillsMap.has(rs)) {
        userSkillsMap.set(rs, {
          proficiency: 3, // empirical baseline for resume-detected skill
          verified: false,
          source: 'resume',
        });
      }
    }

    let totalWeight = 0;
    let earnedWeight = 0;
    let coreSkillCount = 0;
    let coreSkillsMatched = 0;

    const matchingSkills: RecommendationResult['matchingSkills'] = [];
    const missingSkills: string[] = [];

    for (const cs of career.skills) {
      const skillName = cs.skill.name;
      const skillNameLower = skillName.toLowerCase().trim();
      const isCore = cs.isRequired;
      if (isCore) coreSkillCount++;

      // Core skills carry 2.2x weight to reflect critical job requirements
      const weight = (isCore ? 2.2 : 1.0) * (cs.weight || 1.0);
      totalWeight += weight;

      // Direct Match
      const directMatch = userSkillsMap.get(skillNameLower);
      if (directMatch) {
        if (isCore) coreSkillsMatched++;
        const requiredProf = cs.minProficiency || 3;
        const candidateProf = directMatch.proficiency;

        // Proficiency satisfaction with reward for mastery
        let satisfactionRatio: number;
        if (candidateProf >= requiredProf) {
          satisfactionRatio = 1.0 + Math.min(0.12, (candidateProf - requiredProf) * 0.04);
        } else {
          satisfactionRatio = Math.max(0.2, candidateProf / requiredProf);
        }

        earnedWeight += weight * satisfactionRatio;
        matchingSkills.push({
          name: skillName,
          userProficiency: candidateProf,
          requiredProficiency: requiredProf,
          verified: directMatch.verified,
          source: directMatch.source,
        });
        continue;
      }

      // Cross-skill transfer credit check
      let transferFound = false;
      const transferCandidates = SKILL_TRANSFER_GRAPH[skillNameLower] || [];
      for (const tc of transferCandidates) {
        const transferSkill = userSkillsMap.get(tc);
        if (transferSkill) {
          transferFound = true;
          const requiredProf = cs.minProficiency || 3;
          // Assign 70% domain transfer credit
          const effectiveProf = Math.min(requiredProf, Math.round(transferSkill.proficiency * 0.75));
          const satisfactionRatio = Math.max(0.3, effectiveProf / requiredProf) * 0.75;
          earnedWeight += weight * satisfactionRatio;

          matchingSkills.push({
            name: `${skillName} (via ${tc})`,
            userProficiency: effectiveProf,
            requiredProficiency: requiredProf,
            verified: false,
            source: 'transfer',
          });
          break;
        }
      }

      if (!transferFound) {
        missingSkills.push(skillName);
      }
    }

    let rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 50;

    // Asymmetric Core Skill Coverage Penalty:
    // Missing vital foundational core skills cannot be masked solely by peripheral tooling
    if (coreSkillCount > 0) {
      const coreCoverage = coreSkillsMatched / coreSkillCount;
      if (coreCoverage < 0.3) {
        // Severe penalty if less than 30% of core skills are satisfied
        rawScore = rawScore * (0.4 + 1.5 * Math.pow(coreCoverage, 1.5));
      } else if (coreCoverage < 0.6) {
        rawScore = rawScore * (0.7 + 0.5 * coreCoverage);
      }
    }

    const finalScore = Math.round(Math.max(5, Math.min(100, rawScore)));
    const matchedCount = matchingSkills.length;
    const totalCount = career.skills.length;

    let insight: string;
    if (finalScore >= 80) {
      insight = `Strong match: demonstrates ${matchedCount}/${totalCount} career competencies (${coreSkillsMatched}/${coreSkillCount} core requirements satisfied).`;
    } else if (finalScore >= 55) {
      insight = `Moderate match: possesses foundational skills, but has gaps in ${missingSkills.slice(0, 2).join(', ')}.`;
    } else {
      insight = `Low technical overlap: requires foundational ramp-up in core technologies (${missingSkills.slice(0, 3).join(', ')}).`;
    }

    return {
      score: finalScore,
      matchingSkills,
      missingSkills,
      insight,
    };
  }

  /**
   * Matches candidate educational degree, major/branch, and academic distinction against target career prerequisites.
   */
  public static calculateEducationCompatibility(
    candidate: CandidateProfileInput,
    career: CareerTargetInput
  ): { score: number; insight: string } {
    const userDegree = (candidate.degree || '').toLowerCase();
    const userBranch = (candidate.branch || '').toLowerCase();
    const reqText = (career.educationReqs || '').toLowerCase();
    const careerCategory = (career.category || '').toLowerCase();
    const careerTitle = (career.title || '').toLowerCase();
    const cgpa = candidate.cgpa || null;

    let baseScore = 50; // default for unspecified academic profile

    // Domain keywords mapping
    const domainClusters: Record<string, string[]> = {
      cs: ['computer', 'information', 'software', 'data', 'artificial', 'machine learning', 'cyber', 'it'],
      engineering: ['engineering', 'tech', 'electronics', 'electrical', 'mechanical'],
      math_stats: ['statistics', 'mathematics', 'math', 'quantitative', 'analytics', 'economics', 'data science'],
      design: ['design', 'human-computer interaction', 'hci', 'graphic', 'ux', 'ui', 'fine arts', 'psychology'],
      business: ['business', 'management', 'mba', 'administration', 'finance', 'marketing', 'commerce'],
    };

    // Determine target career primary domain
    const targetIsDesign = careerCategory.includes('design') || careerTitle.includes('designer') || reqText.includes('design');
    const targetIsProduct = careerTitle.includes('product manager') || reqText.includes('business') || reqText.includes('mba');
    const targetIsData = careerCategory.includes('data') || careerCategory.includes('artificial') || reqText.includes('statistics');
    const targetIsCyber = careerCategory.includes('security') || careerTitle.includes('cyber');
    const targetIsSoftware = careerCategory.includes('software') || careerCategory.includes('cloud') || careerCategory.includes('infrastructure');

    // Determine candidate branch cluster
    const candInCs = domainClusters.cs.some((k) => userBranch.includes(k));
    const candInMath = domainClusters.math_stats.some((k) => userBranch.includes(k));
    const candInDesign = domainClusters.design.some((k) => userBranch.includes(k));
    const candInBusiness = domainClusters.business.some((k) => userBranch.includes(k));
    const candInEng = domainClusters.engineering.some((k) => userBranch.includes(k));

    if (targetIsDesign) {
      if (candInDesign) baseScore = 95;
      else if (candInCs || userBranch.includes('media')) baseScore = 80;
      else if (reqText.includes('portfolio') || userDegree.includes('bachelor')) baseScore = 70;
      else baseScore = 55;
    } else if (targetIsProduct) {
      if (candInBusiness && candInEng) baseScore = 96;
      else if (candInBusiness || candInCs || candInEng) baseScore = 88;
      else if (candInMath) baseScore = 82;
      else baseScore = 65;
    } else if (targetIsData) {
      if (candInMath && candInCs) baseScore = 98;
      else if (candInMath || candInCs) baseScore = 92;
      else if (candInEng) baseScore = 80;
      else baseScore = 50;
    } else if (targetIsCyber) {
      if (userBranch.includes('security') || userBranch.includes('cyber')) baseScore = 98;
      else if (candInCs) baseScore = 92;
      else if (candInEng) baseScore = 78;
      else baseScore = 50;
    } else if (targetIsSoftware) {
      if (candInCs) baseScore = 95;
      else if (candInEng) baseScore = 82;
      else if (candInMath) baseScore = 75;
      else baseScore = 48;
    } else {
      // General semantic match
      const branchWords = userBranch.split(/[\s,/-]+/).filter((w) => w.length > 3);
      const matchHits = branchWords.filter((w) => reqText.includes(w)).length;
      baseScore = matchHits > 0 ? 85 : 65;
    }

    // Degree Level Consideration
    if (userDegree.includes('phd') || userDegree.includes('doctorate')) {
      baseScore = Math.min(100, baseScore + 6);
    } else if (userDegree.includes('master') || userDegree.includes('m.s') || userDegree.includes('mca') || userDegree.includes('m.tech')) {
      baseScore = Math.min(100, baseScore + 4);
    } else if (!userDegree.includes('bachelor') && !userDegree.includes('b.tech') && !userDegree.includes('b.e') && userDegree.length > 2) {
      // Diploma / associate / non-standard
      if (!reqText.includes('portfolio') && !reqText.includes('equivalent')) {
        baseScore = Math.max(35, baseScore - 10);
      }
    }

    // CGPA Impact (merit reward)
    if (cgpa !== null && cgpa > 0) {
      if (cgpa >= 9.0 || (cgpa <= 4.0 && cgpa >= 3.8)) {
        baseScore = Math.min(100, baseScore + 5);
      } else if (cgpa < 6.0 && cgpa > 2.0) {
        baseScore = Math.max(30, baseScore - 5);
      }
    }

    const finalScore = Math.round(Math.max(20, Math.min(100, baseScore)));
    let insight: string;
    if (finalScore >= 85) {
      insight = `Education in ${candidate.branch || 'current field'} closely aligns with ${career.title} requirements (${career.educationReqs.slice(0, 60)}...).`;
    } else if (finalScore >= 65) {
      insight = `Relevant academic degree; supplementary certifications or portfolio will reinforce cross-domain qualification.`;
    } else {
      insight = `Non-traditional educational background for this track; requires strong project demonstrations to offset degree variance.`;
    }

    return { score: finalScore, insight };
  }

  /**
   * Compares candidate work experience years to career seniority band using a smooth calibration curve.
   */
  public static calculateExperienceCompatibility(
    candidate: CandidateProfileInput,
    career: CareerTargetInput
  ): { score: number; insight: string } {
    const candidateExp = candidate.workExperienceYears || 0;
    const levelStr = (career.experienceLevel || '').toLowerCase();

    let targetMin = 0;
    let targetMax = 3;

    if (levelStr.includes('entry') && levelStr.includes('senior')) {
      targetMin = 1;
      targetMax = 5;
    } else if (levelStr.includes('entry') && levelStr.includes('mid')) {
      targetMin = 0;
      targetMax = 3;
    } else if (levelStr.includes('mid') && levelStr.includes('director')) {
      targetMin = 3;
      targetMax = 8;
    } else if (levelStr.includes('entry') && levelStr.includes('staff')) {
      targetMin = 1;
      targetMax = 6;
    } else if (levelStr.includes('senior') || levelStr.includes('lead') || levelStr.includes('principal')) {
      targetMin = 4;
      targetMax = 10;
    } else if (levelStr.includes('mid')) {
      targetMin = 2;
      targetMax = 5;
    } else {
      // Entry
      targetMin = 0;
      targetMax = 2;
    }

    let score: number;

    if (candidateExp >= targetMin && candidateExp <= targetMax) {
      // Ideal bracket
      score = 95 + Math.min(5, (candidateExp - targetMin) * 1.5);
    } else if (candidateExp < targetMin) {
      // Under-experienced: smooth deficit drop
      const deficit = targetMin - candidateExp;
      score = Math.max(30, 90 - deficit * 18);
    } else {
      // Over-experienced: minor saturation drop, not harsh
      const surplus = candidateExp - targetMax;
      score = Math.max(75, 95 - surplus * 3.5);
    }

    const finalScore = Math.round(score);
    let insight: string;
    if (finalScore >= 90) {
      insight = `Candidate experience (${candidateExp} yrs) sits right in the target operational range for ${career.experienceLevel}.`;
    } else if (candidateExp < targetMin) {
      insight = `Target role calls for ${targetMin}+ years; candidate brings ${candidateExp} yrs, indicating a reach/acceleration opportunity.`;
    } else {
      insight = `Candidate brings senior experience (${candidateExp} yrs), well exceeding baseline requirements.`;
    }

    return { score: finalScore, insight };
  }

  /**
   * Compares candidate interests, preferred roles, preferred industries, and career goals with career metadata.
   */
  public static calculateInterestsAndPreferencesCompatibility(
    candidate: CandidateProfileInput,
    career: CareerTargetInput
  ): {
    interestScore: number;
    preferenceScore: number;
    combinedScore: number;
    insight: string;
  } {
    const userInterests = (candidate.interests || []).map((i) => i.toLowerCase().trim());
    const preferredRoles = (candidate.preferredRoles || []).map((r) => r.toLowerCase().trim());
    const preferredIndustries = (candidate.preferredIndustries || []).map((i) => i.toLowerCase().trim());
    const careerGoals = (candidate.careerGoals || '').toLowerCase().trim();

    const careerTitle = career.title.toLowerCase();
    const careerCat = career.category.toLowerCase();
    const careerOverview = career.overview.toLowerCase();
    const commonTitles = (career.commonJobTitles || []).map((t) => t.toLowerCase());

    // 1. Interest Matching via multi-term relevance
    let interestHits = 0;
    const totalInterests = Math.max(1, userInterests.length);

    for (const interest of userInterests) {
      if (careerTitle.includes(interest) || careerCat.includes(interest)) {
        interestHits += 2.0;
      } else if (careerOverview.includes(interest)) {
        interestHits += 1.0;
      } else {
        const words = interest.split(/[\s/]+/).filter((w) => w.length > 3);
        const hasOverlap = words.some((w) => careerOverview.includes(w) || careerCat.includes(w));
        if (hasOverlap) interestHits += 0.6;
      }
    }

    const normalizedInterestRatio = Math.min(1.0, interestHits / Math.min(totalInterests * 1.5, 4.0));
    const interestScore = Math.round(35 + normalizedInterestRatio * 65);

    // 2. Career Preferences Matching (Roles, Industries, Goals)
    let roleFit = 40; // baseline if no preferred roles specified
    if (preferredRoles.length > 0) {
      let bestRoleMatch = 0;
      for (const prefRole of preferredRoles) {
        if (prefRole === careerTitle || careerTitle.includes(prefRole) || prefRole.includes(careerTitle)) {
          bestRoleMatch = Math.max(bestRoleMatch, 100);
        } else if (commonTitles.some((ct) => ct.includes(prefRole) || prefRole.includes(ct))) {
          bestRoleMatch = Math.max(bestRoleMatch, 90);
        } else {
          const roleWords = prefRole.split(/[\s/]+/).filter((w) => w.length > 3);
          const wordMatches = roleWords.filter((w) => careerTitle.includes(w) || careerOverview.includes(w)).length;
          if (wordMatches > 0) {
            bestRoleMatch = Math.max(bestRoleMatch, 50 + (wordMatches / roleWords.length) * 35);
          }
        }
      }
      roleFit = bestRoleMatch > 0 ? bestRoleMatch : 35;
    }

    let industryFit = 50;
    if (preferredIndustries.length > 0) {
      const match = preferredIndustries.some((pi) => careerCat.includes(pi) || pi.includes(careerCat));
      industryFit = match ? 95 : 55;
    }

    let goalFit = 50;
    if (careerGoals.length > 10) {
      const goalWords = careerGoals.split(/[\s,.-]+/).filter((w) => w.length > 3);
      const hits = goalWords.filter((w) => careerOverview.includes(w) || careerTitle.includes(w)).length;
      goalFit = Math.min(100, 45 + (hits / Math.min(goalWords.length, 6)) * 55);
    }

    const preferenceScore = Math.round(roleFit * 0.5 + industryFit * 0.25 + goalFit * 0.25);
    const combinedScore = Math.round(interestScore * 0.5 + preferenceScore * 0.5);

    let insight: string;
    if (combinedScore >= 80) {
      insight = `Strong alignment: career matches specified target roles, industry passions, and stated career goals.`;
    } else if (combinedScore >= 55) {
      insight = `Moderate alignment: overlaps with some candidate interests but diverges slightly from stated primary roles.`;
    } else {
      insight = `Low affinity with expressed role preferences and target domain interest vectors.`;
    }

    return { interestScore, preferenceScore, combinedScore, insight };
  }

  /**
   * Compares cognitive psychometric evaluation to career-specific aptitude benchmarks.
   */
  public static calculateAptitudeCompatibility(
    candidate: CandidateProfileInput,
    career: CareerTargetInput
  ): {
    score: number;
    isImputed: boolean;
    insight: string;
  } {
    const aptitudeAttempt = candidate.aptitudeScores;
    if (!aptitudeAttempt || (!aptitudeAttempt.overall && !aptitudeAttempt.categoryScores)) {
      // Diagnostic test not yet completed
      return {
        score: 60,
        isImputed: true,
        insight: 'Aptitude assessment not yet completed; scored with baseline prior.',
      };
    }

    const categoryScores = aptitudeAttempt.categoryScores || {};
    const defaultBenchmarks = {
      LOGICAL: 70,
      QUANTITATIVE: 65,
      VERBAL: 65,
      ANALYTICAL: 75,
      PROBLEM_SOLVING: 80,
    };

    const careerBenchmarks = (career.aptitudeReqs as Record<string, number>) || defaultBenchmarks;

    // Determine category weights based on career domain archetype
    const careerCategory = career.category.toLowerCase();
    const careerTitle = career.title.toLowerCase();

    let weights: Record<string, number> = {
      LOGICAL: 1.0,
      QUANTITATIVE: 1.0,
      VERBAL: 1.0,
      ANALYTICAL: 1.0,
      PROBLEM_SOLVING: 1.0,
    };

    if (careerCategory.includes('data') || careerCategory.includes('artificial') || careerTitle.includes('scientist')) {
      weights = { QUANTITATIVE: 1.6, ANALYTICAL: 1.5, LOGICAL: 1.2, PROBLEM_SOLVING: 1.0, VERBAL: 0.7 };
    } else if (careerCategory.includes('software') || careerCategory.includes('infrastructure')) {
      weights = { PROBLEM_SOLVING: 1.6, LOGICAL: 1.4, ANALYTICAL: 1.1, QUANTITATIVE: 0.9, VERBAL: 0.8 };
    } else if (careerCategory.includes('design') || careerCategory.includes('product')) {
      weights = { VERBAL: 1.6, PROBLEM_SOLVING: 1.3, ANALYTICAL: 1.2, LOGICAL: 1.0, QUANTITATIVE: 0.6 };
    } else if (careerCategory.includes('security')) {
      weights = { ANALYTICAL: 1.6, LOGICAL: 1.4, PROBLEM_SOLVING: 1.2, QUANTITATIVE: 0.9, VERBAL: 0.8 };
    }

    let totalWeight = 0;
    let earnedFit = 0;

    for (const [cat, benchmarkVal] of Object.entries(careerBenchmarks)) {
      const w = weights[cat] || 1.0;
      totalWeight += w;

      const userCategoryPercentage =
        categoryScores[cat]?.percentage ?? aptitudeAttempt.overall ?? 65;

      const benchmark = Math.max(40, benchmarkVal);
      const ratio = userCategoryPercentage / benchmark;

      let dimensionFit: number;
      if (ratio >= 1.0) {
        // Exceeds benchmark
        dimensionFit = Math.min(100, 90 + (ratio - 1.0) * 20);
      } else {
        // Smooth non-linear deficit penalty
        dimensionFit = Math.max(15, 90 * Math.pow(ratio, 1.3));
      }

      earnedFit += dimensionFit * w;
    }

    const finalScore = Math.round(totalWeight > 0 ? earnedFit / totalWeight : aptitudeAttempt.overall || 65);
    let insight: string;
    if (finalScore >= 85) {
      insight = `Cognitive diagnostic (${finalScore}%) meets or exceeds benchmarks across all vital dimensions for ${career.title}.`;
    } else if (finalScore >= 65) {
      insight = `Cognitive diagnostic meets standard baseline, with opportunity for analytical and problem-solving refinement.`;
    } else {
      insight = `Diagnostic indicates cognitive stretch for this role's mathematical and analytical benchmarks.`;
    }

    return { score: finalScore, isImputed: false, insight };
  }

  /**
   * Measures empirical corroboration of skills and keyword density from uploaded resume.
   */
  public static calculateResumeEvidence(
    candidate: CandidateProfileInput,
    career: CareerTargetInput
  ): {
    score: number;
    isImputed: boolean;
    insight: string;
  } {
    const resume = candidate.resumeData;
    if (!resume || (!resume.extractedSkills && !resume.summary)) {
      return {
        score: 55,
        isImputed: true,
        insight: 'No resume uploaded yet; neutral evidence prior applied.',
      };
    }

    const extracted = (resume.extractedSkills || []).map((s) => s.toLowerCase().trim());
    if (extracted.length === 0) {
      return {
        score: 45,
        isImputed: false,
        insight: 'Resume detected but few technical skills could be extracted.',
      };
    }

    // 1. Career skill presence in resume
    let careerSkillsFoundInResume = 0;
    for (const cs of career.skills) {
      if (extracted.includes(cs.skill.name.toLowerCase().trim())) {
        careerSkillsFoundInResume++;
      }
    }

    const careerSkillRatio = career.skills.length > 0 ? careerSkillsFoundInResume / career.skills.length : 0.5;

    // 2. Corroboration of profile skills
    const profileSkills = candidate.skills.map((s) => s.name.toLowerCase().trim());
    let corroboratedCount = 0;
    for (const ps of profileSkills) {
      if (extracted.includes(ps)) corroboratedCount++;
    }
    const corroborationRatio = profileSkills.length > 0 ? corroboratedCount / profileSkills.length : 0.5;

    // Composite resume empirical score
    const rawScore = careerSkillRatio * 65 + corroborationRatio * 35;
    const finalScore = Math.round(Math.max(25, Math.min(98, rawScore * 1.1 + 10)));

    let insight: string;
    if (finalScore >= 75) {
      insight = `Resume demonstrates verified practical execution in ${careerSkillsFoundInResume} core technologies for this career path.`;
    } else if (finalScore >= 50) {
      insight = `Resume substantiates partial credentials (${careerSkillsFoundInResume} skills); tailoring keywords will improve ATS pass rate.`;
    } else {
      insight = `Resume lacks direct keyword evidence for ${career.title}; project descriptions need updating.`;
    }

    return { score: finalScore, isImputed: false, insight };
  }

  /**
   * Synthesizes all sub-scores into a transparent composite compatibility score with dynamic feature reweighting.
   */
  public static scoreCareerForProfile(
    candidate: CandidateProfileInput,
    career: CareerTargetInput
  ): RecommendationResult {
    // 1. Calculate Individual Sub-scores
    const skillRes = this.calculateSkillCompatibility(candidate, career);
    const eduRes = this.calculateEducationCompatibility(candidate, career);
    const expRes = this.calculateExperienceCompatibility(candidate, career);
    const intPrefRes = this.calculateInterestsAndPreferencesCompatibility(candidate, career);
    const aptRes = this.calculateAptitudeCompatibility(candidate, career);
    const resumeRes = this.calculateResumeEvidence(candidate, career);

    // 2. Dynamic Feature Weight Allocation
    // Base Weights:
    // Skills: 0.30, Aptitude: 0.15, Interests: 0.10, Preferences: 0.10, Experience: 0.15, Education: 0.10, Resume: 0.10
    let wSkills = 0.30;
    let wAptitude = 0.15;
    let wInterest = 0.10;
    let wPref = 0.10;
    let wExp = 0.15;
    let wEdu = 0.10;
    let wResume = 0.10;

    let presentModalities = 5; // Profile, Skills, Education, Experience, Interests are always present
    const totalModalities = 7;

    // If aptitude was not taken, redistribute its weight adaptively to Skills, Experience, and Interests
    if (aptRes.isImputed) {
      wAptitude = 0.05; // retain light prior
      wSkills += 0.05;
      wExp += 0.03;
      wInterest += 0.02;
    } else {
      presentModalities++;
    }

    // If resume was not provided, redistribute its weight to Skills and Education
    if (resumeRes.isImputed) {
      wResume = 0.04; // retain light prior
      wSkills += 0.04;
      wEdu += 0.02;
    } else {
      presentModalities++;
    }

    // Re-normalize weights so sum is strictly 1.00
    const sumW = wSkills + wAptitude + wInterest + wPref + wExp + wEdu + wResume;
    wSkills = wSkills / sumW;
    wAptitude = wAptitude / sumW;
    wInterest = wInterest / sumW;
    wPref = wPref / sumW;
    wExp = wExp / sumW;
    wEdu = wEdu / sumW;
    wResume = wResume / sumW;

    const confidenceScore = Math.round((presentModalities / totalModalities) * 100);

    // 3. Composite Calculation
    const weightedComposite =
      skillRes.score * wSkills +
      aptRes.score * wAptitude +
      intPrefRes.interestScore * wInterest +
      intPrefRes.preferenceScore * wPref +
      expRes.score * wExp +
      eduRes.score * wEdu +
      resumeRes.score * wResume;

    const matchScore = Math.round(Math.max(10, Math.min(99, weightedComposite)));

    // 4. Detailed Factor Attribution
    const contributingFactors: ContributingFactor[] = [
      {
        id: 'skills',
        name: 'Technical Skills Alignment',
        score: skillRes.score,
        weightPercent: Math.round(wSkills * 100),
        weightedPoints: Math.round(skillRes.score * wSkills * 10) / 10,
        status: skillRes.score >= 80 ? 'positive' : skillRes.score >= 55 ? 'neutral' : 'growth_area',
        insight: skillRes.insight,
      },
      {
        id: 'aptitude',
        name: 'Cognitive Aptitude Fit',
        score: aptRes.score,
        weightPercent: Math.round(wAptitude * 100),
        weightedPoints: Math.round(aptRes.score * wAptitude * 10) / 10,
        status: aptRes.score >= 80 ? 'positive' : aptRes.score >= 60 ? 'neutral' : 'growth_area',
        insight: aptRes.insight,
      },
      {
        id: 'preferences',
        name: 'Career Goals & Role Preferences',
        score: intPrefRes.preferenceScore,
        weightPercent: Math.round(wPref * 100),
        weightedPoints: Math.round(intPrefRes.preferenceScore * wPref * 10) / 10,
        status: intPrefRes.preferenceScore >= 80 ? 'positive' : intPrefRes.preferenceScore >= 55 ? 'neutral' : 'growth_area',
        insight: intPrefRes.insight,
      },
      {
        id: 'interests',
        name: 'Domain Passion & Interests',
        score: intPrefRes.interestScore,
        weightPercent: Math.round(wInterest * 100),
        weightedPoints: Math.round(intPrefRes.interestScore * wInterest * 10) / 10,
        status: intPrefRes.interestScore >= 75 ? 'positive' : intPrefRes.interestScore >= 50 ? 'neutral' : 'growth_area',
        insight: `Interests overlap with ${career.category} topics.`,
      },
      {
        id: 'experience',
        name: 'Experience Level Match',
        score: expRes.score,
        weightPercent: Math.round(wExp * 100),
        weightedPoints: Math.round(expRes.score * wExp * 10) / 10,
        status: expRes.score >= 85 ? 'positive' : expRes.score >= 60 ? 'neutral' : 'growth_area',
        insight: expRes.insight,
      },
      {
        id: 'education',
        name: 'Educational Background Fit',
        score: eduRes.score,
        weightPercent: Math.round(wEdu * 100),
        weightedPoints: Math.round(eduRes.score * wEdu * 10) / 10,
        status: eduRes.score >= 80 ? 'positive' : eduRes.score >= 60 ? 'neutral' : 'growth_area',
        insight: eduRes.insight,
      },
      {
        id: 'resume',
        name: 'Resume Empirical Verification',
        score: resumeRes.score,
        weightPercent: Math.round(wResume * 100),
        weightedPoints: Math.round(resumeRes.score * wResume * 10) / 10,
        status: resumeRes.score >= 70 ? 'positive' : resumeRes.score >= 50 ? 'neutral' : 'growth_area',
        insight: resumeRes.insight,
      },
    ];

    // Sort contributing factors by absolute points contributed descending
    contributingFactors.sort((a, b) => b.weightedPoints - a.weightedPoints);

    const breakdown: ScoreBreakdown = {
      skillScore: skillRes.score,
      aptitudeScore: aptRes.score,
      interestScore: intPrefRes.interestScore,
      preferenceScore: intPrefRes.preferenceScore,
      educationScore: eduRes.score,
      experienceScore: expRes.score,
      resumeScore: resumeRes.score,
      confidenceScore,
      contributingFactors,
    };

    // Analytical explainable justification
    const topPositive = contributingFactors.filter((f) => f.status === 'positive');
    const topGaps = contributingFactors.filter((f) => f.status === 'growth_area');

    const primaryStrength = topPositive[0]?.name || 'Foundational readiness';
    const primaryConstraint = topGaps[0]?.name || (skillRes.missingSkills.length > 0 ? `Target skill gaps (${skillRes.missingSkills[0]})` : 'Interview depth');

    const reasoning = `${candidate.name || 'The candidate'} achieved a ${matchScore}% overall compatibility score with ${career.title}. Primary drivers include ${primaryStrength.toLowerCase()} (${topPositive[0]?.insight || 'well aligned'}). Key focus area for career acceleration: ${primaryConstraint.toLowerCase()}.`;

    const recommendedActions: string[] = [];
    if (skillRes.missingSkills.length > 0) {
      recommendedActions.push(`Master priority requirement: ${skillRes.missingSkills[0]} through production-grade capstone projects.`);
    }
    if (aptRes.score < 75 && !aptRes.isImputed) {
      recommendedActions.push(`Refine technical problem-solving speed and analytical reasoning via timed assessment mock drills.`);
    }
    if (resumeRes.score < 70) {
      recommendedActions.push(`Incorporate key industry terms (${(skillRes.missingSkills.slice(0, 3)).join(', ') || career.title}) into your resume bullet points.`);
    }
    if (recommendedActions.length < 3) {
      recommendedActions.push(`Build a full-stack portfolio deployment showcasing real-world system architecture for ${career.title}.`);
    }

    return {
      careerId: career.id,
      careerTitle: career.title,
      slug: career.slug,
      category: career.category,
      salaryRange: career.salaryRange,
      demandLevel: career.demandLevel || 'High',
      matchScore,
      confidenceScore,
      breakdown,
      matchingSkills: skillRes.matchingSkills,
      missingSkills: skillRes.missingSkills,
      reasoning,
      recommendedActions,
    };
  }

  /**
   * Main entrypoint for generating recommendations for a specific user ID.
   */
  public static async generateUserRecommendations(userId: string): Promise<RecommendationResult[]> {
    // 1. Fetch User Data with all relational telemetry
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
        },
        aptitudeAttempts: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
        resumeAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) throw new Error('User not found');

    // 2. Fetch All Careers with their Required & Preferred Skills
    const careers = await prisma.career.findMany({
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    const latestAptitude = user.aptitudeAttempts[0];
    const latestResume = user.resumeAnalyses[0];

    const candidateProfile: CandidateProfileInput = {
      userId: user.id,
      name: user.name || 'Candidate',
      degree: user.profile?.degree,
      branch: user.profile?.branch,
      cgpa: user.profile?.cgpa,
      workExperienceYears: user.profile?.workExperienceYears,
      interests: user.profile?.interests || [],
      preferredIndustries: user.profile?.preferredIndustries || [],
      preferredRoles: user.profile?.preferredRoles || [],
      preferredLocations: user.profile?.preferredLocations || [],
      careerGoals: user.profile?.careerGoals,
      skills: user.skills.map((us) => ({
        name: us.skill.name,
        proficiency: us.proficiency,
        verified: us.verified,
      })),
      aptitudeScores: latestAptitude
        ? {
            overall: latestAptitude.score,
            categoryScores: latestAptitude.categoryScores as Record<string, { total?: number; correct?: number; percentage: number }>,
          }
        : null,
      resumeData: latestResume
        ? {
            extractedSkills: latestResume.extractedSkills || [],
            atsScore: latestResume.atsScore,
            summary: latestResume.summary || undefined,
          }
        : null,
    };

    const results: RecommendationResult[] = [];

    for (const career of careers) {
      const careerInput: CareerTargetInput = {
        id: career.id,
        title: career.title,
        slug: career.slug,
        category: career.category,
        overview: career.overview,
        description: career.description,
        educationReqs: career.educationReqs,
        experienceLevel: career.experienceLevel,
        salaryRange: career.salaryRange,
        demandLevel: career.demandLevel,
        aptitudeReqs: career.aptitudeReqs as Record<string, number>,
        commonJobTitles: career.commonJobTitles,
        skills: career.skills.map((cs) => ({
          skill: { name: cs.skill.name },
          isRequired: cs.isRequired,
          minProficiency: cs.minProficiency,
          weight: cs.weight,
        })),
      };

      const result = this.scoreCareerForProfile(candidateProfile, careerInput);
      results.push(result);
    }

    // Sort descending by match score
    results.sort((a, b) => b.matchScore - a.matchScore);

    // Python ML Model Inference (scikit-learn, pandas, numpy)
    try {
      const pythonOutput = await PythonRecommenderBridge.runInference(candidateProfile, careers);
      if (pythonOutput?.results && pythonOutput.results.length > 0) {
        const pyMap = new Map(pythonOutput.results.map((r) => [r.careerId, r]));
        for (const rec of results) {
          const pyRes = pyMap.get(rec.careerId);
          if (pyRes) {
            // Blend ML prediction with multi-criteria scores
            rec.matchScore = Math.round(0.6 * rec.matchScore + 0.4 * pyRes.matchScore);
            rec.reasoning = `${pyRes.reasoning} ${rec.reasoning}`;
          }
        }
        results.sort((a, b) => b.matchScore - a.matchScore);
      }
    } catch (err) {
      console.warn('[RecommendationEngine] Python ML bridge fallback:', err);
    }

    // AI Enrichment for Top Matches
    for (let i = 0; i < Math.min(5, results.length); i++) {
      const rec = results[i];
      try {
        const explanation = await AIService.explainCareerMatch({
          userName: user.name || 'Candidate',
          careerTitle: rec.careerTitle,
          matchScore: rec.matchScore,
          userSkills: rec.matchingSkills.map((s) => ({ name: s.name, proficiency: s.userProficiency })),
          missingSkills: rec.missingSkills,
          matchedSkills: rec.matchingSkills.map((s) => s.name),
          aptitudeScore: rec.breakdown.aptitudeScore,
          education: `${user.profile?.degree || 'Undergraduate'} in ${user.profile?.branch || 'Engineering'}`,
          experienceYears: user.profile?.workExperienceYears || 0,
          interests: user.profile?.interests || [],
        });

        if (explanation?.reasoning) {
          rec.reasoning = explanation.reasoning;
        }
        if (explanation?.recommendedActions && explanation.recommendedActions.length > 0) {
          rec.recommendedActions = explanation.recommendedActions;
        }
      } catch (err) {
        console.warn(`[RecommendationEngine] AI enrichment fallback for ${rec.careerTitle}:`, err);
      }

      // Persist to database
      await prisma.careerRecommendation.upsert({
        where: {
          userId_careerId: {
            userId: user.id,
            careerId: rec.careerId,
          },
        },
        update: {
          matchScore: rec.matchScore,
          matchingSkills: rec.matchingSkills as any,
          missingSkills: rec.missingSkills as any,
          reasoning: rec.reasoning,
          breakdown: rec.breakdown as any,
          recommendedActions: rec.recommendedActions,
        },
        create: {
          userId: user.id,
          careerId: rec.careerId,
          matchScore: rec.matchScore,
          matchingSkills: rec.matchingSkills as any,
          missingSkills: rec.missingSkills as any,
          reasoning: rec.reasoning,
          breakdown: rec.breakdown as any,
          recommendedActions: rec.recommendedActions,
        },
      });

      // Synchronize SkillGap table for top recommendations
      await this.syncSkillGaps(user.id, rec.careerId);
    }

    return results;
  }

  /**
   * Synchronizes granular skill gaps into the database for targeted tracking.
   */
  public static async syncSkillGaps(userId: string, careerId: string) {
    const career = await prisma.career.findUnique({
      where: { id: careerId },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!career) return;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
    });

    const userSkillMap = new Map(userSkills.map((us) => [us.skillId, us.proficiency]));

    for (const cs of career.skills) {
      const currentProf = userSkillMap.get(cs.skillId) || 0;
      const requiredProf = cs.minProficiency;

      let gapSeverity = 'Low';
      let priority = 4;

      if (currentProf === 0) {
        gapSeverity = cs.isRequired ? 'Critical' : 'High';
        priority = cs.isRequired ? 1 : 2;
      } else if (currentProf < requiredProf) {
        gapSeverity = cs.isRequired ? 'High' : 'Moderate';
        priority = cs.isRequired ? 2 : 3;
      }

      await prisma.skillGap.upsert({
        where: {
          userId_careerId_skillId: {
            userId,
            careerId,
            skillId: cs.skillId,
          },
        },
        update: {
          currentProficiency: currentProf,
          requiredProficiency: requiredProf,
          gapSeverity,
          priority,
          suggestedResource: `Master ${cs.skill.name} production workflows via targeted exercises and hands-on repository projects.`,
        },
        create: {
          userId,
          careerId,
          skillId: cs.skillId,
          currentProficiency: currentProf,
          requiredProficiency: requiredProf,
          gapSeverity,
          priority,
          suggestedResource: `Master ${cs.skill.name} production workflows via targeted exercises and hands-on repository projects.`,
        },
      });
    }
  }
}
