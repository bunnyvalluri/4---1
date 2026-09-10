'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  ArrowRight,
  ChevronRight,
  MoreHorizontal,
  Layers,
  BarChart3,
  Bot,
  AlertCircle,
  FileText,
  Building,
  UserCheck,
  Zap,
  Flame,
  Award,
  Share2,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Kanban,
  List,
  PieChart,
  Check,
  X
} from 'lucide-react';

export type AppStatus = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface InterviewRound {
  title: string;
  date?: string;
  completed: boolean;
  notes?: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary?: string;
  location?: string;
  workMode?: 'Remote' | 'Hybrid' | 'Onsite';
  url?: string;
  notes?: string;
  date: string;
  status: AppStatus;
  starred: boolean;
  matchScore?: number;
  contactName?: string;
  contactEmail?: string;
  nextStep?: string;
  nextStepDate?: string;
  rounds?: InterviewRound[];
  tags?: string[];
}

const STAGES: {
  id: AppStatus;
  label: string;
  pillColor: string;
  badgeBg: string;
  borderColor: string;
  accentBg: string;
  headerBg: string;
  textColor: string;
  dotColor: string;
  icon: any;
  description: string;
}[] = [
  {
    id: 'Wishlist',
    label: 'Wishlist',
    pillColor: 'text-slate-700 bg-slate-100 border-slate-200',
    badgeBg: 'bg-slate-100 text-slate-700',
    borderColor: 'border-slate-200',
    accentBg: 'bg-slate-50',
    headerBg: 'from-slate-50 to-slate-100/50',
    textColor: 'text-slate-700',
    dotColor: 'bg-slate-400',
    icon: Star,
    description: 'Target companies & open roles',
  },
  {
    id: 'Applied',
    label: 'Applied',
    pillColor: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200',
    accentBg: 'bg-blue-50/40',
    headerBg: 'from-blue-50/80 to-blue-100/40',
    textColor: 'text-blue-700',
    dotColor: 'bg-blue-500',
    icon: Briefcase,
    description: 'Resume submitted & screening',
  },
  {
    id: 'Interview',
    label: 'Interviewing',
    pillColor: 'text-violet-700 bg-violet-50 border-violet-200',
    badgeBg: 'bg-violet-100 text-violet-800',
    borderColor: 'border-violet-200',
    accentBg: 'bg-violet-50/40',
    headerBg: 'from-violet-50/80 to-violet-100/40',
    textColor: 'text-violet-700',
    dotColor: 'bg-violet-500',
    icon: TrendingUp,
    description: 'Active rounds & technical trials',
  },
  {
    id: 'Offer',
    label: 'Offers 🎉',
    pillColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    borderColor: 'border-emerald-200',
    accentBg: 'bg-emerald-50/40',
    headerBg: 'from-emerald-50/80 to-emerald-100/40',
    textColor: 'text-emerald-700',
    dotColor: 'bg-emerald-500',
    icon: CheckCircle2,
    description: 'Received compensation offers',
  },
  {
    id: 'Rejected',
    label: 'Archived',
    pillColor: 'text-rose-700 bg-rose-50 border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    borderColor: 'border-rose-200',
    accentBg: 'bg-rose-50/30',
    headerBg: 'from-rose-50/60 to-rose-100/30',
    textColor: 'text-rose-700',
    dotColor: 'bg-rose-400',
    icon: XCircle,
    description: 'Passed or position closed',
  },
];

