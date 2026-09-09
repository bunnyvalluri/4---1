'use client';

import React from 'react';
import {
  Bot,
  Sparkles,
  Target,
  Brain,
  Route,
  FolderKanban,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { CareerContext } from '@/lib/hooks/useAssistant';

interface ChatEmptyStateProps {
  context: CareerContext | null;
  onSelectPrompt: (prompt: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  context,
  onSelectPrompt,
}) => {
  const userName = context?.user_name || 'Engineer';
  const targetCareer = context?.target_career;
  const matchScore = context?.career_match_score;
  const topGap = context?.top_skill_gaps?.[0]?.name;
  const nextMilestone = context?.roadmap?.nextMilestone;
  const activeProject = context?.active_project?.title;
  const atsScore = context?.resume_ats_score;

  const defaultPrompts = [
    'What should I prioritize on my roadmap this month?',
    'Why is my target pathway recommended for my profile?',
    'How do I bridge my critical skill gaps for technical interviews?',
    'What production capstone projects prove senior competency?',
    'How can I rewrite my resume bullets to pass strict ATS filters?',
  ];

  const prompts =
    context?.suggested_prompts && context.suggested_prompts.length > 0
      ? context.suggested_prompts
      : defaultPrompts;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col items-center text-center animate-in fade-in-50 duration-200">
      {/* Aura Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
        <Bot className="w-8 h-8" />
      </div>

      {/* Greeting */}
      <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
        Hello, I&apos;m Aura
      </h2>
      <p className="text-xs md:text-sm text-slate-600 max-w-md mt-1.5 leading-relaxed">
        Your personal AI Career Mentor. I understand your verified skills, current roadmap, active
        projects, and resume data to help you decide what to do next.
      </p>

      {/* Current Priorities Telemetry Box */}
      {(targetCareer || topGap || nextMilestone || activeProject || atsScore !== undefined) && (
        <div className="w-full mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left shadow-2xs">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Current Career Focus ({userName})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {targetCareer && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 flex items-center gap-2.5">
                <Target className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Target Pathway</p>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {targetCareer} {matchScore ? `(${matchScore}%)` : ''}
                  </p>
                </div>
              </div>
            )}

            {topGap && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Priority Skill Gap</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{topGap}</p>
                </div>
              </div>
            )}

            {nextMilestone && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 flex items-center gap-2.5">
                <Route className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Roadmap Milestone</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{nextMilestone}</p>
                </div>
              </div>
            )}

            {atsScore !== undefined && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="truncate">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Resume ATS Score</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{atsScore} / 100</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested Exploration Prompts */}
      <div className="w-full mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-left px-1">
          Suggested Exploration Prompts
        </p>
        <div className="space-y-2">
          {prompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt)}
              className="w-full p-3 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 text-left transition-all flex items-center justify-between group shadow-2xs"
            >
              <span className="text-xs md:text-sm font-medium text-slate-700 group-hover:text-blue-900 leading-snug">
                {prompt}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
