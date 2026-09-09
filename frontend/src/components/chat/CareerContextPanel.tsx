'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  Target,
  Brain,
  Route,
  FolderKanban,
  FileText,
  ChevronRight,
  ExternalLink,
  Sparkles,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { CareerContext, AssistantMode } from '@/lib/hooks/useAssistant';

interface CareerContextPanelProps {
  context: CareerContext | null;
  onSelectPrompt: (prompt: string) => void;
  onSetMode: (mode: AssistantMode) => void;
}

export const CareerContextPanel: React.FC<CareerContextPanelProps> = ({
  context,
  onSelectPrompt,
  onSetMode,
}) => {
  const targetCareer = context?.target_career || 'Not selected';
  const matchScore = context?.career_match_score;
  const topGap = context?.top_skill_gaps?.[0];
  const roadmap = context?.roadmap;
  const activeProj = context?.active_project;
  const atsScore = context?.resume_ats_score;

  return (
    <aside className="w-full h-full flex flex-col bg-slate-50/50 border-l border-slate-200 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Career Context
            </h2>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Realtime
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Synchronized with your verified profile telemetry.
        </p>
      </div>

      {/* Cards Feed */}
      <div className="p-4 space-y-3 flex-1">
        {/* 1. Target Career Card */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" /> Target Pathway
            </span>
            <Link
              href="/recommendations"
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="View Career Matches"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs font-bold text-slate-800 truncate">{targetCareer}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">Career Match Score</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                matchScore !== undefined && matchScore >= 75
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {matchScore !== undefined ? `${matchScore}%` : 'Pending'}
            </span>
          </div>
        </div>

        {/* 2. Top Skill Gap Card */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-amber-500" /> Top Priority Skill Gap
            </span>
            <Link
              href="/skills"
              className="text-slate-400 hover:text-amber-600 transition-colors"
              title="View Skills Matrix"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          {topGap ? (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 truncate">{topGap.name}</p>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                  {topGap.severity}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Required Level</span>
                <span className="font-semibold text-slate-700">
                  {topGap.currentProficiency} / {topGap.requiredProficiency}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic mt-1">No critical skill gaps recorded</p>
          )}
        </div>

        {/* 3. Learning Roadmap Progress Card */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-emerald-600" /> Active Roadmap
            </span>
            <Link
              href="/roadmap"
              className="text-slate-400 hover:text-emerald-600 transition-colors"
              title="View Learning Roadmap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          {roadmap ? (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="truncate pr-2">{roadmap.title}</span>
                <span className="text-emerald-600 shrink-0">{roadmap.progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(roadmap.progressPercent, 100)}%` }}
                />
              </div>
              {roadmap.nextMilestone && (
                <p className="text-[11px] text-slate-500 mt-2 truncate">
                  Next: <span className="font-medium text-slate-700">{roadmap.nextMilestone}</span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic mt-1">No active roadmap generated</p>
          )}
        </div>

        {/* 4. Active Capstone Project Card */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-600" /> Active Project
            </span>
            <Link
              href="/projects"
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="View Projects"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          {activeProj ? (
            <div>
              <p className="text-xs font-bold text-slate-800 truncate">{activeProj.title}</p>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                Milestone: <span className="font-medium text-slate-700">{activeProj.currentMilestone}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic mt-1">No active capstone in progress</p>
          )}
        </div>

        {/* 5. Resume ATS Benchmark Card */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> Resume ATS Score
            </span>
            <Link
              href="/resume"
              className="text-slate-400 hover:text-purple-600 transition-colors"
              title="View Resume Scanner"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-bold text-slate-800">
              {atsScore !== undefined ? `${atsScore} / 100` : 'Not scanned'}
            </span>
            {atsScore !== undefined && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  atsScore >= 80
                    ? 'bg-emerald-50 text-emerald-700'
                    : atsScore >= 60
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {atsScore >= 80 ? 'Strong' : atsScore >= 60 ? 'Moderate' : 'Needs Review'}
              </span>
            )}
          </div>
        </div>

        {/* Quick Coaching Actions */}
        <div className="pt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Quick Coaching Modes
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                onSetMode('interview');
                onSelectPrompt('Start a technical interview practice session for my target role.');
              }}
              className="p-2 text-left bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Interview Coach</span>
            </button>

            <button
              onClick={() => {
                onSetMode('learning');
                onSelectPrompt(
                  topGap
                    ? `Teach me the architectural fundamentals of ${topGap.name}.`
                    : 'Teach me modern distributed system architecture.'
                );
              }}
              className="p-2 text-left bg-white border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50/50 transition-all text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Learning Mode</span>
            </button>

            <button
              onClick={() => {
                onSetMode('quiz');
                onSelectPrompt('Give me a 3-question diagnostic quiz on my top skill gaps.');
              }}
              className="p-2 text-left bg-white border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Quiz Mode</span>
            </button>

            <button
              onClick={() => {
                onSetMode('resume');
                onSelectPrompt('Review my resume ATS score and recommend high-impact bullet improvements.');
              }}
              className="p-2 text-left bg-white border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate">Resume Coach</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
