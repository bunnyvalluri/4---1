'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Check,
  Zap,
  Filter,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, profRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/profile'),
        ]);

        const projData = await projRes.json();
        const profData = await profRes.json();

        if (profData?.user) setUserProfile(profData.user);
        if (projData?.projects) setProjects(projData.projects);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleAddToRoadmap = (projectId: string) => {
    setAddedIds((prev) => [...prev, projectId]);
  };

  const filteredProjects = projects.filter((p) => {
    if (selectedDifficulty === 'ALL') return true;
    return p.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-10 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                  <FolderGit2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Production Portfolio Blueprints</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Curated Portfolio Projects
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Calibrated to prove production competence and bridge verified skill gaps with real GitHub deliverables.
                </p>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 shrink-0">
                {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-white rounded-3xl border border-slate-200" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FolderGit2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No projects under this filter</h3>
              <p className="text-xs text-slate-500">Switch filter to view all available blueprints.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((proj) => {
                const isAdded = addedIds.includes(proj.id);
                const diffColor =
                  proj.difficulty === 'Advanced'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : proj.difficulty === 'Intermediate'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <div
                    key={proj.id}
                    className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-blue-600 truncate max-w-[200px]">
                          {proj.career?.title || 'General Engineering'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${diffColor}`}>
                          {proj.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {proj.problemStatement}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(proj.techStack || []).map((t: string) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata & Add Action */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {proj.estimatedDuration || '3-4 weeks'}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">{proj.portfolioValue || 'High ROI'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToRoadmap(proj.id)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" /> Add to Roadmap
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
