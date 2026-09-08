'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { SkillItem, CanonicalSkill } from '@/lib/hooks/useSkillIntelligence';

interface AddEditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSkill: SkillItem | null;
  canonicalSkills: CanonicalSkill[];
  onAddSkill: (payload: {
    name: string;
    proficiency: number;
    years_of_experience: number;
    category?: string;
    evidence_source?: string;
  }) => Promise<any>;
  onPatchSkill: (
    skillId: string,
    updates: {
      proficiency?: number;
      years_of_experience?: number;
      category?: string;
      evidence_source?: string;
    }
  ) => Promise<any>;
}

export function AddEditSkillModal({
  isOpen,
  onClose,
  editingSkill,
  canonicalSkills = [],
  onAddSkill,
  onPatchSkill,
}: AddEditSkillModalProps) {
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('TECHNICAL');
  const [proficiency, setProficiency] = useState<number>(2);
  const [yearsExperience, setYearsExperience] = useState<number>(1.5);
  const [evidenceSource, setEvidenceSource] = useState('Profile');
  const [suggestions, setSuggestions] = useState<CanonicalSkill[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingSkill) {
      setSkillName(editingSkill.name);
      setCategory(editingSkill.category || 'TECHNICAL');
      setProficiency(editingSkill.proficiency || 2);
      setYearsExperience(editingSkill.years_of_experience || 1.0);
      setEvidenceSource(editingSkill.evidence_sources?.[0] || 'Profile');
    } else {
      setSkillName('');
      setCategory('TECHNICAL');
      setProficiency(2);
      setYearsExperience(1.5);
      setEvidenceSource('Profile');
    }
    setFormError(null);
  }, [editingSkill, isOpen]);

  // Autocomplete suggestion handler
  const handleNameChange = (val: string) => {
    setSkillName(val);
    setFormError(null);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    const q = val.toLowerCase().trim();
    const matched = canonicalSkills
      .filter(
        (cs) =>
          cs.name.toLowerCase().includes(q) ||
          cs.aliases.some((a) => a.toLowerCase().includes(q))
      )
      .slice(0, 5);
    setSuggestions(matched);
  };

  const selectSuggestion = (cs: CanonicalSkill) => {
    setSkillName(cs.name);
    setCategory(cs.category);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) {
      setFormError('Skill name is required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingSkill) {
        await onPatchSkill(editingSkill.id || editingSkill.name, {
          proficiency,
          years_of_experience: yearsExperience,
          category,
          evidence_source: evidenceSource,
        });
      } else {
        await onAddSkill({
          name: skillName.trim(),
          proficiency,
          years_of_experience: yearsExperience,
          category,
          evidence_source: evidenceSource,
        });
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save skill. Please verify fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              {editingSkill ? (
                <>
                  <Edit2 className="h-5 w-5 text-blue-600" />
                  <span>Edit Skill Competency</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span>Add Skill to Profile</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Normalizes aliases canonicalizing into unified skill intelligence.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Skill Name with Autocomplete */}
          <div className="space-y-1.5 relative">
            <label className="font-bold text-slate-700 block">
              Skill Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ReactJS, PostgreSQL, Python, Docker..."
              value={skillName}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={Boolean(editingSkill)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-60"
            />

            {/* Suggestions list */}
            {suggestions.length > 0 && !editingSkill && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Canonical Matches
                </div>
                {suggestions.map((cs) => (
                  <button
                    key={cs.name}
                    type="button"
                    onClick={() => selectSuggestion(cs)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-800">{cs.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{cs.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="TECHNICAL">Technical Core</option>
              <option value="LANGUAGES">Programming Languages</option>
              <option value="FRAMEWORKS">Frameworks & Libraries</option>
              <option value="DATABASES">Databases & Storage</option>
              <option value="CLOUD">Cloud & DevOps</option>
              <option value="TOOLS">Developer Tools</option>
              <option value="SOFT">Soft Skills & Professional</option>
            </select>
          </div>

          {/* Proficiency Level Pills */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              Proficiency Level: <strong className="text-blue-600">
                {proficiency === 1 ? 'Beginner' : proficiency === 2 ? 'Intermediate' : proficiency === 3 ? 'Advanced' : 'Expert'}
              </strong>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 1, label: 'Beginner' },
                { val: 2, label: 'Intermediate' },
                { val: 3, label: 'Advanced' },
                { val: 4, label: 'Expert' },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  type="button"
                  onClick={() => setProficiency(lvl.val)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                    proficiency === lvl.val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Years of Experience & Evidence Source */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Years Experience</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Primary Evidence</label>
              <select
                value={evidenceSource}
                onChange={(e) => setEvidenceSource(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="Profile">Self-Reported Profile</option>
                <option value="Project">Portfolio Project</option>
                <option value="Resume">Resume Document</option>
                <option value="Assessment">Cognitive Assessment</option>
                <option value="Certification">Industry Certification</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : editingSkill ? 'Save Changes' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