const INITIAL_SAMPLES: JobApplication[] = [
  {
    id: 'sample-1',
    company: 'Stripe',
    role: 'Senior Backend Engineer',
    salary: '$180,000 - $215,000',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    url: 'https://stripe.com/jobs',
    notes: 'Recruiter reached out on LinkedIn. Referral from Alex on Core Payments team. Focus on distributed transactions and idempotency.',
    date: '2026-08-28',
    status: 'Interview',
    starred: true,
    matchScore: 94,
    contactName: 'Sarah Lin (Engineering Lead)',
    contactEmail: 'slin@stripe.com',
    nextStep: 'System Design: Global Ledger Architecture',
    nextStepDate: 'Tomorrow at 2:00 PM',
    tags: ['Go', 'PostgreSQL', 'High Priority'],
    rounds: [
      { title: 'Recruiter Screening', completed: true, notes: 'Great conversation, discussed latency SLA expectations.' },
      { title: 'Coding & Concurrency', completed: true, notes: 'Passed rate limiter implementation with unit tests.' },
      { title: 'System Design', completed: false, notes: 'Scheduled with Staff Architect.' },
      { title: 'Values & Team Fit', completed: false },
    ],
  },
  {
    id: 'sample-2',
    company: 'Linear',
    role: 'Full Stack Engineer (Sync Engine)',
    salary: '$165,000 - $195,000',
    location: 'Remote (Worldwide)',
    workMode: 'Remote',
    url: 'https://linear.app/careers',
    notes: 'Applied through CareerAI 1-click ATS. Emphasize WebSocket sync and optimistic UI rendering experience.',
    date: '2026-09-02',
    status: 'Applied',
    starred: true,
    matchScore: 96,
    contactName: 'Tuomas Artman',
    nextStep: 'Technical Portfolio Review',
    nextStepDate: 'Sep 14',
    tags: ['TypeScript', 'Next.js', 'WebSockets'],
    rounds: [
      { title: 'Application Review', completed: true },
      { title: 'Async Code Exercise', completed: false },
      { title: 'Founder Chat', completed: false },
    ],
  },
  {
    id: 'sample-3',
    company: 'OpenAI',
    role: 'AI Solutions Engineer',
    salary: '$190,000 - $240,000',
    location: 'San Francisco / Remote',
    workMode: 'Hybrid',
    url: 'https://openai.com/careers',
    notes: 'Submitted customized resume with ATS score 92%. Highlight experience fine-tuning LLMs and building RAG pipelines.',
    date: '2026-09-04',
    status: 'Wishlist',
    starred: false,
    matchScore: 91,
    tags: ['Python', 'FastAPI', 'Gemini / GPT-4'],
    nextStep: 'Reach out to alumni for warm referral',
  },
  {
    id: 'sample-4',
    company: 'Vercel',
    role: 'Staff Frontend Architect',
    salary: '$195,000 + $80k Equity',
    location: 'Remote (US/EU)',
    workMode: 'Remote',
    url: 'https://vercel.com/careers',
    notes: 'Completed final executive review with VP of Product. Offer package received, reviewing health benefits and vesting schedule.',
    date: '2026-08-15',
    status: 'Offer',
    starred: true,
    matchScore: 98,
    contactName: 'Elena Rostova',
    contactEmail: 'elena@vercel.com',
    nextStep: 'Compensation Review & Decision Deadline',
    nextStepDate: 'Sep 18, 2026',
    tags: ['React 19', 'Turbopack', 'Edge Runtime'],
    rounds: [
      { title: 'Screening', completed: true },
      { title: 'Deep Dive Architecture', completed: true },
      { title: 'VP Culture Alignment', completed: true },
      { title: 'Offer Presentation', completed: true },
    ],
  },
];

const STORAGE_KEY = 'careerai_applications_v2';

function loadApps(): JobApplication[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Seed with initial high-quality samples so users never experience a desolate empty screen
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLES));
      return INITIAL_SAMPLES;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_SAMPLES;
  }
}

function saveApps(apps: JobApplication[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save applications:', e);
  }
}

