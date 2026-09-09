'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Search,
  MessageSquare,
  Menu,
  Sparkles,
  Command,
  User as UserIcon,
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
  onOpenMobileMenu: () => void;
}

export function DashboardHeader({
  userName = 'Candidate',
  userEmail = '',
  telemetryStatus,
  lastUpdatedText,
  notifications,
  onRefresh,
  onMarkNotificationRead,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recommendations?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const initial = (userName || 'C').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto gap-2 sm:gap-4">
        {/* Left: Mobile Menu Trigger + Brand on mobile */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 outline-none cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Compass className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base">
              Career<span className="text-blue-600">AI</span>
            </span>
          </Link>

          {/* Desktop Realtime Telemetry Indicator */}
          <div className="hidden lg:block">
            <RealtimeStatus
              status={telemetryStatus}
              lastUpdatedText={lastUpdatedText}
              onRefresh={onRefresh}
            />
          </div>
        </div>

        {/* Center: Global Search Bar */}
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

        {/* Right: Quick Tools, Notifications, AI Assistant & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Assistant Shortcut */}
          <Link
            href="/chat"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200/70 transition-colors shadow-2xs"
            title="Ask AI Assistant"
          >
            <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden lg:inline">AI Copilot</span>
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
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
            title="View Profile"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
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
    </header>
  );
}
