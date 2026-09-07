'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, Sparkles, Send, ArrowRight } from 'lucide-react';

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
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-none">
              Ask CareerAI
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Context-aware personal career copilot
            </p>
          </div>
        </div>

        <Link
          href="/chat"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
        >
          <span>Open AI Assistant</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Suggested Prompts Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
          Suggested Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSelectPrompt(p)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 transition-all text-left cursor-pointer"
            >
              &ldquo;{p}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Quick Ask Form */}
      <form onSubmit={handleSend} className="relative flex items-center pt-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about your roadmap, skill gaps, or interview bars..."
          className="w-full h-11 pl-4 pr-12 text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:hover:bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
          aria-label="Send query to CareerAI Copilot"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
