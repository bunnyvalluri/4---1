'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Edit2,
  Archive,
  Check,
  X,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { AssistantSession } from '@/lib/hooks/useAssistant';

interface SessionSidebarProps {
  sessions: AssistantSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onArchiveSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onArchiveSession,
  onDeleteSession,
  searchQuery,
  onSearchChange,
  loading,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Group sessions by relative date
  const now = new Date();
  const todaySessions: AssistantSession[] = [];
  const yesterdaySessions: AssistantSession[] = [];
  const weekSessions: AssistantSession[] = [];
  const olderSessions: AssistantSession[] = [];

  sessions.forEach((s) => {
    const rawDate = s.updated_at || s.created_at;
    if (!rawDate) {
      olderSessions.push(s);
      return;
    }
    const d = new Date(rawDate);
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24 && now.getDate() === d.getDate()) {
      todaySessions.push(s);
    } else if (diffHours < 48) {
      yesterdaySessions.push(s);
    } else if (diffHours < 24 * 7) {
      weekSessions.push(s);
    } else {
      olderSessions.push(s);
    }
  });

  const startEditing = (s: AssistantSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderSessionItem = (s: AssistantSession) => {
    const isActive = s.id === activeSessionId;
    const isEditing = editingId === s.id;

    return (
      <div
        key={s.id}
        onClick={() => onSelectSession(s.id)}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-left transition-all duration-150 ${
          isActive
            ? 'bg-blue-50 text-blue-900 border border-blue-200/80 font-medium'
            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
          <MessageSquare
            className={`w-4 h-4 shrink-0 ${
              isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          {isEditing ? (
            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(s.id, e);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="w-full text-xs px-2 py-1 bg-white border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={(e) => handleSaveRename(s.id, e)}
                className="p-1 hover:bg-blue-100 text-blue-600 rounded"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancelRename}
                className="p-1 hover:bg-slate-200 text-slate-500 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="truncate flex-1">
              <p className="text-xs truncate">{s.title}</p>
              {s.last_message_at && (
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {new Date(s.last_message_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Hover Actions */}
        {!isEditing && (
          <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => startEditing(s, e)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchiveSession(s.id);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors"
              title="Archive"
            >
              <Archive className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(s.id);
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-white/80 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full h-full flex flex-col bg-slate-50/50 border-r border-slate-200 select-none">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Consultation Sessions
          </h2>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-full">
            {sessions.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search consultations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* New Session Button */}
        <button
          onClick={onNewSession}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Consultation
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {searchQuery ? 'No sessions match your search.' : 'No consultation sessions yet.'}
          </div>
        ) : (
          <>
            {todaySessions.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Today
                </p>
                <div className="space-y-1">{todaySessions.map(renderSessionItem)}</div>
              </div>
            )}

            {yesterdaySessions.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Yesterday
                </p>
                <div className="space-y-1">{yesterdaySessions.map(renderSessionItem)}</div>
              </div>
            )}

            {weekSessions.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Previous 7 Days
                </p>
                <div className="space-y-1">{weekSessions.map(renderSessionItem)}</div>
              </div>
            )}

            {olderSessions.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  Older
                </p>
                <div className="space-y-1">{olderSessions.map(renderSessionItem)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
