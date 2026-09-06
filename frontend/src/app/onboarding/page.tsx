'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  User,
  GraduationCap,
  Layers,
  Heart,
  Target,
  BrainCircuit,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Sparkles,
  Upload,
  BookOpen,
  Briefcase,
  Check,
  Shield,
  Zap,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form Fields across 8 steps
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const [degree, setDegree] = useState('Bachelor of Technology');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [college, setCollege] = useState('');
  const [gradYear, setGradYear] = useState(2026);
  const [cgpa, setCgpa] = useState(8.5);

  const [selectedSkills, setSelectedSkills] = useState<{ skillId: string; name: string; proficiency: number }[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [skillSearch, setSkillSearch] = useState('');

  const [interests, setInterests] = useState<string>('Artificial Intelligence, Cloud Native Systems, Web Architecture');
  const [preferredRoles, setPreferredRoles] = useState<string>('Full Stack Developer, AI/ML Engineer');
  const [preferredIndustries, setPreferredIndustries] = useState<string>('SaaS, FinTech, DeepTech');
  const [careerGoals, setCareerGoals] = useState('To build scalable distributed systems and production AI applications.');

  const [resumeText, setResumeText] = useState('');

  const totalSteps = 8;
  const progressPercent = Math.round((step / totalSteps) * 100);

  const stepMeta = [
    { num: 1, label: 'Profile', icon: User },
    { num: 2, label: 'Academics', icon: GraduationCap },
    { num: 3, label: 'Skills', icon: Layers },
    { num: 4, label: 'Interests', icon: Heart },
    { num: 5, label: 'Target Roles', icon: Target },
    { num: 6, label: 'Cognitive', icon: BrainCircuit },
    { num: 7, label: 'Vision', icon: Sparkles },
    { num: 8, label: 'Verification', icon: FileCheck },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, skillsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/skills'),
        ]);
        const profData = await profRes.json();
        const skillsData = await skillsRes.json();

        if (profData?.user) {
          const u = profData.user;
          setFullName(u.name || '');
          setPhone(u.profile?.phone || '');
          setLocation(u.profile?.location || '');
          setBio(u.profile?.bio || '');
          if (u.profile?.degree) setDegree(u.profile.degree);
          if (u.profile?.branch) setBranch(u.profile.branch);
          if (u.profile?.college) setCollege(u.profile.college);
          if (u.profile?.gradYear) setGradYear(u.profile.gradYear);
          if (u.profile?.cgpa) setCgpa(u.profile.cgpa);
          if (u.profile?.interests) setInterests(u.profile.interests.join(', '));
          if (u.profile?.preferredRoles) setPreferredRoles(u.profile.preferredRoles.join(', '));
          if (u.profile?.careerGoals) setCareerGoals(u.profile.careerGoals);

          if (u.skills && u.skills.length > 0) {
            setSelectedSkills(
              u.skills.map((s: any) => ({
                skillId: s.skillId,
                name: s.skill?.name || 'Skill',
                proficiency: s.proficiency || 3,
              }))
            );
          }
        }

        if (skillsData?.catalog) {
          setAvailableSkills(skillsData.catalog);
        }
      } catch (err) {
        console.error('Failed to load onboarding defaults:', err);
      }
    }
    loadData();
  }, []);

  const saveProgress = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const interestsArray = interests.split(',').map((i) => i.trim()).filter(Boolean);
      const rolesArray = preferredRoles.split(',').map((r) => r.trim()).filter(Boolean);
      const industriesArray = preferredIndustries.split(',').map((i) => i.trim()).filter(Boolean);

      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          phone,
          location,
          bio,
          degree,
          branch,
          college,
          gradYear: Number(gradYear),
          cgpa: Number(cgpa),
          interests: interestsArray,
          preferredRoles: rolesArray,
          preferredIndustries: industriesArray,
          careerGoals,
        }),
      });

      if (selectedSkills.length > 0) {
        await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            skills: selectedSkills.map((s) => ({ skillId: s.skillId, proficiency: s.proficiency })),
          }),
        });
      }

      setSaveMessage('Telemetry Saved');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error('Failed to autosave onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/recommendations');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSkill = (skill: any) => {
    const existing = selectedSkills.find((s) => s.skillId === skill.id);
    if (existing) {
      setSelectedSkills(selectedSkills.filter((s) => s.skillId !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, { skillId: skill.id, name: skill.name, proficiency: 4 }]);
    }
  };

  const updateProficiency = (skillId: string, level: number) => {
    setSelectedSkills(
      selectedSkills.map((s) => (s.skillId === skillId ? { ...s, proficiency: level } : s))
    );
  };

  const filteredCatalog = availableSkills.filter((s) =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ======================================================== */}
        {/* TOP BRAND & STEPPER BAR */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">
              Career<span className="text-blue-600">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Step {step} of {totalSteps}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="hidden sm:grid grid-cols-8 gap-2">
          {stepMeta.map((s) => {
            const Icon = s.icon;
            const isDone = s.num < step;
            const isCurrent = s.num === step;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all text-center ${
                  isCurrent
                    ? 'bg-white border-2 border-blue-600 shadow-xs'
                    : isDone
                    ? 'bg-blue-50/80 border border-blue-200 text-blue-700'
                    : 'bg-white/60 border border-slate-200/80 text-slate-400'
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span
                  className={`text-[10px] font-bold truncate max-w-full ${
                    isCurrent ? 'text-blue-600' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Mini Progress Bar */}
        <div className="sm:hidden h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ======================================================== */}
        {/* MAIN WIZARD CARD */}
        {/* ======================================================== */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs space-y-6 relative">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 1 • Profile Baseline
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Information</h2>
                <p className="text-xs text-slate-500">
                  Tell us about yourself so our algorithm can personalize your career trajectory.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Location / City</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Seattle, WA / Remote"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Professional Bio</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Passionate engineer excited by distributed architectures, AI agent workflows, and modern web systems."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 2 • Academic Foundation
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Education Background</h2>
                <p className="text-xs text-slate-500">
                  Cross-disciplinary matching accommodates Computer Science, Design, Business, and Mathematics.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Degree Program</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Bachelor of Technology / BS in Computer Science"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Major / Specialization</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science & Engineering"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Graduation Year</label>
                    <input
                      type="number"
                      value={gradYear}
                      onChange={(e) => setGradYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">CGPA / Percentage (10.0 scale)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills with Proficiency Sliders */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 3 • Technical Telemetry
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Skills Catalog</h2>
                <p className="text-xs text-slate-500">
                  Select your skills and calibrate proficiency from Level 1 (Beginner) to Level 5 (Mastery).
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Search available skills (e.g. React, Python, Docker)..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />

                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1.5 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {filteredCatalog.slice(0, 32).map((skill) => {
                    const isSelected = selectedSkills.some((s) => s.skillId === skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill.name}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Skills Proficiency Calibration */}
                {selectedSkills.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block">
                      Calibrate Selected Skills ({selectedSkills.length})
                    </span>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {selectedSkills.map((s) => (
                        <div
                          key={s.skillId}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
                        >
                          <span className="font-bold text-slate-800">{s.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-500">
                              Lvl {s.proficiency}/5
                            </span>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={s.proficiency}
                              onChange={(e) => updateProficiency(s.skillId, Number(e.target.value))}
                              className="w-24 accent-blue-600 cursor-pointer"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Domain Passion & Interests */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 4 • Affinity Alignment
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Domain Passion & Interests</h2>
                <p className="text-xs text-slate-500">
                  Aligning career recommendations with internal motivation leads to long-term tenure and fulfillment.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Enter Interests (comma-separated)</label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Machine Learning, Distributed Systems, UI/UX Architecture"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500">Click to add popular domains:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Artificial Intelligence',
                      'Cloud Computing',
                      'Cybersecurity',
                      'Full Stack Web',
                      'UI/UX Design',
                      'Data Analytics',
                      'DevOps & CI/CD',
                      'Mobile App Architecture',
                    ].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (!interests.includes(item)) {
                            setInterests(interests ? `${interests}, ${item}` : item);
                          }
                        }}
                        className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Target Roles & Industries */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 5 • Industry Calibration
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Target Roles & Verticals</h2>
                <p className="text-xs text-slate-500">
                  Specify roles you aspire to hold and target market sectors.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Preferred Roles</label>
                  <input
                    type="text"
                    value={preferredRoles}
                    onChange={(e) => setPreferredRoles(e.target.value)}
                    placeholder="Full Stack Developer, AI/ML Engineer, Solutions Architect"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Preferred Industries</label>
                  <input
                    type="text"
                    value={preferredIndustries}
                    onChange={(e) => setPreferredIndustries(e.target.value)}
                    placeholder="Enterprise SaaS, FinTech, Autonomous Tech, DeepTech"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Cognitive Aptitude Baseline */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 6 • Cognitive Fitness
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Aptitude & Psychometrics</h2>
                <p className="text-xs text-slate-500">
                  Aptitude evaluation establishes your objective cognitive baseline against tech benchmarks.
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200/90 bg-blue-50/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Psychometric Diagnostic Available</h4>
                    <p className="text-xs text-slate-600">
                      Standardized test measuring Quantitative, Logical, Verbal, and Analytical reasoning.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <span className="text-slate-600">
                    You can take the 10-question diagnostic now or after onboarding.
                  </span>
                  <Link
                    href="/assessment"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 font-bold text-white shadow-xs hover:bg-blue-700 shrink-0"
                  >
                    <span>Launch Diagnostic</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Stated Career Goals */}
          {step === 7 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 7 • Career Trajectory
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Career Goals & Vision</h2>
                <p className="text-xs text-slate-500">
                  Articulate your 1-3 year objective to guide AI mentorship responses.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700">Career Ambition Statement</label>
                <textarea
                  rows={4}
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="To become a senior engineering leader designing distributed cloud backends and AI copilot agents."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 8: Telemetry Verification & Launch */}
          {step === 8 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider">
                  Step 8 • Verification & Launch
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review & Initialize Engine</h2>
                <p className="text-xs text-slate-500">
                  Verify your input parameters before triggering the multi-criteria ranking algorithm.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Candidate</span>
                  <div className="font-bold text-sm text-slate-900">{fullName || 'Candidate'}</div>
                  <div className="text-xs text-slate-500">{location || 'Remote'}</div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Academics</span>
                  <div className="font-bold text-sm text-slate-900">{degree}</div>
                  <div className="text-xs text-slate-500">{branch} • Class of {gradYear}</div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Skills Telemetry</span>
                  <div className="font-bold text-sm text-slate-900">{selectedSkills.length} Verified Skills</div>
                  <div className="text-xs text-blue-600 font-semibold">Calibrated with proficiency indices</div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Target Roles</span>
                  <div className="font-bold text-sm text-slate-900 truncate">{preferredRoles}</div>
                  <div className="text-xs text-slate-500 truncate">{preferredIndustries}</div>
                </div>
              </div>

              {/* Optional Resume Text */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">Optional: Paste Resume Text for Instant ATS Calibration</label>
                <textarea
                  rows={3}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste work experience, bullet points, or projects here (optional)..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* NAVIGATION CONTROLS */}
          {/* ======================================================== */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <span />
              )}
            </div>

            <div className="flex items-center gap-3">
              {saveMessage && (
                <span className="text-xs text-emerald-600 font-bold animate-pulse">
                  {saveMessage}
                </span>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                <span>{step === totalSteps ? 'Complete & Generate Career Matches' : 'Save & Continue'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
