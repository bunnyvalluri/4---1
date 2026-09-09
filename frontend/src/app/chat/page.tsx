'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ResponsiveDrawer } from '@/components/ui/ResponsiveDrawer';
import { useAssistant, StructuredAction, AssistantMode } from '@/lib/hooks/useAssistant';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { SessionSidebar } from '@/components/chat/SessionSidebar';
import { CareerContextPanel } from '@/components/chat/CareerContextPanel';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { SpecializedModeBar } from '@/components/chat/SpecializedModeBar';
import { ConfirmationModal } from '@/components/chat/ConfirmationModal';

export default function ChatPage() {
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
    searchQuery,
    setSearchQuery,
    mode,
    setMode,
    connectionStatus,
    createSession,
    renameSession,
    archiveSession,
    deleteSession,
    sendMessage,
    executeAction,
  } = useAssistant();

  const [input, setInput] = useState('');
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [showContextDrawer, setShowContextDrawer] = useState(false);

  // Confirmation Modal state
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

  const handleSelectPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const handleNewConsultation = () => {
    createSession('New Consultation', mode);
    setShowSessionDrawer(false);
  };

  const handleDeleteSessionPrompt = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    setConfirmModal({
      isOpen: true,
      title: 'Delete Consultation Session',
      description: `Are you sure you want to delete "${session?.title || 'this session'}"? This action permanently removes all message history.`,
      confirmText: 'Delete Session',
      isDestructive: true,
      onConfirm: async () => {
        await deleteSession(sessionId);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleActionClick = (action: StructuredAction) => {
    if (action.requires_confirmation) {
      setConfirmModal({
        isOpen: true,
        title: `Confirm Action: ${action.title}`,
        description: action.description || 'Would you like Aura to proceed with updating your career records?',
        confirmText: 'Confirm & Execute',
        isDestructive: false,
        onConfirm: async () => {
          const res = await executeAction(action.action_type, action.entity_id, action.parameters);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          if (res.success && action.route) {
            router.push(action.route);
          }
        },
      });
    } else if (action.route) {
      router.push(action.route);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      {/* Primary Platform Navigation Sidebar */}
      <Sidebar />

      {/* Main Chat Copilot Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white">
        {/* Header */}
        <ChatHeader
          userName={context?.user_name}
          connectionStatus={connectionStatus}
          onNewConsultation={handleNewConsultation}
          onArchiveSession={activeSessionId ? () => archiveSession(activeSessionId) : undefined}
          onToggleSidebar={() => setShowSessionDrawer(true)}
          onToggleContext={() => setShowContextDrawer(true)}
          hasActiveSession={!!activeSessionId}
        />

        {/* Specialized Coaching Mode Bar */}
        <SpecializedModeBar
          currentMode={mode}
          onModeChange={(newMode) => setMode(newMode)}
        />

        {/* 3-Panel Content Body */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Panel 1: Consultation Sessions (Desktop >= 1024px) */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0 h-full">
            <SessionSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => setActiveSessionId(id)}
              onNewSession={handleNewConsultation}
              onRenameSession={renameSession}
              onArchiveSession={archiveSession}
              onDeleteSession={handleDeleteSessionPrompt}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              loading={loadingSessions}
            />
          </div>

          {/* Panel 2: Center AI Conversation Window */}
          <main className="flex-1 flex flex-col min-w-0 h-full bg-white relative">
            <ChatWindow
              messages={messages}
              context={context}
              thinkingState={thinkingState}
              isStreaming={isStreaming}
              onSelectPrompt={handleSelectPrompt}
              onActionClick={handleActionClick}
              onRetryMessage={() => {
                const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                if (lastUser) sendMessage(lastUser.content);
              }}
            />

            {/* Sticky Composer */}
            <ChatComposer
              input={input}
              onChange={setInput}
              onSend={handleSend}
              isStreaming={isStreaming}
              mode={mode}
              onResetMode={() => setMode('standard')}
            />
          </main>

          {/* Panel 3: Live Career Context (Desktop >= 1280px) */}
          <div className="hidden xl:block w-80 2xl:w-96 shrink-0 h-full">
            <CareerContextPanel
              context={context}
              onSelectPrompt={handleSelectPrompt}
              onSetMode={setMode}
            />
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Left Drawer: Sessions */}
      <ResponsiveDrawer
        isOpen={showSessionDrawer}
        onClose={() => setShowSessionDrawer(false)}
        title="Consultation History"
        side="left"
        width="w-80"
      >
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setShowSessionDrawer(false);
          }}
          onNewSession={handleNewConsultation}
          onRenameSession={renameSession}
          onArchiveSession={archiveSession}
          onDeleteSession={handleDeleteSessionPrompt}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loadingSessions}
        />
      </ResponsiveDrawer>

      {/* Mobile / Tablet Right Drawer: Live Career Context */}
      <ResponsiveDrawer
        isOpen={showContextDrawer}
        onClose={() => setShowContextDrawer(false)}
        title="Career Telemetry"
        side="right"
        width="w-84"
      >
        <CareerContextPanel
          context={context}
          onSelectPrompt={(p) => {
            handleSelectPrompt(p);
            setShowContextDrawer(false);
          }}
          onSetMode={(m) => {
            setMode(m);
            setShowContextDrawer(false);
          }}
        />
      </ResponsiveDrawer>

      {/* Action / Deletion Confirmation Modal */}
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
