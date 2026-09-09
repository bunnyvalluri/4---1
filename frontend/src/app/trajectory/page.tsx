'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Zap,
  Target,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  Shield,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Cpu,
  BarChart2,
  Users,
  GitFork,
  ExternalLink,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';

interface YearProgression {
  year: number;
  level: string;
  title: string;
  baseSalary: number;
  equityBonus: number;
  salaryFormatted: string;
  equityFormatted: string;
  focus: string;
  responsibilities: string[];
  skills: { name: string; category: 'Core' | 'Architecture' | 'Leadership' | 'Tools' }[];
  milestones: { id: string; text: string }[];
  acceleratorTip: string;
  interviewTrack: string;
}

interface CareerTrackData {
  id: string;
  name: string;
  icon: any;
  category: string;
  overview: string;
  cagrGrowth: string;
  totalFiveYearValue: string;
  keyMoat: string;
  tracks: {
    ic: {
      name: string;
      description: string;
      years: YearProgression[];
    };
    management?: {
      name: string;
      description: string;
      years: YearProgression[];
    };
  };
}

const CAREER_TRAJECTORIES: Record<string, CareerTrackData> = {
  'software-engineer': {
    id: 'software-engineer',
    name: 'Software Engineer',
    icon: Cpu,
    category: 'Engineering & Systems',
    overview: 'From writing foundational code to architecting distributed cloud systems and driving organization-wide technical direction.',
    cagrGrowth: '+265%',
    totalFiveYearValue: '$895,000',
    keyMoat: 'Distributed System Design & Autonomous Execution',
    tracks: {
      ic: {
        name: 'Individual Contributor (IC) Track',
        description: 'Focus on deep technical mastery, systems architecture, and engineering excellence.',
        years: [
          {
            year: 1,
            level: 'L3 / Junior',
            title: 'Junior Software Engineer',
            baseSalary: 85000,
            equityBonus: 10000,
            salaryFormatted: '$80,000 – $95,000',
            equityFormatted: '$10k equity/bonus',
            focus: 'Component implementation, code hygiene, and PR review agility',
            responsibilities: [
              'Deliver well-tested features within established patterns',
              'Actively participate in code reviews and address feedback swiftly',
              'Learn CI/CD automation pipelines and staging deployment workflows',
            ],
            skills: [
              { name: 'TypeScript / Node', category: 'Core' },
              { name: 'React 19 & Next.js', category: 'Core' },
              { name: 'Git Workflows', category: 'Tools' },
              { name: 'REST & GraphQL APIs', category: 'Architecture' },
            ],
            milestones: [
              { id: 'se-y1-1', text: 'Ship first end-to-end production feature with zero regressions' },
              { id: 'se-y1-2', text: 'Achieve >85% unit and integration test coverage on assignments' },
              { id: 'se-y1-3', text: 'Independently resolve triage bugs within SLA targets' },
            ],
            acceleratorTip: 'Master debugging tools and write rigorous unit tests. High PR velocity with low rework is the fastest signal for mid-level promotion.',
            interviewTrack: 'Full Stack Developer',
          },
          {
            year: 2,
            level: 'L4 / Mid-Level',
            title: 'Software Engineer',
            baseSalary: 120000,
            equityBonus: 20000,
            salaryFormatted: '$110,000 – $135,000',
            equityFormatted: '$20k equity/bonus',
            focus: 'Autonomous feature delivery, API contract design, and data modeling',
            responsibilities: [
              'Own multi-week feature deliverables end-to-end with minimal supervision',
              'Design resilient database schemas and high-throughput endpoints',
              'Onboard and mentor incoming associate engineers and interns',
            ],
            skills: [
              { name: 'PostgreSQL Indexing', category: 'Core' },
              { name: 'Docker & Microservices', category: 'Architecture' },
              { name: 'Telemetry & Datadog', category: 'Tools' },
              { name: 'Design Patterns', category: 'Core' },
            ],
            milestones: [
              { id: 'se-y2-1', text: 'Lead technical RFC and implement high-traffic service endpoint' },
              { id: 'se-y2-2', text: 'Participate in primary on-call rotation without escalation' },
              { id: 'se-y2-3', text: 'Successfully onboard and buddy a new hire' },
            ],
            acceleratorTip: 'Stop waiting for tickets. Proactively identify operational bottlenecks or latency hot spots and propose measurable solutions.',
            interviewTrack: 'Software Engineer',
          },
          {
            year: 3,
            level: 'L5 / Senior I',
            title: 'Senior Software Engineer',
            baseSalary: 155000,
            equityBonus: 45000,
            salaryFormatted: '$145,000 – $175,000',
            equityFormatted: '$45k equity/bonus',
            focus: 'Distributed systems, system resiliency, technical roadmaps, and mentoring',
            responsibilities: [
              'Architect distributed sub-systems handling peak load and fault tolerance',
              'Drive technical roadmaps and align cross-functional dependencies',
              'Conduct technical hiring loops and calibrate evaluation rubrics',
            ],
            skills: [
              { name: 'Distributed Systems', category: 'Architecture' },
              { name: 'Kafka / Event-Driven', category: 'Architecture' },
              { name: 'AWS / Cloud Native', category: 'Tools' },
              { name: 'Technical Leadership', category: 'Leadership' },
            ],
            milestones: [
              { id: 'se-y3-1', text: 'Architect and deploy zero-downtime database migration' },
              { id: 'se-y3-2', text: 'Authored 3+ high-impact RFCs accepted across departments' },
              { id: 'se-y3-3', text: 'Achieve measurable 3x performance or latency gain in core service' },
            ],
            acceleratorTip: 'Seniority is defined by blast radius. Focus on building systems and tools that amplify the productivity of your entire pod.',
            interviewTrack: 'Senior Backend Engineer',
          },
          {
            year: 4,
            level: 'L5+ / Senior II / Tech Lead',
            title: 'Tech Lead / Staff Trainee',
            baseSalary: 185000,
            equityBonus: 65000,
            salaryFormatted: '$175,000 – $210,000',
            equityFormatted: '$65k equity/bonus',
            focus: 'Multi-pod technical alignment, high-stakes system architecture, team velocity',
            responsibilities: [
              'Bridge Product, Infrastructure, and Security requirements into coherent architectures',
              'Resolve architectural deadlocks and drive team consensus',
              'Advocate for engineering health and strategic technical debt payoff',
            ],
            skills: [
              { name: 'Cross-pod Alignment', category: 'Leadership' },
              { name: 'Capacity Planning', category: 'Architecture' },
              { name: 'Security & Compliance', category: 'Architecture' },
              { name: 'Mentorship at Scale', category: 'Leadership' },
            ],
            milestones: [
              { id: 'se-y4-1', text: 'Lead multi-quarter migration project involving 3+ teams' },
              { id: 'se-y4-2', text: 'Establish org-wide code review and SLA governance standards' },
              { id: 'se-y4-3', text: 'Mentor 2 mid-level engineers through successful Senior promotions' },
            ],
            acceleratorTip: 'Decide here between Staff IC and Engineering Management. Both branches unlock exponential total compensation and leverage.',
            interviewTrack: 'Senior Backend Engineer',
          },
          {
            year: 5,
            level: 'L6 / Staff Engineer',
            title: 'Staff / Principal Engineer',
            baseSalary: 230000,
            equityBonus: 120000,
            salaryFormatted: '$210,000 – $275,000',
            equityFormatted: '$120k+ equity/bonus',
            focus: 'Org-wide technical vision, strategic innovation, and executive advisory',
            responsibilities: [
              'Define the 2-3 year technical horizon for the company product ecosystem',
              'Represent engineering in executive leadership, board, and investor discussions',
              'Sponsor company-critical initiatives and foster high-performance engineering culture',
            ],
            skills: [
              { name: 'Multi-year Tech Vision', category: 'Leadership' },
              { name: 'Executive Storytelling', category: 'Leadership' },
              { name: 'Enterprise Architecture', category: 'Architecture' },
              { name: 'High-leverage Delegation', category: 'Leadership' },
            ],
            milestones: [
              { id: 'se-y5-1', text: 'Publish enterprise architecture blueprint steering 50+ engineers' },
              { id: 'se-y5-2', text: 'Drive company-wide platform adoption saving $500k+ annual cloud spend' },
              { id: 'se-y5-3', text: 'Keynote internal tech summit or publish acclaimed external tech paper' },
            ],
            acceleratorTip: 'Staff engineers do not code 60 hours a week. They write clarifying documents, eliminate ambiguity, and solve problems that prevent 50 others from stalling.',
            interviewTrack: 'Cloud & DevOps Engineer',
          },
        ],
      },
      management: {
        name: 'Engineering Management Track',
        description: 'Pivots toward people leadership, organizational design, headcount budgeting, and executive strategy.',
        years: [
          {
            year: 1,
            level: 'L3 / IC Foundation',
            title: 'Junior Software Engineer',
            baseSalary: 85000,
            equityBonus: 10000,
            salaryFormatted: '$80,000 – $95,000',
            equityFormatted: '$10k equity/bonus',
            focus: 'Solid technical base and empathy for development challenges',
            responsibilities: ['Build robust features and absorb development mechanics'],
            skills: [{ name: 'Core Coding', category: 'Core' }],
            milestones: [{ id: 'sem-y1-1', text: 'Deliver core features on schedule' }],
            acceleratorTip: 'Great managers must have technical credibility. Spend early years building rock-solid code foundations.',
            interviewTrack: 'Software Engineer',
          },
          {
            year: 2,
            level: 'L4 / Tech Contributor',
            title: 'Software Engineer & Project Lead',
            baseSalary: 120000,
            equityBonus: 20000,
            salaryFormatted: '$110,000 – $135,000',
            equityFormatted: '$20k equity/bonus',
            focus: 'Sprint planning, project facilitation, and peer mentorship',
            responsibilities: ['Run standups and coordinate milestone deliveries with PMs'],
            skills: [{ name: 'Agile & Scrum', category: 'Leadership' }],
            milestones: [{ id: 'sem-y2-1', text: 'Successfully run sprint cycles for team' }],
            acceleratorTip: 'Volunteer to manage sprint health, facilitate retrospectives, and coordinate with Product.',
            interviewTrack: 'Software Engineer',
          },
          {
            year: 3,
            level: 'M1 / Team Lead',
            title: 'Tech Lead / Associate EM',
            baseSalary: 160000,
            equityBonus: 45000,
            salaryFormatted: '$150,000 – $180,000',
            equityFormatted: '$45k equity/bonus',
            focus: '1-on-1 coaching, performance reviews, and technical execution balance',
            responsibilities: ['Conduct regular 1-on-1s and manage sprint delivery commitments'],
            skills: [{ name: 'People Coaching', category: 'Leadership' }],
            milestones: [{ id: 'sem-y3-1', text: 'Transition to managing 3-5 direct reports' }],
            acceleratorTip: 'Shift mindset from personal commits to team unblocking and talent growth.',
            interviewTrack: 'Senior Backend Engineer',
          },
          {
            year: 4,
            level: 'M2 / Engineering Manager',
            title: 'Engineering Manager',
            baseSalary: 195000,
            equityBonus: 70000,
            salaryFormatted: '$180,000 – $220,000',
            equityFormatted: '$70k equity/bonus',
            focus: 'Headcount hiring, organizational hygiene, and quarterly business OKRs',
            responsibilities: ['Own hiring pipeline, compensation reviews, and cross-team delivery'],
            skills: [{ name: 'Talent Acquisition', category: 'Leadership' }],
            milestones: [{ id: 'sem-y4-1', text: 'Scale pod from 5 to 12 high-performing engineers' }],
            acceleratorTip: 'Focus on retention and team psychological safety to consistently hit product milestones.',
            interviewTrack: 'Senior Backend Engineer',
          },
          {
            year: 5,
            level: 'D1 / Director of Engineering',
            title: 'Director of Engineering',
            baseSalary: 245000,
            equityBonus: 140000,
            salaryFormatted: '$225,000 – $290,000',
            equityFormatted: '$140k+ equity/bonus',
            focus: 'Department budgeting, C-suite product strategy, and manager-of-managers leadership',
            responsibilities: ['Lead an organization of 25-50 engineers across multiple managers'],
            skills: [{ name: 'Organizational Strategy', category: 'Leadership' }],
            milestones: [{ id: 'sem-y5-1', text: 'Deliver enterprise roadmap generating >$10M value' }],
            acceleratorTip: 'Directors manage managers. Focus on empowering leaders rather than micromanaging code.',
            interviewTrack: 'Senior Backend Engineer',
          },
        ],
      },
    },
  },
  'ai-ml-engineer': {
    id: 'ai-ml-engineer',
    name: 'AI & Machine Learning Engineer',
    icon: Sparkles,
    category: 'Applied AI & Research',
    overview: 'From data pipelines and model fine-tuning to building high-scale production inference engines and multimodal agentic workflows.',
    cagrGrowth: '+290%',
    totalFiveYearValue: '$965,000',
    keyMoat: 'Production LLM Orchestration, RAG & GPU Optimization',
    tracks: {
      ic: {
        name: 'AI Research & Platform Track',
        description: 'Deep technical trajectory focusing on model architecture, inference latency, and AI infrastructure.',
        years: [
          {
            year: 1,
            level: 'L3 / Junior',
            title: 'Junior Machine Learning Engineer',
            baseSalary: 92000,
            equityBonus: 15000,
            salaryFormatted: '$85,000 – $105,000',
            equityFormatted: '$15k equity/bonus',
            focus: 'Data preprocessing, feature engineering, and baseline model training',
            responsibilities: [
              'Clean, curate, and augment multi-modal training datasets',
              'Implement evaluation pipelines and track loss/accuracy metrics via Weights & Biases',
              'Deploy basic models via FastAPI endpoints with Docker containers',
            ],
            skills: [
              { name: 'Python & PyTorch', category: 'Core' },
              { name: 'FastAPI & Docker', category: 'Tools' },
              { name: 'Pandas & NumPy', category: 'Core' },
              { name: 'Hugging Face Transformers', category: 'Core' },
            ],
            milestones: [
              { id: 'ai-y1-1', text: 'Build automated data ingestion pipeline processing 100k+ records' },
              { id: 'ai-y1-2', text: 'Deploy first custom classifier to staging with sub-100ms response' },
              { id: 'ai-y1-3', text: 'Establish automated model regression benchmark suite' },
            ],
            acceleratorTip: 'Become fluent in PyTorch internals and experiment tracking. The ability to quickly reproduce papers is a huge differentiator.',
            interviewTrack: 'AI Solutions Engineer',
          },
          {
            year: 2,
            level: 'L4 / Applied AI',
            title: 'Applied Machine Learning Engineer',
            baseSalary: 130000,
            equityBonus: 30000,
            salaryFormatted: '$120,000 – $145,000',
            equityFormatted: '$30k equity/bonus',
            focus: 'Model fine-tuning (LoRA/QLoRA), vector search, and RAG architectures',
            responsibilities: [
              'Implement hybrid vector search with Pinecone/Qdrant and sparse BM25 indexing',
              'Fine-tune open-weight models (Llama 3, Mistral) for domain-specific tasks',
              'Optimize token usage, prompt templates, and streaming response latency',
            ],
            skills: [
              { name: 'Fine-Tuning (PEFT/LoRA)', category: 'Core' },
              { name: 'Vector DBs (Qdrant/Pinecone)', category: 'Architecture' },
              { name: 'LangChain & LlamaIndex', category: 'Tools' },
              { name: 'Prompt Engineering & Eval', category: 'Core' },
            ],
            milestones: [
              { id: 'ai-y2-1', text: 'Deploy production RAG system with >92% answer groundedness' },
              { id: 'ai-y2-2', text: 'Cut inference token costs by 40% through intelligent prompt routing' },
              { id: 'ai-y2-3', text: 'Build hallucination detection guardrail in production pipeline' },
            ],
            acceleratorTip: 'Master model evaluation (Evals). Anyone can write a prompt; building reliable evals that prove accuracy is what companies pay premium for.',
            interviewTrack: 'AI Solutions Engineer',
          },
          {
            year: 3,
            level: 'L5 / Senior AI',
            title: 'Senior AI / MLOps Engineer',
            baseSalary: 170000,
            equityBonus: 60000,
            salaryFormatted: '$160,000 – $190,000',
            equityFormatted: '$60k equity/bonus',
            focus: 'Distributed GPU training, vLLM / TensorRT inference optimization, and MLOps',
            responsibilities: [
              'Build distributed training pipelines utilizing DeepSpeed and Ray clusters',
              'Optimize high-throughput inference engines using vLLM and quantization (AWQ/GPTQ)',
              'Implement continuous CI/CD training loops with automated canary evaluation',
            ],
            skills: [
              { name: 'vLLM / TensorRT-LLM', category: 'Architecture' },
              { name: 'Ray & Distributed Computing', category: 'Architecture' },
              { name: 'GPU Profiling (CUDA/Triton)', category: 'Core' },
              { name: 'Kubernetes & Kubeflow', category: 'Tools' },
            ],
            milestones: [
              { id: 'ai-y3-1', text: 'Scale private inference cluster to 10k requests/minute under 80ms TTFT' },
              { id: 'ai-y3-2', text: 'Reduce GPU cluster compute expenditure by $250k through quantization' },
              { id: 'ai-y3-3', text: 'Architect end-to-end multi-agent workflow for enterprise customers' },
            ],
            acceleratorTip: 'GPU compute is the #1 tech expense for modern AI companies. Engineers who optimize memory bandwidth and reduce inference costs command top-tier compensation.',
            interviewTrack: 'AI Solutions Engineer',
          },
          {
            year: 4,
            level: 'L5+ / Lead AI Architect',
            title: 'Lead AI Systems Architect',
            baseSalary: 210000,
            equityBonus: 90000,
            salaryFormatted: '$195,000 – $235,000',
            equityFormatted: '$90k equity/bonus',
            focus: 'Enterprise agentic architectures, foundational model synthesis, multimodal pipelines',
            responsibilities: [
              'Architect multimodal agent pipelines capable of multi-step planning and tool execution',
              'Set enterprise data privacy, differential privacy, and alignment guardrails',
              'Drive AI vendor partnerships and proprietary on-premise infrastructure strategy',
            ],
            skills: [
              { name: 'Autonomous Agent Frameworks', category: 'Architecture' },
              { name: 'AI Safety & Alignment', category: 'Leadership' },
              { name: 'Enterprise Data Strategy', category: 'Leadership' },
              { name: 'Custom CUDA Kernels', category: 'Core' },
            ],
            milestones: [
              { id: 'ai-y4-1', text: 'Deliver autonomous enterprise workflow operating at 99.8% precision' },
              { id: 'ai-y4-2', text: 'Establish company AI ethics, guardrail, and security governance' },
              { id: 'ai-y4-3', text: 'File patent or author landmark whitepaper on agent orchestration' },
            ],
            acceleratorTip: 'Focus on multi-agent collaboration and tool usage. The frontier has moved from simple chatbots to autonomous systems executing real business tasks.',
            interviewTrack: 'AI Solutions Engineer',
          },
          {
            year: 5,
            level: 'L6 / Principal AI Scientist',
            title: 'Principal AI Scientist / Fellow',
            baseSalary: 260000,
            equityBonus: 160000,
            salaryFormatted: '$240,000 – $320,000',
            equityFormatted: '$160k+ equity/bonus',
            focus: 'Long-term frontier AI strategy, core proprietary IP, and global industry advisory',
            responsibilities: [
              'Pioneer company-differentiating proprietary algorithms and foundation models',
              'Advise the Executive Board and CEO on technological moats and disruption risks',
              'Lead research partnerships with top academic labs and frontier AI organizations',
            ],
            skills: [
              { name: 'Frontier AI Research', category: 'Core' },
              { name: 'Executive Strategy', category: 'Leadership' },
              { name: 'Proprietary IP Generation', category: 'Leadership' },
              { name: 'Global Tech Evangelism', category: 'Leadership' },
            ],
            milestones: [
              { id: 'ai-y5-1', text: 'Deliver industry-leading model architecture recognized in benchmark leaderboards' },
              { id: 'ai-y5-2', text: 'Shape core patent portfolio that establishes competitive IP moat' },
              { id: 'ai-y5-3', text: 'Keynote international conferences (NeurIPS, ICML, CVPR)' },
            ],
            acceleratorTip: 'At this level, you set the research agenda for the entire company. Your work defines whether the company leads or gets disrupted.',
            interviewTrack: 'AI Solutions Engineer',
          },
        ],
      },
    },
  },
  'cloud-devops': {
    id: 'cloud-devops',
    name: 'Cloud Infrastructure & SRE',
    icon: Shield,
    category: 'Cloud, DevOps & Security',
    overview: 'From containerization and CI/CD pipelines to global hybrid-cloud mesh architectures and 99.999% uptime guarantees.',
    cagrGrowth: '+230%',
    totalFiveYearValue: '$830,000',
    keyMoat: 'Kubernetes Orchestration, Zero-Trust & Chaos Engineering',
    tracks: {
      ic: {
        name: 'Infrastructure & SRE Track',
        description: 'Focus on high-availability cloud architecture, automated reliability, and security compliance.',
        years: [
          {
            year: 1,
            level: 'L3 / Junior',
            title: 'Junior DevOps / Cloud Engineer',
            baseSalary: 82000,
            equityBonus: 10000,
            salaryFormatted: '$75,000 – $90,000',
            equityFormatted: '$10k equity/bonus',
            focus: 'Docker containerization, GitHub Actions CI/CD, and basic Linux sysadmin',
            responsibilities: [
              'Maintain build workflows and deployment scripts',
              'Monitor server health metrics and respond to automated pager alerts',
              'Write Infrastructure as Code (Terraform) for staging environments',
            ],
            skills: [
              { name: 'Docker & Linux', category: 'Core' },
              { name: 'GitHub Actions / CI/CD', category: 'Tools' },
              { name: 'AWS Essentials (EC2/S3/VPC)', category: 'Core' },
              { name: 'Terraform Basics', category: 'Architecture' },
            ],
            milestones: [
              { id: 'cd-y1-1', text: 'Migrate legacy deployment pipeline to declarative GitHub Actions' },
              { id: 'cd-y1-2', text: 'Pass AWS Certified Solutions Architect Associate exam' },
              { id: 'cd-y1-3', text: 'Implement automated secret rotation across staging clusters' },
            ],
            acceleratorTip: 'Deepen your Linux networking and bash scripting foundations. Most high-severity cloud outages trace back to DNS, subnets, or file descriptors.',
            interviewTrack: 'Cloud & DevOps Engineer',
          },
          {
            year: 2,
            level: 'L4 / Cloud Engineer',
            title: 'Cloud & DevOps Engineer',
            baseSalary: 115000,
            equityBonus: 20000,
            salaryFormatted: '$105,000 – $130,000',
            equityFormatted: '$20k equity/bonus',
            focus: 'Kubernetes (EKS/GKE), Helm charts, Terraform at scale, and observability',
            responsibilities: [
              'Provision and maintain multi-tenant Kubernetes clusters in production',
              'Implement Prometheus, Grafana, and OpenTelemetry distributed tracing',
              'Collaborate with developers to standardize microservice container templates',
            ],
            skills: [
              { name: 'Kubernetes (EKS/GKE)', category: 'Architecture' },
              { name: 'Terraform Modules', category: 'Architecture' },
              { name: 'Prometheus & Grafana', category: 'Tools' },
              { name: 'Zero-Trust Security', category: 'Core' },
            ],
            milestones: [
              { id: 'cd-y2-1', text: 'Lead production cluster migration to Kubernetes with zero downtime' },
              { id: 'cd-y2-2', text: 'Build self-service preview environments for pull requests' },
              { id: 'cd-y2-3', text: 'Achieve CKA (Certified Kubernetes Administrator) credentials' },
            ],
            acceleratorTip: 'Focus on developer productivity. If your infrastructure makes the 50 software engineers ship 20% faster, your value is unquestionable.',
            interviewTrack: 'Cloud & DevOps Engineer',
          },
          {
            year: 3,
            level: 'L5 / Senior SRE',
            title: 'Senior Site Reliability Engineer (SRE)',
            baseSalary: 150000,
            equityBonus: 40000,
            salaryFormatted: '$140,000 – $170,000',
            equityFormatted: '$40k equity/bonus',
            focus: 'SLO/SLI governance, chaos engineering, disaster recovery, and cost governance',
            responsibilities: [
              'Define error budgets, SLOs, and incident post-mortem retrospectives',
              'Run automated chaos tests (Chaos Mesh) simulating regional cloud failovers',
              'Optimize multi-cloud spot instances saving 30%+ on infrastructure compute',
            ],
            skills: [
              { name: 'SLO / Error Budgets', category: 'Leadership' },
              { name: 'Chaos Engineering', category: 'Architecture' },
              { name: 'FinOps Cloud Economics', category: 'Leadership' },
              { name: 'Service Mesh (Istio)', category: 'Architecture' },
            ],
            milestones: [
              { id: 'cd-y3-1', text: 'Maintain 99.99% availability during peak Black Friday / holiday traffic' },
              { id: 'cd-y3-2', text: 'Execute cross-region automated disaster recovery drill under 15 min RTO' },
              { id: 'cd-y3-3', text: 'Save company $300k annually through automated autoscaling policies' },
            ],
            acceleratorTip: 'SRE is not just ops; it is software engineering applied to operations. Automate yourself out of recurring toil every sprint.',
            interviewTrack: 'Cloud & DevOps Engineer',
          },
          {
            year: 4,
            level: 'L5+ / Staff SRE',
            title: 'Staff Reliability & Security Architect',
            baseSalary: 180000,
            equityBonus: 60000,
            salaryFormatted: '$170,000 – $205,000',
            equityFormatted: '$60k equity/bonus',
            focus: 'Global edge distribution, multi-region database replication, compliance (SOC2/FedRAMP)',
            responsibilities: [
              'Architect multi-region active-active cloud infrastructure with distributed consensus',
              'Lead enterprise SOC2 Type II, ISO 27001, and HIPAA infrastructure compliance audits',
              'Design company-wide identity and access management (IAM) security policies',
            ],
            skills: [
              { name: 'Multi-Region Active-Active', category: 'Architecture' },
              { name: 'SOC2 / Compliance', category: 'Leadership' },
              { name: 'Edge Networks & Anycast', category: 'Architecture' },
              { name: 'Incident Command Lead', category: 'Leadership' },
            ],
            milestones: [
              { id: 'cd-y4-1', text: 'Deliver multi-region failover mesh with RPO under 10 seconds' },
              { id: 'cd-y4-2', text: 'Clear comprehensive SOC2 Type II audit with zero critical exceptions' },
              { id: 'cd-y4-3', text: 'Standardize enterprise infrastructure platform across 8 pods' },
            ],
            acceleratorTip: 'Develop strong security intuition. Infrastructure architects who understand both uptime and adversarial security are in the top 5% demand.',
            interviewTrack: 'Cloud & DevOps Engineer',
          },
          {
            year: 5,
            level: 'L6 / Principal Cloud Architect',
            title: 'Principal Cloud & Infrastructure Architect',
            baseSalary: 220000,
            equityBonus: 100000,
            salaryFormatted: '$200,000 – $260,000',
            equityFormatted: '$100k+ equity/bonus',
            focus: 'Global cloud strategy, sovereign data architecture, and multi-million dollar vendor negotiations',
            responsibilities: [
              'Steer enterprise multi-cloud strategy across AWS, GCP, and specialized GPU clouds',
              'Lead executive procurement negotiations with hyperscaler VP teams',
              'Ensure uncompromised platform resilience supporting mission-critical enterprise SLAs',
            ],
            skills: [
              { name: 'Multi-Cloud Architecture', category: 'Architecture' },
              { name: 'Enterprise Procurement', category: 'Leadership' },
              { name: 'Global Data Sovereignty', category: 'Architecture' },
              { name: 'Executive Advisory', category: 'Leadership' },
            ],
            milestones: [
              { id: 'cd-y5-1', text: 'Negotiate 3-year enterprise cloud commitment yielding $2M+ in savings' },
              { id: 'cd-y5-2', text: 'Architect sovereign cloud environment compliant with EU/APAC regulations' },
              { id: 'cd-y5-3', text: 'Establish resilience standards adopted across entire organization' },
            ],
            acceleratorTip: 'At the Principal level, you prevent multi-million-dollar architectural blunders before a single line of Terraform is committed.',
            interviewTrack: 'Cloud & DevOps Engineer',
          },
        ],
      },
    },
  },
};

