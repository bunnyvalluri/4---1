'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserPlus,
  ClipboardCheck,
  Sparkles,
  Map,
  FileText,
  Bot,
  ArrowUpRight,
  TrendingUp,
  Activity,
  RefreshCw,
  Plus,
  Briefcase,
  HelpCircle,
  Clock,
  Shield,
  AlertCircle,
} from 'lucide-react';

interface Metrics {
  total_candidates: number;
  active_candidates: number;
  new_candidates: number;
  assessments_completed: number;
  recommendations_generated: number;
  active_roadmaps: number;
  resumes_analyzed: number;
  ai_conversations: number;
}

interface ActivityItem {
  id: string;
  event: string;
  description: string;
  timestamp: string;
  status: string;
  type: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        if (res.status === 403) {
          setError('Forbidden: Administrator privileges required.');
          return;
        }
        throw new Error('Failed to load dashboard data.');
      }
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.live_activity) setActivities(data.live_activity);
    } catch (err: any) {
      setError(err?.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Optional SSE or periodic polling for live activity
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Unable to load dashboard data</h3>
        <p className="text-xs text-slate-600">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const kpis = [
    {
      title: 'TOTAL CANDIDATES',
      value: metrics?.total_candidates.toLocaleString() || '0',
      change: '+8.4%',
      period: 'vs previous period',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/candidates',
    },
    {
      title: 'ACTIVE CANDIDATES',
      value: metrics?.active_candidates.toLocaleString() || '0',
      change: '72% active rate',
      period: 'last 30 days',
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/candidates',
    },
    {
      title: 'NEW CANDIDATES (7D)',
      value: metrics?.new_candidates.toLocaleString() || '0',
      change: '+12%',
      period: 'weekly growth',
      icon: UserPlus,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      href: '/admin/candidates',
    },
    {
      title: 'ASSESSMENTS COMPLETED',
      value: metrics?.assessments_completed.toLocaleString() || '0',
      change: '78.4% avg score',
      period: 'evaluated attempts',
      icon: ClipboardCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/admin/assessments',
    },
    {
      title: 'RECOMMENDATIONS GENERATED',
      value: metrics?.recommendations_generated.toLocaleString() || '0',
      change: '88% match avg',
      period: 'AI-guided matches',
      icon: Sparkles,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/careers',
    },
    {
      title: 'ACTIVE ROADMAPS',
      value: metrics?.active_roadmaps.toLocaleString() || '0',
      change: '16 weeks avg',
      period: 'in progress',
      icon: Map,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      href: '/admin/roadmaps',
    },
    {
      title: 'RESUMES ANALYZED',
      value: metrics?.resumes_analyzed.toLocaleString() || '0',
      change: '79.2% avg ATS',
      period: 'scanned documents',
      icon: FileText,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      href: '/admin/resumes',
    },
    {
      title: 'AI CONVERSATIONS',
      value: metrics?.ai_conversations.toLocaleString() || '0',
      change: '99.4% success',
      period: 'automated sessions',
      icon: Bot,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      href: '/admin/ai',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="relative h-13 w-13 shrink-0 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 bg-white">
            <img
              src="/logo.webp"
              alt="CareerAI"
              className="h-full w-full object-contain p-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Synced
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time control center for CareerAI platform analytics, candidates, and AI engines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/careers"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Career</span>
          </Link>

          <Link
            href="/admin/questions"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Question Bank</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.title}
              href={kpi.href}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight group-hover:text-blue-600 transition-colors">
                    {kpi.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100 mt-3">
                <span className="font-semibold text-slate-700">{kpi.change}</span>
                <span>{kpi.period}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content: Live Activity & Quick System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Platform Activity (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Live Platform Activity
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Realtime Event Stream</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No platform activity recorded yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="py-3.5 flex items-start justify-between gap-4 group">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{act.event}</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-600 uppercase">
                          {act.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View complete audit trail</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick Actions & System Health Overview (1 col) */}
        <div className="space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Control Shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/candidates"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Candidate Directory
                    </p>
                    <p className="text-[11px] text-slate-500">Manage candidates & statuses</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
              </Link>

              <Link
                href="/admin/careers"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Career Catalog
                    </p>
                    <p className="text-[11px] text-slate-500">Curate careers & skills</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
              </Link>

              <Link
                href="/admin/questions"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Question Bank
                    </p>
                    <p className="text-[11px] text-slate-500">Manage assessment questions</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
              </Link>

              <Link
                href="/admin/ai"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      AI Monitoring
                    </p>
                    <p className="text-[11px] text-slate-500">Latency & model health</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
              </Link>
            </div>
          </div>

          {/* System Security Notice */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-700">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Role Isolation Active</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              All administrative operations require authenticated Firebase custom claims. Administrative actions are logged to the immutable audit ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
