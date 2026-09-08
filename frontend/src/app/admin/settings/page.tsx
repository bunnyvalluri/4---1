'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('CareerAI Platform');
  const [threshold, setThreshold] = useState(60);
  const [rateLimit, setRateLimit] = useState(60);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg('System configuration updated and logged to audit ledger.');
    setTimeout(() => setSavedMsg(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Engine Configuration</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure matching thresholds, API rate limiting, and core platform behavior.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            General Application Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform Brand Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">API Rate Limit (req/min)</label>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Career Recommendation Engine Thresholds
          </h2>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Minimum Match Score Threshold</span>
              <span className="font-extrabold text-blue-600">{threshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Candidates with affinity scores lower than this will not receive this career as a primary recommendation.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenance"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="maintenance" className="text-xs font-bold text-slate-700">
              Enable Scheduled Maintenance Mode
            </label>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
