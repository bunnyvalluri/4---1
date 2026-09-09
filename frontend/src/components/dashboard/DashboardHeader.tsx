'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Search,
  MessageSquare,
  Sparkles,
  Command,
  User as UserIcon,
  X,
  Bot
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { RealtimeStatus } from './RealtimeStatus';
import { NotificationItem } from '@/lib/hooks/useDashboardRealtime';

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  telemetryStatus: 'Live' | 'Syncing...' | 'Offline' | 'Cached';
  lastUpdatedText: string;
  notifications: NotificationItem[];
  onRefresh: () => void;
  onMarkNotificationRead: (id: string) => void;
  onOpenMobileMenu?: () => void;
}

export function DashboardHeader({
  userName = 'Candidate',
  userEmail = '',
  telemetryStatus,
  lastUpdatedText,
  notifications,
  onRefresh,
  onMarkNotificationRead,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recommendations?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const initial = (userName || 'C').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md pt-[env(safe-area-inset-top,0px)] transition-all">
      <div className="flex h-16 items-center justify-between px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto gap-2 sm:gap-4">
        {/* Left: Brand Logo & Desktop Telemetry */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 group min-h-[44px] items-center"
            aria-label="CareerAI Dashboard Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-black text-slate-900 tracking-tight text-lg">
              Career<span className="text-blue-600">AI</span>
            </span>
          </Link>

          {/* Desktop Realtime Telemetry Indicator */}
          <div className="hidden lg:block ml-2">
            <RealtimeStatus
              status={telemetryStatus}
              lastUpdatedText={lastUpdatedText}
              onRefresh={onRefresh}
            />
          </div>
        </div>

        {/* Center: Desktop Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md mx-2 sm:mx-4 relative hidden md:block"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, skills, roadmaps... (Ctrl+K)"
              className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-slate-100/80 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
            />
            <kbd className="absolute right-2.5 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs pointer-events-none">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </div>
        </form>

        {/* Right: Mobile Search Button, Quick Tools, Notifications, AI Assistant & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Search Trigger Button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open search"
          >
            {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          {/* Quick AI Copilot Shortcut (Touch friendly on mobile & desktop) */}
          <Link
            href="/chat"
            className="flex items-center gap-1.5 min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200/80 transition-colors shadow-2xs"
            title="Ask AI Copilot"
            aria-label="Open AI Copilot"
          >
            <Bot className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="hidden sm:inline">AI Copilot</span>
          </Link>

          {/* Real-time Notification Center */}
          <NotificationCenter
            notifications={notifications}
            onMarkRead={onMarkNotificationRead}
          />

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* User Profile Avatar & Name */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors group min-h-[40px]"
            title="View Profile"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform shrink-0">
              {initial}
            </div>
            <div className="hidden xl:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 truncate mt-0.5">
                Candidate
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Search Dropdown Form */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search careers, skills, roadmaps..."
              className="w-full h-11 pl-10 pr-10 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
