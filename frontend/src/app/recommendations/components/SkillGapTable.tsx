import React from 'react';
import { BarChart2, CheckCircle2, AlertTriangle, Minus } from 'lucide-react';
import { SkillGapItem } from '@/lib/hooks/useRecommendations';

interface SkillGapTableProps {
  gaps: SkillGapItem[];
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'HIGH PRIORITY': {
    label: '!!',
    color: 'text-red-700 bg-red-50 border-red-200',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  'MEDIUM PRIORITY': {
    label: '!',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  'LOW PRIORITY': {
    label: '✓',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

const PROFICIENCY_ORDER = ['None', 'Beginner', 'Intermediate', 'Advanced'];

function GapBar({
  currentScore,
  targetScore,
}: {
  currentScore: number;
  targetScore: number;
}) {
  return (
    <div className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
      {/* Target marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
        style={{ left: `${targetScore}%` }}
      />
      {/* Current bar */}
      <div
        className={`h-full rounded-full transition-all duration-700 ${
          currentScore >= targetScore ? 'bg-emerald-500' : currentScore >= targetScore * 0.6 ? 'bg-amber-500' : 'bg-red-500'
        }`}
        style={{ width: `${Math.min(100, currentScore)}%` }}
      />
    </div>
  );
}

function GapLabel({ current, target }: { current: string; target: string }) {
  const gap = PROFICIENCY_ORDER.indexOf(target) - PROFICIENCY_ORDER.indexOf(current);
  if (gap <= 0) return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="No gap" />;
  if (gap === 1) return <Minus className="h-4 w-4 text-amber-500" aria-label="Medium gap" />;
  return <AlertTriangle className="h-4 w-4 text-red-500" aria-label="High gap" />;
}

export function SkillGapTable({ gaps }: SkillGapTableProps) {
  if (!gaps || gaps.length === 0) return null;

  return (
    <section aria-labelledby="skill-gap-heading" className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
          <BarChart2 className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 id="skill-gap-heading" className="text-sm font-extrabold text-slate-900">
            Career Skill Gap Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Skills you need to develop for your target career
          </p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs" role="table">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th scope="col" className="px-5 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">
                Skill
              </th>
              <th scope="col" className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">
                Your Level
              </th>
              <th scope="col" className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">
                Required
              </th>
              <th scope="col" className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">
                Progress
              </th>
              <th scope="col" className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">
                Gap
              </th>
              <th scope="col" className="px-4 py-3 text-left font-extrabold text-slate-500 uppercase tracking-wider">
                Priority
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {gaps.map((gap, idx) => {
              const prioConfig = PRIORITY_CONFIG[gap.priority] ?? PRIORITY_CONFIG['LOW PRIORITY'];
              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-800">{gap.name}</div>
                    {gap.careerTitle && (
                      <div className="text-[10px] text-slate-400 mt-0.5">For: {gap.careerTitle}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`font-semibold ${
                      gap.currentLevel === 'Advanced' ? 'text-emerald-700' :
                      gap.currentLevel === 'Intermediate' ? 'text-blue-700' : 'text-slate-500'
                    }`}>
                      {gap.currentLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-slate-700">{gap.targetLevel}</span>
                  </td>
                  <td className="px-4 py-3.5 w-32">
                    <GapBar currentScore={gap.currentScore} targetScore={gap.targetScore} />
                  </td>
                  <td className="px-4 py-3.5">
                    <GapLabel current={gap.currentLevel} target={gap.targetLevel} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${prioConfig.color}`}>
                      {prioConfig.icon}
                      {gap.priority.replace(' PRIORITY', '')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="sm:hidden divide-y divide-slate-100">
        {gaps.map((gap, idx) => {
          const prioConfig = PRIORITY_CONFIG[gap.priority] ?? PRIORITY_CONFIG['LOW PRIORITY'];
          return (
            <div key={idx} className="px-4 py-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{gap.name}</p>
                  {gap.careerTitle && (
                    <p className="text-[10px] text-slate-400">For: {gap.careerTitle}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${prioConfig.color}`}>
                  {prioConfig.icon}
                  {gap.priority.replace(' PRIORITY', '')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span>
                  You: <span className="font-semibold text-slate-800">{gap.currentLevel}</span>
                </span>
                <span>→</span>
                <span>
                  Need: <span className="font-semibold text-slate-800">{gap.targetLevel}</span>
                </span>
              </div>
              <GapBar currentScore={gap.currentScore} targetScore={gap.targetScore} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
