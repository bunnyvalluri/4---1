'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  BarChart2,
  Map,
  MoreHorizontal,
  BrainCircuit,
  FolderGit2,
  FileCheck,
  MessageSquare,
  User,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  Compass,
  Loader2,
} from 'lucide-react';
import { signOutFirebase } from '@/lib/firebase/client';

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
  description?: string;
}

const moreCandidateTools: QuickToolItem[] = [
  {
    name: 'Career Diagnostic',
    href: '/assessment',
    icon: BrainCircuit,
    description: 'Aptitude & personality evaluation',
  },
  {
    name: 'Portfolio Projects',
    href: '/projects',
    icon: FolderGit2,
    description: 'Hands-on industry projects',
  },
  {
    name: 'Resume ATS Scanner',
    href: '/resume',
    icon: FileCheck,
    badge: 'ATS',
    description: 'Instant keyword & match audit',
  },
  {
    name: 'AI Career Assistant',
    href: '/chat',
    icon: MessageSquare,
    badge: 'AI',
    description: '24/7 intelligent career mentor',
  },
  {
    name: 'Candidate Profile',
    href: '/profile',
    icon: User,
    description: 'Personal info, target career, skills',
  },
  {
    name: 'Notifications',
    href: '/dashboard',
    icon: Bell,
    badge: '3',
    description: 'Updates, reminders & match alerts',
  },
  {
    name: 'Account Settings',
    href: '/profile',
    icon: Settings,
    description: 'Privacy, password & preferences',
  },
];

export function UserMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [user, setUser] = useState<UserData | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Auto-close drawer sheet on navigation
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMoreSheetOpen(false);
  }

  // Fetch current candidate profile info
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  // Lock background scroll when drawer is open
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
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      setMoreSheetOpen(false);
      document.body.style.overflow = '';
      await signOutFirebase();
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (typeof document !== 'undefined') {
        document.cookie = 'career_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';
      }
      window.location.replace('/login');
    } catch {
      window.location.replace('/login');
    }
  };

  // Render exclusively on candidate workspace routes
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

  if (!isCandidateWorkspace || pathname.startsWith('/admin')) {
    return null;
  }

  // Active status determinations
  const isDashboardActive = pathname === '/dashboard';
  const isRecommendationsActive =
    pathname.startsWith('/recommendations') || pathname.startsWith('/careers');
  const isSkillsActive = pathname.startsWith('/skills');
  const isRoadmapActive = pathname.startsWith('/roadmap');

  return (
    <>
      {/* Fixed Floating Bottom Navigation Dock (Visible on Mobile & Tablets < 1024px) */}
      <nav
        aria-label="Candidate mobile navigation bar"
        className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-lg mx-auto z-40 lg:hidden pointer-events-auto select-none"
        style={{
          bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
        }}
      >
        <div className="flex items-center justify-around bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-[0_10px_35px_-5px_rgba(15,23,42,0.18)] px-2 py-1.5 transition-all">
          {/* 1. Dashboard Tab */}
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                isDashboardActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <LayoutDashboard
                className={`h-5 w-5 transition-colors ${
                  isDashboardActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                isDashboardActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Dashboard
            </span>
          </Link>

          {/* 2. Recommendations Tab */}
          <Link
            href="/recommendations"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                isRecommendationsActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <Sparkles
                className={`h-5 w-5 transition-colors ${
                  isRecommendationsActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors truncate max-w-[70px] ${
                isRecommendationsActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Matches
            </span>
          </Link>

          {/* 3. Skills Tab */}
          <Link
            href="/skills"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                isSkillsActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <BarChart2
                className={`h-5 w-5 transition-colors ${
                  isSkillsActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                isSkillsActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Skills
            </span>
          </Link>

          {/* 4. Roadmap Tab */}
          <Link
            href="/roadmap"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
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
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                isRoadmapActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Roadmap
            </span>
          </Link>

          {/* 5. More Tab (Drawer Trigger) */}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(!moreSheetOpen)}
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 focus:outline-hidden touch-target"
            aria-label="More candidate tools and settings"
            aria-expanded={moreSheetOpen}
          >
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
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
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
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

      {/* "More" Bottom Sheet Drawer Modal (Safe-Area Aware) */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMoreSheetOpen(false)}
          />

          {/* Slide-up Sheet */}
          <div
            className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col animate-in slide-in-from-bottom duration-250"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Sheet Drag Handle & Header */}
            <div className="px-5 pt-3 pb-3 border-b border-slate-100 bg-slate-50/80">
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
                  className="touch-target flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                  aria-label="Close sheet"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Body with All "More" Items */}
            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {/* Profile Card Header */}
              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
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
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Active Candidate'}</p>
                  </div>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMoreSheetOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Tools List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-1">
                  Workspace Features
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {moreCandidateTools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = pathname === tool.href || pathname.startsWith(tool.href);

                    return (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        onClick={() => setMoreSheetOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all touch-target ${
                          isActive
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="truncate font-bold text-slate-900">{tool.name}</p>
                            {tool.description && (
                              <p className="text-[10px] text-slate-400 truncate font-normal">
                                {tool.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {tool.badge && (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-blue-100 text-blue-700 shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Admin Portal Switcher if user is admin */}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMoreSheetOpen(false)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors text-xs font-semibold text-indigo-900 touch-target"
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
            <div className="p-4 border-t border-slate-100 bg-slate-50/60">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full touch-target flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100/70 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loggingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-rose-600" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
