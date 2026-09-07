'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BrainCircuit,
  Map,
  FileCheck,
  MessageSquare,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  Zap,
  FolderGit2,
  BarChart2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [latestResume, setLatestResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskUpdating, setTaskUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, recsRes, roadmapRes, resumeRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/recommendations'),
          fetch('/api/roadmap'),
          fetch('/api/resume/history'),
        ]);

        const profileJson = await profileRes.json();
        const recsJson = await recsRes.json();
        const roadmapJson = await roadmapRes.json();
        const resumeJson = await resumeRes.json();

        if (profileJson?.user) setProfileData(profileJson.user);
        if (recsJson?.recommendations) setRecommendations(recsJson.recommendations);
        if (roadmapJson?.roadmap) setRoadmap(roadmapJson.roadmap);
        if (resumeJson?.history?.[0]) setLatestResume(resumeJson.history[0]);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleToggleTask = async (itemId: string, taskId: string, currentStatus: boolean) => {
    setTaskUpdating(taskId);
    try {
      const res = await fetch('/api/roadmap/task', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          taskId,
          done: !currentStatus,
        }),
      });
      if (res.ok) {
        // Refresh roadmap telemetry
        const roadRes = await fetch('/api/roadmap');
        const roadJson = await roadRes.json();
        if (roadJson?.roadmap) setRoadmap(roadJson.roadmap);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    } finally {
      setTaskUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200/80 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200/70 rounded-2xl lg:col-span-2" />
          <div className="h-80 bg-slate-200/70 rounded-2xl" />
        </div>
      </div>
    );
  }

  const topRecommendation = recommendations[0];
  const aptitudeScores = profileData?.latestAptitude?.categoryScores || {};

  const radarData = [
    { subject: 'Logical', score: aptitudeScores.LOGICAL?.percentage || 75 },
    { subject: 'Quantitative', score: aptitudeScores.QUANTITATIVE?.percentage || 70 },
    { subject: 'Verbal', score: aptitudeScores.VERBAL?.percentage || 68 },
    { subject: 'Analytical', score: aptitudeScores.ANALYTICAL?.percentage || 82 },
    { subject: 'Problem Solving', score: aptitudeScores.PROBLEM_SOLVING?.percentage || 85 },
  ];

  const breakdownData = topRecommendation?.breakdown
    ? [
        { name: 'Skills Match', value: topRecommendation.breakdown.skillScore || 80, color: '#2563EB' },
        { name: 'Aptitude Benchmark', value: topRecommendation.breakdown.aptitudeScore || 75, color: '#0284C7' },
        { name: 'Interest Alignment', value: topRecommendation.breakdown.interestScore || 85, color: '#10B981' },
        { name: 'Education Fit', value: topRecommendation.breakdown.educationScore || 85, color: '#F59E0B' },
        { name: 'Experience Baseline', value: topRecommendation.breakdown.experienceScore || 70, color: '#6366F1' },
      ]
    : [];

  const roadmapItems = roadmap?.items || [];
  const completedCount = roadmapItems.filter((i: any) => i.isCompleted).length;
  const progressPercent = roadmapItems.length > 0 ? Math.round((completedCount / roadmapItems.length) * 100) : 0;
  const nextIncompleteItem = roadmapItems.find((i: any) => !i.isCompleted) || roadmapItems[0];

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Responsive Sidebar Navigation */}
      <Sidebar userName={profileData?.name} userEmail={profileData?.email} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8 xl:px-10 overflow-y-auto max-w-7xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* ======================================================== */}
          {/* HEADER & WELCOME BANNER */}
          {/* ======================================================== */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-8 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/8 via-indigo-500/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[11px] font-semibold text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-beacon" />
                  <span>AI Career Guidance Telemetry Active</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back, {profileData?.name?.split(' ')[0] || 'Engineer'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Specialization in <span className="font-semibold text-slate-700">{profileData?.profile?.branch || 'Computer Science'}</span>.
                  Your multi-criteria fitness index is synchronized with real market hiring bars.
                </p>
              </div>

              {/* Action Buttons: Stack on mobile, flex on desktop */}
              <div className="flex flex-col xs:flex-row sm:items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  href="/recommendations"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5 text-center min-h-[44px]"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>Explore Matches</span>
                </Link>
                <Link
                  href="/assessment"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300/80 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors text-center min-h-[44px]"
                >
                  <BrainCircuit className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span>Retake Diagnostic</span>
                </Link>
              </div>
            </div>

            {/* Smart Next-Best-Action Alert Banner */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200/60">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 mt-0.5 sm:mt-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900">Recommended Next Step: </span>
                  <span className="text-slate-600 break-words">
                    {roadmap
                      ? `Focus on Month ${nextIncompleteItem?.month || 1} milestone: "${nextIncompleteItem?.title || 'Core Foundations'}"`
                      : 'Generate your tailored 6-month roadmap from your top career match.'}
                  </span>
                </div>
              </div>
              <Link
                href={roadmap ? '/roadmap' : '/recommendations'}
                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 shrink-0 self-start sm:self-center min-h-[40px] px-2"
              >
                <span>{roadmap ? 'Open Roadmap' : 'Generate Roadmap'}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* ======================================================== */}
          {/* METRIC KPI CARDS (1 col on Mobile, 2 col on Tablet, 4 col on Large Displays) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Top Career Match */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-2.5 sm:space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  Pathway Match
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {topRecommendation ? `${topRecommendation.matchScore}%` : '70%'}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  Top Fit
                </span>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-blue-700 truncate">
                {topRecommendation?.career?.title || 'Full Stack Developer'}
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${topRecommendation?.matchScore || 70}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Verified Skills */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  Verified Skills
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {profileData?.skills?.length || 12}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Telemetry
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                <span className="font-semibold text-slate-700">
                  {profileData?.skills?.filter((s: any) => s.proficiency >= 4).length || 6}
                </span>{' '}
                advanced (Level 4-5)
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (profileData?.skills?.length || 12) * 8)}%` }}
                />
              </div>
            </div>

            {/* Metric 3: Aptitude Index */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  Aptitude Index
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <BrainCircuit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {profileData?.latestAptitude ? `${profileData.latestAptitude.score}%` : '78%'}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  Psychometric
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                {profileData?.latestAptitude ? 'Diagnostic verified' : 'Diagnostic baseline'}
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${profileData?.latestAptitude?.score || 78}%` }}
                />
              </div>
            </div>

            {/* Metric 4: Resume ATS Score */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  Resume ATS
                </span>
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shrink-0">
                  <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {latestResume ? `${latestResume.atsScore}/100` : '56/100'}
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 shrink-0">
                  ATS Scan
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 truncate">
                {latestResume
                  ? `${latestResume.extractedSkills?.length || 0} skills detected`
                  : '1 skills detected'}
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-violet-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${latestResume?.atsScore || 56}%` }}
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ANALYTICS & CHARTS GRID (Responsive stack on Tablet/Mobile) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Cognitive Aptitude Radar */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs xl:col-span-2 space-y-4 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Cognitive Psychometric Profile</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Evaluated across Logical, Quantitative, Verbal, Analytical, and Problem Solving dimensions
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    Benchmark: 70%+
                  </span>
                  <Link
                    href="/assessment"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Details →
                  </Link>
                </div>
              </div>

              {/* Chart container with strict min-w-0 and responsive height */}
              <div className="h-64 sm:h-72 w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Candidate"
                      dataKey="score"
                      stroke="#2563EB"
                      strokeWidth={2}
                      fill="#2563EB"
                      fillOpacity={0.22}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Breakdown Distribution */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4 min-w-0">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Top Match Factors</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Weighting for <span className="font-semibold text-slate-700">{topRecommendation?.career?.title || 'Full Stack Developer'}</span>
                </p>
              </div>

              <div className="space-y-3.5 pt-1">
                {breakdownData.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 text-[11px] sm:text-xs">{item.name}</span>
                      <span className="font-bold text-slate-900 text-[11px] sm:text-xs">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/recommendations"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                >
                  <span>Inspect Full Algorithmic Audit</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TOP PATHWAYS & ACTIVE ROADMAP (1 col on Tablet/Laptop, 2 col on Desktop) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Recommended Pathways */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-3.5 min-w-0">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Top Recommended Pathways</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">Ranked by hybrid algorithmic utility score</p>
                </div>
                <Link
                  href="/recommendations"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All ({recommendations.length || 7})
                </Link>
              </div>

              <div className="space-y-2.5">
                {(recommendations.length > 0 ? recommendations.slice(0, 3) : [
                  { id: '1', career: { title: 'Full Stack Developer', category: 'Software Engineering', salaryRange: '$85,000 - $145,000 / yr', slug: 'full-stack-developer' }, matchScore: 70 },
                  { id: '2', career: { title: 'Data Engineer', category: 'Artificial Intelligence & Data', salaryRange: '$95,000 - $160,000 / yr', slug: 'data-engineer' }, matchScore: 68 },
                  { id: '3', career: { title: 'AI / Machine Learning Engineer', category: 'Artificial Intelligence & Data', salaryRange: '$110,000 - $185,000 / yr', slug: 'ai-ml-engineer' }, matchScore: 67 },
                ]).map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-4 hover:border-slate-300 hover:bg-white transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 overflow-hidden min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-xs font-black shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {rec.career?.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {rec.career?.category} • {rec.career?.salaryRange}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg sm:text-xl font-black text-blue-600">{rec.matchScore}%</div>
                      <Link
                        href={`/careers/${rec.career?.slug || 'full-stack-developer'}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Deep Dive</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Roadmap & Curriculum */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-3.5 min-w-0">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Map className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Active Learning Curriculum</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    {roadmap ? roadmap.career?.title : 'Full Stack Developer'}
                  </p>
                </div>
                <Link
                  href="/roadmap"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Full Roadmap
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Curriculum Progress</span>
                  <span className="font-black text-blue-600">{progressPercent}% Completed</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Next Milestones (Click to toggle complete)
                  </span>
                  {(roadmapItems.length > 0 ? roadmapItems.slice(0, 3) : [
                    { id: 'm1', month: 1, title: 'Core Foundations & Architectural Tooling', isCompleted: false },
                    { id: 'm2', month: 2, title: 'Advanced Frameworks & Database Schemas', isCompleted: false },
                    { id: 'm3', month: 3, title: 'Domain Specialization & Production Toolchains', isCompleted: false },
                  ]).map((item: any) => {
                    const firstTask = item.tasks?.[0];
                    return (
                      <div
                        key={item.id}
                        className="p-3 sm:p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 overflow-hidden min-w-0">
                          <div className="font-bold text-slate-900 truncate text-[11px] sm:text-xs">
                            Month {item.month}: {item.title}
                          </div>
                          <div className="text-slate-500 text-[10px] sm:text-[11px] truncate">
                            {firstTask ? firstTask.title : 'Milestone objectives'}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={taskUpdating === firstTask?.id}
                          onClick={() => {
                            if (firstTask) {
                              handleToggleTask(item.id, firstTask.id, firstTask.done);
                            }
                          }}
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            item.isCompleted || firstTask?.done
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-200/80 text-slate-700 hover:bg-blue-600 hover:text-white'
                          }`}
                        >
                          {item.isCompleted || firstTask?.done ? 'Completed ✓' : 'Mark Done'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* QUICK TOOLBOX SHORTCUTS */}
          {/* ======================================================== */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-3.5">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-400">
              Guidance Platform Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
              <Link
                href="/chat"
                className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-200 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="font-bold text-xs text-slate-900">AI Copilot</div>
                <div className="text-[10px] text-slate-500">Ask career questions</div>
              </Link>

              <Link
                href="/resume"
                className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-violet-50/50 hover:border-violet-200 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:scale-105 transition-transform">
                  <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="font-bold text-xs text-slate-900">Resume ATS</div>
                <div className="text-[10px] text-slate-500">Check keyword pass rate</div>
              </Link>

              <Link
                href="/skills"
                className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-105 transition-transform">
                  <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="font-bold text-xs text-slate-900">Skill Gaps</div>
                <div className="text-[10px] text-slate-500">Target missing levels</div>
              </Link>

              <Link
                href="/projects"
                className="p-3 sm:p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group"
              >
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-105 transition-transform">
                  <FolderGit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="font-bold text-xs text-slate-900">Portfolio Blueprints</div>
                <div className="text-[10px] text-slate-500">Proof of competence</div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
