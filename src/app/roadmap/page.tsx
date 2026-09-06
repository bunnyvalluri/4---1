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
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(1);
  const [editingNotes, setEditingNotes] = useState<{ [itemId: string]: string }>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
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
        // Optimistic / clean reload
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
      fetchRoadmap();
    } catch (err) {
      console.error('Notes save error:', err);
    } finally {
      setSavingNoteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-72 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-white flex">
        <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />
        <div className="flex-1 bg-slate-50/50 flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Map className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No active roadmap generated</h2>
            <p className="text-sm text-slate-600">
              Choose your target career path to automatically synthesize an interactive 6-month curriculum.
            </p>
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
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
    <div className="min-h-screen bg-white flex">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>ACTIONABLE 6-MONTH CURRICULUM</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Learning Roadmap: {roadmap.career?.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Personalized to bridge your highest-priority skill gaps and prepare you for production hiring loops.
                </p>
              </div>

              <div className="text-right shrink-0 bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <div className="text-2xl font-extrabold text-blue-600">{progressPercent}%</div>
                <div className="text-[10px] uppercase font-bold text-blue-800">Overall Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Milestones Completed: {completedItemsCount} of {items.length}</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Month Timeline Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
              {items.map((item: any) => {
                const isActive = item.month === activeMonth;
                const isDone = item.isCompleted;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMonth(item.month)}
                    className={`p-3 rounded-xl border text-center transition-colors ${
                      isActive
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : isDone
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">Month {item.month}</div>
                    <div className="text-[10px] truncate mt-0.5">
                      {isDone ? '✓ Completed' : item.title.split(':')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Month Deep-Dive */}
          {currentMonthItem && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Milestone Month {currentMonthItem.month} of 6
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{currentMonthItem.title}</h2>
                  <p className="text-sm text-slate-600 mt-1">{currentMonthItem.description}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start sm:self-center ${
                    currentMonthItem.isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {currentMonthItem.isCompleted ? '✓ Month Completed' : 'In Progress'}
                </span>
              </div>

              {/* Target Technologies */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Target Competencies Covered
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentMonthItem.skills?.map((s: string) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Tasks Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Interactive Milestone Checklist (Click to Toggle)
                </h4>

                <div className="space-y-2">
                  {((currentMonthItem.tasks as any[]) || []).map((t: any) => {
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(currentMonthItem.id, t.id, t.done)}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                          t.done
                            ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-900'
                        }`}
                      >
                        {t.done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400 shrink-0" />
                        )}
                        <span className={`text-sm ${t.done ? 'line-through text-slate-500 font-normal' : 'font-medium'}`}>
                          {t.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes & Learning Resources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Notes Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5" /> Personal Notes & Journal
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSaveNotes(currentMonthItem.id)}
                      disabled={savingNoteId === currentMonthItem.id}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Save className="h-3 w-3" />
                      <span>{savingNoteId === currentMonthItem.id ? 'Saving...' : 'Save Notes'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={editingNotes[currentMonthItem.id] || ''}
                    onChange={(e) =>
                      setEditingNotes({
                        ...editingNotes,
                        [currentMonthItem.id]: e.target.value,
                      })
                    }
                    placeholder="Log your notes, code snippets, or key architectural patterns mastered..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {/* Recommended Study Workflows */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Recommended Production Workflows
                  </h4>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs text-slate-600">
                    <div>• Build minimum 2 production-grade git commits demonstrating this month&apos;s patterns.</div>
                    <div>• Pair unit tests and automated CI testing with every feature.</div>
                    <div>• Verify documentation and deploy a live demonstration link for your portfolio.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
