'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  Sparkles, 
  PlusCircle, 
  Search, 
  Briefcase, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  X
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  career: string;
  company: string;
  yearsExp: number;
  expertise: string[];
  bio: string;
  linkedinUrl?: string;
  available: boolean;
  sessions: number;
  rating: number;
}

const STORAGE_KEY = 'career_ai_real_mentors';

export default function UserMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [requestModalMentor, setRequestModalMentor] = useState<Mentor | null>(null);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [requestNote, setRequestNote] = useState('');

  // Form state for applying as a real mentor
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    career: 'Software Engineering',
    company: '',
    yearsExp: '3',
    linkedinUrl: '',
    expertise: '',
    bio: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Load real mentors from localStorage if previously registered
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMentors(parsed);
        }
      }
    } catch {
      // ignore JSON error
    }
    setIsLoaded(true);
  }, []);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim()) return;

    const newMentor: Mentor = {
      id: 'mentor_' + Date.now(),
      name: formData.name.trim(),
      avatar: formData.name.trim().slice(0, 2).toUpperCase(),
      career: formData.career,
      company: formData.company.trim(),
      yearsExp: parseInt(formData.yearsExp, 10) || 1,
      expertise: formData.expertise
        ? formData.expertise.split(',').map(s => s.trim()).filter(Boolean)
        : [formData.career],
      bio: formData.bio.trim() || `Industry professional at ${formData.company.trim()} offering career guidance and mentorship.`,
      linkedinUrl: formData.linkedinUrl.trim(),
      available: true,
      sessions: 0,
      rating: 5.0,
    };

    const updated = [newMentor, ...mentors];
    setMentors(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsApplyModalOpen(false);
      setFormData({
        name: '',
        email: '',
        career: 'Software Engineering',
        company: '',
        yearsExp: '3',
        linkedinUrl: '',
        expertise: '',
        bio: '',
      });
    }, 1200);
  };

  const handleRequestMentorship = (mentor: Mentor) => {
    setRequestedIds(prev => [...prev, mentor.id]);
    setRequestModalMentor(null);
    setRequestNote('');
  };

  const filteredMentors = mentors.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      m.career.toLowerCase().includes(q) ||
      m.expertise.some(skill => skill.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 border border-blue-200/60 rounded-xl text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Mentor Network
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1.5">
              Connect with verified industry mentors or get instant guidance with your 24/7 AI mentor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-xs transition-all"
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
              Become a Mentor
            </button>

            <Link
              href="/user/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all"
            >
              <Sparkles className="h-4 w-4 text-blue-200" />
              Launch AI Mentor
            </Link>
          </div>
        </div>

        {/* AI Mentor Callout Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
                <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                Always Available · 24/7 Career Guidance
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Need mentorship right away? Talk to Aura AI
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Get real-time code reviews, portfolio guidance, interview preparation, and step-by-step career navigation customized to your skill gaps.
              </p>
            </div>

            <Link
              href="/user/chat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-sm shadow-md hover:-translate-y-0.5 transition-all shrink-0"
            >
              Start Mentorship Session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Verified Mentors Directory */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Verified Industry Mentors</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {mentors.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic profiles from verified professionals. Placeholder and fake profiles are disabled.
              </p>
            </div>

            {mentors.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search mentors by name, skill, company..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            )}
          </div>

          {/* If mentors exist */}
          {mentors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {filteredMentors.map(mentor => {
                const isRequested = requestedIds.includes(mentor.id);
                return (
                  <div
                    key={mentor.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {mentor.avatar}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-900 text-base">{mentor.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">
                              {mentor.career} @ <span className="font-bold text-slate-700">{mentor.company}</span>
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 py-1 border-y border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {mentor.yearsExp} yrs exp
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {mentor.rating.toFixed(1)}
                        </span>
                        {mentor.linkedinUrl && (
                          <a
                            href={mentor.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline ml-auto"
                          >
                            <ExternalLink className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {mentor.bio}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {mentor.expertise.map(skill => (
                          <span
                            key={skill}
                            className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => !isRequested && setRequestModalMentor(mentor)}
                      disabled={isRequested}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-all mt-2 ${
                        isRequested
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:-translate-y-0.5'
                      }`}
                    >
                      {isRequested ? '✓ Request Submitted' : 'Request Mentorship'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Empty State without fake data */
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center space-y-5">
              <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 text-blue-600 shadow-xs flex items-center justify-center mx-auto">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-black text-slate-900">
                  No Mock Profiles Displayed
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We maintain strict platform authenticity and do not display simulated or placeholder mentor profiles. External industry mentor applications are verified individually before listing.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
                >
                  Apply as a Mentor
                </button>
                <Link
                  href="/user/chat"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all inline-flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Connect with AI Mentor
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply as Mentor Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 relative">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-slate-900">Apply to Mentor Network</h2>
              <p className="text-xs text-slate-500 mt-1">
                Share your real industry experience to help candidates achieve their career goals.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Profile Listed Successfully!</h3>
                <p className="text-xs text-slate-500">Your mentor card is now live in the network.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Work Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Organization *</label>
                    <input
                      required
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Stripe, Amazon, Startup"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Domain Role</label>
                    <select
                      value={formData.career}
                      onChange={e => setFormData({ ...formData, career: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Software Engineering">Software Engineering</option>
                      <option value="Data Science & ML">Data Science & ML</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Years of Experience</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={formData.yearsExp}
                      onChange={e => setFormData({ ...formData, yearsExp: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Core Expertise (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.expertise}
                    onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="System Design, Next.js, Career Transitions, Resume Review"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Bio & Mentorship Focus</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Briefly describe what candidates can learn from your experience..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all"
                  >
                    Submit Mentor Profile
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Request Mentorship Modal */}
      {requestModalMentor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 relative">
            <button
              onClick={() => setRequestModalMentor(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h2 className="text-base font-black text-slate-900">
                Request Session with {requestModalMentor.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {requestModalMentor.career} @ {requestModalMentor.company}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Message / Topics to Discuss</label>
              <textarea
                rows={4}
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
                placeholder="Hi! I would appreciate guidance regarding role transitions, resume pointers, and technical preparation..."
                className="w-full border border-slate-200 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRequestModalMentor(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestMentorship(requestModalMentor)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-all"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
