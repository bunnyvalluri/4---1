'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { SkillMatrixRow } from '@/lib/hooks/useSkillIntelligence';

interface CareerSkillMatrixProps {
  matrix: SkillMatrixRow[];
  targetCareerTitle?: string;
  onActionClick?: (skillName: string) => void;
}

export function CareerSkillMatrix({
  matrix = [],
  targetCareerTitle = 'Full Stack Developer',
  onActionClick,
}: CareerSkillMatrixProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black">
            <AlertTriangle className="h-3 w-3 text-rose-600" />
            <span>Critical</span>
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold">
            <AlertCircle className="h-3 w-3 text-amber-600" />
            <span>High</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            <span>Medium</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Ready</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ready':
        return 'bg-emerald-100/70 text-emerald-800';
      case 'Critical':
        return 'bg-rose-100/70 text-rose-800';
      case 'Improve':
        return 'bg-amber-100/70 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>CAREER SKILL MATRIX</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Deterministic side-by-side gap telemetry evaluated against{' '}
            <span className="font-bold text-slate-800">{targetCareerTitle}</span> standards.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500">
          <span className="text-blue-700 font-extrabold">{matrix.length}</span> competency benchmarks
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile < md) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Skill</th>
              <th className="py-3.5 px-4">Your Level</th>
              <th className="py-3.5 px-4">Required</th>
              <th className="py-3.5 px-4">Gap</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {matrix.map((row) => (
              <tr
                key={row.skill}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="py-3.5 px-4">
                  <div className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {row.skill}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">{row.category}</div>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`font-semibold ${
                      row.user_proficiency >= row.required_proficiency
                        ? 'text-emerald-700'
                        : row.user_proficiency > 0
                        ? 'text-slate-800'
                        : 'text-slate-400 italic'
                    }`}
                  >
                    {row.user_level}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-semibold text-slate-700">{row.required_level}</td>

                <td className="py-3.5 px-4">
                  {row.gap === 0 ? (
                    <span className="text-emerald-600 font-bold">None</span>
                  ) : (
                    <span
                      className={`font-bold ${
                        row.gap_severity === 'Critical'
                          ? 'text-rose-600'
                          : row.gap_severity === 'High'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {row.gap_severity} ({row.gap})
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-4">{getPriorityBadge(row.priority)}</td>

                <td className="py-3.5 px-4">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${getStatusBadge(
                      row.status
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  {row.gap > 0 ? (
                    <Link
                      href="/roadmap"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <span>{row.action_label}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Ready</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View (Shown only on mobile < md) */}
      <div className="block md:hidden space-y-3">
        {matrix.map((row) => (
          <div
            key={row.skill}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{row.skill}</h3>
                <span className="text-[10px] text-slate-400 font-semibold">{row.category}</span>
              </div>
              {getPriorityBadge(row.priority)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Your Level
                </span>
                <span className="font-bold text-slate-800">{row.user_level}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Required
                </span>
                <span className="font-bold text-slate-800">{row.required_level}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Gap
                </span>
                <span
                  className={`font-bold ${
                    row.gap === 0
                      ? 'text-emerald-600'
                      : row.gap_severity === 'Critical'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {row.gap === 0 ? 'None' : `${row.gap_severity} (${row.gap})`}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${getStatusBadge(row.status)}`}>
                  {row.status}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              {row.gap > 0 ? (
                <Link
                  href="/roadmap"
                  className="w-full py-2 text-center rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>{row.action_label}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <div className="w-full py-1.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl">
                  ✓ Verified for Target Role
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
