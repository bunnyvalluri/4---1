'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  ShieldCheck,
  Briefcase as BriefcaseBusiness,
  Brain,
  Layers,
  ClipboardCheck,
  HelpCircle,
  TrendingUp,
  Map,
  FolderKanban,
  BookOpen,
  Bot,
  FileText,
  Bell,
  ScrollText as Logs,
  Activity,
  Settings,
  User as UserRound,
  LogOut,
  Shield,
  X,
  ChevronRight,
} from 'lucide-react';
import { signOutFirebase } from '@/lib/firebase/client';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  adminName?: string;
  adminEmail?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'USER MANAGEMENT',
    items: [
      { name: 'Candidates', href: '/admin/candidates', icon: Users },
      { name: 'Admins', href: '/admin/users', icon: ShieldCheck },
    ],
  },
  {
    title: 'CAREER INTELLIGENCE',
    items: [
      { name: 'Careers', href: '/admin/careers', icon: BriefcaseBusiness },
      { name: 'Skills', href: '/admin/skills', icon: Brain },
      { name: 'Career-Skill Mapping', href: '/admin/careers/mapping', icon: Layers },
    ],
  },
  {
    title: 'ASSESSMENT',
    items: [
      { name: 'Assessments', href: '/admin/assessments', icon: ClipboardCheck },
      { name: 'Question Bank', href: '/admin/questions', icon: HelpCircle },
      { name: 'Assessment Analytics', href: '/admin/assessments/analytics', icon: TrendingUp },
    ],
  },
  {
    title: 'CONTENT & LEARNING',
    items: [
      { name: 'Roadmaps', href: '/admin/roadmaps', icon: Map },
      { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
      { name: 'Learning Resources', href: '/admin/resources', icon: BookOpen },
    ],
  },
  {
    title: 'AI & RESUME',
    items: [
      { name: 'AI Monitoring', href: '/admin/ai', icon: Bot },
      { name: 'Resume Analytics', href: '/admin/resumes', icon: FileText },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: Logs },
      { name: 'System Health', href: '/admin/system-health', icon: Activity },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
  adminName = 'Administrator',
  adminEmail = '',
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      if (onMobileClose) onMobileClose();
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

  const NavContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <BrandLogo href="/admin/dashboard" badge="Admin" subtext="Control Center" size="md" />
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {section.title}
            </h3>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile & Sign Out Footer */}
      <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/50">
        <Link
          href="/admin/profile"
          onClick={onMobileClose}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all group"
        >
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {adminName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{adminEmail}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
        </Link>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 rounded-lg transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <NavContent />
      </aside>

      {/* Mobile Drawer Navigation (< 1024px) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}
