'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { TopCareerPath } from '@/lib/hooks/useDashboardRealtime';

interface CareerPathListProps {
  paths?: TopCareerPath[];
}

export function CareerPathList({ paths = [] }: CareerPathListProps) {
  const items = paths;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">Top Career Paths</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
            Ranked by recommendation engine
          </p>
        </div>
        {items.length > 0 && (
          <Link
            href="/recommendations"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0 min-h-[44px] flex items-center"
          >
            View All ({items.length})
          </Link>
        )}
      </div>

      {/* Cards List or Genuine Empty State */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.careerId || item.rank}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 hover:border-slate-300 hover:bg-white transition-all space-y-3 group min-w-0"
            >
              {/* Top Row: Rank, Title, Salary */}
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black shrink-0 mt-0.5">
                    #{item.rank}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors break-words">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span>{item.category}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-semibold text-slate-700 block sm:inline">{item.salaryRange}</span>
                    </div>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="text-right shrink-0 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs">
                  <div className="text-lg font-black text-blue-600 leading-none">
                    {item.matchScore}%
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                    Match
                  </div>
                </div>
              </div>

              {/* Middle Row: Factors & Missing Skills */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-slate-400">Driver:</span>
                  <span className="font-bold text-slate-800">{item.strongestFactor}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md text-[11px]">
                    {item.skillGap}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Full-width touch friendly action on mobile */}
              <div className="pt-1">
                <Link
                  href={`/careers/${item.slug || 'full-stack-developer'}`}
                  className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm border border-blue-200/80 transition-all active:scale-[0.98]"
                >
                  <span>Deep Dive</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mx-auto border border-amber-200/80">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">No Career Recommendations Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Take the diagnostic cognitive assessment or browse our careers catalog to generate your algorithmically ranked matches.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[38px]"
            >
              Start Diagnostic
            </Link>
            <Link
              href="/careers"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors min-h-[38px]"
            >
              Browse Careers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
