'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Send,
  RefreshCw,
  Star,
  ChevronRight,
  MessageSquare,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Layers,
  Flame,
  Volume2,
  Sliders,
  ChevronDown,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';

interface QuestionBank {
  [career: string]: {
    [type: string]: string[];
  };
}

const QUESTION_BANKS: QuestionBank = {
  'Software Engineer': {
    Technical: [
      'Explain the difference between a process and a thread. How does concurrency differ from parallelism?',
      'What is the time and space complexity of quicksort? In what scenario does it degrade to O(n²), and how can we mitigate that?',
      'How does React\'s reconciliation algorithm (Fiber) work, and how does it optimize virtual DOM diffing?',
      'Explain ACID properties in relational databases and discuss when eventual consistency (BASE) is preferred.',
      'How would you detect and fix a memory leak in a production Node.js or browser application?',
    ],
    Behavioral: [
      'Tell me about a time you had a significant technical disagreement with a senior engineer. How did you resolve it?',
      'Describe a high-severity production outage you were involved in. Walk me through your triage, mitigation, and post-mortem.',
      'Tell me about a project where the requirements changed dramatically mid-cycle. How did you adapt your delivery?',
      'Describe a situation where you had to push back on a product manager\'s deadline for technical debt reasons.',
    ],
    'System Design': [
      'Design a URL shortener service (like bit.ly) handling 100M daily active users with sub-50ms redirection latency.',
      'Architect a distributed rate-limiter for an API gateway that supports sliding-window counters across multiple data centers.',
      'Design an end-to-end notification delivery platform capable of routing push, SMS, and email alerts for 50M subscribers.',
      'How would you architect a real-time collaborative code editor (like Google Docs or VS Code Live Share)?',
    ],
  },
  'Full Stack Engineer': {
    Technical: [
      'Explain the full lifecycle of an HTTP/3 request from DNS resolution and TLS 1.3 handshake to DOM rendering.',
      'Compare Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR) with concrete trade-offs.',
      'How do you prevent OWASP Top 10 vulnerabilities (such as CSRF, XSS, and SQL Injection) in modern web applications?',
      'How do database indexes (B-Tree vs Hash) work under the hood, and what are the trade-offs of indexing high-write tables?',
    ],
    Behavioral: [
      'Walk me through a project where you balanced rapid shipping of MVP features against code quality and test coverage.',
      'Tell me about a time you mentored a junior engineer or onboarded a new team member to a complex codebase.',
      'Describe an instance where you identified a major user experience bottleneck and championed the technical fix.',
    ],
    'System Design': [
      'Design an e-commerce checkout system ensuring idempotency, inventory decrement consistency, and payment webhooks handling.',
      'Architect an image upload and on-the-fly thumbnail generation pipeline handling 10,000 uploads per minute.',
    ],
  },
  'Data Scientist': {
    Technical: [
      'Explain the bias-variance tradeoff and how regularization techniques (L1 Lasso vs L2 Ridge) influence model complexity.',
      'How do Transformer self-attention mechanisms work mathematically, and why do they outperform recurrent architectures (RNNs)?',
      'Describe how you handle imbalanced datasets (e.g. 99.5% negative class) beyond basic accuracy metrics.',
      'What is ROC-AUC, and when would Precision-Recall AUC (PR-AUC) provide a more truthful evaluation of model efficacy?',
    ],
    Behavioral: [
      'Tell me about a time a machine learning model failed in production or produced unexpected drift. How did you diagnose it?',
      'How do you communicate complex statistical models and probabilistic outputs to non-technical business stakeholders?',
    ],
    'Case Study': [
      'Our platform noticed a 12% drop in 7-day retention over the past month. Design an end-to-end root-cause analysis framework.',
      'Design a personalized recommendation engine for an e-commerce platform blending collaborative filtering and vector embeddings.',
    ],
  },
  'Product Manager': {
    Behavioral: [
      'Tell me about a product feature you launched that failed to achieve its target adoption metrics. What did you learn?',
      'How do you manage conflicting priorities between engineering velocity, executive requests, and customer feedback?',
      'Describe a time you used quantitative data combined with qualitative customer interviews to define a quarterly roadmap.',
    ],
    'Product Strategy': [
      'If you were the PM for Spotify, how would you design and monetize an AI podcast summary feature?',
      'How would you determine the North Star metric and secondary guardrail metrics for an AI career guidance platform?',
    ],
  },
};

