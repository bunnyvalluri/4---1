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
      <div className="min-h-screen bg-slate-50 p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-slate-900">Career not found</h2>
          <p className="text-sm text-slate-600">The requested career discipline could not be located in our catalog.</p>
          <Link href="/recommendations" className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm text-white font-semibold">
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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <Sidebar userName={profile?.name} userEmail={profile?.email} />

      {/* Main Content */}
      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/recommendations" className="hover:text-slate-800 flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Career Matches
            </Link>
            <span>/</span>
            <span className="text-slate-900">{career.title}</span>
          </div>

          {/* Hero Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-2">
                <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold border border-blue-200 inline-block">
                  {career.category}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">{career.title}</h1>
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">{career.description}</p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-center min-w-[120px]">
                  <div className="text-3xl font-extrabold text-blue-600">{matchScore}%</div>
                  <div className="text-[10px] uppercase font-bold text-blue-800">Match Score</div>
                </div>
                <button
                  type="button"
                  onClick={handleChooseCareer}
                  disabled={generatingRoadmap}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Map className="h-4 w-4" />
                  <span>{generatingRoadmap ? 'Building Roadmap...' : 'Choose this Career'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6">
              <div>
                <div className="text-xs text-slate-500 font-medium">Compensation Range</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{career.salaryRange}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Industry Demand</div>
                <div className="text-sm font-bold text-blue-600 mt-0.5">{career.demandLevel || 'High'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Experience Bracket</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{career.experienceLevel}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">Education Prerequisites</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate" title={career.educationReqs}>
                  {career.educationReqs?.slice(0, 30)}...
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI Justification */}
          {recommendation?.reasoning && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Why this Career Matches You:</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{recommendation.reasoning}</p>
            </div>
          )}

          {/* Required Skills vs Candidate Verified Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Your Matched Skills
                </h3>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
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
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{cs.skill.name}</span>
                        <div className="text-[11px] text-slate-500">Required: Level {cs.minProficiency}/5</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        Your Level: {match.userProficiency || 4}/5
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Skill Gaps to Bridge
                </h3>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
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
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{cs.skill.name}</span>
                        <div className="text-[11px] text-slate-500">
                          {cs.isRequired ? 'Core Requirement' : 'Preferred Elective'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                        Target: Level {cs.minProficiency}/5
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Typical Roles & Career Progression */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Typical Industry Job Titles & Progression Ladder
            </h3>
            <div className="flex flex-wrap gap-2">
              {(career.commonJobTitles || ['Associate', 'Mid-Level Specialist', 'Senior Lead']).map((title: string) => (
                <span key={title} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800">
                  {title}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Capstone Projects */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-indigo-600" />
                Recommended Portfolio Projects
              </h3>
              <Link href="/projects" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All Projects
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(career.projectSuggestions || []).map((proj: any) => (
                <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{proj.title}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold text-[10px]">
                      {proj.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{proj.problemStatement}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.techStack?.map((t: string) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="rounded-2xl bg-blue-600 p-8 text-center text-white space-y-4 shadow-md">
            <h3 className="text-2xl font-bold">Ready to Commit to this Discipline?</h3>
            <p className="text-blue-100 text-sm max-w-xl mx-auto">
              Generate an actionable 6-month curriculum calibrated precisely to bridge your identified skill gaps.
            </p>
            <button
              type="button"
              onClick={handleChooseCareer}
              disabled={generatingRoadmap}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
            >
              <Map className="h-4 w-4" />
              <span>{generatingRoadmap ? 'Building...' : 'Choose this Career & Generate Roadmap'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
