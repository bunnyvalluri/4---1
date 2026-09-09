'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { MessageSquare, Star, Search, Filter, ExternalLink, CheckCircle2, Clock, Users } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  career: string;
  company: string;
  yearsExp: number;
  expertise: string[];
  bio: string;
  matchScore: number;
  available: boolean;
  sessions: number;
  rating: number;
}

const MENTORS: Mentor[] = [
  {
    id: 'm1', name: 'Priya Sharma', avatar: 'PS', career: 'Software Engineer', company: 'Google',
    yearsExp: 9, expertise: ['System Design', 'React', 'Career Growth', 'FAANG Prep'],
    bio: 'Senior SWE at Google. Ex-Amazon. Helped 40+ engineers crack FAANG interviews. I focus on system design and behavioral prep.',
    matchScore: 96, available: true, sessions: 148, rating: 4.9,
  },
  {
    id: 'm2', name: 'Rahul Mehta', avatar: 'RM', career: 'Data Scientist', company: 'Netflix',
    yearsExp: 7, expertise: ['Machine Learning', 'Python', 'Statistics', 'ML Interview Prep'],
    bio: 'ML Engineer at Netflix Recommendations. PhD in Statistics. Passionate about helping DS candidates crack ML interviews.',
    matchScore: 91, available: true, sessions: 89, rating: 4.8,
  },
  {
    id: 'm3', name: 'Ananya Krishnan', avatar: 'AK', career: 'Product Manager', company: 'Stripe',
    yearsExp: 8, expertise: ['Product Strategy', 'Roadmapping', 'PM Interviews', 'Fintech'],
    bio: 'Senior PM at Stripe. Ex-Flipkart. I help engineers transition to PM roles and help PMs crack top-tier interviews.',
    matchScore: 88, available: false, sessions: 212, rating: 5.0,
  },
  {
    id: 'm4', name: 'Vikram Nair', avatar: 'VN', career: 'DevOps Engineer', company: 'Cloudflare',
    yearsExp: 11, expertise: ['Kubernetes', 'AWS', 'SRE', 'Platform Engineering'],
    bio: 'Principal SRE at Cloudflare. 11 years in DevOps. Certified AWS architect. I help engineers build strong cloud/infra skills.',
    matchScore: 84, available: true, sessions: 67, rating: 4.7,
  },
  {
    id: 'm5', name: 'Deepa Iyer', avatar: 'DI', career: 'UX Designer', company: 'Apple',
    yearsExp: 6, expertise: ['Figma', 'Design Systems', 'Portfolio Review', 'HCI'],
    bio: 'Senior UX Designer at Apple. Ex-Airbnb. I review portfolios, do whiteboard critiques, and help designers break into top companies.',
    matchScore: 79, available: true, sessions: 55, rating: 4.8,
  },
  {
    id: 'm6', name: 'Arjun Kapoor', avatar: 'AK2', career: 'Software Engineer', company: 'Meta',
    yearsExp: 5, expertise: ['React Native', 'Mobile Dev', 'Open Source', 'Junior Dev Mentoring'],
    bio: 'Software Engineer at Meta. Open source contributor. Love helping new graduates find their first job in tech.',
    matchScore: 82, available: true, sessions: 31, rating: 4.6,
  },
];

const CAREERS_FILTER = ['All', 'Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'UX Designer'];

export default function MentorsPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [requested, setRequested] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<Mentor | null>(null);
  const [msgText, setMsgText] = useState('');

  const filtered = MENTORS.filter(m => {
    const matchCat = filter === 'All' || m.career === filter;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.expertise.some(e => e.toLowerCase().includes(search.toLowerCase())) || m.company.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const sendRequest = (mentor: Mentor) => {
    setRequested(prev => [...prev, mentor.id]);
    setActiveModal(null);
    setMsgText('');
  };

  return (
    <DashboardShell userName="Candidate" userEmail="" telemetryStatus="Live" lastUpdatedText="just now" notifications={[]} onRefresh={() => {}} onMarkNotificationRead={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Mentor Matching</h1>
          <p className="text-sm text-slate-500 mt-1">Connect with industry experts who match your career goals</p>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 text-sm">
          {[
            { label: 'Expert Mentors', value: MENTORS.length, icon: <Users className="h-4 w-4 text-blue-500" /> },
            { label: 'Available Now', value: MENTORS.filter(m => m.available).length, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
            { label: 'Total Sessions', value: MENTORS.reduce((a, m) => a + m.sessions, 0), icon: <MessageSquare className="h-4 w-4 text-violet-500" /> },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-xs">
              {s.icon}
              <span className="font-black text-slate-900">{s.value}</span>
              <span className="text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filter + search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, skill, or company..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CAREERS_FILTER.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${filter === c ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300 bg-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Mentor cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(mentor => {
            const isRequested = requested.includes(mentor.id);
            return (
              <div key={mentor.id} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
                {/* Avatar + info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm shadow-sm">
                    {mentor.avatar.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-slate-900">{mentor.name}</div>
                    <div className="text-xs text-slate-500">{mentor.career} @ <span className="font-bold text-slate-700">{mentor.company}</span></div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mentor.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {mentor.available ? '● Available' : '● Waitlist'}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-black text-blue-600">{mentor.matchScore}%</div>
                    <div className="text-[10px] text-slate-400">match</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 fill-amber-400" />{mentor.rating}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{mentor.sessions} sessions</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{mentor.yearsExp}y exp</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{mentor.bio}</p>

                {/* Expertise tags */}
                <div className="flex flex-wrap gap-1.5">
                  {mentor.expertise.map(e => (
                    <span key={e} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                      {e}
                    </span>
                  ))}
                </div>

                {/* Action button */}
                <button
                  onClick={() => isRequested ? null : setActiveModal(mentor)}
                  className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${isRequested ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' : mentor.available ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:-translate-y-0.5' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {isRequested ? '✓ Request Sent' : mentor.available ? 'Request Mentorship' : 'Join Waitlist'}
                </button>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No mentors found for your search</p>
          </div>
        )}
      </div>

      {/* Request modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-black text-slate-900">Request Mentorship from {activeModal.name}</h2>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
              <strong>{activeModal.company}</strong> · {activeModal.career} · {activeModal.yearsExp} years experience
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 mb-2 block">Your message to the mentor</label>
              <textarea
                value={msgText}
                onChange={e => setMsgText(e.target.value)}
                rows={4}
                placeholder="Hi! I'm targeting a career in [field]. I'd love your guidance on [specific area]. Currently I'm [brief background]..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => sendRequest(activeModal)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-black transition-colors">
                Send Request
              </button>
              <button onClick={() => setActiveModal(null)} className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
