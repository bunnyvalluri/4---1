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
} from 'lucide-react';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName = 'User', userEmail = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', href: '/profile', icon: User },
    { label: 'Career Assessment', href: '/assessment', icon: BrainCircuit },
    { label: 'Career Matches', href: '/recommendations', icon: Sparkles },
    { label: 'Skill Gaps', href: '/skills', icon: BarChart2 },
    { label: 'Learning Roadmap', href: '/roadmap', icon: Map },
    { label: 'Projects', href: '/projects', icon: FolderGit2 },
    { label: 'Resume Analyzer', href: '/resume', icon: FileCheck },
    { label: 'AI Career Assistant', href: '/chat', icon: MessageSquare },
    { label: 'Progress', href: '/dashboard#progress', icon: TrendingUp },
    { label: 'Settings', href: '/profile#settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-50/70 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden lg:flex">
      <div className="space-y-6">
        {/* User Mini Profile Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm border border-blue-200">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-sm text-slate-900 truncate">{userName}</div>
              <div className="text-xs text-slate-500 truncate">{userEmail || 'Active Candidate'}</div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Career Journey
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Logout */}
      <div className="pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
