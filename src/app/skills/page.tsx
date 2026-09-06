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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar Navigation */}
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      {/* Main Content */}
      <div className="flex-1 bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 bg-white p-6 rounded-2xl border shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                <BarChart2 className="h-4 w-4" />
                <span>DYNAMIC SKILL GAP ANALYSIS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Skill Gap Telemetry</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Compare your current verified level against target requirements and prioritize high-ROI learning milestones.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterPriority === p
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Gaps List */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : filteredGaps.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No skill gaps under this filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate recommendations on the matches page to synchronize new skill requirements.
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
                const currentPercent = Math.min(100, Math.round((current / 5) * 100));
                const requiredPercent = Math.min(100, Math.round((required / 5) * 100));

                const isCritical = item.gapSeverity === 'Critical' || item.priority === 1;
                const isHigh = item.gapSeverity === 'High' || item.priority === 2;

                const badgeColor = isCritical
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : isHigh
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{item.skill?.name}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            {item.gapSeverity} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Career Target: <strong className="text-slate-700">{item.career?.title}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-500">Current: </span>
                          <span className="text-slate-900 font-bold">{current} / 5</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Required: </span>
                          <span className="text-blue-600 font-bold">{required} / 5</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Comparison Bars */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Current Competency ({currentPercent}%)</span>
                        <span>Target Benchmark ({requiredPercent}%)</span>
                      </div>
                      <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        {/* Target Marker */}
                        <div
                          className="absolute top-0 bottom-0 bg-blue-100/80 rounded-full"
                          style={{ width: `${requiredPercent}%` }}
                        />
                        {/* Current Level */}
                        <div
                          className={`absolute top-0 bottom-0 rounded-full transition-all duration-300 ${
                            currentPercent >= requiredPercent ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${currentPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Learning Resource */}
                    {item.suggestedResource && (
                      <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                        <BookOpen className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{item.suggestedResource}</span>
                      </div>
                    )}
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
