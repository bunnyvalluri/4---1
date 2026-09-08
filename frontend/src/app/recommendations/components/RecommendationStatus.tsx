import React from 'react';
import { RecommendationStatus, JobStatus } from '@/lib/hooks/useRecommendations';
import { CheckCircle2, Clock, Loader2, AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';

interface RecommendationStatusProps {
  status: RecommendationStatus | null;
  jobStatus: JobStatus | null;
  isOnline: boolean;
  recalculating: boolean;
}

const STATUS_CONFIG = {
  up_to_date: {
    label: 'Up to date',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    Icon: CheckCircle2,
  },
  stale: {
    label: 'Recommendations may be outdated',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    Icon: AlertTriangle,
  },
  generating: {
    label: 'AI analyzing your profile…',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500 animate-pulse',
    Icon: Loader2,
  },
  no_data: {
    label: 'No recommendations yet',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    Icon: Clock,
  },
  error: {
    label: 'Error loading recommendations',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    Icon: AlertTriangle,
  },
};

// ── Progress bar for active job ───────────────────────────────────────────────

function JobProgressBar({ jobStatus }: { jobStatus: JobStatus }) {
  const progress = jobStatus.progress ?? 0;
  const label = jobStatus.stage_label ?? jobStatus.message ?? 'Processing…';

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-blue-700 font-medium">{label}</span>
        <span className="text-blue-600 font-bold">{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function RecommendationStatusBadge({
  status,
  jobStatus,
  isOnline,
  recalculating,
}: RecommendationStatusProps) {
  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <WifiOff className="h-3.5 w-3.5" />
        <span>Offline</span>
      </div>
    );
  }

  const effectiveStatus = recalculating ? 'generating' : (status?.status ?? 'no_data');
  const cfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.no_data;
  const { Icon } = cfg;

  return (
    <div className="space-y-2 w-full sm:w-auto">
      <div className={`inline-flex items-center gap-2 rounded-full border ${cfg.border} ${cfg.bg} px-3 py-1.5 text-xs font-semibold ${cfg.color}`}>
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        <Icon className={`h-3.5 w-3.5 ${recalculating ? 'animate-spin' : ''}`} />
        <span>{cfg.label}</span>
      </div>

      {/* Active job progress bar */}
      {recalculating && jobStatus && (
        <div className="w-full min-w-[240px]">
          <JobProgressBar jobStatus={jobStatus} />
        </div>
      )}
    </div>
  );
}

// ── Last analyzed inline display ──────────────────────────────────────────────

export function LastAnalyzedLabel({ status }: { status: RecommendationStatus | null }) {
  if (!status?.last_analyzed_relative) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Clock className="h-3 w-3" />
      Last analyzed: {status.last_analyzed_relative}
    </span>
  );
}

// ── Profile stale warning banner ──────────────────────────────────────────────

export function ProfileStaleBanner({
  status,
  onRecalculate,
}: {
  status: RecommendationStatus;
  onRecalculate: () => void;
}) {
  if (!status.is_stale) return null;
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
      <div className="flex-1 text-sm text-amber-800">
        <span className="font-semibold">Profile changed.</span> Your career recommendations may be
        outdated.
      </div>
      <button
        type="button"
        onClick={onRecalculate}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition-colors shrink-0"
      >
        <RefreshCw className="h-3 w-3" />
        Recalculate Matches
      </button>
    </div>
  );
}
