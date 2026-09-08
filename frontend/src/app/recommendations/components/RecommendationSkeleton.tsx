import React from 'react';

// ── Skeleton primitives ───────────────────────────────────────────────────────

function SkeletonBox({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`bg-slate-200 animate-pulse rounded-xl ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// ── Top match skeleton ────────────────────────────────────────────────────────

function TopMatchSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="h-5 w-20" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <SkeletonBox className="h-8 w-2/3" />
          <div className="flex gap-3">
            <SkeletonBox className="h-16 w-16 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-3/4" />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-64 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <SkeletonBox className="h-3 w-24" />
              <div className="flex-1 h-2 bg-slate-200 rounded-full" />
              <SkeletonBox className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <SkeletonBox className="h-10 w-44" />
        <SkeletonBox className="h-10 w-44" />
      </div>
    </div>
  );
}

// ── Career card skeleton ──────────────────────────────────────────────────────

function CareerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex items-start gap-4">
        <SkeletonBox className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-5 w-48" />
          <SkeletonBox className="h-4 w-32" />
        </div>
        <SkeletonBox className="h-8 w-16 rounded-xl" />
      </div>
      <div className="h-2 bg-slate-100 rounded-full">
        <SkeletonBox className="h-2 w-3/4 rounded-full" />
      </div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <SkeletonBox key={i} className="h-6 w-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Skill gap skeleton ────────────────────────────────────────────────────────

function SkillGapSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
      <SkeletonBox className="h-5 w-40" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-20" />
            <div className="flex-1 h-2 bg-slate-100 rounded-full">
              <SkeletonBox className="h-2 rounded-full" style={{ width: `${40 + i * 10}%` } as React.CSSProperties} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full page skeleton ────────────────────────────────────────────────────────

export function RecommendationSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading career recommendations…" aria-busy="true">
      {/* Header skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBox className="h-8 w-56" />
            <SkeletonBox className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <SkeletonBox className="h-10 w-40" />
            <SkeletonBox className="h-10 w-28" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonBox key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>

      {/* Top match skeleton */}
      <TopMatchSkeleton />

      {/* Career cards grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CareerCardSkeleton key={i} />
        ))}
      </div>

      {/* Skill gap skeleton */}
      <SkillGapSkeleton />
    </div>
  );
}
