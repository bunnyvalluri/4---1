'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, X } from 'lucide-react';
import { AssistantMode } from '@/lib/hooks/useAssistant';

interface ChatComposerProps {
  input: string;
  onChange: (val: string) => void;
  onSend: (text?: string) => void;
  isStreaming: boolean;
  mode: AssistantMode;
  onResetMode: () => void;
  placeholder?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  input,
  onChange,
  onSend,
  isStreaming,
  mode,
  onResetMode,
  placeholder = 'Ask Aura about skills, roadmap, projects, or interview prep... (Shift+Enter for newline)',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        onSend();
      }
    }
  };

  const isSendDisabled = !input.trim() || isStreaming;

  return (
    <div className="p-3 md:p-4 bg-white border-t border-slate-200 shrink-0">
      <div className="max-w-4xl mx-auto">
        {/* Active Mode Pill */}
        {mode !== 'standard' && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              <Sparkles className="w-3 h-3" />
              Active Mode: <span className="capitalize">{mode} Coach</span>
              <button
                onClick={onResetMode}
                className="p-0.5 hover:bg-blue-200/60 rounded-full transition-colors ml-0.5"
                title="Reset to Career Copilot"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {/* Composer Box */}
        <div className="relative flex items-end bg-white border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl shadow-xs transition-all overflow-hidden p-1.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isStreaming}
            maxLength={2000}
            className="flex-1 max-h-[140px] px-3 py-2 text-xs md:text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none leading-relaxed disabled:opacity-50"
          />

          <div className="flex items-center gap-2 pr-1 pb-1 shrink-0">
            {input.length > 500 && (
              <span className="text-[10px] text-slate-400 font-mono">
                {input.length}/2000
              </span>
            )}
            <button
              onClick={() => onSend()}
              disabled={isSendDisabled}
              className={`p-2 rounded-xl text-white transition-all shadow-xs flex items-center justify-center ${
                isSendDisabled
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-2 hidden sm:block">
          Aura synthesizes advice using your live career telemetry. Review recommendations alongside your mentors.
        </p>
      </div>
    </div>
  );
};
