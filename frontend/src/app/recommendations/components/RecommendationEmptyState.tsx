import React from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Zap,
  User,
  BookOpen,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';

interface RecommendationEmptyStateProps {
  profileCompletionPct?: number;
  missingItems?: string[];
}

const CHECKLIST = [
  { label: 'Complete your profile', icon: User, href: '/profile' },
  { label: 'Add skills', icon: Zap, href: '/skills' },
  { label: 'Complete assessment', icon: BrainCircuit, href: '/assessment' },
  { label: 'Add career interests', icon: BookOpen, href: '/profile' },
];

export function RecommendationEmptyState({
  profileCompletionPct = 0,
  missingItems = [],
}: RecommendationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 border border-blue-100">
          <ClipboardList className="h-10 w-10 text-blue-500" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Your Career Matches Aren't Ready Yet
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Complete your profile and career assessment to generate
            personalized AI-powered recommendations.
          </p>
        </div>

        {/* Profile progress */}
        {profileCompletionPct > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Profile Completion</span>
              <span className="font-bold text-blue-600">{profileCompletionPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletionPct}%` }}
              />
            </div>
            {missingItems.length > 0 && (
              <div className="space-y-1 pt-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Still needed:
                </p>
                {missingItems.slice(0, 4).map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            To-do checklist
          </p>
          {CHECKLIST.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors font-medium">
                {label}
              </span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all hover:-translate-y-0.5 shadow-sm shadow-blue-500/20"
          >
            <User className="h-4 w-4" />
            Complete Profile
          </Link>
          <Link
            href="/assessment"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <BrainCircuit className="h-4 w-4" />
            Take Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
