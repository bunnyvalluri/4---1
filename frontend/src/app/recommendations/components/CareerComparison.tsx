import React from 'react';
import { GitCompare, Trophy, Target, Heart, X } from 'lucide-react';
import { CareerComparisonData, RecommendationItem } from '@/lib/hooks/useRecommendations';

interface CareerComparisonProps {
  comparison: CareerComparisonData | null;
  selectedIds: string[];
  allItems: RecommendationItem[];
  onRemove: (id: string) => void;
}

const ROWS = [
  { key: 'match_score', label: 'Compatibility', format: (v: number) => `${Math.round(v)}%` },
  { key: 'skills_score', label: 'Skills Match', format: (v: number) => `${Math.round(v)}%` },
  { key: 'interests_score', label: 'Interest Match', format: (v: number) => `${Math.round(v)}%` },
  { key: 'aptitude_score', label: 'Aptitude Match', format: (v: number) => `${Math.round(v)}%` },
  { key: 'education_score', label: 'Education Match', format: (v: number) => `${Math.round(v)}%` },
  { key: 'experience_score', label: 'Experience Match', format: (v: number) => `${Math.round(v)}%` },
  {
    key: 'skill_gap_severity',
    label: 'Skill Gap',
    format: (v: string | number) => String(v),
    isText: true,
  },
];

function WinnerBadge({ label }: { label: string }) {
  return (
    <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-yellow-100 border border-yellow-300 px-1.5 py-0.5 text-[9px] font-bold text-yellow-700">
      <Trophy className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

export function CareerComparison({ comparison, selectedIds, allItems, onRemove }: CareerComparisonProps) {
  if (selectedIds.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs">
            <GitCompare className="h-7 w-7 text-slate-400" />
          </div>
        </div>
        <div>
          <p className="font-bold text-slate-700">Compare Careers Side by Side</p>
          <p className="text-sm text-slate-500 mt-1">
            Click the <span className="font-semibold">Compare</span> button on any career card to select it.
            Select 2–3 careers to compare.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {allItems.slice(0, 4).map((item) => (
            <span key={item.career_id} className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-600 font-medium">
              {item.career_title}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (!comparison || comparison.careers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Loading comparison data…
      </div>
    );
  }

  const { careers, best_overall, lowest_gap, best_interest_fit } = comparison;

  return (
    <section aria-labelledby="comparison-heading" className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
            <GitCompare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 id="comparison-heading" className="text-sm font-extrabold text-slate-900">
              Career Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Comparing {careers.length} selected careers
            </p>
          </div>
        </div>
        {/* Winner legend */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-yellow-600" /> Best Overall
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3 text-blue-600" /> Lowest Gap
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-600" /> Best Interest
          </span>
        </div>
      </div>

      {/* Desktop comparison table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-slate-100">
              <th scope="col" className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-40">
                Factor
              </th>
              {careers.map((career) => (
                <th key={career.career_id} scope="col" className="px-4 py-3 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-xs leading-tight">{career.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{career.category}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {career.career_id === best_overall && <WinnerBadge label="Best Overall" />}
                        {career.career_id === lowest_gap && <WinnerBadge label="Lowest Gap" />}
                        {career.career_id === best_interest_fit && <WinnerBadge label="Best Interest" />}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(career.career_id)}
                      aria-label={`Remove ${career.title} from comparison`}
                      className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ROWS.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50/40 transition-colors">
                <td className="px-5 py-3 text-xs font-semibold text-slate-600">{row.label}</td>
                {careers.map((career) => {
                  const rawVal = (career as any)[row.key];
                  const isWinner =
                    !row.isText &&
                    typeof rawVal === 'number' &&
                    rawVal === Math.max(...careers.map((c) => (c as any)[row.key] as number));

                  return (
                    <td
                      key={career.career_id}
                      className={`px-4 py-3 text-sm font-bold ${
                        isWinner ? 'text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      {row.format(rawVal)}
                      {isWinner && !row.isText && (
                        <span className="ml-1.5 text-[10px] text-blue-500">▲</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked comparison cards */}
      <div className="sm:hidden divide-y divide-slate-100">
        {careers.map((career) => (
          <div key={career.career_id} className="px-4 py-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-900">{career.title}</p>
                <p className="text-xs text-slate-500">{career.category}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {career.career_id === best_overall && <WinnerBadge label="Best Overall" />}
                  {career.career_id === lowest_gap && <WinnerBadge label="Lowest Gap" />}
                  {career.career_id === best_interest_fit && <WinnerBadge label="Best Interest" />}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(career.career_id)}
                aria-label={`Remove ${career.title}`}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
                <p className="text-lg font-black text-blue-700">{Math.round(career.match_score)}%</p>
                <p className="text-[10px] text-slate-500 font-medium">Compatibility</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
                <p className="text-base font-bold text-slate-700">{career.skill_gap_severity}</p>
                <p className="text-[10px] text-slate-500 font-medium">Skill Gap</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {ROWS.filter(r => !r.isText && r.key !== 'match_score').map((row) => {
                const val = (career as any)[row.key] as number;
                return (
                  <div key={row.key} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 w-28 shrink-0">{row.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-700 w-8 text-right">{Math.round(val)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
