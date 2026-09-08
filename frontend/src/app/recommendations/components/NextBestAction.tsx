import React from 'react';
import Link from 'next/link';
import { ArrowRight, Target, BookOpen } from 'lucide-react';
import { RecommendationItem, SkillGapItem } from '@/lib/hooks/useRecommendations';

interface NextBestActionProps {
  topMatch: RecommendationItem | null;
  topGap: SkillGapItem | null;
}

export function NextBestAction({ topMatch, topGap }: NextBestActionProps) {
  if (!topMatch) return null;

  const gapSkill = topGap?.name ?? topMatch.primary_gap ?? 'System Design';
  const careerTitle = topMatch.career_title;

  return (
    <section
      aria-labelledby="next-action-heading"
      className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-blue-200 shadow-xs">
          <Target className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 id="next-action-heading" className="text-sm font-extrabold text-blue-900 uppercase tracking-wider">
            What Should You Do Next?
          </h2>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <p className="text-sm text-blue-900 leading-relaxed">
          Your strongest match is{' '}
          <span className="font-bold">{careerTitle}</span>.{' '}
          {gapSkill && (
            <>
              Your biggest improvement opportunity is{' '}
              <span className="font-bold">{gapSkill}</span>.
            </>
          )}
        </p>

        {topMatch.recommended_actions?.length > 0 && (
          <div className="rounded-xl border border-blue-200 bg-white/70 p-4 space-y-2">
            <p className="text-xs font-bold text-blue-800">Recommended action:</p>
            <p className="text-sm text-blue-900 font-medium">
              {topMatch.recommended_actions[0]}
            </p>
          </div>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/roadmap"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-500/20"
        >
          <BookOpen className="h-4 w-4" />
          {gapSkill ? `Learn ${gapSkill}` : 'Start Learning'}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={`/careers/${topMatch.career_slug}`}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-white px-5 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-all"
        >
          View Full Career Plan
        </Link>
      </div>
    </section>
  );
}
