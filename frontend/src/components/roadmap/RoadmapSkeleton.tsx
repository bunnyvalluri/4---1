'use client';

import React from 'react';

export function RoadmapSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 max-w-lg w-full">
            <div className="h-6 bg-slate-200 rounded-full w-48" />
            <div className="h-9 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-full" />
          </div>
          <div className="h-20 w-32 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-28 bg-white border border-slate-200 rounded-2xl" />
          <div className="h-32 bg-white border border-slate-200 rounded-2xl" />
          <div className="h-96 bg-white border border-slate-200 rounded-2xl" />
        </div>

        <div className="space-y-6">
          <div className="h-64 bg-white border border-slate-200 rounded-2xl" />
          <div className="h-48 bg-white border border-slate-200 rounded-2xl" />
          <div className="h-64 bg-white border border-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
