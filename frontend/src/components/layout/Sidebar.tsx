'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  BrainCircuit,
  Sparkles,
  BarChart2,
  Map,
  FolderGit2,
  FileCheck,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  Compass,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName = 'Candidate', userEmail = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navGroups = [
    {
      title: 'Career Telemetry',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Career Matches', href: '/recommendations', icon: Sparkles, badge: 'AI' },
        { label: 'Skill Gaps', href: '/skills', icon: BarChart2 },
      ],
    },
    {
      title: 'Execution & Growth',
      items: [
        { label: 'Career Assessment', href: '/assessment', icon: BrainCircuit },
        { label: 'Learning Roadmap', href: '/roadmap', icon: Map },
        { label: 'Portfolio Projects', href: '/projects', icon: FolderGit2 },
        { label: 'Resume ATS Scanner', href: '/resume', icon: FileCheck, badge: 'ATS' },
      ],
    },
    {
      title: 'Copilot & Profile',
      items: [
        { label: 'AI Assistant', href: '/chat', icon: MessageSquare, badge: 'Live' },
        { label: 'My Profile', href: '/profile', icon: User },
      ],
    },
  ];

  // Flat list for mobile/tablet horizontal scroll bar
  const mobileNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Diagnostic', href: '/assessment', icon: BrainCircuit },
    { label: 'Matches', href: '/recommendations', icon: Sparkles },
    { label: 'Gaps', href: '/skills', icon: BarChart2 },
    { label: 'Roadmap', href: '/roadmap', icon: Map },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Resume', href: '/resume', icon: FileCheck },
    { label: 'AI Copilot', href: '/chat', icon: MessageSquare },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* MOBILE & TABLET SUB-NAVBAR (<1024px) */}
      {/* ======================================================== */}
      <div className="lg:hidden w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-3 py-2 overflow-x-auto flex items-center gap-1.5 sticky top-16 z-30 shadow-xs">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR (>=1024px) */}
      {/* ======================================================== */}
      <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-slate-50/50 min-h-[calc(100vh-4rem)] flex-col justify-between p-4 hidden lg:flex">
        <div className="space-y-6">
          {/* User Mini Profile Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all hover:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xs">
                {userName.charAt(0).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-sm text-slate-900 truncate leading-tight">{userName}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {userEmail || 'Active Candidate'}
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Guidance
              </span>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-50/80 text-blue-700 font-bold border border-blue-200/70 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200/80 text-slate-600 group-hover:bg-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200/80 space-y-1">
          <Link
            href="/profile#settings"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Preferences</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
