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

  const [interests, setInterests] = useState<string>('Artificial Intelligence, Cloud Native Systems, Web Architecture');
  const [preferredRoles, setPreferredRoles] = useState<string>('Full Stack Developer, AI/ML Engineer');
  const [preferredIndustries, setPreferredIndustries] = useState<string>('SaaS, FinTech, DeepTech');
  const [careerGoals, setCareerGoals] = useState('To build scalable distributed systems and production AI applications.');

  const [resumeText, setResumeText] = useState('');

  const totalSteps = 8;
  const progressPercent = Math.round((step / totalSteps) * 100);

  useEffect(() => {
    // Load existing profile & skills catalog
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

      setSaveMessage('Progress saved');
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
    } else {
      router.push('/recommendations');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleSkill = (skill: any) => {
    const existing = selectedSkills.find((s) => s.skillId === skill.id);
    if (existing) {
      setSelectedSkills(selectedSkills.filter((s) => s.skillId !== skill.id));
    } else {
      setSelectedSkills([...selectedSkills, { skillId: skill.id, name: skill.name, proficiency: 4 }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <Compass className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-slate-900">CareerAI</span>
          </Link>
          <div className="text-xs font-semibold text-slate-500">
            Step {step} of {totalSteps} ({progressPercent}% Completed)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                <p className="text-xs text-slate-500">Tell us about yourself so we can personalize your guidance</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Johnson"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Professional Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Aspiring full-stack engineer passionate about cloud architectures and AI."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Academic & Education Background</h2>
                <p className="text-xs text-slate-500">We match degrees across Computer Science, Design, Business, and Mathematics</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Degree / Qualification</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Bachelor of Technology / BS / B.Des / MBA"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Branch / Major Specialization</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Computer Science / Data Science / HCI / Statistics"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Graduation Year</label>
                    <input
                      type="number"
                      value={gradYear}
                      onChange={(e) => setGradYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">CGPA / Percentage</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cgpa}
                      onChange={(e) => setCgpa(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Your Technical Skills</h2>
                <p className="text-xs text-slate-500">Select the technologies you have experience with</p>
              </div>

              <div className="pt-2">
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
                  {availableSkills.slice(0, 30).map((skill) => {
                    const isSelected = selectedSkills.some((s) => s.skillId === skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
                <div className="text-xs text-slate-500 mt-3">
                  Selected: <strong>{selectedSkills.length} skills</strong>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 4 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Domain Passion & Interests</h2>
                <p className="text-xs text-slate-500">What areas of technology excite you the most?</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Enter Interests (comma-separated)</label>
                  <input
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="Machine Learning, Distributed Systems, UI/UX, Cloud Infrastructure"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {['Web Development', 'Machine Learning', 'Cloud Native', 'Cybersecurity', 'UI/UX Design', 'DevOps', 'Mobile Apps'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        if (!interests.includes(item)) {
                          setInterests(interests ? `${interests}, ${item}` : item);
                        }
                      }}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-200"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Career Preferences */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 5 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Target Roles & Industries</h2>
                <p className="text-xs text-slate-500">Specify your preferred positions and industry verticals</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Preferred Roles</label>
                  <input
                    type="text"
                    value={preferredRoles}
                    onChange={(e) => setPreferredRoles(e.target.value)}
                    placeholder="Full Stack Developer, Data Scientist, Product Designer"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Preferred Industries</label>
                  <input
                    type="text"
                    value={preferredIndustries}
                    onChange={(e) => setPreferredIndustries(e.target.value)}
                    placeholder="SaaS, FinTech, DeepTech, Healthcare Tech"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Aptitude Assessment */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 6 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Psychometric Diagnostic</h2>
                <p className="text-xs text-slate-500">Cognitive benchmarks calibrate role suitability</p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-sm text-blue-800">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  <span>Cognitive Diagnostic is Ready</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our comprehensive aptitude test measures Quantitative, Logical, Verbal, Analytical, and Problem-Solving capabilities to match against real employer benchmarks.
                </p>
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-800"
                >
                  Take 10-Question Diagnostic Now <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Step 7: Career Goals */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 7 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Stated Career Goals</h2>
                <p className="text-xs text-slate-500">Describe your 1-3 year career ambition</p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-700">Career Statement</label>
                <textarea
                  rows={4}
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="To become a senior engineering leader building resilient distributed backends."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Step 8: Resume Upload */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 8 of 8</span>
                <h2 className="text-xl font-bold text-slate-900">Resume & Empirical Verification</h2>
                <p className="text-xs text-slate-500">Upload your resume text to verify practical execution</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center bg-slate-50 space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-blue-600" />
                  <div className="text-sm font-semibold text-slate-800">You can also paste your resume content below</div>
                  <div className="text-xs text-slate-500">Or use our dedicated Resume Analyzer tab later</div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Resume Text Content (Optional)</label>
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume experience or project descriptions here..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <span />
              )}
            </div>

            <div className="flex items-center gap-3">
              {saveMessage && <span className="text-xs text-emerald-600 font-semibold">{saveMessage}</span>}
              <button
                type="button"
                onClick={handleNext}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                <span>{step === totalSteps ? 'Complete & View Matches' : 'Save & Continue'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
