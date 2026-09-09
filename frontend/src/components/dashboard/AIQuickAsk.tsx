'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Send, ArrowRight } from 'lucide-react';

export function AIQuickAsk() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const suggestedPrompts = [
    'What should I learn next?',
    'Why was this career recommended?',
    'How can I improve my resume?',
    'Give me a project for my skill level.',
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/chat?prompt=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-7 shadow-xs space-y-4 min-w-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black text-slate-900 truncate leading-tight">
              Ask CareerAI
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Personal career guidance copilot
            </p>
          </div>
        </div>

        <Link
          href="/chat"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 shrink-0 min-h-[44px] flex items-center"
        >
          <span>Open Copilot</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Suggested Prompts Pills (Full-width, touch-friendly min 40px height) */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          Suggested Questions:
        </span>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSelectPrompt(p)}
              className="min-h-[40px] text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 transition-all text-left cursor-pointer active:scale-[0.98]"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Quick Ask Form (Full width, min 48px height) */}
      <form onSubmit={handleSend} className="relative flex items-center pt-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about roadmaps, skill gaps, or interview bars..."
          className="w-full h-12 pl-4 pr-14 text-xs sm:text-sm rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:hover:bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-xs active:scale-95"
          aria-label="Send question to AI Copilot"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
