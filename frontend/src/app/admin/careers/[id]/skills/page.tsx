'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  Brain,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function CareerSkillMappingPage() {
  const params = useParams();
  const careerId = params?.id as string;
  const [careerTitle, setCareerTitle] = useState('Career Role');
  const [mappings, setMappings] = useState<any[]>([
    { id: 'm-1', skill: 'Python', level: 'ADVANCED', importance: 'HIGH', weight: 1.0 },
    { id: 'm-2', skill: 'Machine Learning & Neural Networks', level: 'INTERMEDIATE', importance: 'HIGH', weight: 0.9 },
    { id: 'm-3', skill: 'SQL & Data Modeling', level: 'INTERMEDIATE', importance: 'MEDIUM', weight: 0.7 },
    { id: 'm-4', skill: 'MLOps & Docker', level: 'INTERMEDIATE', importance: 'HIGH', weight: 0.8 },
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('INTERMEDIATE');
  const [newImportance, setNewImportance] = useState('HIGH');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    const newEntry = {
      id: `m-${Date.now()}`,
      skill: newSkill.trim(),
      level: newLevel,
      importance: newImportance,
      weight: newImportance === 'HIGH' ? 1.0 : newImportance === 'MEDIUM' ? 0.7 : 0.4,
    };
    setMappings([...mappings, newEntry]);
    setNewSkill('');
    setSavedMsg(`Mapped "${newEntry.skill}" to career profile.`);
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const handleRemoveMapping = (id: string) => {
    setMappings(mappings.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/careers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Career Catalog</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Career-Skill Competency Mapping</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Define required skill proficiencies, priority weights, and impact on the Skill Gap Engine.
            </p>
          </div>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Add New Mapping Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Add Required Competency
        </h3>
        <form onSubmit={handleAddMapping} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Skill Name</label>
            <input
              type="text"
              required
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. PyTorch, Kubernetes, System Design"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Level</label>
            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Importance</label>
            <select
              value={newImportance}
              onChange={(e) => setNewImportance(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="HIGH">High Priority (Weight 1.0)</option>
              <option value="MEDIUM">Medium Priority (Weight 0.7)</option>
              <option value="LOW">Low Priority (Weight 0.4)</option>
            </select>
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Competency Mapping</span>
            </button>
          </div>
        </form>
      </div>

      {/* Mappings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Skill</th>
                <th className="px-4 py-3.5">Required Level</th>
                <th className="px-4 py-3.5">Importance</th>
                <th className="px-4 py-3.5">Priority Weight</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mappings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.skill}</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                      {item.level.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.importance === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {item.importance}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{item.weight}x</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveMapping(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Mapping"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
