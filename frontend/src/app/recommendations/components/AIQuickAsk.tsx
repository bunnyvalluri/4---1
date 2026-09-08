import React from 'react';
import Link from 'next/link';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { RecommendationItem } from '@/lib/hooks/useRecommendations';

interface AIQuickAskProps {
  topMatch: RecommendationItem | null;
}

export function AIQuickAsk({ topMatch }: AIQuickAskProps) {
  const career = topMatch?.career_title ?? 'this career';
  const gap = topMatch?.primary_gap ?? 'system design';

  const PROMPTS = [
    `Why am I a strong match for ${career}?`,
    `What skills am I missing for ${career}?`,
    `Which career has the lowest skill gap for me?`,
    `What should I learn first to improve my career match?`,
    gap ? `How do I improve my ${gap} skills?` : 'Would AI/ML be a good fit for me?',
  ];

  const encodePrompt = (p: string) => `/chat?q=${encodeURIComponent(p)}`;

  return (
    <section
      aria-labelledby="ai-ask-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
          <MessageSquare className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h2 id="ai-ask-heading" className="text-sm font-extrabold text-slate-900">
            Ask CareerAI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Get personalized answers based on your actual profile
          </p>
        </div>
      </div>

      {/* Suggested prompts */}
      <div className="space-y-2">
        {PROMPTS.map((prompt) => (
          <Link
            key={prompt}
            href={encodePrompt(prompt)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 transition-all group"
          >
            <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
            <span className="flex-1 text-left leading-snug">{prompt}</span>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Open AI link */}
      <Link
        href="/chat"
        className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
      >
        <MessageSquare className="h-4 w-4" />
        Open AI Career Assistant
      </Link>
    </section>
  );
}