const STORAGE_KEY_MILESTONES = 'careerai_completed_milestones_v1';

export default function TrajectoryPage() {
  const [selectedCareerKey, setSelectedCareerKey] = useState<string>('software-engineer');
  const [selectedTrackType, setSelectedTrackType] = useState<'ic' | 'management'>('ic');
  const [expandedYear, setExpandedYear] = useState<number | null>(1);
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MILESTONES);
      if (saved) setCompletedMilestones(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleMilestone = (id: string) => {
    const updated = { ...completedMilestones, [id]: !completedMilestones[id] };
    setCompletedMilestones(updated);
    try {
      localStorage.setItem(STORAGE_KEY_MILESTONES, JSON.stringify(updated));
    } catch {}
  };

  const careerData = CAREER_TRAJECTORIES[selectedCareerKey] || CAREER_TRAJECTORIES['software-engineer'];
  const track =
    selectedTrackType === 'management' && careerData.tracks.management
      ? careerData.tracks.management
      : careerData.tracks.ic;

  const totalMilestonesInTrack = useMemo(() => {
    return track.years.reduce((acc, y) => acc + y.milestones.length, 0);
  }, [track]);

  const completedInTrack = useMemo(() => {
    return track.years.reduce(
      (acc, y) => acc + y.milestones.filter((m) => completedMilestones[m.id]).length,
      0
    );
  }, [track, completedMilestones]);

  const progressPercent = totalMilestonesInTrack > 0 ? Math.round((completedInTrack / totalMilestonesInTrack) * 100) : 0;

  // Compute max compensation for responsive chart scaling
  const maxTotalComp = useMemo(() => {
    return Math.max(...track.years.map((y) => y.baseSalary + y.equityBonus));
  }, [track]);

  return (
    <DashboardShell
      userName="Candidate"
      userEmail=""
      telemetryStatus="Live"
      lastUpdatedText="just now"
      notifications={[]}
      onRefresh={() => {}}
      onMarkNotificationRead={() => {}}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-14">
        {/* Header with Career Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Compass className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Career Trajectory Planner
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                5-Year Projection Engine
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Interactive ladder progression, compensation milestones, and technical competency benchmarks.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="relative">
              <select
                value={selectedCareerKey}
                onChange={(e) => {
                  setSelectedCareerKey(e.target.value);
                  setSelectedTrackType('ic');
                  setExpandedYear(1);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors shadow-2xs"
              >
                {Object.values(CAREER_TRAJECTORIES).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* IC vs Management Track Fork Switcher */}
            {careerData.tracks.management && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setSelectedTrackType('ic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedTrackType === 'ic'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  IC Track
                </button>
                <button
                  onClick={() => setSelectedTrackType('management')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedTrackType === 'management'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Management
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Executive High-Impact Telemetry Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 rounded-2xl border border-blue-200/80 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                5-Yr Salary Expansion
              </span>
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">{careerData.cagrGrowth}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              ${track.years[0].baseSalary / 1000}k → ${(track.years[4].baseSalary + track.years[4].equityBonus) / 1000}k Total Comp
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 rounded-2xl border border-emerald-200/80 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Cumulative 5-Yr Earnings
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-700">{careerData.totalFiveYearValue}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Base salary + equity & vesting schedule
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 via-white to-purple-50/30 rounded-2xl border border-violet-200/80 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                Milestone Readiness
              </span>
              <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                <Award className="h-4 w-4" />
              </span>
            </div>
            <div className="text-3xl font-black text-violet-700">{progressPercent}%</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              {completedInTrack} of {totalMilestonesInTrack} career milestones checked
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50/30 rounded-2xl border border-amber-200/80 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Core Career Moat
              </span>
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <Zap className="h-4 w-4" />
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 line-clamp-2 leading-snug">
              {careerData.keyMoat}
            </div>
            <div className="text-xs text-amber-700 font-bold mt-1.5 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              High market defensibility
            </div>
          </div>
        </div>

        {/* INTERACTIVE SALARY & TOTAL COMPENSATION GROWTH ENGINE (CHART) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900">
                  5-Year Compensation Ladder & Equity Progression
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of base salary vs. annual equity grants and bonus milestones across seniority levels
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-blue-600 inline-block" />
                <span className="text-slate-600">Base Salary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" />
                <span className="text-slate-600">Equity / Annual Bonus</span>
              </div>
            </div>
          </div>

          {/* Graphical Growth Bars */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-5 gap-3 sm:gap-6 items-end h-56 sm:h-64 px-2">
              {track.years.map((yr) => {
                const totalComp = yr.baseSalary + yr.equityBonus;
                const totalHeightPercent = Math.round((totalComp / maxTotalComp) * 100);
                const basePortionPercent = Math.round((yr.baseSalary / totalComp) * 100);
                const equityPortionPercent = 100 - basePortionPercent;
                const isSelected = expandedYear === yr.year;

                return (
                  <div
                    key={yr.year}
                    onClick={() => setExpandedYear(yr.year)}
                    className="flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip value */}
                    <div className="text-center mb-2 transition-transform duration-200 group-hover:-translate-y-1">
                      <span className="block text-[11px] sm:text-xs font-black text-slate-900">
                        ${Math.round(totalComp / 1000)}k
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold hidden sm:inline">
                        +${Math.round(yr.equityBonus / 1000)}k rsu
                      </span>
                    </div>

                    {/* Stacked Bar Container */}
                    <div
                      className={`w-full max-w-[72px] rounded-2xl p-1 flex flex-col justify-end transition-all duration-300 ${
                        isSelected
                          ? 'ring-3 ring-blue-500 bg-blue-50/50 shadow-md'
                          : 'bg-slate-50 group-hover:bg-slate-100/80'
                      }`}
                      style={{ height: `${totalHeightPercent}%` }}
                    >
                      {/* Equity Segment */}
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-xl transition-all group-hover:brightness-105"
                        style={{ height: `${equityPortionPercent}%` }}
                        title={`Equity / Bonus: $${yr.equityBonus.toLocaleString()}`}
                      />
                      {/* Base Salary Segment */}
                      <div
                        className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-b-xl transition-all group-hover:brightness-105 mt-0.5"
                        style={{ height: `${basePortionPercent}%` }}
                        title={`Base Salary: $${yr.baseSalary.toLocaleString()}`}
                      />
                    </div>

                    {/* Year & Role Footer */}
                    <div className="text-center mt-3">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Yr {yr.year}
                      </span>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate max-w-[90px] mt-1 hidden sm:block">
                        {yr.level.split('/')[0]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5-YEAR PROGRESSION ACCORDION & MILESTONES ROADMAP */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Career Level Architecture</h2>
              <p className="text-xs text-slate-500">
                Click any year to inspect expectations, technical stacks, actionable milestones, and fast-track tips.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Track: <strong className="text-slate-800">{track.name}</strong>
            </span>
          </div>

          <div className="space-y-4">
            {track.years.map((yr) => {
              const isExpanded = expandedYear === yr.year;
              const isCurrent = yr.year === 1;
              const yearMilestones = yr.milestones;
              const completedInYear = yearMilestones.filter((m) => completedMilestones[m.id]).length;
              const allCompletedInYear = completedInYear === yearMilestones.length;

              return (
                <div
                  key={yr.year}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden bg-white shadow-2xs ${
                    isExpanded
                      ? 'border-blue-300 ring-2 ring-blue-100/80 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Accordion Row Header */}
                  <div
                    onClick={() => setExpandedYear(isExpanded ? null : yr.year)}
                    className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                          allCompletedInYear
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {allCompletedInYear ? <Check className="h-6 w-6" /> : yr.year}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                            {yr.title}
                          </h3>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {yr.level}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wider">
                              CURRENT ENTRY POINT
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs mt-1">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {yr.salaryFormatted}
                          </span>
                          <span className="text-slate-400 hidden sm:inline">•</span>
                          <span className="text-slate-500 font-medium hidden sm:inline">
                            {yr.equityFormatted}
                          </span>
                          <span className="text-slate-400 hidden sm:inline">•</span>
                          <span className="text-blue-600 font-semibold truncate hidden md:inline">
                            Focus: {yr.focus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-slate-400 hidden sm:block">
                        {completedInYear}/{yearMilestones.length} milestones
                      </span>
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content Drawer */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-6 bg-slate-50/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
                        {/* Core Responsibilities */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                          <div className="flex items-center gap-2 text-slate-800">
                            <Target className="h-4 w-4 text-blue-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Core Expectations & Scope
                            </h4>
                          </div>
                          <ul className="space-y-2 text-xs text-slate-600">
                            {yr.responsibilities.map((resp, i) => (
                              <li key={i} className="flex items-start gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* High-Impact Skills Matrix */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                          <div className="flex items-center gap-2 text-slate-800">
                            <Layers className="h-4 w-4 text-violet-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Required Competency Stack
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {yr.skills.map((s, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-3 py-1 rounded-xl font-bold border transition-colors ${
                                  s.category === 'Core'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : s.category === 'Architecture'
                                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                                    : s.category === 'Leadership'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {s.name}
                                <span className="text-[10px] opacity-70 font-normal ml-1">
                                  ({s.category})
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Actionable Milestones */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Promotion & Readiness Milestones (Click to check off)
                            </h4>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">
                            Saved locally in your profile
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {yr.milestones.map((m) => {
                            const isDone = Boolean(completedMilestones[m.id]);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => toggleMilestone(m.id)}
                                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
                                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                                    isDone
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-slate-300 bg-white text-transparent'
                                  }`}
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                                <span className={`text-xs font-medium ${isDone ? 'line-through opacity-80' : ''}`}>
                                  {m.text}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* AI Fast-Track Accelerator & Direct Action Tools */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 text-xs text-slate-700">
                          <Bot className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block font-black text-blue-950 mb-0.5">
                              Fast-Track Promotion Accelerator
                            </strong>
                            {yr.acceleratorTip}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/interview?role=${encodeURIComponent(yr.interviewTrack)}`}
                            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-violet-700 font-bold text-xs rounded-xl border border-violet-200 shadow-2xs transition-colors flex items-center gap-1.5"
                          >
                            <Bot className="h-3.5 w-3.5" />
                            Mock {yr.level.split('/')[0]}
                          </Link>
                          <Link
                            href="/skills"
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            Skill Gaps
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
