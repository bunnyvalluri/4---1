'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  BarChart2,
  BrainCircuit,
  Map,
  FolderGit2,
  FileCheck,
  MessageSquare,
  Mic,
  LineChart,
  Briefcase,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { signOutFirebase } from '@/lib/firebase/client';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { GamificationBar } from '@/components/dashboard/GamificationBar';
import { ResponsiveDrawer } from '@/components/ui/ResponsiveDrawer';

interface UserSidebarProps {
  userName?: string;
  userEmail?: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function UserSidebar({
  userName = 'Candidate',
  userEmail = '',
  mobileOpen = false,
  onCloseMobile,
}: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      if (onCloseMobile) onCloseMobile();
      await signOutFirebase();
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof document !== 'undefined') {
        document.cookie = 'career_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
      }
      window.location.replace('/login');
    } catch {
      window.location.replace('/login');
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Career Matches', href: '/user/recommendations', icon: Sparkles, badge: 'AI' },
    { label: 'Skill Gaps', href: '/user/skills', icon: BarChart2 },
    { label: 'Assessments', href: '/user/assessment', icon: BrainCircuit },
    { label: 'Learning Roadmap', href: '/user/roadmap', icon: Map },
    { label: 'Portfolio Projects', href: '/user/projects', icon: FolderGit2 },
    { label: 'Resume ATS', href: '/user/resume', icon: FileCheck, badge: 'ATS' },
    { label: 'AI Copilot', href: '/user/chat', icon: MessageSquare, badge: 'Active' },
  ];

  const advancedItems = [
    { label: 'Interview Sim', href: '/user/interview', icon: Mic, badge: 'New' },
    { label: 'Market Intel', href: '/user/market', icon: LineChart, badge: 'New' },
    { label: 'Job Tracker', href: '/user/jobs', icon: Briefcase, badge: 'New' },
    { label: 'Career Trajectory', href: '/user/trajectory', icon: TrendingUp, badge: 'New' },
    { label: 'Mentors', href: '/user/mentors', icon: Users, badge: 'New' },
  ];

  const initial = (userName || 'C').charAt(0).toUpperCase();

  const userProfileCard = (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs shadow-xs">
          {initial}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="font-bold text-xs text-slate-900 truncate">{userName}</div>
          <div className="text-[10px] text-slate-500 truncate mt-0.5">{userEmail || 'Active Candidate'}</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
        <span className="text-slate-400 font-medium">Telemetry Status</span>
        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Guidance
        </span>
      </div>
    </div>
  );

  const renderNavLinks = (isMobile: boolean) => (
    <div className="space-y-4">
      <div>
        <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/user/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={isMobile ? onCloseMobile : undefined}
                className={`group flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200/80 text-slate-600 group-hover:bg-slate-300/80'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="px-2 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
          Advanced
        </div>
        <div className="space-y-0.5">
          {advancedItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={isMobile ? onCloseMobile : undefined}
                className={`group flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-violet-50 text-violet-700 font-bold border border-violet-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${
                      isActive
                        ? 'bg-violet-600 text-white'
                        : 'bg-violet-100 text-violet-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP PERSISTENT SIDEBAR (>=1024px) */}
      {/* ======================================================== */}
      <aside className="w-60 shrink-0 border-r border-slate-200/80 bg-slate-50/70 h-[calc(100vh-4rem)] sticky top-16 flex-col justify-between p-3.5 hidden lg:flex overflow-y-auto select-none">
        <div className="space-y-4">
          {/* User Profile Capsule */}
          {userProfileCard}

          {/* Gamification Bar */}
          <GamificationBar xp={120} streak={3} />

          {/* Nav Items */}
          {renderNavLinks(false)}
        </div>

        {/* Bottom Actions: Preferences & Sign Out */}
        <div className="pt-3 border-t border-slate-200/80 space-y-1">
          <Link
            href="/user/settings"
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
              pathname.startsWith('/user/settings')
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Preferences</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE SLIDE-OVER DRAWER (<1024px) */}
      {/* ======================================================== */}
      <ResponsiveDrawer
        isOpen={mobileOpen}
        onClose={onCloseMobile || (() => {})}
        title={<BrandLogo size="xs" subtext="User Portal" href="/user/dashboard" />}
      >
        <div className="space-y-5 pt-2">
          {userProfileCard}
          <GamificationBar xp={120} streak={3} />
          {renderNavLinks(true)}

          <div className="pt-4 border-t border-slate-200 space-y-1">
            <Link
              href="/user/settings"
              onClick={onCloseMobile}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Preferences</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </ResponsiveDrawer>
    </>
  );
}
