'use client';

import React from 'react';

export function SkillsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-full" />
        <div className="h-9 w-72 bg-slate-200 rounded-2xl" />
        <div className="h-4 w-full max-w-xl bg-slate-100 rounded-lg" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-7 w-12 bg-slate-300 rounded-lg" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Target Career Bar Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="h-7 w-64 bg-slate-300 rounded-lg" />
      </div>

      {/* Skills Profile Section Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="h-6 w-52 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100/70 border border-slate-200/50" />
          ))}
        </div>
      </div>

      {/* Matrix Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="h-6 w-60 bg-slate-200 rounded" />
        <div className="h-48 rounded-2xl bg-slate-100/70 border border-slate-200/50" />
      </div>
    </div>
  );
}
