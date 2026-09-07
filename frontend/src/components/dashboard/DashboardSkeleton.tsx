'use client';

import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto py-2">
      {/* Hero Command Center Skeleton */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex justify-between items-start">
          <div className="space-y-2.5 max-w-md w-full">
            <div className="h-5 w-44 bg-slate-200 rounded-full" />
            <div className="h-9 w-64 bg-slate-200 rounded-xl" />
            <div className="h-4 w-full bg-slate-100 rounded-lg" />
            <div className="h-2 w-72 bg-slate-200 rounded-full mt-2" />
          </div>
          <div className="flex gap-2.5 hidden sm:flex">
            <div className="h-11 w-36 bg-slate-200 rounded-xl" />
            <div className="h-11 w-36 bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="h-14 bg-slate-100 rounded-2xl border border-slate-200/60 mt-4" />
      </div>

      {/* 6 Metric KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-7 w-7 bg-slate-200 rounded-lg" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded-lg" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
            <div className="h-1.5 w-full bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>

      {/* Major Widgets 2-Col Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 h-80 space-y-4 shadow-xs">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
          <div className="space-y-3 pt-4">
            <div className="h-4 bg-slate-100 rounded" />
            <div className="h-4 bg-slate-100 rounded" />
            <div className="h-4 bg-slate-100 rounded" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 h-80 space-y-4 shadow-xs">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
          <div className="space-y-3 pt-4">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
