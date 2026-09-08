import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  GitCompare,
} from 'lucide-react';
import { RecommendationItem } from '@/lib/hooks/useRecommendations';

interface CareerMatchCardProps {
  rec: RecommendationItem;
  isSelected: boolean;
  onToggleCompare: (id: string) => void;
  canAddMore: boolean;
}

const MATCH_LEVEL_COLORS: Record<string, string> = {
  'Excellent Match': 'bg-blue-600 text-white',
  'Strong Match': 'bg-indigo-500 text-white',
  'Good Match': 'bg-teal-500 text-white',
  'Potential Match': 'bg-amber-500 text-white',
  'Explore Carefully': 'bg-slate-500 text-white',
};

const MATCH_SCORE_COLOR = (score: number) => {
  if (score >= 90) return 'text-blue-700';
  if (score >= 80) return 'text-indigo-700';
  if (score >= 70) return 'text-teal-700';
  if (score >= 60) return 'text-amber-700';
  return 'text-slate-700';
};

export function CareerMatchCard({ rec, isSelected, onToggleCompare, canAddMore }: CareerMatchCardProps) {
  const [expanded, setExpanded] = useState(false);

  const matchingNames = (rec.matching_skills ?? [])
    .map((s) => (typeof s === 'string' ? s : s?.name ?? ''))
    .filter(Boolean);
  const missingNames = (rec.missing_skills ?? [])
    .map((s) => (typeof s === 'string' ? s : s?.name ?? ''))
    .filter(Boolean);
  const factors = rec.breakdown?.contributingFactors ?? [];
  const confidence = rec.confidence_score ?? rec.breakdown?.confidenceScore ?? 85;

  return (
    <article
      className={`rounded-2xl border bg-white transition-all overflow-hidden ${
        expanded ? 'border-blue-300 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
      aria-label={`Career: ${rec.career_title}, ${rec.match_score}% match`}
    >
      {/* Collapsed header — always visible */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 font-black text-sm">
            #{rec.rank}
          </div>

          {/* Career info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {rec.career_title}
              </h3>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 shrink-0">
                {rec.career_category}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              {rec.career_salary_range && (
                <span className="font-semibold text-slate-700">{rec.career_salary_range}</span>
              )}
              {rec.career_demand_level && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <TrendingUp className="h-3 w-3" />
                    {rec.career_demand_level}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="shrink-0 text-right">
            <div className={`text-2xl font-black leading-none ${MATCH_SCORE_COLOR(rec.match_score)}`}>
              {Math.round(rec.match_score)}%
            </div>
            <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${MATCH_LEVEL_COLORS[rec.match_level] ?? 'bg-slate-500 text-white'}`}>
              {rec.match_level}
            </span>
          </div>
        </div>

        {/* Match score bar */}
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-700"
            style={{ width: `${rec.match_score}%` }}
          />
        </div>

        {/* Skill tags */}
        {matchingNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {matchingNames.slice(0, 4).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800"
              >
                <CheckCircle2 className="h-2.5 w-2.5" />
                {s}
              </span>
            ))}
            {matchingNames.length > 4 && (
              <span className="text-[10px] text-slate-400 font-medium self-center">
                +{matchingNames.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Primary gap */}
        {rec.primary_gap && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            <span>Primary gap: <span className="font-semibold">{rec.primary_gap}</span></span>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? 'Less detail' : 'View analysis'}
            </button>

            {/* Compare toggle */}
            <button
              type="button"
              onClick={() => onToggleCompare(rec.career_id)}
              disabled={!isSelected && !canAddMore}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
              aria-pressed={isSelected}
            >
              <GitCompare className="h-3 w-3" />
              {isSelected ? 'Comparing' : 'Compare'}
            </button>
          </div>

          <Link
            href={`/careers/${rec.career_slug}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-xs shadow-blue-500/20"
          >
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 pb-5 pt-4 space-y-5">
          {/* AI reasoning */}
          {rec.reasoning && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                AI Match Justification
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{rec.reasoning}</p>
            </div>
          )}

          {/* Contributing factors */}
          {factors.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Factor Breakdown — {confidence}% Confidence
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {factors.map((f) => {
                  const isPos = f.status === 'positive';
                  const isNeut = f.status === 'neutral';
                  const barColor = isPos ? 'bg-emerald-500' : isNeut ? 'bg-blue-500' : 'bg-amber-500';
                  const badgeColor = isPos
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : isNeut
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200';

                  return (
                    <div key={f.id ?? f.name} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{f.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                          {Math.round(f.score)}% · {f.weightedPoints > 0 ? `+${f.weightedPoints}` : f.weightedPoints}pts
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(5, Math.min(100, f.score))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate pr-2">{f.insight}</span>
                        <span className="shrink-0">wt: {f.weightPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matching & missing skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-2">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Matched Skills ({matchingNames.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchingNames.map((s) => (
                  <span key={s} className="rounded-lg bg-white border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    {s}
                  </span>
                ))}
                {matchingNames.length === 0 && (
                  <span className="text-xs text-slate-400">None verified yet</span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4 space-y-2">
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Skill Gaps ({missingNames.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingNames.map((s) => (
                  <span key={s} className="rounded-lg bg-white border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    {s}
                  </span>
                ))}
                {missingNames.length === 0 && (
                  <span className="text-xs text-emerald-600 font-semibold">Zero critical gaps!</span>
                )}
              </div>
            </div>
          </div>

          {/* Recommended actions */}
          {rec.recommended_actions?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Recommended Next Steps
              </p>
              {rec.recommended_actions.slice(0, 3).map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] mt-0.5">
                    {i + 1}
                  </span>
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
