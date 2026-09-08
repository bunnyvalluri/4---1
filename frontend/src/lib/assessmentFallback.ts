/**
 * Assessment Fallback & Netlify Serverless Resilience Engine
 * Provides the 25 diagnostic questions, scoring, and dimensional calibration
 * when the external FastAPI server is not directly accessible.
 */

export interface FallbackQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  difficulty: string;
  order: number;
}

export const FALLBACK_QUESTIONS: FallbackQuestion[] = [
  // 1. LOGICAL REASONING (5 questions)
  {
    id: "q_log_1",
    category: "LOGICAL",
    question: 'In a certain code, "CLOUD" is written as "DMPVE". How is "SYSTEM" written in that same code?',
    options: ["TZTUFN", "SZTUFM", "TYTUFN", "TATUSN"],
    correctOption: 0,
    explanation: "Each letter is shifted forward by 1 in the alphabet: S->T, Y->Z, S->T, T->U, E->F, M->N.",
    difficulty: "Easy",
    order: 1,
  },
  {
    id: "q_log_2",
    category: "LOGICAL",
    question: "Statements: All microservices run in containers. Some containers are managed by Kubernetes. Conclusions: I. Some microservices are managed by Kubernetes. II. All Kubernetes nodes host microservices.",
    options: [
      "Only conclusion I follows",
      "Only conclusion II follows",
      "Neither I nor II follows",
      "Both I and II follow",
    ],
    correctOption: 2,
    explanation: 'Since only "some containers" are in Kubernetes, we cannot conclude with certainty that the microservices containers specifically are among those without further premises.',
    difficulty: "Medium",
    order: 2,
  },
  {
    id: "q_log_3",
    category: "LOGICAL",
    question: "Look at this series: 2, 6, 12, 20, 30, ... What number should come next?",
    options: ["40", "42", "44", "48"],
    correctOption: 1,
    explanation: "Differences between consecutive numbers increase by 2: +4, +6, +8, +10, so +12 -> 30 + 12 = 42 (or n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).",
    difficulty: "Easy",
    order: 3,
  },
  {
    id: "q_log_4",
    category: "LOGICAL",
    question: "Point A is 5km North of B. Point C is 12km East of B. What is the shortest direct line distance from A to C?",
    options: ["17 km", "13 km", "15 km", "14 km"],
    correctOption: 1,
    explanation: "Using Pythagorean theorem: sqrt(5^2 + 12^2) = sqrt(25 + 144) = sqrt(169) = 13 km.",
    difficulty: "Medium",
    order: 4,
  },
  {
    id: "q_log_5",
    category: "LOGICAL",
    question: "Five servers (S1, S2, S3, S4, S5) are queued. S1 finishes before S3. S4 finishes after S2 but before S1. S5 finishes last. Which server finishes second?",
    options: ["S1", "S2", "S4", "S3"],
    correctOption: 2,
    explanation: "Order: S2 finishes first, then S4, then S1, then S3, then S5. The second server to finish is S4.",
    difficulty: "Medium",
    order: 5,
  },

  // 2. QUANTITATIVE APTITUDE (5 questions)
  {
    id: "q_quant_1",
    category: "QUANTITATIVE",
    question: "A cloud server processes 1,200 requests per minute with 4 CPU cores. If capacity scales linearly, how many requests can 7 CPU cores process in 30 seconds?",
    options: ["1,050", "2,100", "1,400", "1,200"],
    correctOption: 0,
    explanation: "1 core handles 1200 / 4 = 300 req/min. 7 cores handle 7 * 300 = 2100 req/min. In 30 seconds (0.5 min), 2100 * 0.5 = 1050 requests.",
    difficulty: "Medium",
    order: 6,
  },
  {
    id: "q_quant_2",
    category: "QUANTITATIVE",
    question: "If the price of a cloud database cluster drops by 20% and its usage increases by 25%, what is the net effect on the company total spend for this service?",
    options: [
      "Decreases by 5%",
      "Increases by 5%",
      "Remains unchanged (0% change)",
      "Increases by 2%",
    ],
    correctOption: 2,
    explanation: "New Spend = (0.80) * (1.25) = 1.00. Hence, there is no change in total spend.",
    difficulty: "Medium",
    order: 7,
  },
  {
    id: "q_quant_3",
    category: "QUANTITATIVE",
    question: "An API response time has a mean of 120ms with standard deviation of 15ms. Assuming normal distribution, approximately what percentage of requests respond in under 150ms?",
    options: ["68%", "95%", "97.5%", "99.7%"],
    correctOption: 2,
    explanation: "150ms is (150-120)/15 = 2 standard deviations above the mean. The area under the normal curve below +2 sigma is approximately 97.7% (~97.5%).",
    difficulty: "Hard",
    order: 8,
  },
  {
    id: "q_quant_4",
    category: "QUANTITATIVE",
    question: "A distributed queue receives 400 messages/sec and 2 workers can process 150 messages/sec each. How many additional workers are required to prevent queue backlog?",
    options: ["1 worker", "2 workers", "3 workers", "4 workers"],
    correctOption: 0,
    explanation: "Current capacity = 2 * 150 = 300 msg/s. Deficit = 400 - 300 = 100 msg/s. 1 extra worker adds 150 msg/s, raising capacity to 450 msg/s, clearing backlog.",
    difficulty: "Easy",
    order: 9,
  },
  {
    id: "q_quant_5",
    category: "QUANTITATIVE",
    question: "What is the sum of integers from 1 to 50 inclusive?",
    options: ["1,250", "1,275", "1,300", "1,325"],
    correctOption: 1,
    explanation: "Sum = n*(n+1)/2 = 50 * 51 / 2 = 25 * 51 = 1275.",
    difficulty: "Easy",
    order: 10,
  },

  // 3. VERBAL ABILITY (5 questions)
  {
    id: "q_verb_1",
    category: "VERBAL",
    question: 'Select the word that is most nearly OPPOSITE in meaning to "OBSOLETE":',
    options: ["Archaic", "Contemporary", "Redundant", "Superfluous"],
    correctOption: 1,
    explanation: '"Obsolete" means outdated or no longer in use; "Contemporary" means modern and current.',
    difficulty: "Easy",
    order: 11,
  },
  {
    id: "q_verb_2",
    category: "VERBAL",
    question: "Identify the sentence with correct grammatical agreement and syntax:",
    options: [
      "The committee have reached its decision unanimously.",
      "Neither the engineering lead nor the developers was available for comment.",
      "Each of the microservices requires its own independent database schema.",
      "Data from the production telemetry are showing an spike in latency.",
    ],
    correctOption: 2,
    explanation: '"Each" takes the singular pronoun "its" and singular verb "requires". In B, the verb should agree with the plural "developers" (were).',
    difficulty: "Medium",
    order: 12,
  },
  {
    id: "q_verb_3",
    category: "VERBAL",
    question: "Complete the analogy — ALGORITHM : PROGRAM :: BLUEPRINT : ?",
    options: ["Draftsman", "Building", "Foundation", "Architecture"],
    correctOption: 1,
    explanation: "An algorithm is the abstract plan realized in a program, just as a blueprint is the abstract architectural plan realized in a building.",
    difficulty: "Medium",
    order: 13,
  },
  {
    id: "q_verb_4",
    category: "VERBAL",
    question: 'Choose the most precise term: "The engineering team achieved ________, ensuring that identical inputs consistently yield the exact same system output without side effects."',
    options: ["Concurrency", "Idempotence", "Redundancy", "Elasticity"],
    correctOption: 1,
    explanation: "Idempotence describes an operation where applying it multiple times yields the exact same outcome as a single execution.",
    difficulty: "Hard",
    order: 14,
  },
  {
    id: "q_verb_5",
    category: "VERBAL",
    question: 'Select the correct meaning of the idiom: "To iron out the bottlenecks":',
    options: [
      "To speed up CPU clock speed",
      "To resolve hindrances and streamline a workflow",
      "To press garments for an interview",
      "To compress disk storage",
    ],
    correctOption: 1,
    explanation: '"To iron out bottlenecks" means to detect and resolve obstacles that restrict throughput.',
    difficulty: "Easy",
    order: 15,
  },

  // 4. ANALYTICAL THINKING (5 questions)
  {
    id: "q_ana_1",
    category: "ANALYTICAL",
    question: "A system failure occurs only when both Database connection pool is exhausted AND Redis cache misses exceed 80%. If Redis cache miss is 92% but Database pool is only 40% full, does system failure occur?",
    options: [
      "Yes, because Redis miss rate is critically high",
      "No, because both conditions must be met simultaneously",
      "System enters warning mode only",
      "Cannot be determined without CPU metric",
    ],
    correctOption: 1,
    explanation: "Logical AND demands both conditions to be true. Since the DB connection pool is not exhausted, the failure condition is not satisfied.",
    difficulty: "Medium",
    order: 16,
  },
  {
    id: "q_ana_2",
    category: "ANALYTICAL",
    question: "You observe that web page bounce rates spike whenever average DOMContentLoaded time exceeds 2.4 seconds. If optimizing image payloads reduces load time from 3.1s to 1.8s, what is the most reasonable analytical hypothesis?",
    options: [
      "Bounce rates will likely decrease because page load drops below the 2.4s threshold",
      "Bounce rates will stay unchanged because image size never affects user retention",
      "Bounce rates will double due to image caching overhead",
      "Server compute cost will increase proportionally to bounce reduction",
    ],
    correctOption: 0,
    explanation: "Since the load time moves from above the friction threshold (3.1s > 2.4s) to comfortably below it (1.8s < 2.4s), user drop-off is expected to improve.",
    difficulty: "Medium",
    order: 17,
  },
  {
    id: "q_ana_3",
    category: "ANALYTICAL",
    question: "A machine learning classifier predicts fraud. Precision is 90% and Recall is 50%. What does this imply about the model predictions?",
    options: [
      "When the model flags a transaction as fraud, it is almost always correct, but it misses half of all actual fraud cases.",
      "The model flags 90% of all fraud cases correctly, but has 50% false alarms.",
      "The model has an accuracy of 70% across all transactions.",
      "The dataset is perfectly balanced between fraudulent and legitimate events.",
    ],
    correctOption: 0,
    explanation: "High precision (90%) means low false positives. Moderate recall (50%) means it detects only 50% of the true positive population.",
    difficulty: "Hard",
    order: 18,
  },
  {
    id: "q_ana_4",
    category: "ANALYTICAL",
    question: "In an A/B test with 50,000 users per variant, Variant B generates a 3.4% conversion rate versus Variant A 3.1% (p-value = 0.008). Which conclusion is analytically rigorous?",
    options: [
      "Variant B has a statistically significant improvement at alpha = 0.05 level.",
      "The test was too small to draw any conclusions.",
      "Variant A is superior because p-value is below 0.05.",
      "The observed difference is entirely attributable to random noise.",
    ],
    correctOption: 0,
    explanation: "A p-value of 0.008 is well below the standard 0.05 significance threshold, indicating the observed lift is statistically significant.",
    difficulty: "Medium",
    order: 19,
  },
  {
    id: "q_ana_5",
    category: "ANALYTICAL",
    question: "Given three microservices X, Y, Z: X depends on Y, and Y depends on Z. If Z experiences a 500 error, what is the expected cascading failure pattern in the absence of circuit breakers?",
    options: [
      "Only Z fails; X and Y remain unaffected",
      "Both Y and X will likely experience timeout or error propagation",
      "X will succeed because it has no direct dependency on Z",
      "The network switch will reset automatically",
    ],
    correctOption: 1,
    explanation: "Without isolation or circuit breakers, synchronous dependency failures cascade upstream: Z failing causes Y to block/fail, which causes X to fail.",
    difficulty: "Easy",
    order: 20,
  },

  // 5. PROBLEM SOLVING (5 questions)
  {
    id: "q_ps_1",
    category: "PROBLEM_SOLVING",
    question: "You need to find a single target value in a sorted array of 1,000,000 elements. What is the maximum number of comparisons required using Binary Search?",
    options: ["1,000,000", "500,000", "20", "100"],
    correctOption: 2,
    explanation: "Binary search operates in O(log2 N). ceil(log2(1,000,000)) = ceil(19.93) = 20 comparisons.",
    difficulty: "Medium",
    order: 21,
  },
  {
    id: "q_ps_2",
    category: "PROBLEM_SOLVING",
    question: "A web app experiences sudden high latency. The database CPU is at 99%, while app servers are at 15% CPU. What is the most effective immediate troubleshooting step?",
    options: [
      "Spin up 10 more app server instances",
      "Inspect slow query logs and active transactions to identify unindexed queries or table locks",
      "Restart the frontend build process",
      "Switch CSS frameworks",
    ],
    correctOption: 1,
    explanation: "App servers are idle while database CPU is saturated. Inspecting slow queries and table locks addresses the root bottleneck immediately.",
    difficulty: "Medium",
    order: 22,
  },
  {
    id: "q_ps_3",
    category: "PROBLEM_SOLVING",
    question: "You need to store and look up user session tokens with average time complexity O(1). Which data structure is best suited?",
    options: [
      "Binary Search Tree",
      "Hash Map / Key-Value Store",
      "Doubly Linked List",
      "Sorted Array",
    ],
    correctOption: 1,
    explanation: "A Hash Map or in-memory key-value store (like Redis) provides average O(1) amortized lookup, insertion, and deletion.",
    difficulty: "Easy",
    order: 23,
  },
  {
    id: "q_ps_4",
    category: "PROBLEM_SOLVING",
    question: "Two threads simultaneously execute `count = count + 1` on a shared variable without synchronization. What is the classic name for this bug and its resolution?",
    options: [
      "Memory leak; resolve by increasing RAM",
      "Race condition; resolve using mutex locks or atomic operations",
      "Stack overflow; resolve by avoiding recursion",
      "Deadlock; resolve by eliminating threads",
    ],
    correctOption: 1,
    explanation: "Simultaneous read-modify-write without synchronization is a race condition. Mutexes, semaphores, or atomic instructions ensure thread safety.",
    difficulty: "Medium",
    order: 24,
  },
  {
    id: "q_ps_5",
    category: "PROBLEM_SOLVING",
    question: "You are designing an image upload feature. Users frequently upload 25MB RAW images that crash mobile viewers. What architecture resolves this gracefully?",
    options: [
      "Reject all files larger than 100KB at the form level without user explanation",
      "Upload to object storage, trigger an async background worker to compress and generate multi-resolution WebP variants, and serve via CDN",
      "Store base64 strings directly in the relational database rows",
      "Tell mobile users to only view the site on desktop screens",
    ],
    correctOption: 1,
    explanation: "Decoupling storage, async background transformation into modern web formats (WebP/AVIF), and CDN distribution is the cloud-native best practice.",
    difficulty: "Medium",
    order: 25,
  },
];

