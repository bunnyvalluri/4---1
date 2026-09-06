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
    <div className="min-h-screen bg-white flex">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl border shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                <FolderGit2 className="h-4 w-4" />
                <span>CAPSTONE & PORTFOLIO BLUEPRINTS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Recommended Portfolio Projects
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Curated real-world projects calibrated to prove production competency and bridge skill gaps.
              </p>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
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

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <FolderGit2 className="mx-auto h-8 w-8 text-slate-400" />
              <div className="text-sm font-bold text-slate-900">No projects under this filter</div>
              <div className="text-xs text-slate-500">Switch filter to view all available capstones.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((proj) => {
                const isAdded = addedIds.includes(proj.id);
                return (
                  <div
                    key={proj.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 truncate max-w-[200px]">
                          {proj.career?.title || 'General Engineering'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {proj.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{proj.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.problemStatement}</p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(proj.techStack || []).map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata & Add to Roadmap */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {proj.estimatedDuration || '3-4 weeks'}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{proj.portfolioValue || 'High Value'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToRoadmap(proj.id)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isAdded
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Added
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
      </div>
    </div>
  );
}
