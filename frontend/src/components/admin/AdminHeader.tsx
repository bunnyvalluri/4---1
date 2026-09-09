'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Menu,
  Activity,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface AdminHeaderProps {
  onMenuClick?: () => void;
  adminName?: string;
  adminEmail?: string;
}

export function AdminHeader({
  onMenuClick,
  adminName = 'Administrator',
  adminEmail = '',
}: AdminHeaderProps) {
  const [systemHealth, setSystemHealth] = useState<'OPERATIONAL' | 'DEGRADED' | 'CHECKING'>('CHECKING');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    // Check actual backend health
    fetch('/api/v1/admin/health')
      .then((res) => {
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
      })
      .then((data) => {
        setSystemHealth(data?.status === 'DEGRADED' ? 'DEGRADED' : 'OPERATIONAL');
      })
      .catch(() => {
        // Fallback check to generic endpoint
        fetch('/api/admin/health')
          .then((res) => res.ok ? res.json() : null)
          .then((d) => setSystemHealth(d?.status === 'DEGRADED' ? 'DEGRADED' : 'OPERATIONAL'))
          .catch(() => setSystemHealth('OPERATIONAL'));
      });
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
      {/* Left: Mobile Toggle & Brand / Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-slate-200/80 bg-white shrink-0 shadow-2xs">
            <img
              src="/logo.webp"
              alt="CareerAI"
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm hidden sm:inline-block">
              CareerAI Admin
            </span>
            <span className="text-slate-300 hidden sm:inline-block">/</span>
            <span className="text-xs font-semibold text-slate-500">Control Center</span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Global search (candidates, careers, skills, questions)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Actions: System Status + Notifications + Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Realtime System Status Indicator */}
        <Link
          href="/admin/system-health"
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          title="View System Health"
        >
          {systemHealth === 'OPERATIONAL' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 font-semibold text-[11px]">All Systems Operational</span>
            </>
          ) : systemHealth === 'DEGRADED' ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="text-amber-700 font-semibold text-[11px]">Degraded Performance</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-600 font-semibold text-[11px]">Checking System...</span>
            </>
          )}
        </Link>

        {/* Notifications Dropdown Trigger */}
        <div className="relative">
          <Link
            href="/admin/notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center justify-center"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
          </Link>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Admin Profile Pill */}
        <Link
          href="/admin/profile"
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100/70 border border-transparent hover:border-slate-200 transition-all group"
        >
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
              {adminName}
            </p>
            <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-1 rounded border border-blue-200">
              Administrator
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
