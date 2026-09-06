import {
  RecommendationEngine,
  CandidateProfileInput,
  CareerTargetInput,
} from '../lib/recommendationEngine';

/**
 * Multi-Profile Recommendation Engine Verification Test Suite
 * Validates that the Transparent Hybrid Recommendation System:
 * 1. Accurately adapts rankings and compatibility scores across diverse candidate profiles.
 * 2. Properly exposes contributing factors, confidence metrics, and attribution insights.
 * 3. Does not use simplistic clamping or hardcoded bias (non-CS degrees, varied seniority).
 */

const careersCatalog: CareerTargetInput[] = [
  {
    id: 'c1',
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    category: 'Software Engineering',
    overview: 'Frontend Developers craft user interfaces, interactive browser experiences, responsive layouts, and modern web application frontends.',
    description: 'Expertise in modern JavaScript, TypeScript, React, state management, and CSS frameworks.',
    educationReqs: 'Degree in Computer Science, Design & Technology, or self-directed portfolio.',
    experienceLevel: 'Entry to Senior',
    salaryRange: '$75,000 - $130,000 / yr',
    demandLevel: 'High',
    aptitudeReqs: { LOGICAL: 70, QUANTITATIVE: 55, VERBAL: 70, ANALYTICAL: 75, PROBLEM_SOLVING: 75 },
    commonJobTitles: ['Frontend Engineer', 'UI Software Developer', 'React Developer'],
    skills: [
      { skill: { name: 'JavaScript' }, isRequired: true, minProficiency: 4, weight: 1.2 },
      { skill: { name: 'TypeScript' }, isRequired: true, minProficiency: 4, weight: 1.2 },
      { skill: { name: 'React.js' }, isRequired: true, minProficiency: 4, weight: 1.5 },
      { skill: { name: 'HTML5 & CSS3' }, isRequired: true, minProficiency: 3, weight: 1.0 },
      { skill: { name: 'Tailwind CSS' }, isRequired: false, minProficiency: 3, weight: 0.8 },
      { skill: { name: 'Problem Solving' }, isRequired: true, minProficiency: 3, weight: 1.0 },
    ],
  },
  {
    id: 'c2',
    title: 'AI / Machine Learning Engineer',
    slug: 'ai-ml-engineer',
    category: 'Artificial Intelligence & Data',
    overview: 'Researches, designs, and trains neural networks, predictive models, NLP algorithms, and computer vision pipelines.',
    description: 'Deploys production models with PyTorch, TensorFlow, MLOps, and scalable distributed training.',
    educationReqs: 'BS/MS in Computer Science, Data Science, Artificial Intelligence, Mathematics, or related quantitative field.',
    experienceLevel: 'Entry to Staff',
    salaryRange: '$110,000 - $185,000 / yr',
    demandLevel: 'Extreme',
    aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 85, VERBAL: 65, ANALYTICAL: 90, PROBLEM_SOLVING: 90 },
    commonJobTitles: ['ML Engineer', 'Applied AI Scientist', 'Deep Learning Specialist', 'LLM Engineer'],
    skills: [
      { skill: { name: 'Python' }, isRequired: true, minProficiency: 4, weight: 1.5 },
      { skill: { name: 'Machine Learning' }, isRequired: true, minProficiency: 4, weight: 1.5 },
      { skill: { name: 'Deep Learning' }, isRequired: true, minProficiency: 3, weight: 1.4 },
      { skill: { name: 'PyTorch' }, isRequired: true, minProficiency: 3, weight: 1.3 },
      { skill: { name: 'Pandas & NumPy' }, isRequired: true, minProficiency: 3, weight: 1.1 },
      { skill: { name: 'Analytical Thinking' }, isRequired: true, minProficiency: 4, weight: 1.0 },
      { skill: { name: 'Problem Solving' }, isRequired: true, minProficiency: 4, weight: 1.0 },
    ],
  },
  {
    id: 'c3',
    title: 'Cybersecurity Analyst',
    slug: 'cybersecurity-analyst',
    category: 'Security & Operations',
    overview: 'Defends computer systems, monitors network anomalies, conducts threat analysis, and implements cryptographic safeguards.',
    description: 'Performs SOC analysis, incident response, vulnerability assessments, and digital forensics.',
    educationReqs: 'Degree in Cybersecurity, Computer Science, Information Assurance, or Security+ / CEH.',
    experienceLevel: 'Entry to Senior',
    salaryRange: '$80,000 - $140,000 / yr',
    demandLevel: 'Very High',
    aptitudeReqs: { LOGICAL: 85, QUANTITATIVE: 65, VERBAL: 70, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
    commonJobTitles: ['SOC Analyst', 'Information Security Officer', 'Incident Response Analyst'],
    skills: [
      { skill: { name: 'Network Security' }, isRequired: true, minProficiency: 4, weight: 1.5 },
      { skill: { name: 'Linux Administration' }, isRequired: true, minProficiency: 3, weight: 1.2 },
      { skill: { name: 'Cryptography' }, isRequired: true, minProficiency: 3, weight: 1.2 },
      { skill: { name: 'Analytical Thinking' }, isRequired: true, minProficiency: 4, weight: 1.0 },
      { skill: { name: 'Problem Solving' }, isRequired: true, minProficiency: 4, weight: 1.0 },
    ],
  },
  {
    id: 'c4',
    title: 'UI/UX Product Designer',
    slug: 'ui-ux-designer',
    category: 'Design & Product',
    overview: 'Researches customer friction points, designs wireframes, conducts user testing, and crafts scalable design systems.',
    description: 'Expertise in Figma, interaction design, usability metrics, customer journeys, and responsive component libraries.',
    educationReqs: 'Degree in Human-Computer Interaction (HCI), Graphic Design, Psychology, or Computer Science.',
    experienceLevel: 'Entry to Lead',
    salaryRange: '$75,000 - $130,000 / yr',
    demandLevel: 'High',
    aptitudeReqs: { LOGICAL: 65, QUANTITATIVE: 50, VERBAL: 80, ANALYTICAL: 80, PROBLEM_SOLVING: 75 },
    commonJobTitles: ['Product Designer', 'Interaction Designer', 'UX Researcher'],
    skills: [
      { skill: { name: 'Figma' }, isRequired: true, minProficiency: 4, weight: 1.5 },
      { skill: { name: 'Design Systems & Wireframing' }, isRequired: true, minProficiency: 4, weight: 1.5 },
      { skill: { name: 'User Research & Usability Testing' }, isRequired: true, minProficiency: 3, weight: 1.2 },
      { skill: { name: 'Communication & Presentation' }, isRequired: true, minProficiency: 3, weight: 1.0 },
    ],
  },
  {
    id: 'c5',
    title: 'Cloud & DevOps Engineer',
    slug: 'cloud-devops-engineer',
    category: 'Cloud & Infrastructure',
    overview: 'Automates cloud infrastructure, manages container orchestration, ensures zero-downtime CI/CD pipelines, and scales clusters.',
    description: 'Deep mastery of Docker, Kubernetes, AWS, Terraform, Linux, and Site Reliability Engineering principles.',
    educationReqs: 'B.Tech/BS in Computer Science, IT, or equivalent cloud certifications (AWS/Azure/CKA).',
    experienceLevel: 'Entry to Principal',
    salaryRange: '$95,000 - $160,000 / yr',
    demandLevel: 'Very High',
    aptitudeReqs: { LOGICAL: 80, QUANTITATIVE: 65, VERBAL: 65, ANALYTICAL: 85, PROBLEM_SOLVING: 85 },
    commonJobTitles: ['Site Reliability Engineer (SRE)', 'Platform Engineer', 'Cloud Infrastructure Engineer'],
    skills: [
      { skill: { name: 'Docker' }, isRequired: true, minProficiency: 4, weight: 1.4 },
      { skill: { name: 'Kubernetes' }, isRequired: true, minProficiency: 4, weight: 1.4 },
      { skill: { name: 'AWS (Amazon Web Services)' }, isRequired: true, minProficiency: 4, weight: 1.4 },
      { skill: { name: 'Linux Administration' }, isRequired: true, minProficiency: 4, weight: 1.2 },
      { skill: { name: 'Problem Solving' }, isRequired: true, minProficiency: 3, weight: 1.0 },
    ],
  },
];

