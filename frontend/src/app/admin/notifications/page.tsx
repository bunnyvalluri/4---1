'use client';

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Clock } from 'lucide-react';

export default function AdminNotificationsPage() {
  const notifications = [
    {
      id: 'notif-1',
      title: 'Platform System Health Operational',
      description: 'All 5 critical platform infrastructure nodes are responding within normal latency thresholds.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'HEALTH',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'notif-2',
      title: 'Candidate Influx Milestone',
      description: 'Candidate registrations have grown by 12% in the past 7 days across Software Engineering and AI tracks.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      type: 'ANALYTICS',
      icon: Info,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'notif-3',
      title: 'AI Rate Limit Auto-Mitigated',
      description: 'Google Gemini token latency backoff was successfully handled by the offline fallback engine without candidate interruption.',
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      type: 'AI_SYSTEM',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin Notification Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational alerts, platform events, and system notifications.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const Icon = notif.icon;
          return (
            <div
              key={notif.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl border ${notif.color} shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
