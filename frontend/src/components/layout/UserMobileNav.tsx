'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Sparkles,
  Map,
  MessageSquare,
  MoreHorizontal,
  BrainCircuit,
  BarChart2,
  FolderGit2,
  FileCheck,
  User,
  ShieldCheck,
  LogOut,
  X,
  Compass,
} from 'lucide-react';

interface UserData {
  name?: string;
  email?: string;
  role?: string;
}

interface QuickToolItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const moreCandidateTools: QuickToolItem[] = [
  { name: 'Career Diagnostic', href: '/assessment', icon: BrainCircuit },
  { name: 'Skill Gap Analysis', href: '/skills', icon: BarChart2 },
  { name: 'Resume ATS Scanner', href: '/resume', icon: FileCheck, badge: 'ATS' },
  { name: 'Portfolio Projects', href: '/projects', icon: FolderGit2 },
  { name: 'My Profile & Goal', href: '/profile', icon: User },
];

export function UserMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [user, setUser] = useState<UserData | null>(null);

  // Close sheet on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMoreSheetOpen(false);
  }

  // Fetch current authenticated candidate user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  // Lock background scroll when more drawer is open
  useEffect(() => {
    if (moreSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [moreSheetOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
    router.refresh();
  };

  // Only render on candidate/user workspace routes
  const isCandidateWorkspace =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/recommendations') ||
    pathname.startsWith('/skills') ||
    pathname.startsWith('/roadmap') ||
    pathname.startsWith('/resume') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/careers');

  // Hide on admin portal, auth pages, or public marketing pages
  if (!isCandidateWorkspace || pathname.startsWith('/admin')) {
    return null;
  }

  // Active state determinations
  const isDashboardActive = pathname === '/dashboard';
  const isMatchesActive =
    pathname.startsWith('/recommendations') || pathname.startsWith('/careers');
  const isRoadmapActive = pathname.startsWith('/roadmap');
  const isCopilotActive = pathname.startsWith('/chat');

  // Notification badge on Copilot tab when not currently on chat
  const showCopilotBadge = !isCopilotActive;

  return (
    <>
      {/* Floating Pill Mobile Navigation Dock (Hidden on Desktop >= 1024px) */}
      <nav
        aria-label="Mobile workspace bottom navigation"
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 max-w-md mx-auto z-40 lg:hidden pointer-events-auto select-none"
        style={{
          bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        }}
      >
        <div className="flex items-center justify-around bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-[0_10px_35px_-5px_rgba(15,23,42,0.16)] px-3 py-1.5 transition-all">
          {/* 1. Dashboard Tab */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                isDashboardActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <Home
                className={`h-5 w-5 transition-colors ${
                  isDashboardActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                isDashboardActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Dashboard
            </span>
          </Link>

          {/* 2. Matches Tab */}
          <Link
            href="/recommendations"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                isMatchesActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <Sparkles
                className={`h-5 w-5 transition-colors ${
                  isMatchesActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                isMatchesActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Matches
            </span>
          </Link>

          {/* 3. Roadmap Tab */}
          <Link
            href="/roadmap"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                isRoadmapActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <Map
                className={`h-5 w-5 transition-colors ${
                  isRoadmapActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                isRoadmapActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Roadmap
            </span>
          </Link>

          {/* 4. Copilot Tab (with live AI beacon dot badge) */}
          <Link
            href="/chat"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                isCopilotActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <MessageSquare
                className={`h-5 w-5 transition-colors ${
                  isCopilotActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
              {/* Red Notification Badge */}
              {showCopilotBadge && (
                <span className="absolute top-1 right-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white"></span>
                </span>
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                isCopilotActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Copilot
            </span>
          </Link>

          {/* 5. More Tab (Three Dots) */}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(!moreSheetOpen)}
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 focus:outline-hidden"
            aria-label="More navigation tools"
            aria-expanded={moreSheetOpen}
          >
            <div
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                moreSheetOpen
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <MoreHorizontal
                className={`h-5 w-5 transition-colors ${
                  moreSheetOpen ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                moreSheetOpen
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet Drawer Modal (Mobile/Tablet only) */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMoreSheetOpen(false)}
          />

          {/* Slide-up Sheet */}
          <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl overflow-hidden max-h-[82vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle & Header */}
            <div className="px-5 pt-3 pb-3 border-b border-slate-100 bg-slate-50/70">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">CareerAI Workspace</h3>
                    <p className="text-[11px] text-slate-500">Candidate Intelligence & Growth Tools</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreSheetOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close sheet"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Quick Links Content */}
            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {/* Profile Card */}
              <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-100 rounded-2xl">
                <Link
                  href="/profile"
                  onClick={() => setMoreSheetOpen(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {(user?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Candidate'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Active Guidance'}</p>
                  </div>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMoreSheetOpen(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Profile
                </Link>
              </div>

              {/* Grid of Candidate Tools */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-1">
                  Telemetry & Tools
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {moreCandidateTools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = pathname === tool.href || pathname.startsWith(tool.href);

                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setMoreSheetOpen(false)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="truncate">{tool.name}</span>
                        </div>
                        {tool.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-blue-100 text-blue-700 shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Admin Portal Link if authenticated user is admin */}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMoreSheetOpen(false)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/60 transition-colors text-xs font-semibold text-indigo-900"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span>Switch to Administrator Portal</span>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                </Link>
              )}
            </div>

            {/* Bottom Actions: Sign Out */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50/80 border border-rose-200 hover:bg-rose-100/70 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
