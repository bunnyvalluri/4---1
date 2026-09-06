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
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

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
      }
    } catch (err) {
      console.error('Failed to recalculate:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateRoadmap = async (careerId: string) => {
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      {/* Main Content */}
      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl border shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                <Sparkles className="h-4 w-4" />
                <span>EXPLAINABLE CAREER RECOMMENDATION ENGINE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Ranked Career Pathways</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Ranked through transparent hybrid multi-factor scoring across verified skills, aptitude benchmarks, career preferences, education, experience, and resume evidence.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRecalculate}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors disabled:opacity-50"
            >
              <RotateCw className={`h-3.5 w-3.5 text-blue-600 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Re-scoring Pipeline...' : 'Recalculate Matches'}</span>
            </button>
          </div>

          {/* Recommendations List */}
          <div className="space-y-5">
            {recommendations.map((rec, index) => {
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
                  className={`rounded-2xl border transition-all duration-200 ${
                    isExpanded
                      ? 'border-blue-300 bg-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Collapsed Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-lg">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{rec.career?.title}</h2>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                            {rec.career?.category}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>Compensation: <strong className="text-slate-800">{rec.career?.salaryRange}</strong></span>
                          <span>•</span>
                          <span>Seniority: <strong className="text-slate-800">{rec.career?.experienceLevel || 'Entry to Senior'}</strong></span>
                          <span>•</span>
                          <span>Demand: <strong className="text-blue-600">{rec.career?.demandLevel}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-blue-600">{rec.matchScore}%</div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Match Score</div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                          {confidenceScore}% confidence
                        </div>
                      </div>
                      <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Deep-Dive Details */}
                  {isExpanded && (
                    <div className="px-5 pb-6 sm:px-6 sm:pb-8 pt-2 border-t border-slate-100 space-y-6">
                      {/* Explainable AI Narrative */}
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <div className="flex items-center gap-2 font-bold text-blue-900 mb-1.5">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span>Explainable Match Justification:</span>
                        </div>
                        <p>{rec.reasoning}</p>
                      </div>

                      {/* Contributing Factors Breakdown */}
                      {contributingFactors.length > 0 && (
                        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                Contributing Factors & Score Attribution
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                Mathematically weighted multi-attribute compatibility breakdown
                              </p>
                            </div>
                            <span className="self-start sm:self-center text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-medium">
                              Confidence Index: {confidenceScore}%
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
                                  className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-slate-800">{factor.name}</span>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
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
                                    <span className="font-mono text-slate-400 shrink-0">w: {factor.weightPercent}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Skill Comparison Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Matched Skills */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Matched Skills ({matchingSkills.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {matchingSkills.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800 border border-emerald-200 font-medium"
                              >
                                {s.name || s} (Proficiency: {s.userProficiency || 3}/5)
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Priority Skill Gaps */}
                        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 text-amber-600" /> Priority Skill Gaps ({missingSkills.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {missingSkills.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800 border border-amber-200 font-medium"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommended Actions */}
                      {recommendedActions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Recommended Action Items
                          </h4>
                          <div className="space-y-1.5">
                            {recommendedActions.map((action, aIdx) => (
                              <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                        <Link
                          href={`/careers/${rec.career?.slug || 'full-stack-developer'}`}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          View Full Career Details <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleGenerateRoadmap(rec.careerId)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                        >
                          <Map className="h-4 w-4" />
                          <span>Build 6-Month Roadmap for {rec.career?.title}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
