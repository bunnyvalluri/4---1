'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2 } from 'lucide-react';

interface SkillItem {
  name: string;
  proficiency: number;
  level: string;
  verified?: boolean;
}

interface SkillProfileProps {
  categories?: Record<string, SkillItem[]>;
}

export function SkillProfile({ categories = {} }: SkillProfileProps) {
  // Filter out any empty categories
  const nonEmptyCategories: Record<string, SkillItem[]> = {};
  for (const [k, v] of Object.entries(categories)) {
    if (Array.isArray(v) && v.length > 0) {
      nonEmptyCategories[k] = v;
    }
  }

  const categoryKeys = Object.keys(nonEmptyCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryKeys[0] || '');
  const activeCategory = categoryKeys.includes(selectedCategory) ? selectedCategory : (categoryKeys[0] || '');
  const currentSkills = nonEmptyCategories[activeCategory] || [];

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'advanced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">Your Skill Profile</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
            Verified candidate competence
          </p>
        </div>
        {categoryKeys.length > 0 && (
          <Link
            href="/skills"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0 min-h-[44px] flex items-center"
          >
            View All Skills →
          </Link>
        )}
      </div>

      {categoryKeys.length > 0 ? (
        <>
          {/* Horizontally Scrollable Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer select-none ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Skills List: 1-col on mobile, 2-col on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {currentSkills.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:p-3.5 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2 min-w-0"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {s.name}
                    </span>
                    {s.verified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Proficiency {s.proficiency}/5
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${getLevelBadge(
                      s.level
                    )}`}
                  >
                    {s.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-8 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-slate-200/60 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto border border-emerald-200/80">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">No Verified Skills Recorded</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your engineering skills in your profile or upload your resume to build your verified competence matrix.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors min-h-[38px]"
            >
              Add Skills in Profile
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors min-h-[38px]"
            >
              Audit via Resume
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
