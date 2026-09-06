'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Map,
  BookOpen,
  Award,
  DollarSign,
  TrendingUp,
  FolderGit2,
  ShieldCheck,
  Compass,
  Check,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function CareerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [career, setCareer] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [careerRes, recsRes, profRes] = await Promise.all([
          fetch(`/api/careers?slug=${slug}`),
          fetch('/api/recommendations'),
          fetch('/api/profile'),
        ]);

        const careerData = await careerRes.json();
        const recsData = await recsRes.json();
        const profData = await profRes.json();

        if (careerData?.career) setCareer(careerData.career);
        if (profData?.user) setProfile(profData.user);

        if (recsData?.recommendations && careerData?.career) {
          const match = recsData.recommendations.find(
            (r: any) => r.careerId === careerData.career.id || r.career?.slug === slug
          );
          if (match) setRecommendation(match);
        }
      } catch (err) {
        console.error('Failed to load career details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadData();
  }, [slug]);

  const handleChooseCareer = async () => {
    if (!career?.id) return;
    setGeneratingRoadmap(true);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId: career.id }),
      });
      if (res.ok) {
        router.push('/roadmap');
      }
    } catch (err) {
      console.error('Failed to choose career:', err);
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200/80 rounded-3xl" />
        <div className="h-96 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-slate-50/40 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Career not found</h2>
          <p className="text-xs text-slate-500">The requested career discipline could not be located in our catalog.</p>
          <Link
            href="/recommendations"
            className="inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            Return to Career Matches
          </Link>
        </div>
      </div>
    );
  }

  const matchScore = recommendation?.matchScore || 85;
  const matchingSkills = recommendation?.matchingSkills || [];
  const missingSkills = recommendation?.missingSkills || [];

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={profile?.name} userEmail={profile?.email} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-10 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Link href="/recommendations" className="hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Career Matches
            </Link>
            <span>/</span>
            <span className="text-slate-800">{career.title}</span>
          </div>

          {/* Hero Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold border border-blue-200 inline-block">
                  {career.category}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {career.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {career.description}
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                <div className="rounded-2xl bg-blue-50/80 border border-blue-200/80 p-4 text-center min-w-[130px]">
                  <div className="text-3xl font-black text-blue-600 tracking-tight">{matchScore}%</div>
                  <div className="text-[10px] uppercase font-bold text-blue-800">Match Compatibility</div>
                </div>
                <button
                  type="button"
                  onClick={handleChooseCareer}
                  disabled={generatingRoadmap}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Map className="h-4 w-4" />
                  <span>{generatingRoadmap ? 'Synthesizing...' : 'Adopt & Build Roadmap'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6">
              <div>
                <div className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Salary Range</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{career.salaryRange}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Market Demand</div>
                <div className="text-sm font-black text-emerald-600 mt-0.5">{career.demandLevel || 'High Demand'}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Seniority Level</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{career.experienceLevel || 'Entry to Lead'}</div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Education Alignment</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5 truncate" title={career.educationReqs}>
                  {career.educationReqs?.slice(0, 30)}...
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI Justification */}
          {recommendation?.reasoning && (
            <div className="rounded-3xl border border-blue-100 bg-blue-50/40 p-6 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-blue-900 text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Explainable AI Match Attribution:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{recommendation.reasoning}</p>
            </div>
          )}

          {/* Required Skills vs Candidate Verified Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Your Matched Competencies
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {matchingSkills.length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {career.skills?.map((cs: any) => {
                  const match = matchingSkills.find(
                    (m: any) => m.name?.toLowerCase() === cs.skill.name?.toLowerCase()
                  );
                  if (!match) return null;

                  return (
                    <div
                      key={cs.id}
                      className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{cs.skill.name}</span>
                        <div className="text-[11px] text-slate-500">Required: Level {cs.minProficiency}/5</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        Your Lvl: {match.userProficiency || 4}/5
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Skill Gaps to Bridge
                </h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {missingSkills.length} Priority
                </span>
              </div>

              <div className="space-y-2">
                {career.skills?.map((cs: any) => {
                  const isMissing = missingSkills.includes(cs.skill.name);
                  if (!isMissing) return null;

                  return (
                    <div
                      key={cs.id}
                      className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{cs.skill.name}</span>
                        <div className="text-[11px] text-slate-500">
                          {cs.isRequired ? 'Core Hiring Requirement' : 'Preferred Elective'}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                        Target: Level {cs.minProficiency}/5
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Job Titles & Career Progression */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-3 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Industry Title Progression
            </h3>
            <div className="flex flex-wrap gap-2">
              {(career.commonJobTitles || ['Associate', 'Mid-Level Specialist', 'Senior Lead']).map((title: string) => (
                <span
                  key={title}
                  className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-800"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
