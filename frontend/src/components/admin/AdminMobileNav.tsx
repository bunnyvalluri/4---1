'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  MoreHorizontal,
  X,
  Briefcase,
  Brain,
  Layers,
  ClipboardCheck,
  HelpCircle,
  Map,
  FolderKanban,
  Bot,
  FileText,
  Bell,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Loader2,
  Shield,
} from 'lucide-react';
import { signOutFirebase } from '@/lib/firebase/client';

interface AdminMobileNavProps {
  onOpenSidebar?: () => void;
  adminName?: string;
  adminEmail?: string;
}

interface AdminToolItem {
  name: string;
  href: string;
  icon: React.ElementType;
  section: string;
  badge?: string;
}

const adminMoreItems: AdminToolItem[] = [
  // Assessments & Careers
  { name: 'Assessments', href: '/admin/assessments', icon: ClipboardCheck, section: 'Assessments' },
  { name: 'Question Bank', href: '/admin/questions', icon: HelpCircle, section: 'Assessments' },
  { name: 'Careers Directory', href: '/admin/careers', icon: Briefcase, section: 'Careers & Skills' },
  { name: 'Skills Taxonomy', href: '/admin/skills', icon: Brain, section: 'Careers & Skills' },
  { name: 'Career Mapping', href: '/admin/careers/mapping', icon: Layers, section: 'Careers & Skills' },

  // Content & Learning
  { name: 'Roadmaps', href: '/admin/roadmaps', icon: Map, section: 'Learning' },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban, section: 'Learning' },
  { name: 'Resumes & ATS', href: '/admin/resumes', icon: FileText, section: 'AI & Data' },
  { name: 'AI Monitoring', href: '/admin/ai', icon: Bot, section: 'AI & Data' },

  // System & Security
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, section: 'System & Security' },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: Activity, section: 'System & Security' },
  { name: 'Security & Health', href: '/admin/system-health', icon: ShieldAlert, section: 'System & Security' },
  { name: 'Portal Settings', href: '/admin/settings', icon: Settings, section: 'System & Security' },
];

export function AdminMobileNav({
  onOpenSidebar,
  adminName = 'Administrator',
  adminEmail = '',
}: AdminMobileNavProps) {
  const pathname = usePathname();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close sheet when route changes
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMoreSheetOpen(false);
  }

  // Prevent background scroll when more drawer is open
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
    } catch (err) {
      console.error('Logout error:', err);
      window.location.replace('/login');
    }
  };

  // Nav item active determinations
  const isDashboardActive = pathname === '/admin/dashboard' || pathname === '/admin';
  const isUsersActive =
    pathname.startsWith('/admin/users') || pathname.startsWith('/admin/candidates');
  const isAnalyticsActive = pathname.startsWith('/admin/analytics');
  const isActivityActive =
    pathname.startsWith('/admin/audit-logs') || pathname.startsWith('/admin/notifications');

  return (
    <>
      {/* Floating Pill Mobile Navigation Dock (Hidden on Desktop >= 1024px) */}
      <nav
        aria-label="Admin mobile navigation dock"
        className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-lg mx-auto z-40 lg:hidden pointer-events-auto select-none"
        style={{
          bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))',
        }}
      >
        <div className="flex items-center justify-around bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-[0_10px_35px_-5px_rgba(15,23,42,0.18)] px-2 py-1.5 transition-all">
          {/* 1. Dashboard Tab */}
          <Link
            href="/admin/dashboard"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 touch-target"
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

          {/* 2. Users Tab */}
          <Link
            href="/admin/users"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 touch-target"
          >
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                isUsersActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <Users
                className={`h-5 w-5 transition-colors ${
                  isUsersActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                isUsersActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Users
            </span>
          </Link>

          {/* 3. Analytics Tab */}
          <Link
            href="/admin/analytics"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 touch-target"
          >
            <div
              className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                isAnalyticsActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <BarChart3
                className={`h-5 w-5 transition-colors ${
                  isAnalyticsActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                isAnalyticsActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Analytics
            </span>
          </Link>

          {/* 4. Activity Tab */}
          <Link
            href="/admin/audit-logs"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 touch-target"
          >
            <div
              className={`relative flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${
                isActivityActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <Activity
                className={`h-5 w-5 transition-colors ${
                  isActivityActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
              <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </div>
            <span
              className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-colors ${
                isActivityActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Activity
            </span>
          </Link>

          {/* 5. More Tab (Admin Control Drawer) */}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(!moreSheetOpen)}
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 focus:outline-hidden touch-target cursor-pointer"
            aria-label="More administrative tools"
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

      {/* "More" Bottom Sheet Drawer Modal (Mobile/Tablet only) */}
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
            {/* Sheet Handle & Header */}
            <div className="px-5 pt-3 pb-3 border-b border-slate-100 bg-slate-50/80">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Admin Control Center</h3>
                    <p className="text-[11px] text-slate-500">Enterprise Administration & Monitoring</p>
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

            {/* Scrollable Quick Links Content */}
            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {/* Profile Card */}
              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                <Link
                  href="/admin/profile"
                  onClick={() => setMoreSheetOpen(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{adminEmail || 'Super Administrator'}</p>
                  </div>
                </Link>
                <Link
                  href="/admin/profile"
                  onClick={() => setMoreSheetOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Settings
                </Link>
              </div>

              {/* Grid of Admin Tools */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-1">
                  Management & Tools
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {adminMoreItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMoreSheetOpen(false)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all touch-target ${
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
                          <span className="truncate">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Open full drawer option */}
              {onOpenSidebar && (
                <button
                  type="button"
                  onClick={() => {
                    setMoreSheetOpen(false);
                    onOpenSidebar();
                  }}
                  className="w-full touch-target flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <Menu className="h-4 w-4 text-slate-500" />
                    <span>Open Full Navigation Drawer</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
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
                    <span>Sign Out from Admin</span>
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
