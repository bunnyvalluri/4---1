'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Sparkles,
  Send,
  Plus,
  Compass,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  BrainCircuit,
  Map,
  Target,
  ArrowRight,
  MessageSquare,
  PanelLeft,
  Trash2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Layers,
  Loader2,
} from 'lucide-react';
import { useAssistant, StructuredAction, AssistantMode } from '@/lib/hooks/useAssistant';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { ResponsiveDrawer } from '@/components/ui/ResponsiveDrawer';
import { ConfirmationModal } from '@/components/chat/ConfirmationModal';

export default function UserChatPage() {
  const router = useRouter();
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    context,
    loadingSessions,
    isStreaming,
    thinkingState,
    mode,
    setMode,
    createSession,
    deleteSession,
    sendMessage,
    executeAction,
  } = useAssistant();

  const [input, setInput] = useState('');
  const [sessionsDrawerOpen, setSessionsDrawerOpen] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const handleSend = (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isStreaming) return;
    sendMessage(textToSend);
    if (!customText) setInput('');
  };

  const handleActionClick = (action: StructuredAction) => {
    if (action.requires_confirmation) {
      setConfirmModal({
        isOpen: true,
        title: `Confirm Action: ${action.title}`,
        description: action.description || 'Would you like CareerAI to proceed with updating your career records?',
        confirmText: 'Confirm & Execute',
        isDestructive: false,
        onConfirm: async () => {
          await executeAction(action.action_type, action.entity_id, action.parameters);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    } else if (action.route) {
      const targetRoute = action.route.startsWith('/user')
        ? action.route
        : `/user${action.route.startsWith('/') ? action.route : `/${action.route}`}`;
      router.push(targetRoute);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Consultation Session',
      description: `Are you sure you want to delete "${session?.title || 'this session'}"? Message history will be permanently removed.`,
      confirmText: 'Delete Session',
      isDestructive: true,
      onConfirm: async () => {
        await deleteSession(sessionId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const targetCareer = context?.target_career || 'Target Role';
  const matchScore = context?.career_match_score;
  const verifiedSkillsCount = context?.top_skills?.length ?? 0;
  const topSkillGap = context?.top_skill_gaps?.[0]?.name;
  const roadmapMilestone = context?.roadmap?.nextMilestone;
  const roadmapProgress = context?.roadmap?.progressPercent ?? 0;
  const atsScore = context?.resume_ats_score;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[550px] w-full min-w-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* ======================================================== */}
      {/* 1. COPILOT HEADER BAR */}
      {/* ======================================================== */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-none">
                AI Career Copilot
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                <Sparkles className="h-2.5 w-2.5" />
                Live Guidance
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Your personalized career assistant grounded in real-time telemetry
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSessionsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Session History"
          >
            <PanelLeft className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sessions</span>
            <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded font-bold text-slate-700">
              {sessions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => createSession('New Consultation')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. REAL CAREER CONTEXT BANNER CARD */}
      {/* ======================================================== */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50/80 border-b border-slate-200/80 shrink-0">
        <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/60 p-2.5 sm:p-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-blue-600" />
                Career Context:
              </span>
              <span className="text-xs font-bold text-slate-900">
                {targetCareer}
                {matchScore !== undefined && (
                  <span className="ml-1 text-[11px] font-bold text-blue-600">
                    ({matchScore}% Match)
                  </span>
                )}
              </span>
            </div>

            {/* Telemetry Checklist Status Pills */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              {/* Resume */}
              <Link
                href="/user/resume"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Resume {atsScore ? `(${atsScore}/100)` : '✓'}</span>
              </Link>

              {/* Skills */}
              <Link
                href="/user/skills"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Skills ({verifiedSkillsCount} verified)</span>
              </Link>

              {/* Roadmap */}
              <Link
                href="/user/roadmap"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Roadmap ({roadmapProgress}%)</span>
              </Link>

              {/* Goals */}
              <Link
                href="/user/settings"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span>Goals ✓</span>
              </Link>
            </div>
          </div>

          {/* Quick Context Sub-indicators */}
          {(topSkillGap || roadmapMilestone) && (
            <div className="mt-2 pt-2 border-t border-blue-200/50 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
              {topSkillGap && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-700">Priority Gap:</span>
                  <span className="font-medium text-slate-800">{topSkillGap}</span>
                  <Link
                    href="/user/skills"
                    className="text-blue-600 hover:underline font-semibold ml-0.5"
                  >
                    View
                  </Link>
                </div>
              )}
              {roadmapMilestone && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-blue-700">Next Milestone:</span>
                  <span className="font-medium text-slate-800">{roadmapMilestone}</span>
                  <Link
                    href="/user/roadmap"
                    className="text-blue-600 hover:underline font-semibold ml-0.5"
                  >
                    Roadmap
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CONVERSATION VIEW (SCROLLABLE) */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto min-w-0">
        <ChatWindow
          messages={messages}
          context={context}
          thinkingState={thinkingState}
          isStreaming={isStreaming}
          onSelectPrompt={(prompt) => handleSend(prompt)}
          onActionClick={handleActionClick}
          onRetryMessage={() => {
            const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
            if (lastUserMessage) {
              sendMessage(lastUserMessage.content);
            }
          }}
        />
      </div>

      {/* ======================================================== */}
      {/* 4. MESSAGE COMPOSER BAR */}
      {/* ======================================================== */}
      <div className="shrink-0 border-t border-slate-200/90 bg-white">
        <ChatComposer
          input={input}
          onChange={setInput}
          onSend={(text?: string) => handleSend(text)}
          isStreaming={isStreaming}
          mode={mode}
          onResetMode={() => setMode('standard')}
        />
      </div>

      {/* ======================================================== */}
      {/* 5. CONSULTATION SESSIONS DRAWER */}
      {/* ======================================================== */}
      <ResponsiveDrawer
        isOpen={sessionsDrawerOpen}
        onClose={() => setSessionsDrawerOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span>Consultation History</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={() => {
              createSession('New Consultation');
              setSessionsDrawerOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Start New Consultation</span>
          </button>

          <div className="space-y-1.5">
            <div className="px-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Past Sessions ({sessions.length})
            </div>

            {loadingSessions ? (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No past consultations found.
              </p>
            ) : (
              sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    className={`group flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setSessionsDrawerOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <MessageSquare
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{s.title || 'Career Consultation'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-opacity"
                      title="Delete Session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ResponsiveDrawer>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
