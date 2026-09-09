'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  TrendingUp,
  DollarSign,
  Building2,
  Flame,
  BarChart3,
  Globe,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Search,
  Filter,
  Layers,
  MapPin,
  Laptop,
  Zap,
  Target,
  Clock,
  Compass,
  Award,
  ChevronRight,
} from 'lucide-react';

interface CareerMarketProfile {
  title: string;
  category: string;
  salaryMin: number;
  salaryMid: number;
  salaryMax: number;
  bonusAvg: number;
  equityAvg: number;
  growthRate: number;
  hiringVelocity: 'Ultra Fast' | 'Fast' | 'Steady';
  avgDaysToOffer: number;
  totalOpenings: number;
  remoteShare: number;
  demandTag: 'Explosive' | 'Very High' | 'High' | 'Emerging';
  topSkills: { name: string; premium: string; growth: string; category: string }[];
  hubs: { city: string; avgSalary: number; openings: number }[];
  companies: {
    name: string;
    logoText: string;
    openings: number;
    remotePolicy: string;
    avgPay: string;
    color: string;
  }[];
  overview: string;
  outlookAdvice: string;
}

const MARKET_PROFILES: Record<string, CareerMarketProfile> = {
  'Software Engineer': {
    title: 'Software Engineer',
    category: 'Engineering & Architecture',
    salaryMin: 88,
    salaryMid: 142,
    salaryMax: 235,
    bonusAvg: 18,
    equityAvg: 35,
    growthRate: 26.4,
    hiringVelocity: 'Fast',
    avgDaysToOffer: 19,
    totalOpenings: 54200,
    remoteShare: 64,
    demandTag: 'Very High',
    overview:
      'Demand remains extraordinarily resilient with sustained hiring across cloud infrastructure, distributed systems, and AI-enabled product workflows.',
    outlookAdvice:
      'Candidates commanding top 10% compensation differentiate through systems design, concurrency fundamentals, and hands-on cloud orchestration.',
    topSkills: [
      { name: 'Distributed Systems', premium: '+18%', growth: '+34% YoY', category: 'Architecture' },
      { name: 'TypeScript & Next.js', premium: '+12%', growth: '+28% YoY', category: 'Frontend/FullStack' },
      { name: 'Kubernetes & Docker', premium: '+15%', growth: '+22% YoY', category: 'Cloud' },
      { name: 'PostgreSQL & Redis', premium: '+10%', growth: '+19% YoY', category: 'Databases' },
      { name: 'Python & Go', premium: '+14%', growth: '+25% YoY', category: 'Backend' },
      { name: 'GraphQL & REST APIs', premium: '+8%', growth: '+15% YoY', category: 'API' },
    ],
    hubs: [
      { city: 'San Francisco Bay Area', avgSalary: 178, openings: 14200 },
      { city: 'New York Metro', avgSalary: 162, openings: 9800 },
      { city: 'Seattle / Bellevue', avgSalary: 168, openings: 7400 },
      { city: 'Global Remote (US Baseline)', avgSalary: 146, openings: 18600 },
      { city: 'Austin & Texas Tech Hub', avgSalary: 138, openings: 4200 },
    ],
    companies: [
      { name: 'Amazon AWS', logoText: 'AMZN', openings: 2150, remotePolicy: 'Hybrid / Remote', avgPay: '$175K - $260K', color: 'bg-orange-500' },
      { name: 'Google Cloud', logoText: 'GOOG', openings: 1420, remotePolicy: 'Hybrid', avgPay: '$185K - $285K', color: 'bg-blue-600' },
      { name: 'Microsoft Azure', logoText: 'MSFT', openings: 1640, remotePolicy: 'Remote Eligible', avgPay: '$165K - $250K', color: 'bg-cyan-600' },
      { name: 'Stripe & Fintech', logoText: 'STRP', openings: 480, remotePolicy: '100% Remote', avgPay: '$195K - $310K', color: 'bg-violet-600' },
      { name: 'High-Growth Tech Startups', logoText: 'YCSU', openings: 8900, remotePolicy: 'Remote First', avgPay: '$140K - $220K', color: 'bg-emerald-600' },
    ],
  },
  'AI & Machine Learning Engineer': {
    title: 'AI & Machine Learning Engineer',
    category: 'AI & Machine Learning',
    salaryMin: 115,
    salaryMid: 178,
    salaryMax: 310,
    bonusAvg: 25,
    equityAvg: 60,
    growthRate: 48.2,
    hiringVelocity: 'Ultra Fast',
    avgDaysToOffer: 14,
    totalOpenings: 32400,
    remoteShare: 58,
    demandTag: 'Explosive',
    overview:
      'The fastest accelerating domain in technology. Companies are aggressively staffing LLM evaluation, fine-tuning, RAG infrastructure, and GPU-optimized inference pipelines.',
    outlookAdvice:
      'Moving beyond basic prompting to production MLOps, vector database optimization, and latency-budgeted fine-tuning yields the greatest salary multipliers.',
    topSkills: [
      { name: 'LLM Fine-Tuning & RAG', premium: '+28%', growth: '+140% YoY', category: 'Generative AI' },
      { name: 'PyTorch & Transformers', premium: '+22%', growth: '+45% YoY', category: 'Frameworks' },
      { name: 'MLOps (vLLM, Triton)', premium: '+24%', growth: '+62% YoY', category: 'Deployment' },
      { name: 'Vector DBs (Pinecone, pgvector)', premium: '+16%', growth: '+75% YoY', category: 'Data' },
      { name: 'Python & CUDA', premium: '+20%', growth: '+38% YoY', category: 'Core' },
      { name: 'Data Pipeline Engineering', premium: '+12%', growth: '+20% YoY', category: 'Data' },
    ],
    hubs: [
      { city: 'San Francisco Bay Area', avgSalary: 212, openings: 11500 },
      { city: 'New York Metro', avgSalary: 188, openings: 5900 },
      { city: 'Seattle Metro', avgSalary: 194, openings: 4600 },
      { city: 'Global Remote', avgSalary: 175, openings: 8200 },
      { city: 'Boston / Cambridge Tech Hub', avgSalary: 172, openings: 2200 },
    ],
    companies: [
      { name: 'OpenAI', logoText: 'OPAI', openings: 380, remotePolicy: 'Hybrid / Onsite', avgPay: '$240K - $450K', color: 'bg-slate-900' },
      { name: 'Google DeepMind & AI', logoText: 'GDM', openings: 620, remotePolicy: 'Hybrid', avgPay: '$220K - $390K', color: 'bg-blue-600' },
      { name: 'Anthropic', logoText: 'ANTH', openings: 210, remotePolicy: 'Hybrid', avgPay: '$250K - $480K', color: 'bg-amber-600' },
      { name: 'NVIDIA AI Software', logoText: 'NVDA', openings: 1100, remotePolicy: 'Hybrid Eligible', avgPay: '$210K - $360K', color: 'bg-emerald-600' },
      { name: 'Meta GenAI Labs', logoText: 'META', openings: 940, remotePolicy: 'Hybrid', avgPay: '$230K - $420K', color: 'bg-indigo-600' },
    ],
  },
  'Cloud & DevOps Architect': {
    title: 'Cloud & DevOps Architect',
    category: 'Cloud & Infrastructure',
    salaryMin: 95,
    salaryMid: 152,
    salaryMax: 240,
    bonusAvg: 16,
    equityAvg: 30,
    growthRate: 29.1,
    hiringVelocity: 'Fast',
    avgDaysToOffer: 17,
    totalOpenings: 38900,
    remoteShare: 72,
    demandTag: 'Very High',
    overview:
      'Massive enterprise transition to multi-cloud resilience, infrastructure as code, and zero-trust security postures is driving high demand for SREs and platform engineers.',
    outlookAdvice:
      'Certifications paired with real terraform modular architectures and Kubernetes cluster hardening place candidates in top-tier interview pipelines.',
    topSkills: [
      { name: 'Terraform & OpenTofu', premium: '+15%', growth: '+30% YoY', category: 'IaC' },
      { name: 'Kubernetes Multi-Cluster', premium: '+19%', growth: '+28% YoY', category: 'Orchestration' },
      { name: 'AWS & GCP Architectures', premium: '+14%', growth: '+21% YoY', category: 'Cloud' },
      { name: 'CI/CD Pipelines (GitHub Actions)', premium: '+10%', growth: '+18% YoY', category: 'Automation' },
      { name: 'Prometheus, Grafana & Datadog', premium: '+11%', growth: '+22% YoY', category: 'Observability' },
      { name: 'Zero-Trust Security Policies', premium: '+16%', growth: '+35% YoY', category: 'Security' },
    ],
    hubs: [
      { city: 'Global Remote', avgSalary: 158, openings: 15400 },
      { city: 'San Francisco Bay Area', avgSalary: 182, openings: 7800 },
      { city: 'Seattle Tech Corridor', avgSalary: 172, openings: 5400 },
      { city: 'New York Metro', avgSalary: 164, openings: 5800 },
      { city: 'Austin Tech Hub', avgSalary: 145, openings: 4500 },
    ],
    companies: [
      { name: 'Datadog', logoText: 'DDOG', openings: 440, remotePolicy: '100% Remote', avgPay: '$170K - $265K', color: 'bg-purple-600' },
      { name: 'Cloudflare', logoText: 'NET', openings: 380, remotePolicy: 'Remote First', avgPay: '$175K - $280K', color: 'bg-orange-600' },
      { name: 'HashiCorp / IBM', logoText: 'HASH', openings: 260, remotePolicy: 'Remote Eligible', avgPay: '$165K - $250K', color: 'bg-blue-700' },
      { name: 'CrowdStrike & Security', logoText: 'CRWD', openings: 510, remotePolicy: '100% Remote', avgPay: '$180K - $275K', color: 'bg-rose-600' },
      { name: 'Enterprise Cloud Consultancies', logoText: 'CONS', openings: 6200, remotePolicy: 'Hybrid / Remote', avgPay: '$145K - $220K', color: 'bg-teal-600' },
    ],
  },
  'Data Scientist & Analytics': {
    title: 'Data Scientist & Analytics',
    category: 'AI & Machine Learning',
    salaryMin: 92,
    salaryMid: 146,
    salaryMax: 245,
    bonusAvg: 15,
    equityAvg: 28,
    growthRate: 31.8,
    hiringVelocity: 'Fast',
    avgDaysToOffer: 21,
    totalOpenings: 29800,
    remoteShare: 61,
    demandTag: 'High',
    overview:
      'Companies increasingly prioritize business-impact-driven analytics: translating complex raw event streams into causal insights, revenue attribution, and predictive engines.',
    outlookAdvice:
      'High earnings belong to data scientists who combine classical inferential statistics with modern SQL, Python data engineering, and A/B test governance.',
    topSkills: [
      { name: 'Advanced SQL & DBT', premium: '+12%', growth: '+25% YoY', category: 'Data' },
      { name: 'Python (Pandas, SciPy, Scikit)', premium: '+11%', growth: '+19% YoY', category: 'Analysis' },
      { name: 'A/B Testing & Causal Inference', premium: '+17%', growth: '+32% YoY', category: 'Experimentation' },
      { name: 'Tableau & PowerBI Storytelling', premium: '+8%', growth: '+12% YoY', category: 'BI' },
      { name: 'Apache Spark & BigQuery', premium: '+15%', growth: '+24% YoY', category: 'Data Eng' },
      { name: 'Predictive Modeling', premium: '+14%', growth: '+20% YoY', category: 'Modeling' },
    ],
    hubs: [
      { city: 'San Francisco Bay Area', avgSalary: 174, openings: 7200 },
      { city: 'New York Metro', avgSalary: 165, openings: 6800 },
      { city: 'Global Remote', avgSalary: 148, openings: 9200 },
      { city: 'Chicago Financial District', avgSalary: 142, openings: 3800 },
      { city: 'Seattle Metro', avgSalary: 162, openings: 2800 },
    ],
    companies: [
      { name: 'Netflix Analytics', logoText: 'NFLX', openings: 220, remotePolicy: 'Hybrid', avgPay: '$180K - $310K', color: 'bg-rose-700' },
      { name: 'Uber Marketplace DS', logoText: 'UBER', openings: 310, remotePolicy: 'Hybrid', avgPay: '$165K - $275K', color: 'bg-slate-900' },
      { name: 'Palantir Commercial', logoText: 'PLTR', openings: 440, remotePolicy: 'Hybrid / Travel', avgPay: '$160K - $270K', color: 'bg-teal-700' },
      { name: 'Capital One & FinTech', logoText: 'COF', openings: 850, remotePolicy: 'Hybrid', avgPay: '$150K - $230K', color: 'bg-red-600' },
      { name: 'Healthcare & Biotech Startups', logoText: 'HLTH', openings: 3400, remotePolicy: 'Remote First', avgPay: '$140K - $210K', color: 'bg-emerald-700' },
    ],
  },
  'Product Manager': {
    title: 'Product Manager',
    category: 'Product & Design',
    salaryMin: 102,
    salaryMid: 158,
    salaryMax: 275,
    bonusAvg: 20,
    equityAvg: 42,
    growthRate: 21.5,
    hiringVelocity: 'Steady',
    avgDaysToOffer: 24,
    totalOpenings: 24300,
    remoteShare: 52,
    demandTag: 'High',
    overview:
      'Product management is becoming more quantitative and technical. Product managers with deep understanding of APIs, data metrics, and generative AI features stand out dramatically.',
    outlookAdvice:
      'Demonstrate end-to-end feature ownership from customer discovery to post-launch retention analysis. Being able to read SQL and craft product briefs with AI is key.',
    topSkills: [
      { name: 'Product Strategy & Roadmaps', premium: '+14%', growth: '+18% YoY', category: 'Core' },
      { name: 'Data Analysis & SQL for PMs', premium: '+16%', growth: '+35% YoY', category: 'Quantitative' },
      { name: 'Customer Discovery & UX Testing', premium: '+10%', growth: '+14% YoY', category: 'Discovery' },
      { name: 'Generative AI Product Patterns', premium: '+22%', growth: '+95% YoY', category: 'Emerging' },
      { name: 'Agile & Cross-Functional Leadership', premium: '+8%', growth: '+10% YoY', category: 'Execution' },
      { name: 'Go-To-Market & Pricing Design', premium: '+15%', growth: '+20% YoY', category: 'Business' },
    ],
    hubs: [
      { city: 'San Francisco Bay Area', avgSalary: 186, openings: 6900 },
      { city: 'New York Metro', avgSalary: 172, openings: 5400 },
      { city: 'Seattle Metro', avgSalary: 170, openings: 3800 },
      { city: 'Global Remote', avgSalary: 152, openings: 6200 },
      { city: 'Boston Tech Hub', avgSalary: 150, openings: 2000 },
    ],
    companies: [
      { name: 'Airbnb', logoText: 'ABNB', openings: 140, remotePolicy: 'Live & Work Anywhere', avgPay: '$180K - $300K', color: 'bg-rose-500' },
      { name: 'Notion & Productivity', logoText: 'NTN', openings: 75, remotePolicy: 'Hybrid / Remote', avgPay: '$175K - $280K', color: 'bg-slate-700' },
      { name: 'Figma & Design Systems', logoText: 'FIG', openings: 85, remotePolicy: 'Hybrid', avgPay: '$185K - $295K', color: 'bg-purple-600' },
      { name: 'DoorDash Marketplace', logoText: 'DASH', openings: 230, remotePolicy: 'Hybrid', avgPay: '$170K - $275K', color: 'bg-red-500' },
      { name: 'B2B SaaS Scaleups', logoText: 'SAAS', openings: 4500, remotePolicy: 'Remote First', avgPay: '$145K - $230K', color: 'bg-blue-600' },
    ],
  },
  'UX & Product Designer': {
    title: 'UX & Product Designer',
    category: 'Product & Design',
    salaryMin: 78,
    salaryMid: 124,
    salaryMax: 195,
    bonusAvg: 12,
    equityAvg: 22,
    growthRate: 18.2,
    hiringVelocity: 'Steady',
    avgDaysToOffer: 22,
    totalOpenings: 19800,
    remoteShare: 67,
    demandTag: 'Steady' as any,
    overview:
      'Design teams are evolving with design systems engineering, cross-platform accessibility, and AI design tools. High demand for designers who understand interactive code.',
    outlookAdvice:
      'Portfolios emphasizing problem framing, iterative user research, interactive prototypes, and measurable design system ROI land top offers.',
    topSkills: [
      { name: 'Figma Auto-Layout & Variables', premium: '+10%', growth: '+25% YoY', category: 'Design Tools' },
      { name: 'Design System Engineering', premium: '+18%', growth: '+32% YoY', category: 'Systems' },
      { name: 'Accessibility (WCAG AAA)', premium: '+14%', growth: '+28% YoY', category: 'Standards' },
      { name: 'Interactive Prototyping (Framer)', premium: '+12%', growth: '+30% YoY', category: 'Prototyping' },
      { name: 'User Research & Usability Testing', premium: '+9%', growth: '+12% YoY', category: 'Research' },
      { name: 'Basic HTML/CSS & React Concepts', premium: '+15%', growth: '+26% YoY', category: 'Tech' },
    ],
    hubs: [
      { city: 'San Francisco Bay Area', avgSalary: 154, openings: 4900 },
      { city: 'New York Metro', avgSalary: 142, openings: 4100 },
      { city: 'Global Remote', avgSalary: 128, openings: 7400 },
      { city: 'Seattle Metro', avgSalary: 138, openings: 2100 },
      { city: 'Los Angeles Media Hub', avgSalary: 126, openings: 1300 },
    ],
    companies: [
      { name: 'Apple Product Design', logoText: 'AAPL', openings: 260, remotePolicy: 'Onsite / Hybrid', avgPay: '$150K - $250K', color: 'bg-slate-800' },
      { name: 'Adobe Creative Cloud', logoText: 'ADBE', openings: 320, remotePolicy: 'Remote Eligible', avgPay: '$140K - $225K', color: 'bg-red-600' },
      { name: 'Shopify Merchant UX', logoText: 'SHOP', openings: 190, remotePolicy: 'Digital by Design', avgPay: '$135K - $215K', color: 'bg-emerald-600' },
      { name: 'Canva Design Platform', logoText: 'CNVA', openings: 140, remotePolicy: 'Hybrid / Remote', avgPay: '$130K - $205K', color: 'bg-cyan-600' },
      { name: 'Fintech & Consumer Tech', logoText: 'CONS', openings: 3800, remotePolicy: 'Remote First', avgPay: '$120K - $190K', color: 'bg-indigo-600' },
    ],
  },
};

