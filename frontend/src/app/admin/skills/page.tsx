'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Plus,
  Search,
  CheckCircle2,
  X,
  Layers,
  Tag,
  Sparkles,
} from 'lucide-react';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<any[]>([
    { id: 'sk-1', name: 'Python', category: 'Programming', aliases: ['Python 3', 'Python Programming'], demand_score: 95 },
    { id: 'sk-2', name: 'TypeScript', category: 'Frontend & Full Stack', aliases: ['TS', 'TypeScript 5'], demand_score: 92 },
    { id: 'sk-3', name: 'PyTorch', category: 'Machine Learning', aliases: ['Torch', 'PyTorch ML'], demand_score: 89 },
    { id: 'sk-4', name: 'Docker', category: 'DevOps & Cloud', aliases: ['Containerization', 'Docker Compose'], demand_score: 88 },
    { id: 'sk-5', name: 'PostgreSQL', category: 'Database', aliases: ['Postgres', 'PostgreSQL 16'], demand_score: 86 },
    { id: 'sk-6', name: 'System Design', category: 'Architecture', aliases: ['Distributed Systems', 'System Architecture'], demand_score: 94 },
  ]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Technical');
  const [newAliases, setNewAliases] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const aliasList = newAliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const newSkill = {
      id: `sk-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      aliases: aliasList,
      demand_score: 85,
    };

    setSkills([newSkill, ...skills]);
    setNewName('');
    setNewAliases('');
    setShowAddModal(false);
    setSuccessMsg(`Skill "${newSkill.name}" added to catalog.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Skill Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate canonical skills, category taxonomy, and normalization aliases.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Skill</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skill catalog by name or category..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((skill) => (
          <div
            key={skill.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {skill.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-slate-500 text-xs">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px]">Aliases:</span>
                <span className="text-[11px] font-medium text-slate-700">
                  {skill.aliases.join(', ') || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span>Market Demand</span>
              <span className="font-bold text-slate-800">{skill.demand_score}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Create Canonical Skill
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. FastAPI"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Aliases (comma-separated)</label>
                <input
                  type="text"
                  value={newAliases}
                  onChange={(e) => setNewAliases(e.target.value)}
                  placeholder="FastAPI Framework, Python FastAPI"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
