'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Map,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Compass,
  Award,
  DollarSign,
  Zap,
  BookOpen,
  Filter,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [generatingRoadmapId, setGeneratingRoadmapId] = useState<string | null>(null);

  const fetchRecs = async () => {
    try {
      const [recRes, profRes] = await Promise.all([
        fetch('/api/recommendations'),
        fetch('/api/profile'),
      ]);
      const data = await recRes.json();
      const profData = await profRes.json();

      if (profData?.user) setUserProfile(profData.user);
      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        if (data.recommendations.length > 0 && !expandedId) {
          setExpandedId(data.recommendations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleRecalculate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/recommendations', { method: 'POST' });
      const data = await res.json();
      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        if (data.recommendations.length > 0) {
          setExpandedId(data.recommendations[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to recalculate:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateRoadmap = async (careerId: string) => {
    setGeneratingRoadmapId(careerId);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId }),
      });
      if (res.ok) {
        router.push('/roadmap');
      }
    } catch (err) {
      console.error('Roadmap generate failed:', err);
    } finally {
      setGeneratingRoadmapId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200/80 rounded-3xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const categories = ['ALL', ...Array.from(new Set(recommendations.map((r) => r.career?.category).filter(Boolean)))];

  const filteredRecs = recommendations.filter((r) => {
    if (activeCategory === 'ALL') return true;
    return r.career?.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-10 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Explainable Multi-Criteria Recommendation Engine</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Ranked Career Pathways
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Scored across verified technical skills, cognitive benchmarks, career preferences, and empirical resume telemetry.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRecalculate}
                disabled={generating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300/80 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all shrink-0 disabled:opacity-50"
              >
                <RotateCw className={`h-3.5 w-3.5 text-blue-600 ${generating ? 'animate-spin' : ''}`} />
                <span>{generating ? 'Re-scoring Pipeline...' : 'Recalculate Matches'}</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations List */}
          <div className="space-y-4">
            {filteredRecs.map((rec, index) => {
              const isExpanded = expandedId === rec.id;
              const matchingSkills = (rec.matchingSkills as any[]) || [];
              const missingSkills = (rec.missingSkills as string[]) || [];
              const recommendedActions = (rec.recommendedActions as string[]) || [];
              const breakdown = (rec.breakdown as any) || {};
              const contributingFactors = (breakdown.contributingFactors as any[]) || [];
              const confidenceScore = breakdown.confidenceScore ?? 85;

              return (
                <div
                  key={rec.id}
                  className={`rounded-3xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-blue-300 bg-white shadow-md'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Collapsed Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      {/* Rank Indicator */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/80 font-black text-lg shadow-2xs">
                        #{index + 1}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                            {rec.career?.title}
                          </h2>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                            {rec.career?.category}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">{rec.career?.salaryRange}</span>
                          <span>•</span>
                          <span>{rec.career?.experienceLevel || 'Entry to Senior'}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                            <TrendingUp className="h-3 w-3" />
                            {rec.career?.demandLevel || 'High Demand'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Gauge & Accordion Toggle */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <div className="text-3xl font-black text-blue-600 tracking-tight leading-none">
                          {rec.matchScore}%
                        </div>
                        <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                          Fit Index
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {confidenceScore}% confidence
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Deep-Dive Details */}
                  {isExpanded && (
                    <div className="px-5 pb-7 sm:px-8 sm:pb-8 pt-2 border-t border-slate-100 space-y-6">
                      {/* Explainable AI Narrative Justification */}
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-blue-900">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span>Explainable Match Justification:</span>
                        </div>
                        <p>{rec.reasoning || rec.explanation}</p>
                      </div>

                      {/* Contributing Factors Breakdown */}
                      {contributingFactors.length > 0 && (
                        <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
                            <div>
                              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                Factor Attribution Breakdown
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                Mathematical multi-attribute utility score distribution
                              </p>
                            </div>
                            <span className="self-start sm:self-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              Confidence: {confidenceScore}%
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {contributingFactors.map((factor) => {
                              const isPos = factor.status === 'positive';
                              const isNeutral = factor.status === 'neutral';
                              const badgeColor = isPos
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                : isNeutral
                                ? 'text-blue-700 bg-blue-50 border-blue-200'
                                : 'text-amber-800 bg-amber-50 border-amber-200';

                              const barColor = isPos
                                ? 'bg-emerald-500'
                                : isNeutral
                                ? 'bg-blue-600'
                                : 'bg-amber-500';

                              return (
                                <div
                                  key={factor.id}
                                  className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-800">{factor.name}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                                      {factor.score}% ({factor.weightedPoints > 0 ? `+${factor.weightedPoints}` : factor.weightedPoints} pts)
                                    </span>
                                  </div>

                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                      style={{ width: `${Math.min(100, Math.max(5, factor.score))}%` }}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                                    <span className="truncate pr-2">{factor.insight}</span>
                                    <span className="text-slate-400 shrink-0">weight: {factor.weightPercent}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Skill Comparison Grid: Matched vs Missing */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Matched Skills */}
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verified Match Competencies ({matchingSkills.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {matchingSkills.map((s: any, sIdx: number) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1 rounded-lg bg-white border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-2xs"
                              >
                                <Check className="h-3 w-3 text-emerald-600" />
                                {typeof s === 'string' ? s : s?.name || 'Skill'}
                              </span>
                            ))}
                            {matchingSkills.length === 0 && (
                              <span className="text-xs text-slate-400">None verified yet</span>
                            )}
                          </div>
                        </div>

                        {/* Missing Skills */}
                        <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-5 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 text-amber-600" /> High-ROI Skill Gaps ({missingSkills.length})
                            </span>
                            <Link href="/skills" className="text-[11px] font-bold text-blue-600 hover:underline">
                              Gaps Matrix →
                            </Link>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {missingSkills.map((s: any, sIdx: number) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800 shadow-2xs"
                              >
                                <BookOpen className="h-3 w-3 text-amber-600" />
                                {typeof s === 'string' ? s : s?.name || 'Skill'}
                              </span>
                            ))}
                            {missingSkills.length === 0 && (
                              <span className="text-xs text-emerald-600 font-semibold">Zero critical gaps!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <Link
                          href={`/careers/${rec.career?.slug || 'full-stack-developer'}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>View Full Career Discipline Curriculum</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>

                        <button
                          type="button"
                          disabled={generatingRoadmapId === rec.career?.id}
                          onClick={() => handleGenerateRoadmap(rec.career?.id)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                        >
                          <Map className="h-4 w-4" />
                          <span>
                            {generatingRoadmapId === rec.career?.id
                              ? 'Generating Roadmap...'
                              : 'Select Career & Build 6-Month Roadmap'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
