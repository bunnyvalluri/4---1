import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RotateCw,
  User,
  Brain,
} from 'lucide-react';
import {
  RecommendationStatus,
  JobStatus,
} from '@/lib/hooks/useRecommendations';
import { RecommendationStatusBadge, LastAnalyzedLabel } from './RecommendationStatus';

interface RecommendationsHeaderProps {
  status: RecommendationStatus | null;
  jobStatus: JobStatus | null;
  recalculating: boolean;
  isOnline: boolean;
  onRecalculate: () => void;
}

export function RecommendationsHeader({
  status,
  jobStatus,
  recalculating,
  isOnline,
  onRecalculate,
}: RecommendationsHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Main header content */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: title + description */}
          <div className="space-y-2 max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              AI Career Intelligence
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Career Intelligence
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Find the career paths that best match your skills, interests, aptitude,
              education, experience, and goals.
            </p>
          </div>

          {/* Right: action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={onRecalculate}
              disabled={recalculating || !isOnline}
              aria-label="Recalculate career matches"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-sm shadow-blue-500/20"
            >
              <RotateCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Analyzing…' : 'Recalculate Matches'}
            </button>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <User className="h-4 w-4 text-slate-500" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Status row */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <RecommendationStatusBadge
            status={status}
            jobStatus={jobStatus}
            isOnline={isOnline}
            recalculating={recalculating}
          />
          <LastAnalyzedLabel status={status} />
        </div>
      </div>

      {/* Profile completion nudge bar */}
      {status && !status.profile_complete && (
        <div className="border-t border-slate-100 bg-slate-50 px-6 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">
                Complete your profile to improve recommendation accuracy
              </span>
              <span className="text-xs font-bold text-blue-600">
                {status.profile_completion_pct}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${status.profile_completion_pct}%` }}
              />
            </div>
            {status.missing_profile_items.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-1.5">
                Missing:{' '}
                <span className="text-slate-500 font-medium">
                  {status.missing_profile_items.slice(0, 3).join(', ')}
                </span>
              </p>
            )}
          </div>
          <Link
            href="/profile"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Complete Profile →
          </Link>
        </div>
      )}
    </div>
  );
}
