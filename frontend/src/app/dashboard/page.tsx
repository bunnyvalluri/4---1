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
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [latestResume, setLatestResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200" />
          ))}
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
        { name: 'Skills', value: topRecommendation.breakdown.skillScore || 80, color: '#2563EB' },
        { name: 'Aptitude', value: topRecommendation.breakdown.aptitudeScore || 75, color: '#0284C7' },
        { name: 'Interest', value: topRecommendation.breakdown.interestScore || 85, color: '#16A34A' },
        { name: 'Education', value: topRecommendation.breakdown.educationScore || 85, color: '#D97706' },
        { name: 'Experience', value: topRecommendation.breakdown.experienceScore || 70, color: '#4F46E5' },
      ]
    : [];

  const roadmapItems = roadmap?.items || [];
  const completedCount = roadmapItems.filter((i: any) => i.isCompleted).length;
  const progressPercent = roadmapItems.length > 0 ? Math.round((completedCount / roadmapItems.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <Sidebar userName={profileData?.name} userEmail={profileData?.email} />

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl border shadow-xs">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
                Welcome back, {profileData?.name || 'Engineer'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  {profileData?.profile?.branch || 'Candidate'}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Your AI Career Guidance telemetry is active. Track progress, roadmaps, and match analytics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <BrainCircuit className="h-4 w-4" />
                <span>Retake Diagnostic</span>
              </Link>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Top Career Match */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Match</span>
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {topRecommendation ? `${topRecommendation.matchScore}%` : 'N/A'}
              </div>
              <div className="text-xs font-medium text-blue-700 truncate">
                {topRecommendation?.career?.title || 'Take assessment'}
              </div>
            </div>

            {/* Metric 2: Skills Count */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Skills</span>
                <Award className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {profileData?.skills?.length || 0}
              </div>
              <div className="text-xs text-slate-500">
                {profileData?.skills?.filter((s: any) => s.proficiency >= 4).length || 0} mastered proficiencies
              </div>
            </div>

            {/* Metric 3: Assessment Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aptitude Index</span>
                <Target className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {profileData?.latestAptitude ? `${profileData.latestAptitude.score}%` : 'Baseline'}
              </div>
              <div className="text-xs text-slate-500">
                {profileData?.latestAptitude ? 'Diagnostic completed' : 'Take 10-min test'}
              </div>
            </div>

            {/* Metric 4: Resume ATS Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resume ATS</span>
                <FileCheck className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">
                {latestResume ? `${latestResume.atsScore}/100` : 'Pending'}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {latestResume ? `${latestResume.extractedSkills?.length || 0} extracted skills` : 'Upload PDF / DOCX'}
              </div>
            </div>
          </div>

          {/* Charts & Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cognitive Aptitude Radar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-blue-600" />
                    Cognitive Psychometric Profile
                  </h3>
                  <p className="text-xs text-slate-500">Multi-dimensional cognitive fitness compared to career benchmarks</p>
                </div>
                <Link href="/assessment" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  View Questions
                </Link>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" />
                    <Radar name="Candidate" dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Breakdown Distribution */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  Top Match Factors
                </h3>
                <p className="text-xs text-slate-500">
                  {topRecommendation?.career?.title || 'Full Stack Developer'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {breakdownData.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>{item.name}</span>
                      <span className="font-semibold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Career Matches & Current Roadmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 3 Career Matches */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Top Career Matches
                </h3>
                <Link href="/recommendations" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  See All ({recommendations.length})
                </Link>
              </div>

              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600">#{idx + 1}</span>
                        <h4 className="text-sm font-bold text-slate-900">{rec.career?.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {rec.career?.category} • {rec.career?.salaryRange}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold text-blue-600">{rec.matchScore}%</div>
                      <Link
                        href={`/careers/${rec.career?.slug || 'full-stack-developer'}`}
                        className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Deep Dive <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Learning Roadmap */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Map className="h-4 w-4 text-indigo-600" />
                  Active Learning Roadmap
                </h3>
                <Link href="/roadmap" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Manage Roadmap
                </Link>
              </div>

              {roadmap ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">{roadmap.career?.title}</span>
                    <span className="text-blue-600 font-bold">{progressPercent}% Completed</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {roadmapItems.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">Month {item.month}: {item.title}</div>
                          <div className="text-slate-500 text-[11px] truncate max-w-xs">{item.description}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {item.isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="text-xs text-slate-500">No active roadmap generated yet.</div>
                  <Link
                    href="/recommendations"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                  >
                    Select Career & Build Roadmap
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
