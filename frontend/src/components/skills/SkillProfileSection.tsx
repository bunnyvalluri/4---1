'use client';

import React from 'react';
import {
  Search,
  SlidersHorizontal,
  Award,
  ShieldCheck,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { SkillItem } from '@/lib/hooks/useSkillIntelligence';

interface SkillProfileSectionProps {
  skills: SkillItem[];
  allCategories: Record<string, SkillItem[]>;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onSelectSkill: (skill: SkillItem) => void;
  onEditSkill: (skill: SkillItem) => void;
  onDeleteSkill: (skillId: string) => void;
  onAddSkillClick: () => void;
}

export function SkillProfileSection({
  skills,
  allCategories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectSkill,
  onEditSkill,
  onDeleteSkill,
  onAddSkillClick,
}: SkillProfileSectionProps) {
  const categoryKeys = ['All', 'Technical', 'Languages', 'Frameworks', 'Databases', 'Cloud', 'Tools', 'Soft Skills'];

  const getProficiencyBars = (level: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 w-6 rounded-full transition-all ${
              step <= level
                ? level >= 4
                  ? 'bg-purple-600'
                  : level === 3
                  ? 'bg-emerald-500'
                  : level === 2
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'advanced':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <span>YOUR SKILL PROFILE</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verified candidate competence, verified evidence chains, and active proficiency levels.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900 font-extrabold">{skills.length}</span> skills
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {categoryKeys.map((cat) => {
          const count =
            cat === 'All'
              ? Object.values(allCategories).reduce((acc, curr) => acc + curr.length, 0)
              : (allCategories[cat] || []).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search skills, aliases, or sources..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="name">Skill Name (A-Z)</option>
            <option value="proficiency">Proficiency (High-Low)</option>
            <option value="learning">Learning In-Progress</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <Layers className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No skills found in this category</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or add a new skill to this category.
          </p>
          <button
            type="button"
            onClick={onAddSkillClick}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
          >
            Add Skill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {skills.map((skill) => {
            return (
              <div
                key={skill.id || skill.name}
                onClick={() => onSelectSkill(skill)}
                className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between relative"
              >
                <div>
                  {/* Top row: Name & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {skill.name}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {skill.category}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getLevelBadge(
                        skill.level
                      )}`}
                    >
                      {skill.level}
                    </span>
                  </div>

                  {/* Proficiency Bars */}
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Proficiency
                    </span>
                    {getProficiencyBars(skill.proficiency)}
                  </div>

                  {/* Evidence Sources */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-medium mr-1">Evidence:</span>
                    {skill.evidence_sources && skill.evidence_sources.length > 0 ? (
                      skill.evidence_sources.map((src, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                          <span>{src}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Self-Reported</span>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Actions & Status */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{skill.learning_status}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSkill(skill);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Edit skill"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove ${skill.name} from your profile?`)) {
                          onDeleteSkill(skill.id || skill.name);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
