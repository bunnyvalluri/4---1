import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Map,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { RecommendationItem } from '@/lib/hooks/useRecommendations';

interface TopCareerMatchProps {
  match: RecommendationItem;
}

// ── Score ring visual ─────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 90 ? '#2563eb' : score >= 80 ? '#3b82f6' : score >= 70 ? '#60a5fa' : '#93c5fd';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-blue-700 leading-none">{score}%</span>
        <span className="text-[10px] font-bold text-slate-500 mt-0.5">Match</span>
      </div>
    </div>
  );
}

// ── Factor bar ────────────────────────────────────────────────────────────────

function FactorBar({
  label,
  score,
  color = 'bg-blue-500',
}: {
  label: string;
  score: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-28 shrink-0 font-medium">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="text-xs font-bold text-slate-700 w-8 text-right">{score}%</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TopCareerMatch({ match }: TopCareerMatchProps) {
  const factors = match.breakdown?.contributingFactors ?? [];
  const matchingNames = (match.matching_skills ?? []).map((s) =>
    typeof s === 'string' ? s : s?.name ?? ''
  );
  const missingNames = (match.missing_skills ?? []).map((s) =>
    typeof s === 'string' ? s : s?.name ?? ''
  );

  // Build factor scores from contributing factors
  const skillsScore = match.skills_score || factors.find((f) => /skill/i.test(f.name))?.score || 0;
  const interestScore = match.interests_score || factors.find((f) => /interest/i.test(f.name))?.score || 0;
  const aptitudeScore = match.aptitude_score || factors.find((f) => /aptitude/i.test(f.name))?.score || 0;
  const educationScore = match.education_score || factors.find((f) => /edu/i.test(f.name))?.score || 0;
  const experienceScore = match.experience_score || factors.find((f) => /exp/i.test(f.name))?.score || 0;
  const preferenceScore = match.preference_score || factors.find((f) => /pref|career/i.test(f.name))?.score || 0;

  return (
    <section
      aria-labelledby="top-match-heading"
      className="rounded-2xl border-2 border-blue-200 bg-white shadow-md overflow-hidden"
    >
      {/* Header strip */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-yellow-300" />
          <span className="text-sm font-extrabold text-white tracking-wide uppercase">
            Your Strongest Career Match
          </span>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
          Top Match
        </span>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: title, score ring, actions */}
          <div className="flex-1 space-y-6">
            <div>
              <h2
                id="top-match-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
              >
                {match.career_title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {match.career_category}
                </span>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {match.match_level}
                </span>
                {match.career_demand_level && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    <TrendingUp className="h-3 w-3" />
                    {match.career_demand_level} Demand
                  </span>
                )}
              </div>
              {match.career_salary_range && (
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  {match.career_salary_range}
                </p>
              )}
            </div>

            {/* Score ring on mobile */}
            <div className="flex items-center gap-6 lg:hidden">
              <ScoreRing score={Math.round(match.match_score)} />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-700">Compatibility</p>
                <p className="text-xs text-slate-500">{match.confidence_score}% confidence</p>
              </div>
            </div>

            {/* Why fits */}
            {matchingNames.length > 0 && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-2">
                <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                  Why this career fits you
                </p>
                <ul className="space-y-1.5">
                  {matchingNames.slice(0, 5).map((s) => (
                    <li key={s} className="flex items-center gap-2 text-xs text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to develop */}
            {missingNames.length > 0 && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 space-y-2">
                <p className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                  Areas to develop
                </p>
                <ul className="space-y-1.5">
                  {missingNames.slice(0, 3).map((s) => (
                    <li key={s} className="flex items-center gap-2 text-xs text-amber-800">
                      <ArrowRight className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI reasoning snippet */}
            {match.reasoning && (
              <p className="text-xs text-slate-500 leading-relaxed border-l-2 border-blue-200 pl-3 italic">
                {match.reasoning.slice(0, 200)}{match.reasoning.length > 200 ? '…' : ''}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/careers/${match.career_slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-500/20"
              >
                View Career Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Map className="h-4 w-4 text-slate-500" />
                Start Career Roadmap
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <MessageSquare className="h-4 w-4 text-slate-500" />
                Ask CareerAI
              </Link>
            </div>
          </div>

          {/* Right: score ring + factor bars (desktop) */}
          <div className="hidden lg:flex flex-col items-center gap-6 w-64 shrink-0">
            <ScoreRing score={Math.round(match.match_score)} />

            <div className="w-full space-y-2.5">
              <FactorBar label="Skills Match" score={skillsScore} color="bg-blue-600" />
              <FactorBar label="Interest Match" score={interestScore} color="bg-indigo-500" />
              <FactorBar label="Aptitude Match" score={aptitudeScore} color="bg-violet-500" />
              <FactorBar label="Education Match" score={educationScore} color="bg-teal-500" />
              <FactorBar label="Experience Match" score={experienceScore} color="bg-emerald-500" />
              <FactorBar label="Career Preference" score={preferenceScore} color="bg-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
