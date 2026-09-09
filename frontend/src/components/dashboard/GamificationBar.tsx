'use client';

import React from 'react';
import { Flame, Zap, Star } from 'lucide-react';

interface GamificationBarProps {
  xp?: number;
  streak?: number;
  level?: string;
  nextLevelXp?: number;
}

const LEVELS = [
  { name: 'Beginner', minXp: 0, color: 'text-slate-500', bg: 'bg-slate-100' },
  { name: 'Explorer', minXp: 100, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Achiever', minXp: 300, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Expert', minXp: 700, color: 'text-violet-600', bg: 'bg-violet-50' },
  { name: 'Legend', minXp: 1500, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export function getLevel(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      const next = LEVELS[i + 1];
      return {
        ...LEVELS[i],
        nextXp: next?.minXp ?? LEVELS[i].minXp + 1000,
        progress: next
          ? Math.round(((xp - LEVELS[i].minXp) / (next.minXp - LEVELS[i].minXp)) * 100)
          : 100,
      };
    }
  }
  return { ...LEVELS[0], nextXp: 100, progress: 0 };
}

export function GamificationBar({ xp = 0, streak = 0 }: GamificationBarProps) {
  const level = getLevel(xp);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-2.5 shadow-xs">
      {/* Level badge + streak */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${level.bg} ${level.color}`}>
          {level.name}
        </span>
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="h-3.5 w-3.5" />
          <span className="text-[11px] font-black">{streak}d</span>
        </div>
      </div>

      {/* XP bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 text-amber-500">
            <Zap className="h-3 w-3" />
            <span className="text-[11px] font-black text-slate-700">{xp} XP</span>
          </div>
          <span className="text-[10px] text-slate-400">{level.nextXp} XP</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
            style={{ width: `${level.progress}%` }}
          />
        </div>
      </div>

      {/* Stars row */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(level.progress / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
}
