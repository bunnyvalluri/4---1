'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Map,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  ArrowRight,
  BookOpen,
  Edit3,
  Save,
  Clock,
  Layers,
  Award,
  ExternalLink,
  FolderGit2,
  Check,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(1);
  const [editingNotes, setEditingNotes] = useState<{ [itemId: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [savedNoteSuccess, setSavedNoteSuccess] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchRoadmap = async () => {
    try {
      const [roadRes, profRes] = await Promise.all([
        fetch('/api/roadmap'),
        fetch('/api/profile'),
      ]);
      const data = await roadRes.json();
      const profData = await profRes.json();

      if (profData?.user) setUserProfile(profData.user);
      if (data?.roadmap) {
        setRoadmap(data.roadmap);
        const notesObj: { [id: string]: string } = {};
        data.roadmap.items?.forEach((item: any) => {
          notesObj[item.id] = item.notes || '';
        });
        setEditingNotes(notesObj);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (itemId: string, taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/roadmap/task', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          taskId,
          done: !currentStatus,
        }),
      });

      if (res.ok) {
        fetchRoadmap();
      }
    } catch (err) {
      console.error('Task toggle error:', err);
    }
  };

  const handleSaveNotes = async (itemId: string) => {
    setSavingNoteId(itemId);
    try {
      await fetch('/api/roadmap/task', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          notes: editingNotes[itemId] || '',
        }),
      });
      setSavedNoteSuccess(itemId);
      setTimeout(() => setSavedNoteSuccess(null), 2500);
      fetchRoadmap();
    } catch (err) {
      console.error('Notes save error:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200/80 rounded-3xl" />
        <div className="h-96 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
        <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-5 max-w-md bg-white p-10 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Map className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900">No active roadmap generated</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose your target career path from your personalized matches to synthesize an interactive 6-month curriculum.
              </p>
            </div>
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5"
            >
              <span>Explore Career Matches</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = roadmap.items || [];
  const currentMonthItem = items.find((i: any) => i.month === activeMonth) || items[0];
  const completedItemsCount = items.filter((i: any) => i.isCompleted).length;
  const progressPercent = items.length > 0 ? Math.round((completedItemsCount / items.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <main className="flex-1 min-w-0 py-4 sm:py-8 px-3 sm:px-6 lg:px-10 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 sm:p-8 shadow-xs space-y-5 sm:space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                  <Map className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Personalized 6-Month Curriculum</span>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
                  Target: {roadmap.career?.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 break-words">
                  Calibrated to bridge your highest-priority skill gaps and prepare you for production tech hiring bars.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">{progressPercent}%</div>
                <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">Overall Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between text-xs font-semibold text-slate-600 gap-1">
                <span>Milestones Completed: {completedItemsCount} of {items.length} Months</span>
                <span className="text-blue-600 font-bold">{progressPercent}% Complete</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Month Timeline Navigation */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
              {items.map((item: any) => {
                const isActive = item.month === activeMonth;
                const isDone = item.isCompleted;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMonth(item.month)}
                    className={`p-2.5 sm:p-3.5 rounded-2xl border text-center transition-all min-h-[48px] flex flex-col justify-center ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : isDone
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-black">Month {item.month}</div>
                    <div className="text-[10px] truncate mt-0.5">
                      {isDone ? '✓ Done' : item.title?.split(':')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Month Deep-Dive */}
          {currentMonthItem && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                    Milestone Month {currentMonthItem.month} of 6
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {currentMonthItem.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentMonthItem.description}
                  </p>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 self-start sm:self-center border ${
                    currentMonthItem.isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {currentMonthItem.isCompleted ? '✓ Month Verified' : 'In Progress'}
                </span>
              </div>

              {/* Target Technologies */}
              {currentMonthItem.skills && currentMonthItem.skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Core Technologies Covered
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentMonthItem.skills.map((s: string) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Tasks Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Interactive Milestone Checklist (Click task to toggle)
                </h4>

                <div className="space-y-2.5">
                  {((currentMonthItem.tasks as any[]) || []).map((t: any) => {
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(currentMonthItem.id, t.id, t.done)}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          t.done
                            ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-800'
                            : 'bg-slate-50/50 border-slate-200 hover:border-blue-300 hover:bg-white text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {t.done ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400 shrink-0" />
                          )}
                          <span className={`text-xs sm:text-sm font-semibold ${t.done ? 'line-through text-slate-500' : ''}`}>
                            {t.title}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            t.done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {t.done ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Capstone Project */}
              {currentMonthItem.milestoneProject && (
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <FolderGit2 className="h-4 w-4 text-indigo-600" />
                    <span>Month {currentMonthItem.month} Portfolio Deliverable:</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {currentMonthItem.milestoneProject}
                  </h4>
                  <p className="text-xs text-slate-600">
                    Implement this deliverable to provide verifiable GitHub proof of competency for recruiters.
                  </p>
                </div>
              )}

              {/* Curated Resources */}
              {currentMonthItem.resources && currentMonthItem.resources.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Curated Learning Resources
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentMonthItem.resources.map((res: any, rIdx: number) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{res.title}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                          {res.type || 'Course'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Learning Notes Field */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Personal Notes & Journal (Month {currentMonthItem.month})</span>
                  </label>
                  {savedNoteSuccess === currentMonthItem.id && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Saved
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={editingNotes[currentMonthItem.id] || ''}
                  onChange={(e) =>
                    setEditingNotes({
                      ...editingNotes,
                      [currentMonthItem.id]: e.target.value,
                    })
                  }
                  placeholder="Note key insights, bugs solved, or portfolio repos built this month..."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={savingNoteId === currentMonthItem.id}
                    onClick={() => handleSaveNotes(currentMonthItem.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-900 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingNoteId === currentMonthItem.id ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
