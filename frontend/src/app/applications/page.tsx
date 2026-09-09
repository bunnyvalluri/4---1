'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Plus, Trash2, ExternalLink, Briefcase, TrendingUp, CheckCircle2, XCircle, Star, GripVertical } from 'lucide-react';

type AppStatus = 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';

interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary?: string;
  location?: string;
  url?: string;
  notes?: string;
  date: string;
  status: AppStatus;
  starred: boolean;
}

const COLUMNS: { id: AppStatus; label: string; color: string; bg: string; border: string; icon: React.ReactNode }[] = [
  { id: 'Wishlist', label: 'Wishlist', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: <Star className="h-4 w-4" /> },
  { id: 'Applied', label: 'Applied', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'Interview', label: 'Interview', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'Offer', label: 'Offer 🎉', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="h-4 w-4" /> },
  { id: 'Rejected', label: 'Rejected', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="h-4 w-4" /> },
];

const STORAGE_KEY = 'careerai_applications';

function loadApps(): JobApplication[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveApps(apps: JobApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', salary: '', location: '', url: '', notes: '', status: 'Applied' as AppStatus });

  useEffect(() => { setApps(loadApps()); }, []);

  const addApp = () => {
    if (!form.company || !form.role) return;
    const newApp: JobApplication = {
      id: Date.now().toString(),
      ...form,
      date: new Date().toISOString().split('T')[0],
      starred: false,
    };
    const updated = [newApp, ...apps];
    setApps(updated);
    saveApps(updated);
    setAdding(false);
    setForm({ company: '', role: '', salary: '', location: '', url: '', notes: '', status: 'Applied' });
  };

  const moveApp = (id: string, status: AppStatus) => {
    const updated = apps.map(a => a.id === id ? { ...a, status } : a);
    setApps(updated);
    saveApps(updated);
  };

  const deleteApp = (id: string) => {
    const updated = apps.filter(a => a.id !== id);
    setApps(updated);
    saveApps(updated);
  };

  const toggleStar = (id: string) => {
    const updated = apps.map(a => a.id === id ? { ...a, starred: !a.starred } : a);
    setApps(updated);
    saveApps(updated);
  };

  const stats = {
    total: apps.length,
    applied: apps.filter(a => a.status === 'Applied').length,
    interviews: apps.filter(a => a.status === 'Interview').length,
    offers: apps.filter(a => a.status === 'Offer').length,
  };

  return (
    <DashboardShell userName="Candidate" userEmail="" telemetryStatus="Live" lastUpdatedText="just now" notifications={[]} onRefresh={() => {}} onMarkNotificationRead={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Job Application Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">Track every application from wishlist to offer</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-white' },
            { label: 'Applied', value: stats.applied, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Interviews', value: stats.interviews, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Offers', value: stats.offers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-200 p-4 text-center`}>
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add form modal */}
        {adding && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900">Add New Application</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Company *</label>
                  <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Google, Meta, Startup..." value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Role *</label>
                  <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Software Engineer, PM..." value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Salary</label>
                  <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="$100K - $150K" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Status</label>
                  <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as AppStatus })}>
                    {COLUMNS.map(c => <option key={c.id}>{c.id}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Location</label>
                  <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Remote, NYC, Bangalore..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Notes</label>
                  <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={2} placeholder="Referral contact, interview tips..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={addApp} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors">Add Application</button>
                <button onClick={() => setAdding(false)} className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-2.5 text-sm font-bold transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => {
            const colApps = apps.filter(a => a.status === col.id);
            return (
              <div key={col.id} className="flex-shrink-0 w-72">
                <div className={`rounded-2xl border ${col.border} ${col.bg} p-4 space-y-3`}>
                  {/* Column header */}
                  <div className={`flex items-center justify-between`}>
                    <div className={`flex items-center gap-2 font-black text-sm ${col.color}`}>
                      {col.icon}
                      {col.label}
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-white rounded-full px-2 py-0.5 border border-slate-200">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 min-h-[120px]">
                    {colApps.map(app => (
                      <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-black text-sm text-slate-900 truncate">{app.company}</div>
                            <div className="text-xs text-slate-500 truncate">{app.role}</div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => toggleStar(app.id)} className="p-1 rounded-lg hover:bg-amber-50 transition-colors">
                              <Star className={`h-3.5 w-3.5 ${app.starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                            </button>
                            <button onClick={() => deleteApp(app.id)} className="p-1 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>

                        {app.salary && <div className="text-[11px] font-bold text-emerald-600">{app.salary}</div>}
                        {app.location && <div className="text-[11px] text-slate-400">{app.location}</div>}
                        {app.notes && <div className="text-[11px] text-slate-500 line-clamp-2">{app.notes}</div>}

                        <div className="text-[10px] text-slate-400">{app.date}</div>

                        {/* Move buttons */}
                        <div className="flex gap-1 flex-wrap">
                          {COLUMNS.filter(c => c.id !== col.id).map(c => (
                            <button
                              key={c.id}
                              onClick={() => moveApp(app.id, c.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.border} ${c.color} hover:${c.bg} transition-colors`}
                            >
                              → {c.label.replace(' 🎉', '')}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {colApps.length === 0 && (
                      <div className="text-center py-6 text-slate-300 text-xs">
                        Drop applications here
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
