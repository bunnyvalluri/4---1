/**
 * Authoritative recommendations fallback dataset and utilities.
 * Ensures the CareerAI Recommendations Intelligence system operates seamlessly
 * in serverless environments (e.g. Netlify) when external databases or FastAPI
 * backend daemons are unreachable, preventing broken UI and mixed-content errors.
 */

import {
  RecommendationItem,
  RecommendationStatus,
  SkillGapItem,
  CareerComparisonData,
} from './hooks/useRecommendations';

export const FALLBACK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec_fullstack_dev',
    rank: 1,
    career_id: 'career_fullstack_dev',
    career_title: 'Full Stack Developer',
    career_category: 'Software Engineering',
    career_slug: 'full-stack-developer',
    career_salary_range: '$115,000 - $160,000',
    career_demand_level: 'Very High',
    career_experience_level: 'Mid-Level',
    match_score: 94.2,
    match_level: 'Excellent Match',
    skills_score: 96.0,
    interests_score: 92.0,
    aptitude_score: 88.0,
    education_score: 90.0,
    experience_score: 85.0,
    preference_score: 90.0,
    confidence_score: 92.0,
    matching_skills: [
      { name: 'TypeScript', proficiency: 5, userProficiency: 5, requiredProficiency: 4, verified: true },
      { name: 'React.js', proficiency: 5, userProficiency: 5, requiredProficiency: 4, verified: true },
      { name: 'Node.js', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
      { name: 'Next.js', proficiency: 4, userProficiency: 4, requiredProficiency: 3, verified: true },
      { name: 'PostgreSQL', proficiency: 4, userProficiency: 4, requiredProficiency: 3, verified: true },
      { name: 'Tailwind CSS', proficiency: 5, userProficiency: 5, requiredProficiency: 3, verified: true },
      { name: 'Docker', proficiency: 3, userProficiency: 3, requiredProficiency: 3, verified: false },
    ],
    missing_skills: [
      { name: 'Kubernetes', currentProficiency: 1, requiredProficiency: 3, gapSeverity: 'High' },
      { name: 'GraphQL', currentProficiency: 2, requiredProficiency: 3, gapSeverity: 'Medium' },
      { name: 'System Design', currentProficiency: 2, requiredProficiency: 4, gapSeverity: 'Medium' },
    ],
    reasoning:
      'Exceptional alignment with your modern web engineering stack (React, TypeScript, Next.js, Node.js). Your demonstrated proficiency in full-stack architecture and relational databases makes this your highest-ROI career track.',
    breakdown: {
      contributingFactors: [
        {
          id: 'cf_skills',
          name: 'Core Skills',
          score: 96.0,
          weightPercent: 35,
          weightedPoints: 33.6,
          status: 'positive',
          insight: '7 of 9 core competencies verified with advanced proficiency.',
        },
        {
          id: 'cf_interests',
          name: 'Career Interests',
          score: 92.0,
          weightPercent: 20,
          weightedPoints: 18.4,
          status: 'positive',
          insight: 'Strong interest alignment with web technologies and product development.',
        },
        {
          id: 'cf_aptitude',
          name: 'Cognitive Aptitude',
          score: 88.0,
          weightPercent: 15,
          weightedPoints: 13.2,
          status: 'positive',
          insight: 'High logical reasoning and algorithmic problem-solving diagnostic scores.',
        },
        {
          id: 'cf_education',
          name: 'Education & Academics',
          score: 90.0,
          weightPercent: 15,
          weightedPoints: 13.5,
          status: 'positive',
          insight: 'Computer Science degree provides authoritative technical foundation.',
        },
        {
          id: 'cf_experience',
          name: 'Practical Experience',
          score: 85.0,
          weightPercent: 15,
          weightedPoints: 12.8,
          status: 'positive',
          insight: 'Verified repository contributions and production-grade project portfolio.',
        },
      ],
      confidenceScore: 92.0,
    },
    recommended_actions: [
      'Containerize a multi-tier microservices application with Kubernetes and Helm charts.',
      'Implement GraphQL federation schema stitching with Apollo Server and TypeScript.',
      'Design high-throughput distributed architectures featuring Redis caching and message queues.',
    ],
    top_strength: 'TypeScript & Modern React Stack',
    primary_gap: 'Kubernetes Cluster Orchestration',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec_aiml_eng',
    rank: 2,
    career_id: 'career_aiml_eng',
    career_title: 'AI / Machine Learning Engineer',
    career_category: 'Artificial Intelligence',
    career_slug: 'ai-machine-learning-engineer',
    career_salary_range: '$130,000 - $185,000',
    career_demand_level: 'High',
    career_experience_level: 'Mid / Senior',
    match_score: 88.7,
    match_level: 'Strong Match',
    skills_score: 86.0,
    interests_score: 94.0,
    aptitude_score: 92.0,
    education_score: 90.0,
    experience_score: 78.0,
    preference_score: 92.0,
    confidence_score: 88.0,
    matching_skills: [
      { name: 'Python', proficiency: 5, userProficiency: 5, requiredProficiency: 4, verified: true },
      { name: 'Scikit-learn', proficiency: 4, userProficiency: 4, requiredProficiency: 3, verified: true },
      { name: 'PyTorch', proficiency: 3, userProficiency: 3, requiredProficiency: 4, verified: false },
      { name: 'SQL', proficiency: 4, userProficiency: 4, requiredProficiency: 3, verified: true },
      { name: 'Data Structures', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
    ],
    missing_skills: [
      { name: 'MLOps & Model Deployment', currentProficiency: 1, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'LLM Fine-Tuning', currentProficiency: 2, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'Distributed Training', currentProficiency: 1, requiredProficiency: 3, gapSeverity: 'Medium' },
    ],
    reasoning:
      'Strong scientific programming foundation with Python and Scikit-learn, coupled with exceptional mathematical and analytical aptitude. Advancing in production MLOps and LLM orchestration will bridge your gap to tier-1 AI engineering roles.',
    breakdown: {
      contributingFactors: [
        {
          id: 'cf_skills',
          name: 'Core Skills',
          score: 86.0,
          weightPercent: 35,
          weightedPoints: 30.1,
          status: 'positive',
          insight: 'Proficient in Python data science ecosystem; MLOps pipeline mastery required.',
        },
        {
          id: 'cf_interests',
          name: 'Career Interests',
          score: 94.0,
          weightPercent: 20,
          weightedPoints: 18.8,
          status: 'positive',
          insight: 'Exemplary interest in neural architectures and generative intelligence.',
        },
        {
          id: 'cf_aptitude',
          name: 'Cognitive Aptitude',
          score: 92.0,
          weightPercent: 15,
          weightedPoints: 13.8,
          status: 'positive',
          insight: 'Top-tier analytical deduction and probabilistic reasoning metrics.',
        },
        {
          id: 'cf_education',
          name: 'Education & Academics',
          score: 90.0,
          weightPercent: 15,
          weightedPoints: 13.5,
          status: 'positive',
          insight: 'Linear algebra and multivariable calculus academic foundation.',
        },
        {
          id: 'cf_experience',
          name: 'Practical Experience',
          score: 78.0,
          weightPercent: 15,
          weightedPoints: 11.7,
          status: 'neutral',
          insight: 'Expand production deployment portfolio with MLflow and vector stores.',
        },
      ],
      confidenceScore: 88.0,
    },
    recommended_actions: [
      'Build end-to-end continuous training pipelines using MLflow and FastAPI serving.',
      'Fine-tune open-weights models (Llama 3 / Mistral) using LoRA and PEFT.',
      'Deploy semantic search with pgvector or Pinecone indexing for RAG workflows.',
    ],
    top_strength: 'Python & Statistical Algorithms',
    primary_gap: 'MLOps Pipeline Deployment',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec_cloud_arch',
    rank: 3,
    career_id: 'career_cloud_arch',
    career_title: 'Cloud Solutions Architect',
    career_category: 'Cloud & Infrastructure',
    career_slug: 'cloud-solutions-architect',
    career_salary_range: '$135,000 - $190,000',
    career_demand_level: 'High',
    career_experience_level: 'Senior',
    match_score: 84.5,
    match_level: 'Strong Match',
    skills_score: 81.0,
    interests_score: 88.0,
    aptitude_score: 89.0,
    education_score: 90.0,
    experience_score: 80.0,
    preference_score: 85.0,
    confidence_score: 86.0,
    matching_skills: [
      { name: 'Docker', proficiency: 3, userProficiency: 3, requiredProficiency: 4, verified: true },
      { name: 'Linux', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
      { name: 'CI/CD Pipelines', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
      { name: 'Git', proficiency: 5, userProficiency: 5, requiredProficiency: 4, verified: true },
      { name: 'PostgreSQL', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
    ],
    missing_skills: [
      { name: 'AWS Cloud Architecture', currentProficiency: 2, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'Terraform & IaC', currentProficiency: 1, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'Cloud Security & IAM', currentProficiency: 2, requiredProficiency: 4, gapSeverity: 'Medium' },
    ],
    reasoning:
      'Solid systems engineering and automation background. Transitioning to architectural leadership requires formal infrastructure-as-code mastery (Terraform) and multi-region high-availability design.',
    breakdown: {
      contributingFactors: [
        {
          id: 'cf_skills',
          name: 'Core Skills',
          score: 81.0,
          weightPercent: 35,
          weightedPoints: 28.3,
          status: 'positive',
          insight: 'Well-versed in containerization and CI/CD; needs multi-cloud IaC depth.',
        },
        {
          id: 'cf_interests',
          name: 'Career Interests',
          score: 88.0,
          weightPercent: 20,
          weightedPoints: 17.6,
          status: 'positive',
          insight: 'Demonstrated enthusiasm for resilient architecture and scalability.',
        },
        {
          id: 'cf_aptitude',
          name: 'Cognitive Aptitude',
          score: 89.0,
          weightPercent: 15,
          weightedPoints: 13.3,
          status: 'positive',
          insight: 'Strong fault-tree analysis and abstract system modeling aptitude.',
        },
        {
          id: 'cf_education',
          name: 'Education & Academics',
          score: 90.0,
          weightPercent: 15,
          weightedPoints: 13.5,
          status: 'positive',
          insight: 'CS background provides systems, networking, and concurrency depth.',
        },
        {
          id: 'cf_experience',
          name: 'Practical Experience',
          score: 80.0,
          weightPercent: 15,
          weightedPoints: 12.0,
          status: 'positive',
          insight: 'Proven CI/CD automation and containerization project evidence.',
        },
      ],
      confidenceScore: 86.0,
    },
    recommended_actions: [
      'Architect a zero-downtime multi-AZ cloud architecture on AWS using Terraform.',
      'Achieve AWS Certified Solutions Architect Associate accreditation.',
      'Implement automated secret rotation and least-privilege IAM policies with Vault.',
    ],
    top_strength: 'Linux & CI/CD Pipelines',
    primary_gap: 'Terraform Infrastructure as Code',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec_data_eng',
    rank: 4,
    career_id: 'career_data_eng',
    career_title: 'Data Engineer',
    career_category: 'Data Engineering',
    career_slug: 'data-engineer',
    career_salary_range: '$110,000 - $155,000',
    career_demand_level: 'High',
    career_experience_level: 'Mid-Level',
    match_score: 81.2,
    match_level: 'Good Match',
    skills_score: 84.0,
    interests_score: 79.0,
    aptitude_score: 86.0,
    education_score: 90.0,
    experience_score: 76.0,
    preference_score: 80.0,
    confidence_score: 85.0,
    matching_skills: [
      { name: 'SQL', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
      { name: 'Python', proficiency: 5, userProficiency: 5, requiredProficiency: 4, verified: true },
      { name: 'PostgreSQL', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
      { name: 'Data Modeling', proficiency: 3, userProficiency: 3, requiredProficiency: 4, verified: false },
    ],
    missing_skills: [
      { name: 'Apache Spark', currentProficiency: 1, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'Apache Kafka', currentProficiency: 1, requiredProficiency: 3, gapSeverity: 'High' },
      { name: 'Snowflake / BigQuery', currentProficiency: 1, requiredProficiency: 3, gapSeverity: 'Medium' },
    ],
    reasoning:
      'Strong relational data design and Python scripting capabilities. Scaling distributed streaming data pipelines with Kafka and Spark will unlock senior data platform engineering tiers.',
    breakdown: {
      contributingFactors: [
        {
          id: 'cf_skills',
          name: 'Core Skills',
          score: 84.0,
          weightPercent: 35,
          weightedPoints: 29.4,
          status: 'positive',
          insight: 'Expert relational querying and database normalization capabilities.',
        },
        {
          id: 'cf_interests',
          name: 'Career Interests',
          score: 79.0,
          weightPercent: 20,
          weightedPoints: 15.8,
          status: 'neutral',
          insight: 'Moderate interest in data platform pipelines and ETL maintenance.',
        },
        {
          id: 'cf_aptitude',
          name: 'Cognitive Aptitude',
          score: 86.0,
          weightPercent: 15,
          weightedPoints: 12.9,
          status: 'positive',
          insight: 'Strong numerical deduction and dataset schema transformation metrics.',
        },
        {
          id: 'cf_education',
          name: 'Education & Academics',
          score: 90.0,
          weightPercent: 15,
          weightedPoints: 13.5,
          status: 'positive',
          insight: 'Database management systems and discrete mathematics coursework.',
        },
        {
          id: 'cf_experience',
          name: 'Practical Experience',
          score: 76.0,
          weightPercent: 15,
          weightedPoints: 11.4,
          status: 'neutral',
          insight: 'Add high-volume stream ingestion repository projects to portfolio.',
        },
      ],
      confidenceScore: 85.0,
    },
    recommended_actions: [
      'Construct a real-time event streaming pipeline using Kafka and Spark Structured Streaming.',
      'Deploy dbt (data build tool) transformations inside modern data warehouse schemas.',
      'Design medallion architecture (Bronze/Silver/Gold) lakes using Delta Lake.',
    ],
    top_strength: 'SQL & Relational Modeling',
    primary_gap: 'Distributed Apache Spark Processing',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec_devops_sre',
    rank: 5,
    career_id: 'career_devops_sre',
    career_title: 'DevOps & Site Reliability Engineer',
    career_category: 'Cloud & Infrastructure',
    career_slug: 'devops-site-reliability-engineer',
    career_salary_range: '$120,000 - $170,000',
    career_demand_level: 'High',
    career_experience_level: 'Mid-Level',
    match_score: 78.4,
    match_level: 'Good Match',
    skills_score: 77.0,
    interests_score: 80.0,
    aptitude_score: 84.0,
    education_score: 90.0,
    experience_score: 75.0,
    preference_score: 76.0,
    confidence_score: 84.0,
    matching_skills: [
      { name: 'Docker', proficiency: 3, userProficiency: 3, requiredProficiency: 4, verified: true },
      { name: 'Git', proficiency: 5, userProficiency: 5, requiredProficiency: 4, verified: true },
      { name: 'CI/CD Pipelines', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
      { name: 'Linux', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
    ],
    missing_skills: [
      { name: 'Prometheus & Grafana', currentProficiency: 1, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'Terraform', currentProficiency: 1, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'Kubernetes Ingress & Mesh', currentProficiency: 1, requiredProficiency: 4, gapSeverity: 'High' },
    ],
    reasoning:
      'Solid command of version control and workflow automation. Growth into dedicated SRE positions requires practical telemetry instrumentation (Prometheus/Grafana) and incident post-mortem mastery.',
    breakdown: {
      contributingFactors: [
        {
          id: 'cf_skills',
          name: 'Core Skills',
          score: 77.0,
          weightPercent: 35,
          weightedPoints: 26.9,
          status: 'neutral',
          insight: 'Core automation verified; observability and SLO telemetry in progress.',
        },
        {
          id: 'cf_interests',
          name: 'Career Interests',
          score: 80.0,
          weightPercent: 20,
          weightedPoints: 16.0,
          status: 'positive',
          insight: 'Healthy curiosity in site uptime, deployment reliability, and automation.',
        },
        {
          id: 'cf_aptitude',
          name: 'Cognitive Aptitude',
          score: 84.0,
          weightPercent: 15,
          weightedPoints: 12.6,
          status: 'positive',
          insight: 'Good incident root-cause diagnosis and systemic pattern recognition.',
        },
        {
          id: 'cf_education',
          name: 'Education & Academics',
          score: 90.0,
          weightPercent: 15,
          weightedPoints: 13.5,
          status: 'positive',
          insight: 'Operating systems and network architecture foundations.',
        },
        {
          id: 'cf_experience',
          name: 'Practical Experience',
          score: 75.0,
          weightPercent: 15,
          weightedPoints: 11.2,
          status: 'neutral',
          insight: 'Build hands-on production observability dashboards in homelab/cloud.',
        },
      ],
      confidenceScore: 84.0,
    },
    recommended_actions: [
      'Configure Prometheus alerts and custom Grafana dashboards for a Kubernetes cluster.',
      'Implement GitOps workflow using ArgoCD and automated Helm promotions.',
      'Define Service Level Objectives (SLOs) and error budget tracking pipelines.',
    ],
    top_strength: 'Git & Deployment Automation',
    primary_gap: 'Observability & Monitoring Stacks',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rec_cybersecurity',
    rank: 6,
    career_id: 'career_cybersecurity',
    career_title: 'Cybersecurity Analyst',
    career_category: 'Security',
    career_slug: 'cybersecurity-analyst',
    career_salary_range: '$105,000 - $145,000',
    career_demand_level: 'High',
    career_experience_level: 'Entry / Mid',
    match_score: 73.1,
    match_level: 'Moderate Match',
    skills_score: 68.0,
    interests_score: 76.0,
    aptitude_score: 85.0,
    education_score: 90.0,
    experience_score: 65.0,
    preference_score: 72.0,
    confidence_score: 80.0,
    matching_skills: [
      { name: 'Linux', proficiency: 4, userProficiency: 4, requiredProficiency: 4, verified: true },
      { name: 'Networking Fundamentals', proficiency: 3, userProficiency: 3, requiredProficiency: 4, verified: false },
      { name: 'Python', proficiency: 5, userProficiency: 5, requiredProficiency: 3, verified: true },
    ],
    missing_skills: [
      { name: 'SIEM & SOC Operations', currentProficiency: 1, requiredProficiency: 4, gapSeverity: 'High' },
      { name: 'Penetration Testing', currentProficiency: 1, requiredProficiency: 3, gapSeverity: 'High' },
      { name: 'OWASP Security Best Practices', currentProficiency: 2, requiredProficiency: 4, gapSeverity: 'Medium' },
    ],
    reasoning:
      'Solid systems programming and Linux command-line capabilities. Direct transition into security operations demands targeted exposure to SIEM telemetry (Splunk/Wazuh) and penetration testing methodology.',
    breakdown: {
      contributingFactors: [
        {
          id: 'cf_skills',
          name: 'Core Skills',
          score: 68.0,
          weightPercent: 35,
          weightedPoints: 23.8,
          status: 'neutral',
          insight: 'Strong OS and scripting baseline; offensive/defensive tooling required.',
        },
        {
          id: 'cf_interests',
          name: 'Career Interests',
          score: 76.0,
          weightPercent: 20,
          weightedPoints: 15.2,
          status: 'positive',
          insight: 'Interest in digital forensics, cryptology, and application hardening.',
        },
        {
          id: 'cf_aptitude',
          name: 'Cognitive Aptitude',
          score: 85.0,
          weightPercent: 15,
          weightedPoints: 12.7,
          status: 'positive',
          insight: 'Excellent anomaly detection and vulnerability hypothesis reasoning.',
        },
        {
          id: 'cf_education',
          name: 'Education & Academics',
          score: 90.0,
          weightPercent: 15,
          weightedPoints: 13.5,
          status: 'positive',
          insight: 'Formal background in cryptography and network protocols.',
        },
        {
          id: 'cf_experience',
          name: 'Practical Experience',
          score: 65.0,
          weightPercent: 15,
          weightedPoints: 9.7,
          status: 'growth_area',
          insight: 'Undertake CTF challenges and obtain CompTIA Security+ or CEH.',
        },
      ],
      confidenceScore: 80.0,
    },
    recommended_actions: [
      'Complete hands-on red-team and blue-team labs on Hack The Box or TryHackMe.',
      'Deploy open-source Wazuh SIEM to audit security events across server nodes.',
      'Conduct automated vulnerability scans using OWASP ZAP and Trivy.',
    ],
    top_strength: 'Linux Systems & Python Scripting',
    primary_gap: 'SIEM Incident Detection & Response',
    updated_at: new Date().toISOString(),
  },
];

export const FALLBACK_STATUS: RecommendationStatus = {
  status: 'up_to_date',
  last_analyzed: new Date().toISOString(),
  last_analyzed_relative: '10 minutes ago',
  is_stale: false,
  profile_complete: true,
  profile_completion_pct: 94,
  missing_profile_items: [],
  active_job_id: null,
  recommendation_count: 6,
};

export const FALLBACK_SKILL_GAPS: SkillGapItem[] = [
  {
    name: 'Kubernetes',
    currentLevel: 'Beginner',
    targetLevel: 'Advanced',
    currentScore: 40,
    targetScore: 80,
    priority: 'HIGH PRIORITY',
    careerTitle: 'Full Stack Developer',
    suggestedResource: 'Deploy containerized microservices and ingress controllers on a local minikube / k3s cluster.',
  },
  {
    name: 'MLOps Pipeline Deployment',
    currentLevel: 'Beginner',
    targetLevel: 'Intermediate',
    currentScore: 30,
    targetScore: 70,
    priority: 'HIGH PRIORITY',
    careerTitle: 'AI / Machine Learning Engineer',
    suggestedResource: 'Build automated CI/CD model deployment pipelines using MLflow, DVC, and FastAPI inference services.',
  },
  {
    name: 'Terraform & IaC',
    currentLevel: 'Beginner',
    targetLevel: 'Advanced',
    currentScore: 30,
    targetScore: 80,
    priority: 'HIGH PRIORITY',
    careerTitle: 'Cloud Solutions Architect',
    suggestedResource: 'Automate multi-tier AWS infrastructure provisioning with modular Terraform configurations.',
  },
  {
    name: 'Distributed Apache Spark',
    currentLevel: 'Beginner',
    targetLevel: 'Intermediate',
    currentScore: 35,
    targetScore: 75,
    priority: 'MEDIUM PRIORITY',
    careerTitle: 'Data Engineer',
    suggestedResource: 'Process big data streaming telemetry using PySpark and Delta Lake table optimizations.',
  },
];

export const FALLBACK_CATEGORIES = [
  'ALL',
  'Software Engineering',
  'Artificial Intelligence',
  'Cloud & Infrastructure',
  'Data Engineering',
  'Security',
];

/**
 * Filter, search, and sort fallback recommendations.
 */
export function filterAndSortRecommendations(
  items: RecommendationItem[],
  search?: string,
  category?: string,
  sortBy: string = 'match_score'
): { items: RecommendationItem[]; total: number; top_match: RecommendationItem | null } {
  let filtered = [...items];

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.career_title.toLowerCase().includes(q) ||
        item.career_category.toLowerCase().includes(q) ||
        item.matching_skills.some((s) => s.name.toLowerCase().includes(q)) ||
        item.missing_skills.some((s) => s.name.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'ALL') {
    filtered = filtered.filter(
      (item) => item.career_category.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort
  if (sortBy === 'skills_score') {
    filtered.sort((a, b) => b.skills_score - a.skills_score);
  } else if (sortBy === 'interests_score') {
    filtered.sort((a, b) => b.interests_score - a.interests_score);
  } else if (sortBy === 'lowest_gap') {
    filtered.sort((a, b) => a.missing_skills.length - b.missing_skills.length);
  } else {
    // Default: match_score
    filtered.sort((a, b) => b.match_score - a.match_score);
  }

  // Re-rank after sorting
  filtered = filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));

  return {
    items: filtered,
    total: filtered.length,
    top_match: filtered[0] || null,
  };
}

/**
 * Generate a dynamic comparison matrix between selected careers.
 */
export function buildComparisonMatrix(careerIds: string[]): CareerComparisonData {
  const selected = FALLBACK_RECOMMENDATIONS.filter((r) => careerIds.includes(r.career_id));

  const careers = selected.map((r) => ({
    id: r.career_id,
    title: r.career_title,
    category: r.career_category,
    salary_range: r.career_salary_range,
    demand_level: r.career_demand_level,
    match_score: r.match_score,
    skills_score: r.skills_score,
    top_strength: r.top_strength,
    primary_gap: r.primary_gap,
    // Required properties for table rows
    career_id: r.career_id,
    match_level: r.match_level,
    interests_score: r.interests_score,
    aptitude_score: r.aptitude_score,
    education_score: r.education_score,
    experience_score: r.experience_score,
    skill_gap_count: r.missing_skills.length,
    skill_gap_severity: r.missing_skills.length <= 2 ? 'Low' : r.missing_skills.length <= 3 ? 'Medium' : 'High',
    top_missing_skill: r.missing_skills[0]?.name || 'None',
  })) as any[];

  // Find winners
  const bestOverall = careers.reduce((prev, curr) => (curr.match_score > prev.match_score ? curr : prev), careers[0]);
  const lowestGap = careers.reduce((prev, curr) => (curr.skill_gap_count < prev.skill_gap_count ? curr : prev), careers[0]);
  const bestInterest = careers.reduce((prev, curr) => (curr.interests_score > prev.interests_score ? curr : prev), careers[0]);

  return {
    careers,
    common_skills: ['Python', 'Linux', 'SQL', 'Git', 'Docker'],
    unique_skills: {},
    factor_comparison: [
      {
        factor: 'Technical Skills',
        scores: Object.fromEntries(careers.map((c) => [c.id, c.skills_score])),
      },
      {
        factor: 'Interests Fit',
        scores: Object.fromEntries(careers.map((c) => [c.id, c.interests_score])),
      },
      {
        factor: 'Aptitude Alignment',
        scores: Object.fromEntries(careers.map((c) => [c.id, c.aptitude_score])),
      },
      {
        factor: 'Education Alignment',
        scores: Object.fromEntries(careers.map((c) => [c.id, c.education_score])),
      },
    ],
    best_overall: bestOverall?.id || '',
    lowest_gap: lowestGap?.id || '',
    best_interest_fit: bestInterest?.id || '',
  } as any;
}
