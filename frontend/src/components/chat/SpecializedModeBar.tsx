'use client';

import React from 'react';
import { Sparkles, Award, BookOpen, Zap, FolderKanban, FileText, Check } from 'lucide-react';
import { AssistantMode } from '@/lib/hooks/useAssistant';

interface SpecializedModeBarProps {
  currentMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

export const SpecializedModeBar: React.FC<SpecializedModeBarProps> = ({
  currentMode,
  onModeChange,
}) => {
  const modes: Array<{ id: AssistantMode; label: string; icon: any; color: string }> = [
    { id: 'standard', label: 'Career Copilot', icon: Sparkles, color: 'text-blue-600' },
    { id: 'interview', label: 'Interview Coach', icon: Award, color: 'text-indigo-600' },
    { id: 'learning', label: 'Learning Mode', icon: BookOpen, color: 'text-amber-600' },
    { id: 'quiz', label: 'Quiz Mode', icon: Zap, color: 'text-emerald-600' },
    { id: 'project', label: 'Project Mentor', icon: FolderKanban, color: 'text-cyan-600' },
    { id: 'resume', label: 'Resume Coach', icon: FileText, color: 'text-purple-600' },
  ];

  return (
    <div className="px-4 py-2 bg-white/90 backdrop-blur-xs border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1 shrink-0">
        Mode:
      </span>
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;

        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              isActive
                ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${m.color}`} />
            <span>{m.label}</span>
            {isActive && <Check className="w-3 h-3 text-blue-600 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
};
