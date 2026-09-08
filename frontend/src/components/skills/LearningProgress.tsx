'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { LearningProgressItem } from '@/lib/hooks/useSkillIntelligence';

interface LearningProgressProps {
  items: LearningProgressItem[];
}

export function LearningProgress({ items = [] }: LearningProgressProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600" />
            <span>SKILLS IN PROGRESS</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time tracking of competencies currently being leveled up through your learning roadmap.
          </p>
        </div>

        <Link
          href="/roadmap"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <span>Open Full Roadmap</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* List of Skills in Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.skill}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  {item.skill}
                </span>
                <span className="text-xs font-black text-blue-700">
                  {item.current_progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${item.current_progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>
                  Current: <strong className="text-slate-700">{item.current_level}</strong>
                </span>
                <span>
                  Target: <strong className="text-blue-600">{item.target_level}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Est: {item.estimated_completion}</span>
              </div>

              <Link
                href={item.action_url || '/roadmap'}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:shadow-xs transition-all"
              >
                <span>{item.action_label}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