interface Message {
  role: 'ai' | 'user';
  content: string;
  score?: number;
  strengths?: string[];
  improvements?: string[];
  idealPoints?: string[];
}

interface EvaluationData {
  score: number;
  feedback: string;
}

export default function UserInterviewPage() {
  const [career, setCareer] = useState<string>('Software Engineer');
  const [type, setType] = useState<string>('Technical');
  const [difficulty, setDifficulty] = useState<'Entry' | 'Mid' | 'Senior'>('Mid');
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const [ended, setEnded] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showStarGuide, setShowStarGuide] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const availableCareers = Object.keys(QUESTION_BANKS);
  const availableTypes = Object.keys(QUESTION_BANKS[career] || {});
  const questions = QUESTION_BANKS[career]?.[type] || [];

  // Setup Speech Recognition on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Timer counter during active session
  useEffect(() => {
    let interval: any;
    if (timerActive && !ended) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, ended]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleSpeech = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const startSession = () => {
    setStarted(true);
    setEnded(false);
    setQIndex(0);
    setSessionScore([]);
    setElapsedSeconds(0);
    setTimerActive(true);

    const firstQuestion = questions[0] || 'Tell me about yourself and your background.';
    setMessages([
      {
        role: 'ai',
        content: `Welcome to your **${difficulty}-Level ${type} Mock Interview** for the **${career}** track!\n\nI am your AI Interviewer. I will evaluate your answers against industry hiring bars (depth, structure, trade-offs, and communication clarity). Take your time to think through your response.\n\n### Question 1 of ${questions.length}:\n**${firstQuestion}**`,
      },
    ]);
  };

  const restartSession = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setStarted(false);
    setEnded(false);
    setMessages([]);
    setInput('');
    setSessionScore([]);
    setQIndex(0);
    setElapsedSeconds(0);
    setTimerActive(false);
  };

  const insertStarTemplate = () => {
    const template = `**Situation:**\n[Describe the context, project, or problem]\n\n**Task:**\n[Explain your specific responsibility or challenge]\n\n**Action:**\n[Detail the concrete technical steps and decisions you took]\n\n**Result:**\n[Highlight quantifiable outcomes, impact, and lessons learned]`;
    setInput((prev) => (prev ? `${prev}\n\n${template}` : template));
  };

  const parseFeedbackSections = (text: string) => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const idealPoints: string[] = [];

    const strengthsMatch = text.match(/✅\s*Strengths:?([\s\S]*?)(?=🔧|💡|$)/i);
    if (strengthsMatch) {
      strengthsMatch[1]
        .split('\n')
        .map((s) => s.replace(/^[-*•\d.]\s*/, '').trim())
        .filter(Boolean)
        .forEach((item) => strengths.push(item));
    }

    const improvementsMatch = text.match(/🔧\s*Areas to Improve:?([\s\S]*?)(?=💡|✅|$)/i);
    if (improvementsMatch) {
      improvementsMatch[1]
        .split('\n')
        .map((s) => s.replace(/^[-*•\d.]\s*/, '').trim())
        .filter(Boolean)
        .forEach((item) => improvements.push(item));
    }

    const idealMatch = text.match(/💡\s*Ideal Answer Should Include:?([\s\S]*?)$/i);
    if (idealMatch) {
      idealMatch[1]
        .split('\n')
        .map((s) => s.replace(/^[-*•\d.]\s*/, '').trim())
        .filter(Boolean)
        .forEach((item) => idealPoints.push(item));
    }

    return { strengths, improvements, idealPoints };
  };

  const sendAnswer = async () => {
    if (!input.trim() || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const currentQuestion = questions[qIndex] || 'Interview question';
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          answer: userMsg,
          career,
          type,
          difficulty,
        }),
      });

      const data: EvaluationData = await res.json();
      const score = typeof data.score === 'number' ? data.score : 7;
      const newScores = [...sessionScore, score];
      setSessionScore(newScores);

      const parsed = parseFeedbackSections(data.feedback || '');
      const nextQ = qIndex + 1;
      const isLast = nextQ >= questions.length;

      let followUpContent = data.feedback;
      if (!isLast) {
        followUpContent += `\n\n---\n\n### Question ${nextQ + 1} of ${questions.length}:\n**${questions[nextQ]}**`;
      } else {
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
        followUpContent += `\n\n---\n\n🏁 **Interview Session Concluded!**\nYour Overall Performance: **${avg}/10**\n${
          avg >= 8
            ? '🌟 **Exceptional!** Strong hire signals across problem-solving and structured technical communication.'
            : avg >= 6
            ? '👍 **Solid Attempt!** Good foundational concepts. Focus on adding more quantifiable results and architectural edge cases.'
            : '📚 **Keep Practicing!** Review the suggested ideal points below to refine your structure and depth.'
        }`;
        setEnded(true);
        setTimerActive(false);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: followUpContent,
          score,
          strengths: parsed.strengths.length > 0 ? parsed.strengths : undefined,
          improvements: parsed.improvements.length > 0 ? parsed.improvements : undefined,
          idealPoints: parsed.idealPoints.length > 0 ? parsed.idealPoints : undefined,
        },
      ]);
      setQIndex(nextQ);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            '⚠️ Communication error evaluating your response. Please verify your connection or try again.',
        },
      ]);
    }
    setLoading(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const avgScore = sessionScore.length
    ? Math.round(sessionScore.reduce((a, b) => a + b, 0) / sessionScore.length)
    : 0;

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                AI Interview Simulator
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100/80 text-blue-700">
                <Sparkles className="h-3 w-3" />
                Gemini 2.0
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Interactive mock interviews calibrated against senior industry rubrics with real-time scoring.
            </p>
          </div>

          {started && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>

              {sessionScore.length > 0 && (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Avg: {avgScore}/10</span>
                </div>
              )}

              <button
                onClick={restartSession}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          )}
        </div>

        {!started ? (
          /* PRE-SESSION CONFIGURATION & PREVIEW */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Config Panel */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-blue-600" />
                      Configure Your Interview Round
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose your target track, assessment format, and calibration standard.
                    </p>
                  </div>

                  {/* Career Role Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                      Target Role
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {availableCareers.map((c) => {
                        const isSelected = career === c;
                        return (
                          <button
                            key={c}
                            onClick={() => {
                              setCareer(c);
                              const newTypes = Object.keys(QUESTION_BANKS[c] || {});
                              if (newTypes.length && !newTypes.includes(type)) {
                                setType(newTypes[0]);
                              }
                            }}
                            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span>{c}</span>
                            {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interview Focus Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                      Interview Format
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableTypes.map((t) => {
                        const isSelected = type === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seniority / Difficulty Level */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                      Experience Calibration
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(['Entry', 'Mid', 'Senior'] as const).map((lvl) => {
                        const isSelected = difficulty === lvl;
                        return (
                          <button
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                            }`}
                          >
                            {lvl} Level
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Session Spec Summary */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Curated Questions:</span>
                      <span className="font-bold text-slate-800">{questions.length} Scenario Questions</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Estimated Time:</span>
                      <span className="font-bold text-slate-800">~15 Minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Evaluation Mode:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5" /> Real-Time Scoring & Rubrics
                      </span>
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={startSession}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Launch Interview Simulation</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right Sidebar - Guidelines & STAR Framework */}
              <div className="lg:col-span-5 space-y-6">
                {/* Preparation Guide Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    Interview Success Rubrics
                  </h3>

                  <div className="space-y-3.5 text-xs text-slate-600">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">Structure with STAR</strong>
                        Frame scenario answers around Situation, Task, Action, and quantifiable Result.
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                        <Volume2 className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">Think Out Loud</strong>
                        State your trade-offs explicitly. Top interviewers evaluate how you reason about edge cases.
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block">Quantify Scale & Impact</strong>
                        Mention latency numbers, request throughput, team sizes, and measurable metrics.
                      </div>
                    </div>
                  </div>
                </div>

                {/* STAR Helper Card */}
                <div className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-900 uppercase tracking-wider">
                      STAR Method Reference
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/60 text-blue-800">
                      Standard
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
                      <strong className="text-blue-700 block">S - Situation</strong>
                      <span className="text-slate-500">Context & project background</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
                      <strong className="text-blue-700 block">T - Task</strong>
                      <span className="text-slate-500">Your core responsibility</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
                      <strong className="text-blue-700 block">A - Action</strong>
                      <span className="text-slate-500">Concrete steps you executed</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 shadow-xs">
                      <strong className="text-blue-700 block">R - Result</strong>
                      <span className="text-slate-500">Metrics, impact & learnings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE INTERVIEW STAGE */
          <div className="space-y-5">
            {/* Step Progress Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex gap-1.5">
                  {questions.map((_, idx) => {
                    const isCompleted = idx < qIndex;
                    const isCurrent = idx === qIndex;
                    return (
                      <div
                        key={idx}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'w-6 bg-emerald-500'
                            : isCurrent
                            ? 'w-10 bg-blue-600 animate-pulse'
                            : 'w-4 bg-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-black text-slate-700">
                  Question {Math.min(qIndex + 1, questions.length)} of {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                  {career}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-black">
                  {type}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold">
                  {difficulty} Level
                </span>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col min-h-[500px]">
              {/* Messages container */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px] bg-slate-50/40">
                {messages.map((msg, i) => {
                  const isAi = msg.role === 'ai';
                  return (
                    <div
                      key={i}
                      className={`flex gap-3.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAi && (
                        <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                          <BrainCircuit className="h-5 w-5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 space-y-3.5 shadow-xs ${
                          isAi
                            ? 'bg-white border border-slate-200/90 text-slate-800'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {/* AI Score Badge if scored */}
                        {isAi && msg.score !== undefined && (
                          <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                  msg.score >= 8
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : msg.score >= 6
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                <Star className="h-3 w-3 fill-current" />
                                Score: {msg.score}/10
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                Evaluated by Gemini 2.0
                              </span>
                            </div>

                            <div className="flex gap-0.5">
                              {[...Array(10)].map((_, dotIdx) => (
                                <div
                                  key={dotIdx}
                                  className={`h-2 w-2 rounded-full ${
                                    dotIdx < msg.score!
                                      ? msg.score! >= 8
                                        ? 'bg-emerald-500'
                                        : 'bg-amber-500'
                                      : 'bg-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Content text */}
                        <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-3.5 items-start">
                    <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        Analyzing answer structure, technical depth, and metrics...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              {!ended ? (
                <div className="border-t border-slate-200 bg-white p-4 sm:p-5 space-y-3">
                  {/* Action Bar Tools */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={insertStarTemplate}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all"
                      >
                        <Layers className="h-3.5 w-3.5 text-blue-600" />
                        Insert STAR Framework
                      </button>

                      {speechSupported && (
                        <button
                          onClick={toggleSpeech}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
                            isListening
                              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-3.5 w-3.5 text-rose-600" />
                              Listening... (Click to stop)
                            </>
                          ) : (
                            <>
                              <Mic className="h-3.5 w-3.5 text-slate-500" />
                              Voice Dictation
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 font-mono">Enter</kbd> to submit
                    </span>
                  </div>

                  {/* Textarea + Submit */}
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          sendAnswer();
                        }
                      }}
                      placeholder="Type your structured answer here (explain context, technical choices, edge cases, and results)..."
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 p-3.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24 shadow-inner"
                    />

                    <div className="absolute right-3 bottom-3">
                      <button
                        onClick={sendAnswer}
                        disabled={loading || !input.trim()}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <span>Submit</span>
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* CONCLUDED SCREEN CTA */
                <div className="border-t border-slate-200 bg-white p-6 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Round Complete · Full Evaluation Ready
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={restartSession}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retake / New Round
                    </button>

                    <Link
                      href="/user/roadmap"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                    >
                      Review Skill Roadmaps
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
