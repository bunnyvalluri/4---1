'use client';

import React from 'react';

export function AssessmentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
          <div className="h-6 w-28 bg-slate-200 rounded-full" />
        </div>
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-96 max-w-full bg-slate-200 rounded-md" />
      </div>

      {/* Progress Skeleton */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-40 bg-slate-200 rounded-md" />
          <div className="h-5 w-24 bg-slate-200 rounded-md" />
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full" />
      </div>

      {/* Main Workspace Skeleton */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 space-y-6">
          <div className="h-6 w-36 bg-slate-200 rounded-full" />
          <div className="h-10 w-full bg-slate-200 rounded-xl" />

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 w-full bg-slate-100 rounded-2xl border border-slate-200/60" />
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between">
            <div className="h-10 w-24 bg-slate-200 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          </div>
        </div>

        {/* Sidebar Navigator Skeleton */}
        <div className="hidden lg:block w-72 rounded-3xl border border-slate-200/90 bg-white p-5 space-y-4">
          <div className="h-5 w-32 bg-slate-200 rounded-md" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="h-10 w-full bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