// Dynamic gradient generator for company logos
function getCompanyGradient(name: string): string {
  const gradients = [
    'from-blue-600 to-indigo-600',
    'from-violet-600 to-purple-700',
    'from-emerald-500 to-teal-700',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
    'from-cyan-600 to-blue-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export default function UserJobsPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'insights'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStarred, setFilterStarred] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'Remote' | 'Hybrid' | 'Onsite'>('all');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [celebrationOffer, setCelebrationOffer] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    company: '',
    role: '',
    salary: '',
    location: '',
    workMode: 'Remote' as 'Remote' | 'Hybrid' | 'Onsite',
    url: '',
    notes: '',
    status: 'Applied' as AppStatus,
    matchScore: 90,
    contactName: '',
    contactEmail: '',
    nextStep: '',
    nextStepDate: '',
    tags: '',
  });

  useEffect(() => {
    setApps(loadApps());
  }, []);

  const handleResetToDemo = () => {
    setApps(INITIAL_SAMPLES);
    saveApps(INITIAL_SAMPLES);
  };

  const handleSaveApp = () => {
    if (!form.company.trim() || !form.role.trim()) return;

    const tagList = form.tags
      ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    if (editingId) {
      const updated = apps.map((a) =>
        a.id === editingId
          ? {
              ...a,
              company: form.company,
              role: form.role,
              salary: form.salary,
              location: form.location,
              workMode: form.workMode,
              url: form.url,
              notes: form.notes,
              status: form.status,
              matchScore: form.matchScore,
              contactName: form.contactName,
              contactEmail: form.contactEmail,
              nextStep: form.nextStep,
              nextStepDate: form.nextStepDate,
              tags: tagList.length > 0 ? tagList : a.tags,
            }
          : a
      );
      setApps(updated);
      saveApps(updated);
      setEditingId(null);
    } else {
      const newApp: JobApplication = {
        id: 'app-' + Date.now(),
        company: form.company,
        role: form.role,
        salary: form.salary || '$120,000 - $160,000',
        location: form.location || 'Remote',
        workMode: form.workMode,
        url: form.url,
        notes: form.notes,
        date: new Date().toISOString().split('T')[0],
        status: form.status,
        starred: false,
        matchScore: form.matchScore || Math.floor(85 + Math.random() * 12),
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        nextStep: form.nextStep || 'Follow up with hiring team',
        nextStepDate: form.nextStepDate,
        tags: tagList.length > 0 ? tagList : ['Engineering', 'Active'],
        rounds: [
          { title: 'Application Submitted', completed: true },
          { title: 'Recruiter Screening', completed: form.status !== 'Wishlist' && form.status !== 'Applied' },
          { title: 'Technical Interview', completed: form.status === 'Offer' },
        ],
      };
      const updated = [newApp, ...apps];
      setApps(updated);
      saveApps(updated);
    }

    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      company: '',
      role: '',
      salary: '',
      location: '',
      workMode: 'Remote',
      url: '',
      notes: '',
      status: 'Applied',
      matchScore: 92,
      contactName: '',
      contactEmail: '',
      nextStep: '',
      nextStepDate: '',
      tags: '',
    });
    setEditingId(null);
  };

  const openEdit = (app: JobApplication) => {
    setForm({
      company: app.company,
      role: app.role,
      salary: app.salary || '',
      location: app.location || '',
      workMode: app.workMode || 'Remote',
      url: app.url || '',
      notes: app.notes || '',
      status: app.status,
      matchScore: app.matchScore || 90,
      contactName: app.contactName || '',
      contactEmail: app.contactEmail || '',
      nextStep: app.nextStep || '',
      nextStepDate: app.nextStepDate || '',
      tags: (app.tags || []).join(', '),
    });
    setEditingId(app.id);
    setIsAdding(true);
  };

  const moveApp = (id: string, newStatus: AppStatus) => {
    if (newStatus === 'Offer') {
      const moved = apps.find((a) => a.id === id);
      if (moved) {
        setCelebrationOffer(moved.company);
        setTimeout(() => setCelebrationOffer(null), 4500);
      }
    }
    const updated = apps.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
    setApps(updated);
    saveApps(updated);
  };

  const deleteApp = (id: string) => {
    const updated = apps.filter((a) => a.id !== id);
    setApps(updated);
    saveApps(updated);
    if (selectedApp?.id === id) setSelectedApp(null);
  };

  const toggleStar = (id: string) => {
    const updated = apps.map((a) => (a.id === id ? { ...a, starred: !a.starred } : a));
    setApps(updated);
    saveApps(updated);
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.tags && app.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesStar = !filterStarred || app.starred;
      const matchesMode = filterMode === 'all' || app.workMode === filterMode;
      return matchesSearch && matchesStar && matchesMode;
    });
  }, [apps, searchQuery, filterStarred, filterMode]);

  // Executive KPI stats
  const stats = useMemo(() => {
    const total = apps.length;
    const wishlist = apps.filter((a) => a.status === 'Wishlist').length;
    const applied = apps.filter((a) => a.status === 'Applied').length;
    const interviews = apps.filter((a) => a.status === 'Interview').length;
    const offers = apps.filter((a) => a.status === 'Offer').length;
    const rejected = apps.filter((a) => a.status === 'Rejected').length;
    const active = applied + interviews + offers;
    const interviewRate = total > 0 ? Math.round(((interviews + offers) / Math.max(1, total - wishlist)) * 100) : 0;

    return { total, wishlist, applied, interviews, offers, rejected, active, interviewRate };
  }, [apps]);

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Celebration Banner when landing an offer */}
        {celebrationOffer && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h3 className="font-black text-lg">Offer Stage Achieved at {celebrationOffer}!</h3>
                <p className="text-emerald-100 text-xs">
                  Outstanding achievement. Time to benchmark leverage in the{' '}
                  <Link href="/user/market" className="underline font-bold hover:text-white">
                    Market Intelligence Hub
                  </Link>
                  .
                </p>
              </div>
            </div>
            <button
              onClick={() => setCelebrationOffer(null)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header with Title & Core Action Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Briefcase className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Job Application Tracker
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                {stats.active} Active Pipelines
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Manage your career pipeline, track interview milestones, and prep with AI across every stage.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleResetToDemo}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5"
              title="Load realistic top-tier company sample applications"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Demo Data
            </button>

            <Link
              href="/user/interview"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors flex items-center gap-1.5"
            >
              <Bot className="h-3.5 w-3.5" />
              AI Mock Prep
            </Link>

            <Link
              href="/user/market"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <DollarSign className="h-3.5 w-3.5" />
              Salary Bands
            </Link>

            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </button>
          </div>
        </div>

        {/* Telemetry Dashboard: 4 High-Impact KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Pipeline</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Layers className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.total}</span>
              <span className="text-xs font-bold text-blue-600">
                {stats.wishlist} targets saved
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              High conversion velocity
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-violet-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Interview Conversion</span>
              <span className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-violet-700">{stats.interviewRate}%</span>
              <span className="text-xs font-bold text-slate-400">vs 15% avg</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
              <Zap className="h-3 w-3" />
              Top 10% candidate tier
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-amber-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Rounds</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <Calendar className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.interviews}</span>
              <span className="text-xs font-bold text-amber-600">in progress</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              Next round tomorrow (Stripe)
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Offers Received</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Award className="h-4 w-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{stats.offers}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                🎉 Won
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Est. package: <strong className="text-slate-900">$195k+</strong>
            </div>
          </div>
        </div>

        {/* Smart Filter, Search Bar, and View Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search company, role, or stack (e.g. Stripe, React, Go)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Star Filter */}
            <button
              onClick={() => setFilterStarred(!filterStarred)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 ${
                filterStarred
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${filterStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
              Starred
            </button>

            {/* Work Mode Filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
              {(['all', 'Remote', 'Hybrid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    filterMode === mode
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode === 'all' ? 'All Loc' : mode}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'kanban'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Board View"
              >
                <Kanban className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('insights')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'insights'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="AI Funnel & Telemetry"
              >
                <PieChart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Funnel</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: KANBAN BOARD VIEW */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start snap-x">
            {STAGES.map((col) => {
              const colApps = filteredApps.filter((a) => a.status === col.id);
              const ColIcon = col.icon;

              return (
                <div
                  key={col.id}
                  className="flex-shrink-0 w-80 min-w-[320px] snap-start bg-slate-50/70 border border-slate-200/80 rounded-3xl p-3.5 flex flex-col max-h-[85vh]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${col.badgeBg}`}>
                        <ColIcon className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="font-black text-sm text-slate-800">{col.label}</h3>
                        <p className="text-[11px] text-slate-400">{col.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {colApps.length}
                      </span>
                      <button
                        onClick={() => {
                          resetForm();
                          setForm((prev) => ({ ...prev, status: col.id }));
                          setIsAdding(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title={`Add to ${col.label}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cards List in this Column */}
                  <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[140px]">
                    {colApps.map((app) => {
                      const grad = getCompanyGradient(app.company);

                      return (
                        <div
                          key={app.id}
                          className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-4 shadow-2xs hover:shadow-md transition-all duration-200 group relative flex flex-col justify-between space-y-3"
                        >
                          {/* Card Top: Logo, Company, Role, Star */}
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`h-9 w-9 rounded-xl bg-gradient-to-br ${grad} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0`}
                              >
                                {app.company.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-sm text-slate-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
                                  {app.company}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                  {app.role}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleStar(app.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-amber-500 transition-colors shrink-0"
                              title="Favorite"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  app.starred ? 'fill-amber-400 text-amber-400' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Compensation & Work Mode */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60">
                              {app.salary || '$140k - $180k'}
                            </span>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span className="truncate max-w-[110px]">{app.location || 'Remote'}</span>
                            </div>
                          </div>

                          {/* Next Step / Milestone Alert */}
                          {app.nextStep && (
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 text-xs">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-blue-500" />
                                  Next Step
                                </span>
                                {app.nextStepDate && (
                                  <span className="text-blue-600 font-semibold">{app.nextStepDate}</span>
                                )}
                              </div>
                              <p className="text-slate-800 font-medium text-xs line-clamp-1">
                                {app.nextStep}
                              </p>
                            </div>
                          )}

                          {/* Tags */}
                          {app.tags && app.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {app.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                              {app.matchScore && (
                                <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ml-auto">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  {app.matchScore}% Match
                                </span>
                              )}
                            </div>
                          )}

                          {/* Card Footer: Quick Actions & Stage Mover */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/interview?role=${encodeURIComponent(app.role)}`}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                                title="Practice Mock Interview for this role"
                              >
                                <Bot className="h-3.5 w-3.5" />
                              </Link>
                              <Link
                                href="/user/market"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                title="Check Market Salary Data"
                              >
                                <DollarSign className="h-3.5 w-3.5" />
                              </Link>
                              <button
                                onClick={() => openEdit(app)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit Application"
                              >
                                <SlidersHorizontal className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteApp(app.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Move Stage Selector */}
                            <div className="relative group/menu">
                              <select
                                value={app.status}
                                onChange={(e) => moveApp(app.id, e.target.value as AppStatus)}
                                className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {STAGES.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    Move: {s.label.replace(' 🎉', '')}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {colApps.length === 0 && (
                      <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white/50">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                          <Plus className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-500">No applications</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click + above to add an opportunity
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: STRUCTURED TABLE / LIST VIEW */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900">Application Records</h3>
                <p className="text-xs text-slate-500">Structured telemetry table across all job pipelines</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Showing {filteredApps.length} opportunities
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Company & Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Target Compensation</th>
                    <th className="py-3 px-4">Match</th>
                    <th className="py-3 px-4">Next Step</th>
                    <th className="py-3 px-4">Date Added</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => {
                    const st = STAGES.find((s) => s.id === app.status) || STAGES[0];
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleStar(app.id)}
                              className="text-slate-300 hover:text-amber-400"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  app.starred ? 'fill-amber-400 text-amber-400' : ''
                                }`}
                              />
                            </button>
                            <div>
                              <div className="font-black text-slate-900 text-sm">{app.company}</div>
                              <div className="text-slate-500 text-xs">{app.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${st.pillColor}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {app.salary || '—'}
                          <span className="block text-[11px] font-normal text-slate-400">
                            {app.workMode} ({app.location})
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100 inline-flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {app.matchScore || 90}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-medium">{app.nextStep || '—'}</div>
                          {app.nextStepDate && (
                            <div className="text-[11px] text-blue-600 font-semibold">
                              {app.nextStepDate}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{app.date}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/interview?role=${encodeURIComponent(app.role)}`}
                              className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Bot className="h-3 w-3" />
                              Prep
                            </Link>
                            <button
                              onClick={() => openEdit(app)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteApp(app.id)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: PIPELINE FUNNEL & AI ACTION INSIGHTS */}
        {viewMode === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversion Funnel Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Application Conversion Funnel</h3>
                <p className="text-xs text-slate-500">
                  Step-by-step conversion telemetry from initial target to offer acceptance
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    stage: 'Target List & Wishlist',
                    count: stats.wishlist + stats.applied + stats.interviews + stats.offers,
                    pct: 100,
                    color: 'bg-slate-500',
                  },
                  {
                    stage: 'Submitted / Applied',
                    count: stats.applied + stats.interviews + stats.offers,
                    pct: Math.round(
                      ((stats.applied + stats.interviews + stats.offers) / Math.max(1, stats.total)) * 100
                    ),
                    color: 'bg-blue-600',
                  },
                  {
                    stage: 'Interview Rounds (Technical / Recruiter)',
                    count: stats.interviews + stats.offers,
                    pct: Math.round(
                      ((stats.interviews + stats.offers) / Math.max(1, stats.total)) * 100
                    ),
                    color: 'bg-violet-600',
                  },
                  {
                    stage: 'Offers Received',
                    count: stats.offers,
                    pct: Math.round((stats.offers / Math.max(1, stats.total)) * 100),
                    color: 'bg-emerald-600',
                  },
                ].map((step, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{step.stage}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-black">{step.count} candidates</span>
                        <span className="text-slate-400 font-semibold">({step.pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full ${step.color} transition-all duration-500`}
                        style={{ width: `${Math.max(8, step.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-3">
                <Bot className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-black text-blue-950 mb-0.5">
                    AI Pipeline Diagnostic
                  </strong>
                  Your interview conversion rate of{' '}
                  <span className="font-black text-blue-700">{stats.interviewRate}%</span> is in the 92nd
                  percentile for Software & Product Engineering. Your primary bottleneck is volume at the top of the funnel. Adding 3-5 more targeted applications this week will maximize offer leverage.
                </div>
              </div>
            </div>

            {/* AI Action Checklist */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-violet-700">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-black text-slate-900">Recommended Next Actions</h3>
              </div>
              <p className="text-xs text-slate-500">Prioritized checklist generated by CareerAI Copilot</p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                    <span>High Urgency</span>
                    <span className="text-[11px]">Tomorrow</span>
                  </div>
                  <h4 className="font-black text-xs text-slate-900">Stripe System Design Preparation</h4>
                  <p className="text-[11px] text-slate-600">
                    Review distributed ledger and high-throughput idempotency keys.
                  </p>
                  <Link
                    href="/interview?role=Senior%20Backend%20Engineer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Launch Mock Simulator →
                  </Link>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Offer Leverage</span>
                    <span className="text-[11px]">Sep 18</span>
                  </div>
                  <h4 className="font-black text-xs text-slate-900">Vercel Compensation Review</h4>
                  <p className="text-[11px] text-slate-600">
                    Compare equity package against 2026 Tier-1 Bay Area market bands.
                  </p>
                  <Link
                    href="/user/market"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 mt-1"
                  >
                    View Salary Benchmark →
                  </Link>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                    <span>Network Referral</span>
                    <span className="text-[11px]">This Week</span>
                  </div>
                  <h4 className="font-black text-xs text-slate-900">Warm intro for OpenAI Wishlist</h4>
                  <p className="text-[11px] text-slate-600">
                    Request mentorship or team overview through the community hub.
                  </p>
                  <Link
                    href="/user/mentors"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Connect with Mentors →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add or Edit Application Drawer */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {editingId ? 'Edit Application Details' : 'Add New Job Application'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track company requirements, interview steps, and compensation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, OpenAI, Google, Linear..."
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer, AI Solutions Architect..."
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Pipeline Stage
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as AppStatus })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label.replace(' 🎉', '')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Work Mode</label>
                  <select
                    value={form.workMode}
                    onChange={(e) =>
                      setForm({ ...form, workMode: e.target.value as 'Remote' | 'Hybrid' | 'Onsite' })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Target Compensation
                  </label>
                  <input
                    type="text"
                    placeholder="$160,000 - $200,000"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Location</label>
                  <input
                    type="text"
                    placeholder="San Francisco, New York, Global..."
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Next Step / Milestone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. System Design Interview"
                    value={form.nextStep}
                    onChange={(e) => setForm({ ...form, nextStep: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Scheduled Date / Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomorrow at 3:00 PM, or Oct 12"
                    value={form.nextStepDate}
                    onChange={(e) => setForm({ ...form, nextStepDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/role"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Key Stack / Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="TypeScript, Python, Distributed Systems, High Priority"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 mb-1 block">
                    Interview Notes, Referrals & Preparation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Referral contact name, recruiter guidance, key questions to prepare..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApp}
                  disabled={!form.company.trim() || !form.role.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors shadow-sm"
                >
                  {editingId ? 'Save Changes' : 'Add Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