const CATEGORIES = [
  'All Tracks',
  'Engineering & Architecture',
  'AI & Machine Learning',
  'Cloud & Infrastructure',
  'Product & Design',
];

export default function MarketPage() {
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [activeCategory, setActiveCategory] = useState('All Tracks');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'compensation' | 'skills' | 'companies' | 'hubs'>('compensation');

  // Interactive Compensation Benchmark tool state
  const [calcExperience, setCalcExperience] = useState<'Entry' | 'Mid' | 'Senior' | 'Staff'>('Mid');
  const [calcLocation, setCalcLocation] = useState<'Tier1' | 'Remote' | 'Tier2'>('Tier1');

  const profile = MARKET_PROFILES[selectedRole] || MARKET_PROFILES['Software Engineer'];

  // Filter available role titles based on category and search query
  const filteredRoles = useMemo(() => {
    return Object.entries(MARKET_PROFILES).filter(([_, data]) => {
      const matchesCat = activeCategory === 'All Tracks' || data.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        data.topSkills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Compute calculated compensation benchmark estimate
  const estimatedComp = useMemo(() => {
    let base = profile.salaryMid;
    if (calcExperience === 'Entry') base = profile.salaryMin;
    if (calcExperience === 'Mid') base = profile.salaryMid;
    if (calcExperience === 'Senior') base = profile.salaryMax * 0.85;
    if (calcExperience === 'Staff') base = profile.salaryMax;

    // Location modifier
    if (calcLocation === 'Tier1') base *= 1.08;
    if (calcLocation === 'Remote') base *= 0.96;
    if (calcLocation === 'Tier2') base *= 0.88;

    const roundedBase = Math.round(base);
    const bonus = Math.round(roundedBase * (profile.bonusAvg / 100));
    const equity = Math.round(roundedBase * (profile.equityAvg / 100));
    const total = roundedBase + bonus + equity;

    return { base: roundedBase, bonus, equity, total };
  }, [profile, calcExperience, calcLocation]);

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
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Job Market Intelligence
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Q3 2026 Telemetry
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Real-time salary distribution bands, hiring velocity, skill salary multipliers, and verified corporate openings.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/interview"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-blue-600" />
              Practice {profile.title} Interview
            </Link>

            <Link
              href="/applications"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all"
            >
              <Briefcase className="h-3.5 w-3.5" />
              View Application Tracker
            </Link>
          </div>
        </div>

        {/* Category & Role Selector Strip */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by role or skill..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Quick Role Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
            {filteredRoles.map(([key, data]) => {
              const isSelected = selectedRole === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedRole(key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{data.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : data.demandTag === 'Explosive'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {data.demandTag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Hero Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Median Base Salary
              </span>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">${profile.salaryMid}K</div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Band: ${profile.salaryMin}K – ${profile.salaryMax}K</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Annual Job Growth
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">+{profile.growthRate}%</div>
            <div className="text-xs text-slate-500">
              <span className="font-bold text-emerald-700">Top quartile</span> expansion rate
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Active US/Remote Openings
              </span>
              <Briefcase className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">
              {profile.totalOpenings.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">
              <span className="font-bold text-indigo-600">{profile.remoteShare}%</span> remote-friendly
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Hiring Velocity
              </span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600">{profile.hiringVelocity}</div>
            <div className="text-xs text-slate-500">
              Avg <span className="font-bold text-slate-800">{profile.avgDaysToOffer} days</span> from 1st round to offer
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-xl pointer-events-none -mr-8 -mt-8" />
          </div>
        </div>

        {/* Analytical Tabs Header */}
        <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('compensation')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'compensation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Compensation & Bands
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'skills'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="h-4 w-4" />
            Skill Salary Premiums
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'companies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Top Hiring Employers
          </button>

          <button
            onClick={() => setActiveTab('hubs')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'hubs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="h-4 w-4" />
            Regional & Remote Hubs
          </button>
        </div>

        {/* Tab 1: Compensation Bands & Calculator */}
        {activeTab === 'compensation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Visual Distribution Chart */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Salary Tiers by Seniority — {profile.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Normalized base salary compensation excluding bonus and equity components.
                  </p>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      label: 'Junior / Entry Level (0-2 yrs)',
                      val: profile.salaryMin,
                      pct: Math.round((profile.salaryMin / profile.salaryMax) * 100),
                      desc: 'Foundation skills, core syntax, structured guidance required',
                      color: 'bg-slate-400',
                    },
                    {
                      label: 'Mid-Career Professional (3-5 yrs)',
                      val: profile.salaryMid,
                      pct: Math.round((profile.salaryMid / profile.salaryMax) * 100),
                      desc: 'Autonomous delivery, API contracts, testing & operational ownership',
                      color: 'bg-blue-600',
                    },
                    {
                      label: 'Senior / Staff / Principal (6+ yrs)',
                      val: profile.salaryMax,
                      pct: 100,
                      desc: 'Cross-functional architecture, high availability, mentoring & strategy',
                      color: 'bg-emerald-600',
                    },
                  ].map((tier) => (
                    <div key={tier.label} className="space-y-2 p-3.5 rounded-xl bg-slate-50/60 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800">{tier.label}</span>
                        <span className="text-sm font-black text-slate-900">${tier.val}K / year</span>
                      </div>

                      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${tier.color} transition-all duration-700`}
                          style={{ width: `${tier.pct}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-500">{tier.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Additional Total Comp Insight */}
                <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    Total Compensation Packaging
                  </div>
                  <p className="text-blue-800/80 leading-relaxed">
                    Senior offers at Tier-1 tech firms typically add ~{profile.bonusAvg}% annual performance bonus and ~{profile.equityAvg}% in 4-year RSU equity grants over base salary.
                  </p>
                </div>
              </div>

              {/* Interactive Worth Calculator */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Personal Market Valuation
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Calibrate your target compensation based on your years of experience and geographic tier.
                  </p>
                </div>

                {/* Experience Tier Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Entry', 'Mid', 'Senior', 'Staff'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setCalcExperience(lvl)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          calcExperience === lvl
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Tier Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                    Location Bracket
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'Tier1', label: 'SF / NY / Sea' },
                      { id: 'Remote', label: 'Full Remote' },
                      { id: 'Tier2', label: 'Tier-2 Cities' },
                    ].map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => setCalcLocation(loc.id as any)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border text-center transition-all ${
                          calcLocation === loc.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculated Result Card */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      Estimated Market Worth
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      Target Band
                    </span>
                  </div>

                  <div className="text-3xl font-black text-slate-900">
                    ${estimatedComp.total}K
                    <span className="text-xs text-slate-500 font-medium ml-1">/ yr Total Comp</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Base Pay</span>
                      <span className="font-bold text-slate-800">${estimatedComp.base}K</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Bonus Avg</span>
                      <span className="font-bold text-slate-800">${estimatedComp.bonus}K</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Equity (RSU)</span>
                      <span className="font-bold text-slate-800">${estimatedComp.equity}K</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/skills"
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Audit Your Current Skill Level</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Skill Salary Premiums */}
        {activeTab === 'skills' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                High-Impact Skills & Salary Multipliers for {profile.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Technologies and capabilities commanding significant compensation premiums in current job offers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.topSkills.map((skill, i) => (
                <div
                  key={skill.name}
                  className="rounded-xl border border-slate-200 bg-white p-4.5 space-y-3 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {skill.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <TrendingUp className="h-3 w-3" />
                      {skill.premium}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{skill.name}</h4>
                    <span className="text-[11px] font-semibold text-slate-500">{skill.growth}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Demand Tier</span>
                    <span className="font-bold text-blue-600">
                      {i < 2 ? 'Critical Core' : 'Accelerating'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <strong>Want to master these skills?</strong> Add them directly to your personalized learning path with step-by-step verified modules.
              </div>
              <Link
                href="/roadmap"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all whitespace-nowrap shadow-xs"
              >
                Open Learning Roadmap →
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Top Companies Hiring */}
        {activeTab === 'companies' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Verified Corporate Openings for {profile.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Leading employers actively recruiting candidates in this category with transparent compensation bands.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profile.companies.map((comp) => (
                <div
                  key={comp.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-11 w-11 rounded-xl ${comp.color} text-white font-black text-xs flex items-center justify-center shadow-xs`}
                      >
                        {comp.logoText}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{comp.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">
                          {comp.openings.toLocaleString()} open roles
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 py-1 border-y border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Work Policy:</span>
                        <span className="font-bold text-slate-700">{comp.remotePolicy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Typical Total Pay:</span>
                        <span className="font-black text-emerald-600">{comp.avgPay}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/applications?company=${encodeURIComponent(comp.name)}`}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all text-center block mt-1"
                  >
                    Track in Application Tracker
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Regional Hubs */}
        {activeTab === 'hubs' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                Regional Tech Hubs & Remote Salaries
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Geographic compensation differentials and active job distribution.
              </p>
            </div>

            <div className="space-y-3">
              {profile.hubs.map((hub, idx) => {
                const maxHubSalary = Math.max(...profile.hubs.map((h) => h.avgSalary));
                const pct = Math.round((hub.avgSalary / maxHubSalary) * 100);
                return (
                  <div
                    key={hub.city}
                    className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-[240px]">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="font-black text-slate-900 text-sm">{hub.city}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {hub.openings.toLocaleString()} live listings tracked
                      </span>
                    </div>

                    <div className="flex-1 max-w-xs space-y-1 hidden md:block">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Index vs SF Baseline</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Average Compensation</span>
                      <span className="text-base font-black text-slate-900">${hub.avgSalary}K / yr</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strategic Guidance Insight Callout (Clean Modern Light Theme) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200/80 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-black uppercase tracking-wider">
            <span className="p-1 rounded-lg bg-blue-100 text-blue-700">
              <Compass className="h-4 w-4" />
            </span>
            <span>Executive Market Outlook</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {profile.overview}
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-4xl">
            {profile.outlookAdvice}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/interview"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              Practice Mock Interview for this Track
            </Link>

            <Link
              href="/chat"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Ask Aura AI about Market Shifts
            </Link>
          </div>

          {/* Subtle decorative mesh blur */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </DashboardShell>
  );
}
