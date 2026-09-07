'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  Sparkles,
  BrainCircuit,
  BarChart2,
  Map,
  FolderGit2,
  FileCheck,
  MessageSquare,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveDrawer } from '@/components/ui/ResponsiveDrawer';

interface DashboardSidebarProps {
  userName?: string;
  userEmail?: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function DashboardSidebar({
  userName = 'Alex Johnson',
  userEmail = 'alex@example.com',
  mobileOpen,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Career Match', href: '/recommendations', icon: Sparkles, badge: 'AI' },
    { label: 'Assessments', href: '/assessment', icon: BrainCircuit },
    { label: 'Skill Gap', href: '/skills', icon: BarChart2 },
    { label: 'Learning Roadmap', href: '/roadmap', icon: Map },
    { label: 'Portfolio Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Resume ATS', href: '/resume', icon: FileCheck, badge: 'ATS' },
    { label: 'AI Assistant', href: '/chat', icon: MessageSquare, badge: 'Live' },
  ];

  const renderNavLinks = (isMobile: boolean) => (
    <div className="space-y-1">
      <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
        Navigation
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={isMobile ? onCloseMobile : undefined}
            className={`group flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              isActive
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
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
  );

  const initial = (userName || 'A').charAt(0).toUpperCase();

  const userProfileCard = (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs shadow-xs">
          {initial}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>
        <div className="overflow-hidden min-w-0">
          <div className="font-bold text-xs text-slate-900 truncate">{userName}</div>
          <div className="text-[10px] text-slate-500 truncate mt-0.5">{userEmail}</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ======================================================== */}
      {/* DESKTOP PERSISTENT SIDEBAR (>=1024px) */}
      {/* ======================================================== */}
      <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-slate-50/70 h-[calc(100vh-4rem)] sticky top-16 flex-col justify-between p-4 hidden lg:flex overflow-y-auto">
        <div className="space-y-5">
          {/* Brand Header */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Compass className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
                Career<span className="text-blue-600">AI</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                Intelligence Center
              </span>
            </div>
          </Link>

          {/* User Profile Capsule */}
          {userProfileCard}

          {/* Nav Items */}
          {renderNavLinks(false)}
        </div>

        {/* Bottom Actions: Preferences & Sign Out */}
        <div className="pt-3 border-t border-slate-200/80 space-y-1">
          <Link
            href="/profile"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors"
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
        onClose={onCloseMobile}
        title={
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Compass className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-900">CareerAI Navigation</span>
          </div>
        }
      >
        <div className="space-y-5 pt-2">
          {userProfileCard}
          {renderNavLinks(true)}

          <div className="pt-4 border-t border-slate-200 space-y-1">
            <Link
              href="/profile"
              onClick={onCloseMobile}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Preferences</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
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
