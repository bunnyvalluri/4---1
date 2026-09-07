'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ChevronRight, ArrowRight } from 'lucide-react';
import { TopCareerPath } from '@/lib/hooks/useDashboardRealtime';

interface CareerPathListProps {
  paths?: TopCareerPath[];
}

export function CareerPathList({ paths = [] }: CareerPathListProps) {
  const defaultPaths: TopCareerPath[] = [
    {
      rank: 1,
      careerId: 'c1',
      title: 'Full Stack Developer',
      category: 'Software Engineering',
      salaryRange: '$85,000 - $145,000 / yr',
      matchScore: 92,
      strongestFactor: 'Skills 94%',
      skillGap: '2 skills missing',
      slug: 'full-stack-developer',
    },
    {
      rank: 2,
      careerId: 'c2',
      title: 'Data Engineer',
      category: 'Artificial Intelligence & Data',
      salaryRange: '$95,000 - $160,000 / yr',
      matchScore: 86,
      strongestFactor: 'Aptitude 91%',
      skillGap: '3 skills missing',
      slug: 'data-engineer',
    },
    {
      rank: 3,
      careerId: 'c3',
      title: 'AI / ML Engineer',
      category: 'Artificial Intelligence & Data',
      salaryRange: '$110,000 - $185,000 / yr',
      matchScore: 82,
      strongestFactor: 'Math Logic 89%',
      skillGap: '4 skills missing',
      slug: 'ai-ml-engineer',
    },
  ];

  const items = paths.length > 0 ? paths : defaultPaths;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Top Career Paths</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Ranked by multi-factor algorithmic recommendation engine
          </p>
        </div>
        <Link
          href="/recommendations"
          className="text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          View All ({items.length})
        </Link>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.careerId || item.rank}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3.5 sm:p-4 hover:border-slate-300 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            {/* Left: Rank, Title, Salary */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-black shrink-0">
                #{item.rank}
              </span>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">{item.salaryRange}</span>
                </div>
              </div>
            </div>

            {/* Right: Metrics, Strongest factor, Gap, Action */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <div className="text-left sm:text-right">
                <div className="text-base sm:text-lg font-black text-blue-600">
                  {item.matchScore}%
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {item.strongestFactor}
                </div>
              </div>

              <div className="hidden md:block text-left sm:text-right">
                <div className="text-[11px] font-bold text-slate-700">
                  {item.skillGap}
                </div>
                <div className="text-[10px] text-amber-600 font-semibold">
                  Action required
                </div>
              </div>

              <Link
                href={`/careers/${item.slug || 'full-stack-developer'}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors shrink-0"
              >
                <span>Deep Dive</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
