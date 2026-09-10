'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Play,
  Award,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { RoadmapResourceLink } from '@/lib/types/roadmap';

interface ResourceCardProps {
  itemId: string;
  skillName: string;
  currentLevel?: string;
  targetLevel?: string;
  whyMatters?: string;
  resources?: RoadmapResourceLink[];
  onStartResource?: (itemId: string, resourceId: string) => void;
  onCompleteResource?: (itemId: string, resourceId: string) => void;
}

export function ResourceCard({
  itemId,
  skillName,
  currentLevel = 'BEGINNER',
  targetLevel = 'INTERMEDIATE',
  whyMatters,
  resources = [],
  onStartResource,
  onCompleteResource,
}: ResourceCardProps) {
  const [startedIds, setStartedIds] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const handleStart = (res: RoadmapResourceLink) => {
    setStartedIds((prev) => ({ ...prev, [res.id]: true }));
    if (onStartResource) {
      onStartResource(itemId, res.id);
    }
    window.open(res.url, '_blank', 'noopener,noreferrer');
  };

  const handleToggleComplete = (res: RoadmapResourceLink) => {
    const nextState = !completedIds[res.id] && !res.is_completed;
    setCompletedIds((prev) => ({ ...prev, [res.id]: nextState }));
    if (onCompleteResource) {
      onCompleteResource(itemId, res.id);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/50 p-5 shadow-xs space-y-4">
      {/* Skill Context & Level Progression */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700">
            <Sparkles className="h-4 w-4" />
          </span>
          <h4 className="text-sm font-black text-slate-900 tracking-tight">
            Target Skill: {skillName}
          </h4>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
          <span className="text-slate-500">{currentLevel}</span>
          <ArrowRight className="h-3 w-3 text-slate-400" />
          <span className="text-blue-700 font-extrabold">{targetLevel}</span>
        </div>
      </div>

      {/* Why This Skill Matters */}
      {whyMatters && (
        <div className="rounded-xl bg-blue-50/40 border border-blue-100/80 p-3">
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            <strong className="text-blue-900 font-bold">Why this skill matters: </strong>
            {whyMatters}
          </p>
        </div>
      )}

      {/* Verified Resources Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Verified External Curriculum</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Official Providers Only</span>
        </div>

        {resources.length === 0 ? (
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-amber-900">
              No verified learning resource is currently available for this topic.
            </p>
            <p className="text-[11px] text-amber-700/80 mt-1">
              CareerAI only connects to verified official portals (W3Schools & GeeksforGeeks).
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((res) => {
              const isW3S = res.provider === 'W3SCHOOLS' || res.url.includes('w3schools.com');
              const isGFG = res.provider === 'GEEKSFORGEEKS' || res.url.includes('geeksforgeeks.org');
              const isCompleted = completedIds[res.id] || res.is_completed;
              const isStarted = startedIds[res.id];

              return (
                <div
                  key={res.id || res.url}
                  className={`rounded-xl border p-4 transition-all ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      {/* Provider Badge & Type */}
                      <div className="flex flex-wrap items-center gap-2">
                        {isW3S && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-[10px] font-black tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                            [ W3Schools ]
                          </span>
                        )}
                        {isGFG && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-green-100/90 border border-green-400 text-green-950 text-[10px] font-black tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-ping" />
                            [ GeeksforGeeks ]
                          </span>
                        )}
                        {!isW3S && !isGFG && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                            {res.provider || 'Official'}
                          </span>
                        )}

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded">
                          {res.resource_type || res.type || 'Tutorial'}
                        </span>

                        {res.skill_level && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            • {res.skill_level}
                          </span>
                        )}
                      </div>

                      {/* Title & Outbound link */}
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:text-blue-700 transition-colors"
                      >
                        <span className="group-hover:underline">{res.title}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-700 shrink-0" />
                      </a>

                      {/* Description / Why recommended */}
                      {(res.description || res.why_recommended) && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {res.why_recommended || res.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex sm:flex-col items-center gap-2 shrink-0 self-start sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleStart(res)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                          isStarted
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                        }`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{isStarted ? 'In Progress' : 'Start Learning'}</span>
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleComplete(res)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors border ${
                          isCompleted
                            ? 'bg-emerald-100/80 border-emerald-300 text-emerald-800'
                            : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}
                        />
                        <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Completion Status Badge */}
                  {isCompleted && (
                    <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Self-Reported: USER_MARKED_COMPLETE
                      </span>
                      <span className="text-slate-400 font-normal">
                        Ready for CI/CD verification task
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attribution & Legal Notice */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-400">
        <span>
          Source: W3Schools & GeeksforGeeks. You will leave CareerAI to access the official tutorial.
        </span>
        <span className="font-semibold text-slate-500">Official Links Only • Never Scraped</span>
      </div>
    </div>
  );
}
