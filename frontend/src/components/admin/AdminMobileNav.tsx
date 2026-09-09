'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Users,
  BarChart3,
  Bell,
  MoreHorizontal,
  X,
  Briefcase,
  Brain,
  Layers,
  ClipboardCheck,
  HelpCircle,
  Map,
  FolderKanban,
  BookOpen,
  Bot,
  FileText,
  Activity,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
} from 'lucide-react';

interface AdminMobileNavProps {
  onOpenSidebar?: () => void;
  adminName?: string;
  adminEmail?: string;
}

interface QuickLinkItem {
  name: string;
  href: string;
  icon: React.ElementType;
  section: string;
  badge?: string;
}

const moreMenuItems: QuickLinkItem[] = [
  // Career Intelligence
  { name: 'Careers', href: '/admin/careers', icon: Briefcase, section: 'Career Intelligence' },
  { name: 'Skills', href: '/admin/skills', icon: Brain, section: 'Career Intelligence' },
  { name: 'Career Mapping', href: '/admin/careers/mapping', icon: Layers, section: 'Career Intelligence' },

  // Assessments
  { name: 'Assessments', href: '/admin/assessments', icon: ClipboardCheck, section: 'Assessments' },
  { name: 'Question Bank', href: '/admin/questions', icon: HelpCircle, section: 'Assessments' },

  // Content & Learning
  { name: 'Roadmaps', href: '/admin/roadmaps', icon: Map, section: 'Content' },
  { name: 'Projects', href: '/admin/projects', icon: FolderKanban, section: 'Content' },
  { name: 'Resources', href: '/admin/resources', icon: BookOpen, section: 'Content' },

  // AI & Analytics
  { name: 'AI Monitoring', href: '/admin/ai', icon: Bot, section: 'AI & Data' },
  { name: 'Resume Analytics', href: '/admin/resumes', icon: FileText, section: 'AI & Data' },

  // System
  { name: 'System Health', href: '/admin/system-health', icon: Activity, section: 'System' },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, section: 'System' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, section: 'System' },
];

export function AdminMobileNav({
  onOpenSidebar,
  adminName = 'Administrator',
  adminEmail = '',
}: AdminMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close sheet when pathname changes (standard React pattern)
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
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed
    }
    router.push('/login');
    router.refresh();
  };

  // Nav item checks
  const isDashboardActive = pathname === '/admin/dashboard' || pathname === '/admin';
  const isUsersActive =
    pathname.startsWith('/admin/candidates') || pathname.startsWith('/admin/users');
  const isAnalyticsActive = pathname.startsWith('/admin/analytics');
  const isActivityActive =
    pathname.startsWith('/admin/audit-logs') || pathname.startsWith('/admin/notifications');

  // Red badge indicator for activity
  const showActivityBadge = !isActivityActive;

  return (
    <>
      {/* Floating Pill Mobile Navigation Dock (Hidden on Desktop >= 1024px) */}
      <nav
        aria-label="Mobile admin bottom navigation"
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-6 max-w-md mx-auto z-40 lg:hidden pointer-events-auto select-none"
        style={{
          bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        }}
      >
        <div className="flex items-center justify-around bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-full shadow-[0_10px_35px_-5px_rgba(15,23,42,0.16)] px-3 py-1.5 transition-all">
          {/* 1. Dashboard Tab */}
          <Link
            href="/admin/dashboard"
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

          {/* 2. Users Tab */}
          <Link
            href="/admin/candidates"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
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
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
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
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
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
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                isAnalyticsActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Analytics
            </span>
          </Link>

          {/* 4. Activity Tab (with red indicator badge) */}
          <Link
            href="/admin/audit-logs"
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95"
          >
            <div
              className={`relative flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                isActivityActive
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                  : 'text-slate-600 group-hover:text-slate-900'
              }`}
            >
              <Bell
                className={`h-5 w-5 transition-colors ${
                  isActivityActive ? 'text-blue-600 stroke-[2.25]' : 'text-slate-600'
                }`}
              />
              {/* Red Notification Indicator Dot */}
              {showActivityBadge && (
                <span className="absolute top-1 right-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white"></span>
                </span>
              )}
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                isActivityActive
                  ? 'font-bold text-blue-600'
                  : 'font-medium text-slate-500 group-hover:text-slate-800'
              }`}
            >
              Activity
            </span>
          </Link>

          {/* 5. More Tab (Three Dots) */}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(!moreSheetOpen)}
            className="flex flex-col items-center justify-center flex-1 py-1 group transition-transform active:scale-95 focus:outline-hidden"
            aria-label="More navigation options"
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
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Admin Control Center</h3>
                  <p className="text-[11px] text-slate-500">Quick access to all admin management tools</p>
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
                  href="/admin/profile"
                  onClick={() => setMoreSheetOpen(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {adminName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{adminName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
                  </div>
                </Link>
                <Link
                  href="/admin/profile"
                  onClick={() => setMoreSheetOpen(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Profile
                </Link>
              </div>

              {/* Grid of Admin Tools */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-1">
                  Management & Tools
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreSheetOpen(false)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate">{item.name}</span>
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
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-800"
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
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50/80 border border-rose-200 hover:bg-rose-100/70 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out from Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
