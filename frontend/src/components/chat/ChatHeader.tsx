'use client';

import React from 'react';
import { Bot, Sparkles, Plus, Archive, PanelLeft, PanelRight, Wifi, WifiOff } from 'lucide-react';

interface ChatHeaderProps {
  userName?: string;
  connectionStatus: 'online' | 'connecting' | 'offline';
  onNewConsultation: () => void;
  onArchiveSession?: () => void;
  onToggleSidebar?: () => void;
  onToggleContext?: () => void;
  hasActiveSession: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName = 'Candidate',
  connectionStatus,
  onNewConsultation,
  onArchiveSession,
  onToggleSidebar,
  onToggleContext,
  hasActiveSession,
}) => {
  return (
    <header className="h-16 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between z-10 shrink-0">
      {/* Left: Mobile Drawer Trigger + Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Toggle Sessions History"
            aria-label="Toggle Sessions History"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">Aura Career Mentor</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Copilot
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'online'
                      ? 'bg-emerald-500'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="capitalize">{connectionStatus}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="truncate max-w-[140px] md:max-w-[200px] text-slate-600 font-medium">
                {userName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {hasActiveSession && onArchiveSession && (
          <button
            onClick={onArchiveSession}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Archive current consultation"
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </button>
        )}

        <button
          onClick={onNewConsultation}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Consultation</span>
          <span className="sm:hidden">New</span>
        </button>

        {onToggleContext && (
          <button
            onClick={onToggleContext}
            className="xl:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors ml-1"
            title="Toggle Career Context"
            aria-label="Toggle Career Context"
          >
            <PanelRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
};
