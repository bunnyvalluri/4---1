'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Sparkles,
  LayoutDashboard,
  BrainCircuit,
  Map,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Layers,
  FileCheck,
  MessageSquare,
  BarChart2,
  FolderGit2,
  ChevronRight,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/onboarding');

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 group-hover:scale-[1.03] transition-transform">
            <Compass className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              Career<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Guidance Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {!user ? (
            <div className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Home
              </Link>
              <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                How It Works
              </Link>
              <Link href="/recommendations" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Careers
              </Link>
              <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </Link>
              <Link href="/#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
                Dashboard
              </Link>
              <Link
                href="/assessment"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  pathname.startsWith('/assessment')
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BrainCircuit className="h-3.5 w-3.5 text-indigo-600" />
                Diagnostic
              </Link>
              <Link
                href="/recommendations"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  pathname.startsWith('/recommendations') || pathname.startsWith('/careers')
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Matches
              </Link>
              <Link
                href="/skills"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  pathname.startsWith('/skills')
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5 text-emerald-600" />
                Skill Gaps
              </Link>
              <Link
                href="/roadmap"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  pathname.startsWith('/roadmap')
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Map className="h-3.5 w-3.5 text-blue-600" />
                Roadmap
              </Link>
              <Link
                href="/resume"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  pathname.startsWith('/resume')
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5 text-violet-600" />
                Resume ATS
              </Link>
              <Link
                href="/chat"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  pathname.startsWith('/chat')
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                AI Copilot
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    pathname.startsWith('/admin')
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  Admin
                </Link>
              )}
            </div>
          )}
        </nav>

        {/* Right CTA / User Profile */}
        <div className="hidden lg:flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <span>Get Started</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-slate-200/80 pl-4">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/70 transition-colors"
                title="View Profile Settings"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[110px] leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">Candidate</div>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 lg:hidden space-y-4 max-h-[85vh] overflow-y-auto">
          {!user ? (
            <div className="space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Home
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                How It Works
              </Link>
              <Link
                href="/recommendations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Explore Careers
              </Link>
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Features & Science
              </Link>
              <div className="pt-4 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-sm"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* User Profile Snippet */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xs">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{user.name}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[180px]">{user.email}</div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Settings
                </Link>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-1">
                <div className="px-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Career Telemetry
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname === '/dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-blue-600" />
                  Dashboard
                </Link>
                <Link
                  href="/assessment"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname.startsWith('/assessment') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BrainCircuit className="h-4 w-4 text-indigo-600" />
                  Career Assessment
                </Link>
                <Link
                  href="/recommendations"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname.startsWith('/recommendations') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Career Matches
                </Link>
                <Link
                  href="/skills"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname.startsWith('/skills') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <BarChart2 className="h-4 w-4 text-emerald-600" />
                  Skill Gaps
                </Link>
              </div>

              <div className="space-y-1">
                <div className="px-2 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Execution & Tools
                </div>
                <Link
                  href="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname.startsWith('/roadmap') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Map className="h-4 w-4 text-blue-600" />
                  Learning Roadmap
                </Link>
                <Link
                  href="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname.startsWith('/projects') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FolderGit2 className="h-4 w-4 text-indigo-500" />
                  Portfolio Projects
                </Link>
                <Link
                  href="/resume"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname.startsWith('/resume') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileCheck className="h-4 w-4 text-violet-600" />
                  Resume ATS Scanner
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                    pathname.startsWith('/chat') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  AI Career Assistant
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl ${
                      pathname.startsWith('/admin') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    Admin Portal
                  </Link>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
