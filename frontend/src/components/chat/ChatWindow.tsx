'use client';

import React, { useRef, useEffect } from 'react';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import { AssistantMessage as IAssistantMessage, CareerContext, StructuredAction } from '@/lib/hooks/useAssistant';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { ChatEmptyState } from './ChatEmptyState';

interface ChatWindowProps {
  messages: IAssistantMessage[];
  context: CareerContext | null;
  thinkingState: string | null;
  isStreaming: boolean;
  onSelectPrompt: (prompt: string) => void;
  onActionClick: (action: StructuredAction) => void;
  onRetryMessage: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  context,
  thinkingState,
  isStreaming,
  onSelectPrompt,
  onActionClick,
  onRetryMessage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on messages or thinking changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingState, isStreaming]);

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-between">
        {isEmpty ? (
          <ChatEmptyState context={context} onSelectPrompt={onSelectPrompt} />
        ) : (
          <div className="space-y-1">
            {messages.map((msg, idx) =>
              msg.role === 'user' ? (
                <UserMessage key={msg.id || idx} message={msg} />
              ) : (
                <AssistantMessage
                  key={msg.id || idx}
                  message={msg}
                  onActionClick={onActionClick}
                  onRetry={onRetryMessage}
                />
              )
            )}

            {/* Thinking / Intermediate Processing State Bar */}
            {thinkingState && (
              <div className="flex items-start gap-3 my-4 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-xs bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-2 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span className="animate-pulse">{thinkingState}</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
