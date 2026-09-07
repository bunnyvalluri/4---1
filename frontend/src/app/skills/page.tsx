'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowRight,
  BookOpen,
  Map,
  Compass,
  TrendingUp,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function SkillGapsPage() {
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [gapsRes, profRes] = await Promise.all([
          fetch('/api/skill-gaps'),
          fetch('/api/profile'),
        ]);

        const gapsJson = await gapsRes.json();
        const profJson = await profRes.json();

        if (profJson?.user) setUserProfile(profJson.user);
        if (gapsJson?.skillGaps) setSkillGaps(gapsJson.skillGaps);
      } catch (err) {
        console.error('Failed to load skill gaps:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredGaps = skillGaps.filter((item) => {
    if (filterPriority === 'ALL') return true;
    if (filterPriority === 'HIGH') return item.priority <= 2 || item.gapSeverity === 'Critical' || item.gapSeverity === 'High';
    if (filterPriority === 'MEDIUM') return item.priority === 3 || item.gapSeverity === 'Moderate';
    if (filterPriority === 'LOW') return item.priority >= 4 || item.gapSeverity === 'Low';
    return true;
  });

  const criticalCount = skillGaps.filter(
    (g) => g.gapSeverity === 'Critical' || g.priority === 1
  ).length;
  const highCount = skillGaps.filter(
    (g) => g.gapSeverity === 'High' || g.priority === 2
  ).length;

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
                  <BarChart2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Dynamic Skill Gap Matrix</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Skill Gap Telemetry & Milestones
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Compares verified competency against market requirements. Prioritize high-ROI learning items to maximize career match fidelity.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70 shrink-0">
                {[
                  { key: 'ALL', label: 'All', count: skillGaps.length },
                  { key: 'HIGH', label: 'Critical', count: criticalCount + highCount },
                  { key: 'MEDIUM', label: 'Moderate', count: skillGaps.length - (criticalCount + highCount) },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilterPriority(f.key)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      filterPriority === f.key
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="ml-1.5 text-[10px] text-slate-400">({f.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick KPI Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600 font-bold">
                  {criticalCount}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Critical Skill Gaps</div>
                  <div className="text-[11px] text-slate-500">Must bridge for candidate shortlisting</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">
                  {skillGaps.length}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Total Telemetry Items</div>
                  <div className="text-[11px] text-slate-500">Tracked against target roles</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">
                  ~6 wk
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Estimated Velocity</div>
                  <div className="text-[11px] text-slate-500">Average bridging duration</div>
                </div>
              </div>
            </div>
          </div>

          {/* Gaps List */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200" />
              ))}
            </div>
          ) : filteredGaps.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No skill gaps under this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate career recommendations to synchronize target benchmarks and discover skill opportunities.
              </p>
              <Link
                href="/recommendations"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                View Career Matches
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGaps.map((item) => {
                const current = item.currentProficiency || 0;
                const required = item.requiredProficiency || 3;
                const gap = Math.max(0, required - current);

                const isCritical = item.gapSeverity === 'Critical' || item.priority === 1;
                const isHigh = item.gapSeverity === 'High' || item.priority === 2;

                const badgeStyle = isCritical
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isHigh
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900 break-words">{item.skill?.name}</h3>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${badgeStyle}`}>
                            {item.gapSeverity || 'Moderate'} Severity
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            Priority #{item.priority || 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 break-words">
                          Required for: <strong className="text-slate-800">{item.career?.title || 'Target Pathway'}</strong>
                        </p>
                      </div>

                      {/* Level Badges */}
                      <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200/70 text-xs w-full sm:w-auto shrink-0">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Current</span>
                          <span className="font-extrabold text-slate-900">Lvl {current} / 5</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Required</span>
                          <span className="font-extrabold text-blue-600">Lvl {required} / 5</span>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Gap</span>
                          <span className={`font-extrabold ${gap > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {gap > 0 ? `-${gap} Lvl` : 'Filled'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Segmented Level Comparison Visualizer */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Proficiency Milestone Progression</span>
                        <span>
                          {current >= required ? 'Benchmark Satisfied' : `Needs +${gap} proficiency steps`}
                        </span>
                      </div>

                      {/* 5-Segment Level Bar */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {[1, 2, 3, 4, 5].map((lvl) => {
                          const hasCurrent = current >= lvl;
                          const hasRequired = required >= lvl;

                          let bgClass = 'bg-slate-100 text-slate-400';
                          if (hasCurrent) {
                            bgClass = 'bg-blue-600 text-white shadow-2xs';
                          } else if (hasRequired) {
                            bgClass = 'bg-amber-100 text-amber-800 border border-dashed border-amber-300';
                          }

                          return (
                            <div
                              key={lvl}
                              className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${bgClass}`}
                            >
                              Lvl {lvl} {hasCurrent ? '✓' : hasRequired ? 'Target' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actionable Learning Resource Card */}
                    {item.suggestedResource && (
                      <div className="rounded-2xl bg-slate-50/80 p-3 text-xs text-slate-600 flex items-center justify-between gap-3 border border-slate-200/60">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="truncate">{item.suggestedResource}</span>
                        </div>
                        <Link
                          href="/roadmap"
                          className="shrink-0 text-[11px] font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          <span>Add to Roadmap</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
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