async function runTests() {
  console.log('🧪 Starting Multi-Profile AI Recommendation Engine Verification Tests...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${detail || ''}`);
      process.exitCode = 1;
    }
  }

  // ==========================================
  // PROFILE 1: FRONTEND SPECIALIST (Maya Lin)
  // ==========================================
  console.log('--- Test Suite 1: Frontend Developer Profile ---');
  const frontendProfile: CandidateProfileInput = {
    name: 'Maya Lin',
    degree: 'Bachelor of Technology',
    branch: 'Computer Science and Engineering',
    cgpa: 8.8,
    workExperienceYears: 1.5,
    interests: ['Modern Frontend', 'UI/UX Design Systems', 'Web Performance', 'Component Architecture'],
    preferredRoles: ['Frontend Developer', 'UI Software Developer'],
    preferredIndustries: ['Software Engineering', 'Consumer Tech'],
    careerGoals: 'To architect scalable, accessible, and high-performance web frontend user interfaces with React and TypeScript.',
    skills: [
      { name: 'JavaScript', proficiency: 5, verified: true },
      { name: 'TypeScript', proficiency: 5, verified: true },
      { name: 'React.js', proficiency: 5, verified: true },
      { name: 'HTML5 & CSS3', proficiency: 5, verified: true },
      { name: 'Tailwind CSS', proficiency: 4, verified: true },
      { name: 'Problem Solving', proficiency: 4, verified: true },
    ],
    aptitudeScores: {
      overall: 78,
      categoryScores: {
        LOGICAL: { percentage: 75 },
        QUANTITATIVE: { percentage: 65 },
        VERBAL: { percentage: 80 },
        ANALYTICAL: { percentage: 80 },
        PROBLEM_SOLVING: { percentage: 85 },
      },
    },
    resumeData: {
      extractedSkills: ['JavaScript', 'TypeScript', 'React.js', 'HTML5 & CSS3', 'Tailwind CSS'],
      atsScore: 90,
    },
  };

  const mayaResults = careersCatalog
    .map((career) => RecommendationEngine.scoreCareerForProfile(frontendProfile, career))
    .sort((a, b) => b.matchScore - a.matchScore);

  assert(
    mayaResults[0].careerTitle === 'Frontend Developer',
    'Frontend profile ranks Frontend Developer as #1 career match',
    `Rank 1 was ${mayaResults[0].careerTitle} with ${mayaResults[0].matchScore}%`
  );
  assert(
    mayaResults[0].matchScore >= 85,
    'Frontend match score is high (>= 85%) for perfectly qualified candidate',
    `Score was ${mayaResults[0].matchScore}%`
  );
  assert(
    mayaResults.find((r) => r.careerTitle === 'Cybersecurity Analyst')!.matchScore < 60,
    'Cybersecurity Analyst scores significantly lower (< 60%) due to missing core security skills',
    `Cybersecurity score was ${mayaResults.find((r) => r.careerTitle === 'Cybersecurity Analyst')!.matchScore}%`
  );
  assert(
    mayaResults[0].breakdown.contributingFactors.length === 7,
    'Exposes all 7 transparent contributing factors in breakdown'
  );

  // ==========================================
  // PROFILE 2: AI / ML RESEARCHER (Dr. Arjun Rao)
  // ==========================================
  console.log('\n--- Test Suite 2: AI / ML Engineer Profile ---');
  const mlProfile: CandidateProfileInput = {
    name: 'Dr. Arjun Rao',
    degree: 'Master of Science',
    branch: 'Data Science, Statistics and Mathematics',
    cgpa: 9.4,
    workExperienceYears: 2.0,
    interests: ['Artificial Intelligence', 'Machine Learning', 'Deep Neural Networks', 'Mathematical Modeling'],
    preferredRoles: ['AI / Machine Learning Engineer', 'Applied AI Scientist'],
    preferredIndustries: ['Artificial Intelligence & Data', 'DeepTech'],
    careerGoals: 'To research, develop, and deploy scalable deep neural network architectures and transformer models.',
    skills: [
      { name: 'Python', proficiency: 5, verified: true },
      { name: 'Machine Learning', proficiency: 5, verified: true },
      { name: 'Deep Learning', proficiency: 5, verified: true },
      { name: 'PyTorch', proficiency: 4, verified: true },
      { name: 'Pandas & NumPy', proficiency: 5, verified: true },
      { name: 'Analytical Thinking', proficiency: 5, verified: true },
      { name: 'Problem Solving', proficiency: 4, verified: true },
    ],
    aptitudeScores: {
      overall: 94,
      categoryScores: {
        LOGICAL: { percentage: 90 },
        QUANTITATIVE: { percentage: 95 },
        VERBAL: { percentage: 75 },
        ANALYTICAL: { percentage: 95 },
        PROBLEM_SOLVING: { percentage: 90 },
      },
    },
    resumeData: {
      extractedSkills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Pandas & NumPy'],
      atsScore: 94,
    },
  };

  const arjunResults = careersCatalog
    .map((career) => RecommendationEngine.scoreCareerForProfile(mlProfile, career))
    .sort((a, b) => b.matchScore - a.matchScore);

  assert(
    arjunResults[0].careerTitle === 'AI / Machine Learning Engineer',
    'ML profile ranks AI / Machine Learning Engineer as #1 career match',
    `Rank 1 was ${arjunResults[0].careerTitle} with ${arjunResults[0].matchScore}%`
  );
  assert(
    arjunResults[0].matchScore >= 90,
    'ML Engineer score is exceptionally high (>= 90%) for top-tier candidate',
    `Score was ${arjunResults[0].matchScore}%`
  );
  assert(
    arjunResults.find((r) => r.careerTitle === 'UI/UX Product Designer')!.matchScore < 55,
    'UI/UX Product Designer ranks low (< 55%) for ML candidate lacking design credentials',
    `UI/UX score was ${arjunResults.find((r) => r.careerTitle === 'UI/UX Product Designer')!.matchScore}%`
  );

  // ==========================================
  // PROFILE 3: CYBERSECURITY ANALYST (Elena Rostova)
  // ==========================================
  console.log('\n--- Test Suite 3: Cybersecurity Analyst Profile ---');
  const cyberProfile: CandidateProfileInput = {
    name: 'Elena Rostova',
    degree: 'Bachelor of Science',
    branch: 'Cybersecurity and Information Assurance',
    cgpa: 8.6,
    workExperienceYears: 2.0,
    interests: ['Threat Hunting', 'Penetration Testing', 'Security Operations', 'Network Defense'],
    preferredRoles: ['Cybersecurity Analyst', 'SOC Analyst'],
    preferredIndustries: ['Security & Operations', 'Defense'],
    careerGoals: 'Protecting critical infrastructure against modern state-sponsored cyber intrusions and zero-days.',
    skills: [
      { name: 'Network Security', proficiency: 5, verified: true },
      { name: 'Linux Administration', proficiency: 4, verified: true },
      { name: 'Cryptography', proficiency: 4, verified: true },
      { name: 'Analytical Thinking', proficiency: 4, verified: true },
      { name: 'Problem Solving', proficiency: 4, verified: true },
    ],
    aptitudeScores: {
      overall: 88,
      categoryScores: {
        LOGICAL: { percentage: 90 },
        QUANTITATIVE: { percentage: 75 },
        VERBAL: { percentage: 75 },
        ANALYTICAL: { percentage: 95 },
        PROBLEM_SOLVING: { percentage: 88 },
      },
    },
    resumeData: {
      extractedSkills: ['Network Security', 'Linux Administration', 'Cryptography'],
      atsScore: 88,
    },
  };

  const elenaResults = careersCatalog
    .map((career) => RecommendationEngine.scoreCareerForProfile(cyberProfile, career))
    .sort((a, b) => b.matchScore - a.matchScore);

  assert(
    elenaResults[0].careerTitle === 'Cybersecurity Analyst',
    'Cybersecurity profile ranks Cybersecurity Analyst as #1 career match',
    `Rank 1 was ${elenaResults[0].careerTitle} with ${elenaResults[0].matchScore}%`
  );
  assert(
    elenaResults[0].matchScore >= 85,
    'Cybersecurity match score is strong (>= 85%)',
    `Score was ${elenaResults[0].matchScore}%`
  );

  // ==========================================
  // PROFILE 4: UI/UX DESIGNER (Chloe Dubois - Non-CS Degree!)
  // ==========================================
  console.log('\n--- Test Suite 4: Non-CS UI/UX Designer Profile ---');
  const designProfile: CandidateProfileInput = {
    name: 'Chloe Dubois',
    degree: 'Bachelor of Design (B.Des)',
    branch: 'Human-Computer Interaction (HCI) and Digital Media',
    cgpa: 9.1,
    workExperienceYears: 2.0,
    interests: ['User Experience Research', 'Design Systems', 'Interactive Prototypes', 'Accessibility'],
    preferredRoles: ['UI/UX Product Designer', 'Product Designer'],
    preferredIndustries: ['Design & Product', 'Consumer Tech'],
    careerGoals: 'Crafting intuitive, accessible, and delightful design systems that solve complex user problems.',
    skills: [
      { name: 'Figma', proficiency: 5, verified: true },
      { name: 'Design Systems & Wireframing', proficiency: 5, verified: true },
      { name: 'User Research & Usability Testing', proficiency: 4, verified: true },
      { name: 'Communication & Presentation', proficiency: 4, verified: true },
    ],
    aptitudeScores: {
      overall: 76,
      categoryScores: {
        LOGICAL: { percentage: 65 },
        QUANTITATIVE: { percentage: 50 },
        VERBAL: { percentage: 90 },
        ANALYTICAL: { percentage: 82 },
        PROBLEM_SOLVING: { percentage: 78 },
      },
    },
    resumeData: {
      extractedSkills: ['Figma', 'Design Systems & Wireframing', 'User Research & Usability Testing'],
      atsScore: 92,
    },
  };

  const chloeResults = careersCatalog
    .map((career) => RecommendationEngine.scoreCareerForProfile(designProfile, career))
    .sort((a, b) => b.matchScore - a.matchScore);

  assert(
    chloeResults[0].careerTitle === 'UI/UX Product Designer',
    'HCI / Design profile ranks UI/UX Product Designer as #1 career match (No CS bias!)',
    `Rank 1 was ${chloeResults[0].careerTitle} with ${chloeResults[0].matchScore}%`
  );
  assert(
    chloeResults[0].matchScore >= 85,
    'UI/UX Designer match score is high (>= 85%) for qualified HCI designer',
    `Score was ${chloeResults[0].matchScore}%`
  );
  assert(
    chloeResults.find((r) => r.careerTitle === 'Cloud & DevOps Engineer')!.matchScore < 45,
    'DevOps Engineer scores low (< 45%) for designer with 0 infrastructure skills',
    `DevOps score was ${chloeResults.find((r) => r.careerTitle === 'Cloud & DevOps Engineer')!.matchScore}%`
  );

  // ==========================================
  // PROFILE 5: SENIOR CLOUD & DEVOPS ENGINEER (Marcus Vance)
  // ==========================================
  console.log('\n--- Test Suite 5: Senior Cloud & DevOps Profile ---');
  const devopsProfile: CandidateProfileInput = {
    name: 'Marcus Vance',
    degree: 'Bachelor of Technology',
    branch: 'Information Technology',
    cgpa: 8.0,
    workExperienceYears: 5.0,
    interests: ['Cloud Native Infrastructure', 'Kubernetes Clusters', 'Site Reliability Engineering', 'Automation'],
    preferredRoles: ['Cloud & DevOps Engineer', 'Site Reliability Engineer (SRE)'],
    preferredIndustries: ['Cloud & Infrastructure', 'Enterprise Software'],
    careerGoals: 'Automate multi-region Kubernetes clusters with zero-downtime GitOps pipelines.',
    skills: [
      { name: 'Docker', proficiency: 5, verified: true },
      { name: 'Kubernetes', proficiency: 5, verified: true },
      { name: 'AWS (Amazon Web Services)', proficiency: 5, verified: true },
      { name: 'Linux Administration', proficiency: 5, verified: true },
      { name: 'Problem Solving', proficiency: 4, verified: true },
    ],
    aptitudeScores: {
      overall: 86,
      categoryScores: {
        LOGICAL: { percentage: 85 },
        QUANTITATIVE: { percentage: 75 },
        VERBAL: { percentage: 70 },
        ANALYTICAL: { percentage: 90 },
        PROBLEM_SOLVING: { percentage: 90 },
      },
    },
    resumeData: {
      extractedSkills: ['Docker', 'Kubernetes', 'AWS (Amazon Web Services)', 'Linux Administration'],
      atsScore: 91,
    },
  };

  const marcusResults = careersCatalog
    .map((career) => RecommendationEngine.scoreCareerForProfile(devopsProfile, career))
    .sort((a, b) => b.matchScore - a.matchScore);

  assert(
    marcusResults[0].careerTitle === 'Cloud & DevOps Engineer',
    'Senior DevOps profile ranks Cloud & DevOps Engineer as #1 career match',
    `Rank 1 was ${marcusResults[0].careerTitle} with ${marcusResults[0].matchScore}%`
  );
  assert(
    marcusResults[0].matchScore >= 90,
    'Cloud & DevOps score is high (>= 90%) for experienced candidate',
    `Score was ${marcusResults[0].matchScore}%`
  );

  // ==========================================
  // PROFILE 6: COLD-START CANDIDATE (No Aptitude or Resume)
  // ==========================================
  console.log('\n--- Test Suite 6: Cold-Start Missingness Handling ---');
  const coldStartProfile: CandidateProfileInput = {
    name: 'Fresh Student',
    degree: 'B.Tech',
    branch: 'Computer Science',
    skills: [{ name: 'JavaScript', proficiency: 3 }],
    aptitudeScores: null, // No aptitude test taken
    resumeData: null,     // No resume uploaded
  };

  const coldStartResults = careersCatalog.map((c) =>
    RecommendationEngine.scoreCareerForProfile(coldStartProfile, c)
  );

  assert(
    coldStartResults[0].confidenceScore < 80,
    'Confidence score reflects missing diagnostic modalities (< 80%)',
    `Confidence score was ${coldStartResults[0].confidenceScore}%`
  );
  assert(
    coldStartResults[0].matchScore > 10 && coldStartResults[0].matchScore < 75,
    'Cold start score is calculated cleanly within valid range without crashing or hardcoded 70 baseline',
    `Match score was ${coldStartResults[0].matchScore}%`
  );

  console.log(`\n========================================`);
  console.log(`Test Execution Summary: ${passed}/${total} assertions passed successfully.`);
  console.log(`========================================\n`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED: Transparent Hybrid Recommendation Engine verified!');
  } else {
    throw new Error(`Test failure: ${total - passed} assertions failed.`);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
