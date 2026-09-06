'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  Trash2,
  HelpCircle,
  Plus,
  Compass,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ChatAssistantPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessionSidebar, setShowSessionSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [profRes, chatRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/assistant/chat'),
        ]);
        const profData = await profRes.json();
        const chatData = await chatRes.json();

        if (profData?.user) setUserProfile(profData.user);
        if (chatData?.sessions) {
          setSessions(chatData.sessions);
          if (chatData.sessions.length > 0) {
            setActiveSessionId(chatData.sessions[0].id);
            setMessages(chatData.sessions[0].messages || []);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }

    loadInitial();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const text = customText || input;
    if (!text.trim() || loading) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: activeSessionId,
        }),
      });

      const data = await res.json();
      if (data?.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.response,
            createdAt: new Date(),
          },
        ]);
        if (data.sessionId && !activeSessionId) {
          setActiveSessionId(data.sessionId);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setShowSessionSidebar(false);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptChips = [
    'What should I prioritize on my active roadmap this month?',
    'Why is my top career pathway recommended for my profile?',
    'How do I bridge my critical skill gaps for technical interviews?',
    'What production capstone projects prove senior competency?',
    'How can I rewrite my resume bullets to pass strict ATS filters?',
  ];

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col lg:flex-row">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      {/* Main Chat Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-white overflow-hidden">
        {/* Session Sidebar (Collapsible on Mobile/Tablet) */}
        <div
          className={`w-full md:w-72 border-r border-slate-200/80 bg-slate-50/60 p-4 flex flex-col justify-between shrink-0 transition-all ${
            showSessionSidebar ? 'block' : 'hidden md:flex'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Consultations
              </span>
              <button
                type="button"
                onClick={() => setShowSessionSidebar(false)}
                className="md:hidden p-1 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              onClick={handleNewSession}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>New Consultation</span>
            </button>

            <div className="space-y-1.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => {
                    setActiveSessionId(sess.id);
                    setMessages(sess.messages || []);
                    setShowSessionSidebar(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold truncate transition-all ${
                    activeSessionId === sess.id
                      ? 'bg-white text-blue-700 font-bold border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {sess.title || 'Career Consultation'}
                </button>
              ))}
              {sessions.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-4">No past sessions</div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-500 space-y-1 shadow-2xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Grounded Copilot Intelligence</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Aura inspects your verified skills, current roadmap, and resume data to formulate contextual answers.
            </p>
          </div>
        </div>

        {/* Center: Conversation Stream & Input */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {/* Header Bar */}
          <div className="h-14 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSessionSidebar(!showSessionSidebar)}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                title="Toggle sessions"
              >
                <PanelLeft className="h-4 w-4" />
              </button>

              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
                <Bot className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span>Aura Career Mentor</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    AI Copilot
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">Contextual Telemetry Grounded</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewSession}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="max-w-xl mx-auto text-center py-8 sm:py-12 space-y-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 mx-auto border border-blue-200/80 shadow-xs">
                  <Bot className="h-8 w-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Hello, I&apos;m Aura
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Your personal AI career mentor. Ask me about your roadmap, skill gaps, resume keyword fixes, or interview prep.
                  </p>
                </div>

                <div className="space-y-2 text-left pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-center">
                    Suggested Exploration Prompts
                  </span>
                  <div className="flex flex-col gap-2">
                    {promptChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 text-xs font-semibold text-slate-700 hover:bg-blue-50/50 hover:text-blue-800 hover:border-blue-200 text-left transition-all shadow-2xs flex items-center justify-between group"
                      >
                        <span>{chip}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-3xl ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isUser
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xs'
                      }`}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-slate-50/80 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {!isUser && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Aura Grounded AI</span>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="text-slate-500 hover:text-slate-800 flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex items-center gap-3 mr-auto max-w-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Aura is formulating contextual career guidance...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-slate-200/80 p-4 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 max-w-4xl mx-auto"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Aura anything about your skills, roadmap, or target role..."
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all hover:-translate-y-0.5"
                title="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
