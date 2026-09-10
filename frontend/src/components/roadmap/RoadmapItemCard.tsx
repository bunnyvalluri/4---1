'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Lock,
  Play,
  Clock,
  ExternalLink,
  Save,
  Check,
  AlertCircle,
  Edit3,
  GitBranch,
  Terminal,
  ShieldCheck,
} from 'lucide-react';
import { RoadmapItemData } from '@/lib/types/roadmap';
import { ResourceCard } from './ResourceCard';

interface RoadmapItemCardProps {
  item: RoadmapItemData;
  allItems: RoadmapItemData[];
  onStart: (itemId: string) => void;
  onComplete: (itemId: string) => void;
  onSkip: (itemId: string) => void;
  onToggleTask: (itemId: string, taskId: string, currentDone: boolean) => void;
  onSaveNotes: (itemId: string, notes: string) => void;
  onCompleteResource: (itemId: string, resourceId: string) => void;
  onStartResource?: (itemId: string, resourceId: string) => void;
}

export function RoadmapItemCard({
  item,
  allItems,
  onStart,
  onComplete,
  onSkip,
  onToggleTask,
  onSaveNotes,
  onCompleteResource,
  onStartResource,
}: RoadmapItemCardProps) {
  const [notes, setNotes] = useState(item.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);

  // Check if locked by dependency
  const isLocked = item.status === 'LOCKED';
  const isCompleted = item.status === 'COMPLETED' || item.is_completed;
  const isInProgress = item.status === 'IN_PROGRESS';

  // Find prerequisite item titles
  const prereqItems = (item.dependencies || [])
    .map((depId) => allItems.find((i) => i.id === depId))
    .filter((i): i is RoadmapItemData => Boolean(i && !i.is_completed));

  const handleNotesSubmit = () => {
    setIsSavingNotes(true);
    onSaveNotes(item.id, notes);
    setTimeout(() => {
      setIsSavingNotes(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 400);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'practice':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'interview':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'resume':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const weekDisplay = item.week_number || (item.month ? (item.month - 1) * 2 + 1 : 1);

  return (
    <div
      id={`item-${item.id}`}
      className={`rounded-2xl border p-5 sm:p-6 transition-all space-y-5 ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/20 shadow-2xs'
          : isInProgress
          ? 'border-blue-300 bg-white shadow-xs ring-1 ring-blue-500/20'
          : isLocked
          ? 'border-slate-200/70 bg-slate-50/60 opacity-90'
          : 'border-slate-200 bg-white shadow-2xs'
      }`}
    >
      {/* Header with Week, Month, Title and Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-600 text-white shadow-2xs">
              Week {weekDisplay}
            </span>

            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
              Month {item.month}
            </span>

            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeBadge(item.item_type || 'learning')}`}>
              {item.item_type || 'Curriculum'}
            </span>

            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <Clock className="h-3 w-3 text-slate-400" />
              <span>{Math.round(item.estimated_hours || 10)} hrs</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {item.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="shrink-0 self-start sm:self-center">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Verified Complete</span>
            </span>
          ) : isInProgress ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <Play className="h-3.5 w-3.5 fill-blue-600 animate-pulse" />
              <span>In Progress</span>
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              <span>Locked</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600">
              <Circle className="h-3.5 w-3.5 text-slate-400" />
              <span>Not Started</span>
            </span>
          )}
        </div>
      </div>

      {/* Dependency Lock Alert */}
      {isLocked && prereqItems.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-slate-100/90 border border-slate-200 p-3 text-xs text-slate-600">
          <AlertCircle className="h-4 w-4 text-slate-500 shrink-0" />
          <span>
            <strong>Prerequisite Required:</strong> Complete{' '}
            <span className="font-semibold text-slate-800">"{prereqItems[0].title}"</span> before unlocking this milestone.
          </span>
        </div>
      )}

      {/* Embedded ResourceCard for W3Schools & GeeksforGeeks Verified Tutorials */}
      <ResourceCard
        itemId={item.id}
        skillName={item.skills?.[0] || item.title}
        currentLevel={item.current_level || 'BEGINNER'}
        targetLevel={item.target_level || 'INTERMEDIATE'}
        whyMatters={item.why_matters}
        resources={item.resource_links || []}
        onStartResource={onStartResource}
        onCompleteResource={onCompleteResource}
      />

      {/* Practical Implementation & CI/CD Assignment */}
      {item.assignment && (
        <div className="rounded-xl border border-slate-800/10 bg-slate-900 text-white p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Weekly Production Assignment: {item.assignment.title}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                <ShieldCheck className="h-3 w-3" />
                {item.verification_type || 'GITHUB_ACTIONS'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {item.assignment.description}
          </p>

          {item.assignment.verificationCriteria && item.assignment.verificationCriteria.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Automated Verification Criteria
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {item.assignment.verificationCriteria.map((crit: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{crit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.assignment.repoTemplate && (
            <div className="pt-2 flex items-center justify-between">
              <a
                href={item.assignment.repoTemplate}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>GitHub Starter Repository</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-[10px] text-slate-400">Fork & Submit PR to Verify</span>
            </div>
          )}
        </div>
      )}

      {/* Interactive Subtasks Checklist */}
      {item.tasks && item.tasks.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Milestone Checklist ({item.tasks.filter((t) => t.done).length} of {item.tasks.length} Done)
          </div>

          <div className="space-y-1.5">
            {item.tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => !isLocked && onToggleTask(item.id, task.id, task.done)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                  isLocked ? 'opacity-60 cursor-not-allowed bg-slate-50/50' : 'cursor-pointer hover:bg-slate-50/80'
                } ${task.done ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-700' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {task.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <span className={`font-medium ${task.done ? 'line-through text-slate-400' : ''}`}>
                    {task.text}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    task.done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.done ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Learning Notes Field */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Edit3 className="h-3 w-3" />
            <span>Personal Notes & Repository Link</span>
          </label>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
        </div>

        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record key technical insights, bugs resolved, or code repos built..."
          disabled={isLocked}
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
        />

        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSavingNotes || isLocked}
            onClick={handleNotesSubmit}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {!isCompleted && !isInProgress && (
            <button
              type="button"
              disabled={isLocked}
              onClick={() => onStart(item.id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Start Week Milestone</span>
            </button>
          )}

          {!isCompleted && isInProgress && !showConfirmComplete && (
            <button
              type="button"
              onClick={() => setShowConfirmComplete(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark Complete</span>
            </button>
          )}

          {showConfirmComplete && (
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800">
                Complete this milestone?
              </span>
              <button
                type="button"
                onClick={() => {
                  onComplete(item.id);
                  setShowConfirmComplete(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
              >
                Yes, Complete
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmComplete(false)}
                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isCompleted && (
          <button
            type="button"
            disabled={isLocked}
            onClick={() => onSkip(item.id)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            Skip Non-Essential
          </button>
        )}
      </div>
    </div>
  );
}
