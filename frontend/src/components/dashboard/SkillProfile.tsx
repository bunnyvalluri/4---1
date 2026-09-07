'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, ChevronRight, CheckCircle2 } from 'lucide-react';

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
  const defaultCategories: Record<string, SkillItem[]> = {
    'Technical Skills': [
      { name: 'Python', proficiency: 4, level: 'Advanced', verified: true },
      { name: 'SQL & Query Optimization', proficiency: 4, level: 'Advanced', verified: true },
      { name: 'RESTful API Architecture', proficiency: 3, level: 'Intermediate', verified: true },
      { name: 'Data Structures & Algorithms', proficiency: 4, level: 'Advanced', verified: true },
    ],
    Frameworks: [
      { name: 'React.js', proficiency: 3, level: 'Intermediate', verified: true },
      { name: 'FastAPI', proficiency: 3, level: 'Intermediate', verified: true },
      { name: 'Next.js', proficiency: 3, level: 'Intermediate', verified: true },
    ],
    Languages: [
      { name: 'Python', proficiency: 4, level: 'Advanced', verified: true },
      { name: 'JavaScript (ES6+)', proficiency: 4, level: 'Advanced', verified: true },
      { name: 'TypeScript', proficiency: 3, level: 'Intermediate', verified: true },
    ],
    Tools: [
      { name: 'Git & GitHub', proficiency: 4, level: 'Advanced', verified: true },
      { name: 'Docker', proficiency: 2, level: 'Beginner', verified: true },
      { name: 'PostgreSQL', proficiency: 3, level: 'Intermediate', verified: true },
    ],
    'Soft Skills': [
      { name: 'Analytical Reasoning', proficiency: 4, level: 'Advanced', verified: true },
      { name: 'Technical Documentation', proficiency: 3, level: 'Intermediate', verified: true },
    ],
  };

  const activeCategories = Object.keys(categories).length > 0 ? categories : defaultCategories;
  const categoryKeys = Object.keys(activeCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryKeys[0] || 'Technical Skills');

  const currentSkills = activeCategories[selectedCategory] || [];

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
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>Your Skill Profile</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Verified candidate competence across technical and soft capabilities
          </p>
        </div>
        <Link
          href="/skills"
          className="text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          View All Skills →
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {categoryKeys.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Proficiency List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {currentSkills.map((s) => (
          <div
            key={s.name}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {s.name}
                </span>
                {s.verified && (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>Proficiency {s.proficiency}/5</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadge(
                  s.level
                )}`}
              >
                {s.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
