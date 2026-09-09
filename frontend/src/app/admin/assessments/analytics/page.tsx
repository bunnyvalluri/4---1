'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Brain,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Filter,
  Users,
  Target,
  FileQuestion,
  PieChart,
} from 'lucide-react';

interface AssessmentMetrics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  medianTimeMinutes: number;
}

interface ScoreDistribution {
  exceptional: number;
  proficient: number;
  developing: number;
  needsImprovement: number;
}

interface CategoryMastery {
  category: string;
  avgScore: number;
  benchmark: number;
  status: string;
}

interface RecentSubmission {
  id: string;
  candidateName: string;
  candidateEmail: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  completedAt: string;
  strengths: string[];
  weaknesses: string[];
}

export default function AssessmentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AssessmentMetrics>({
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    medianTimeMinutes: 0,
  });
  const [distribution, setDistribution] = useState<ScoreDistribution>({
    exceptional: 0,
    proficient: 0,
    developing: 0,
    needsImprovement: 0,
  });
  const [categories, setCategories] = useState<CategoryMastery[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [timeRange, setTimeRange] = useState('all');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/assessments/analytics');
      if (!res.ok) throw new Error('Failed to fetch assessment analytics');
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.distribution) setDistribution(data.distribution);
      if (data.categoryMastery) setCategories(data.categoryMastery);
      if (data.recentSubmissions) setRecentSubmissions(data.recentSubmissions);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalBucketSum =
    distribution.exceptional +
    distribution.proficient +
    distribution.developing +
    distribution.needsImprovement || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/questions"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Questions Bank</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">Evaluation Analytics</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Assessment Analytics & Cognitive Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregate candidate evaluation telemetry, score curves, category mastery, and cognitive diagnostic breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/questions"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <FileQuestion className="h-3.5 w-3.5" />
            <span>Manage Questions</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Attempts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Attempts</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.totalAttempts}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Completed diagnostics</p>
        </div>

        {/* Average Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Average Score</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.averageScore}%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Platform proficiency baseline</p>
        </div>

        {/* Pass Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Benchmark Pass Rate</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.passRate}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Scored ≥ 75% threshold</p>
        </div>

        {/* Median Duration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Median Time</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.medianTimeMinutes}m</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Per full assessment session</p>
        </div>
      </div>

      {/* Analytics Charts & Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Curve */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Candidate Score Distribution
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Target: Normal Curve</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* Exceptional (90-100%) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Exceptional (90% – 100%)</span>
                <span className="font-bold text-slate-900">
                  {distribution.exceptional} candidates ({Math.round((distribution.exceptional / totalBucketSum) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(distribution.exceptional / totalBucketSum) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Proficient (75-89%) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Proficient (75% – 89%)</span>
                <span className="font-bold text-slate-900">
                  {distribution.proficient} candidates ({Math.round((distribution.proficient / totalBucketSum) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(distribution.proficient / totalBucketSum) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Developing (60-74%) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Developing (60% – 74%)</span>
                <span className="font-bold text-slate-900">
                  {distribution.developing} candidates ({Math.round((distribution.developing / totalBucketSum) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(distribution.developing / totalBucketSum) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Needs Improvement (<60%) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Needs Improvement (&lt; 60%)</span>
                <span className="font-bold text-slate-900">
                  {distribution.needsImprovement} candidates ({Math.round((distribution.needsImprovement / totalBucketSum) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(distribution.needsImprovement / totalBucketSum) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Domain Mastery */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Cognitive & Domain Mastery
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">Benchmark: 70%</span>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.category}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{cat.category}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Benchmark: {cat.benchmark}%</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-slate-900">{cat.avgScore}%</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      cat.avgScore >= cat.benchmark
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Submissions Log */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Assessment Submissions
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Live evaluation log</span>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-4 py-3.5">Diagnostic Score</th>
                <th className="px-4 py-3.5">Questions Correct</th>
                <th className="px-4 py-3.5">Primary Strength</th>
                <th className="px-4 py-3.5">Improvement Area</th>
                <th className="px-6 py-3.5 text-right">Evaluated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs">
                    No assessment attempts recorded yet. Candidates taking diagnostic evaluations will appear here.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{sub.candidateName}</p>
                        <p className="text-[11px] text-slate-500">{sub.candidateEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.score >= 85
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.score >= 70
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub.score}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-700">
                        {sub.correctCount} / {sub.totalQuestions}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {sub.strengths[0] || 'Technical Foundation'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {sub.weaknesses[0] || 'Optimization'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-[11px]">
                      {new Date(sub.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading submissions...</div>
          ) : recentSubmissions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No assessment attempts recorded yet.
            </div>
          ) : (
            recentSubmissions.map((sub) => (
              <div key={sub.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{sub.candidateName}</p>
                    <p className="text-[11px] text-slate-500">{sub.candidateEmail}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      sub.score >= 75
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {sub.score}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    Correct: <strong className="text-slate-700">{sub.correctCount}/{sub.totalQuestions}</strong>
                  </span>
                  <span>{new Date(sub.completedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
