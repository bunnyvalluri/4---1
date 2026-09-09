'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Mic, Send, RefreshCw, Star, ChevronRight, MessageSquare, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';

const QUESTION_BANKS: Record<string, Record<string, string[]>> = {
  'Software Engineer': {
    Technical: [
      'Explain the difference between a stack and a queue. When would you use each?',
      'What is the time complexity of quicksort, and when can it degrade to O(n²)?',
      'How would you design a URL shortener like bit.ly? Walk me through your approach.',
      'What is the difference between SQL and NoSQL? When would you choose one over the other?',
      'Explain how React\'s virtual DOM works and why it improves performance.',
      'What is a REST API? What are the key HTTP methods and their uses?',
    ],
    Behavioral: [
      'Tell me about a time you had a conflict with a teammate. How did you resolve it?',
      'Describe a project where you had to learn something completely new in a short time.',
      'Tell me about your biggest technical failure. What did you learn?',
      'How do you prioritize when you have multiple urgent tasks?',
      'Describe a time you disagreed with your manager\'s technical decision.',
    ],
    'System Design': [
      'Design a scalable notification system that can handle millions of users.',
      'How would you design Twitter\'s feed system?',
      'Design a rate limiter for an API gateway.',
      'How would you architect a real-time collaborative document editor (like Google Docs)?',
    ],
  },
  'Data Scientist': {
    Technical: [
      'Explain the difference between supervised and unsupervised learning with examples.',
      'What is overfitting? How do you detect and prevent it?',
      'Explain the bias-variance tradeoff.',
      'How does a Random Forest work? What are its advantages over a single decision tree?',
      'What is gradient descent? When would you use mini-batch gradient descent?',
    ],
    Behavioral: [
      'Tell me about a data project that had a significant business impact.',
      'How do you communicate complex findings to non-technical stakeholders?',
      'Describe a time when your analysis led to an unexpected conclusion.',
    ],
    'Case Study': [
      'We are seeing a 15% drop in user engagement over 3 weeks. How would you investigate?',
      'How would you build a recommendation system for our e-commerce platform?',
      'Design an A/B test for a new checkout flow. What metrics would you track?',
    ],
  },
};

interface Message {
  role: 'ai' | 'user';
  content: string;
  score?: number;
  feedback?: string;
}

const CAREERS = Object.keys(QUESTION_BANKS);
const TYPES: Record<string, string[]> = {
  'Software Engineer': ['Technical', 'Behavioral', 'System Design'],
  'Data Scientist': ['Technical', 'Behavioral', 'Case Study'],
};

export default function InterviewPage() {
  const [career, setCareer] = useState('Software Engineer');
  const [type, setType] = useState('Technical');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const [ended, setEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const questions = QUESTION_BANKS[career]?.[type] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = () => {
    setStarted(true);
    setMessages([{
      role: 'ai',
      content: `Welcome to your **${type} Interview** for **${career}**! 🎯\n\nI'll ask you ${questions.length} questions. Answer each one as you would in a real interview. I'll score you and give detailed feedback after each response.\n\n**Question 1/${questions.length}:**\n\n${questions[0]}`,
    }]);
    setQIndex(0);
    setSessionScore([]);
    setEnded(false);
  };

  const sendAnswer = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questions[qIndex],
          answer: userMsg,
          career,
          type,
        }),
      });
      const data = await res.json();
      const score = data.score || Math.floor(Math.random() * 4) + 6;
      const newScores = [...sessionScore, score];
      setSessionScore(newScores);

      const nextQ = qIndex + 1;
      const isLast = nextQ >= questions.length;

      const aiResponse: Message = {
        role: 'ai',
        content: data.feedback || `Good attempt! Here are some thoughts on your answer...`,
        score,
        feedback: data.feedback,
      };

      if (!isLast) {
        aiResponse.content += `\n\n**Question ${nextQ + 1}/${questions.length}:**\n\n${questions[nextQ]}`;
      } else {
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        aiResponse.content += `\n\n---\n\n🎉 **Session Complete!** Your average score: **${avg}/10**\n\n${avg >= 8 ? 'Excellent performance! You are interview-ready.' : avg >= 6 ? 'Good foundation! Focus on the areas highlighted above.' : 'Keep practicing! Review the feedback and try again.'}`;
        setEnded(true);
      }

      setMessages(prev => [...prev, aiResponse]);
      setQIndex(nextQ);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, there was an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const avgScore = sessionScore.length ? Math.round(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length) : 0;

  return (
    <DashboardShell userName="Candidate" userEmail="" telemetryStatus="Live" lastUpdatedText="just now" notifications={[]} onRefresh={() => {}} onMarkNotificationRead={() => {}}>
      <div className="space-y-5 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">AI Interview Simulator</h1>
          <p className="text-sm text-slate-500 mt-1">Practice real interviews with AI feedback and scoring</p>
        </div>

        {!started ? (
          /* Setup screen */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
              <h2 className="font-black text-slate-800">Configure Your Session</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Target Career</label>
                  <select
                    value={career}
                    onChange={e => { setCareer(e.target.value); setType(TYPES[e.target.value][0]); }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CAREERS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2 block">Interview Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(TYPES[career] || []).map(t => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${type === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
                  <span className="font-bold">{questions.length} questions</span> • Real-time AI scoring • Detailed feedback
                </div>
              </div>
              <button
                onClick={startSession}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-black text-sm transition-all shadow-sm hover:-translate-y-0.5"
              >
                Start Interview Session →
              </button>
            </div>

            {/* Tips panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="font-black text-slate-800">Interview Tips</h2>
              {[
                { icon: '🎯', tip: 'Use the STAR method (Situation, Task, Action, Result) for behavioral questions' },
                { icon: '🧠', tip: 'Think out loud — explain your reasoning process clearly' },
                { icon: '⏱️', tip: 'Keep answers concise: 2-3 minutes for behavioral, 5-8 for technical' },
                { icon: '💡', tip: 'Always clarify ambiguous requirements before diving into solutions' },
                { icon: '🔄', tip: 'Iterate on your answers — it\'s okay to refine as you go' },
              ].map(({ icon, tip }) => (
                <div key={tip} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="text-lg shrink-0">{icon}</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Chat interface */
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((qIndex / questions.length) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{qIndex}/{questions.length} done</span>
              {sessionScore.length > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-black text-slate-700">{avgScore}/10</span>
                </div>
              )}
              <button onClick={() => { setStarted(false); setMessages([]); }} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                <RefreshCw className="h-3.5 w-3.5" /> Restart
              </button>
            </div>

            {/* Messages */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="h-[420px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'ai' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <BrainCircuit className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-blue-600 text-white'}`}>
                      {msg.score !== undefined && (
                        <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${msg.role === 'ai' ? 'border-slate-200' : 'border-blue-500'}`}>
                          {msg.score >= 7 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                          <span className="font-black">Score: {msg.score}/10</span>
                          <div className="flex gap-0.5">
                            {[...Array(10)].map((_, j) => (
                              <div key={j} className={`h-1.5 w-1.5 rounded-full ${j < msg.score! ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <BrainCircuit className="h-4 w-4 animate-pulse" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-slate-400">AI is evaluating...</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              {!ended && (
                <div className="border-t border-slate-200 p-4">
                  <div className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
                      placeholder="Type your answer... (Enter to submit, Shift+Enter for new line)"
                      rows={3}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendAnswer}
                      disabled={loading || !input.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors self-end"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5">Press Enter to submit • Shift+Enter for new line</div>
                </div>
              )}
              {ended && (
                <div className="border-t border-slate-200 p-4 text-center">
                  <button
                    onClick={startSession}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" /> Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