export function getSanitizedQuestions() {
  return FALLBACK_QUESTIONS.map((q) => ({
    id: q.id,
    category: q.category,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
    order: q.order,
  }));
}

export function evaluateSubmission(answers: Record<string, number>, timeSpentSeconds = 180) {
  let correctCount = 0;
  const totalQuestions = FALLBACK_QUESTIONS.length;

  const categoryStats: Record<string, { correct: number; total: number; percentage: number }> = {
    LOGICAL: { correct: 0, total: 0, percentage: 0 },
    QUANTITATIVE: { correct: 0, total: 0, percentage: 0 },
    VERBAL: { correct: 0, total: 0, percentage: 0 },
    ANALYTICAL: { correct: 0, total: 0, percentage: 0 },
    PROBLEM_SOLVING: { correct: 0, total: 0, percentage: 0 },
  };

  const reviewItems = FALLBACK_QUESTIONS.map((q) => {
    const userChoice = answers[q.id];
    const isCorrect = userChoice !== undefined && userChoice === q.correctOption;

    if (!categoryStats[q.category]) {
      categoryStats[q.category] = { correct: 0, total: 0, percentage: 0 };
    }
    categoryStats[q.category].total += 1;
    if (isCorrect) {
      correctCount += 1;
      categoryStats[q.category].correct += 1;
    }

    return {
      question_id: q.id,
      category: q.category,
      question: q.question,
      options: q.options,
      selected_option: userChoice,
      correct_option: q.correctOption,
      is_correct: isCorrect,
      explanation: q.explanation,
      difficulty: q.difficulty,
    };
  });

  const categoryScores: Record<string, any> = {};
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const [cat, stats] of Object.entries(categoryStats)) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 1000) / 10 : 0;
    categoryScores[cat] = {
      score: stats.correct,
      total: stats.total,
      percentage: pct,
    };
    if (pct >= 70) {
      strengths.push(cat);
    } else if (pct < 60) {
      weaknesses.push(cat);
    }
  }

  const overallScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;
  const performanceTier =
    overallScore >= 80 ? "Tier 1 • Exceptional" : overallScore >= 60 ? "Tier 2 • Proficient" : "Tier 3 • Developing";

  const strLabels = strengths.map((s) => s.replace("_", " "));
  const devLabels = weaknesses.map((w) => w.replace("_", " "));

  const careerImpacts = [
    {
      career_title: "Full Stack Developer",
      match_percentage: Math.min(98, Math.max(65, overallScore + 8)),
      fit_level: overallScore >= 75 ? "High Alignment" : "Moderate Alignment",
      rationale: "Strong algorithmic consistency and logical breakdown accelerate web component architecture and full-stack debugging.",
    },
    {
      career_title: "AI / ML Engineer",
      match_percentage: Math.min(99, Math.max(55, (categoryScores.ANALYTICAL?.percentage || 70) + 6)),
      fit_level: "High Alignment",
      rationale: "Analytical reasoning and pattern recognition meet rigorous machine learning model validation and evaluation criteria.",
    },
    {
      career_title: "Backend Engineer",
      match_percentage: Math.min(98, Math.max(60, (categoryScores.PROBLEM_SOLVING?.percentage || 70) + 7)),
      fit_level: "High Alignment",
      rationale: "Root-cause diagnostics and concurrency understanding fortify high-throughput API architecture.",
    },
  ];

  const aiInsights = {
    summary: `Candidate demonstrated an overall Aptitude Index of ${overallScore}%, showing strong proficiency in ${strLabels.join(", ") || "Foundational Reasoning"}.`,
    strengths: strLabels.length ? strLabels : ["Logical Deduction"],
    development_areas: devLabels.length ? devLabels : ["Algorithmic Edge Cases"],
    career_implications: [
      "Demonstrated problem solving elevates competitiveness for senior engineering and systems design roles.",
      "High cognitive agility reduces onboarding ramp time on complex distributed codebases.",
    ],
    recommended_actions: [
      "Complete focused challenges on identified development areas in the Roadmap.",
      "Incorporate quantitative and complexity analysis into daily engineering workflows.",
    ],
    ai_confidence: 0.95,
  };

  return {
    id: `att_${Date.now()}`,
    user_id: "candidate",
    status: "COMPLETED",
    score: overallScore,
    performance_tier: performanceTier,
    total_questions: totalQuestions,
    correct_count: correctCount,
    category_scores: categoryScores,
    strengths,
    weaknesses,
    career_impacts: careerImpacts,
    ai_insights: aiInsights,
    review_items: reviewItems,
    completed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}
