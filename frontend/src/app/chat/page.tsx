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
  PanelLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ResponsiveDrawer } from '@/components/ui/ResponsiveDrawer';

export default function ChatAssistantPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || input).trim();
    if (!text || loading) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text, createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setMessages([]);
    setShowSessionDrawer(false);
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

  const sessionListContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Consultation Sessions
        </span>
      </div>

      <button
        type="button"
        onClick={handleNewSession}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5 min-h-[44px]"
      >
        <Plus className="h-4 w-4" />
        <span>New Consultation</span>
      </button>

      <div className="space-y-1.5 max-h-[60vh] md:max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 touch-scroll">
        {sessions.map((sess) => (
          <button
            key={sess.id}
            type="button"
            onClick={() => {
              setActiveSessionId(sess.id);
              setMessages(sess.messages || []);
              setShowSessionDrawer(false);
            }}
            className={`w-full text-left p-3 rounded-xl text-xs font-semibold truncate transition-all min-h-[44px] ${
              activeSessionId === sess.id
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
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
  );

  return (
    <div className="min-h-screen-dvh bg-slate-50/40 flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      {/* Main Chat Layout Container: Dynamic full height adapting for mobile header and desktop sidebar */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100dvh-3rem)] lg:h-screen-dvh bg-white overflow-hidden min-w-0">
        
        {/* Desktop Session Sidebar (md+) */}
        <div className="w-72 border-r border-slate-200/80 bg-slate-50/60 p-4 hidden md:flex flex-col justify-between shrink-0 overflow-y-auto">
          {sessionListContent}
        </div>

        {/* Mobile Session Drawer (<md) */}
        <ResponsiveDrawer
          isOpen={showSessionDrawer}
          onClose={() => setShowSessionDrawer(false)}
          title="Consultation History"
        >
          {sessionListContent}
        </ResponsiveDrawer>

        {/* Center: Conversation Stream & Multiline Input */}
        <div className="flex-1 flex flex-col h-full bg-white relative min-w-0">
          
          {/* Header Bar */}
          <div className="h-14 border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setShowSessionDrawer(true)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600 outline-none"
                aria-label="Open consultations drawer"
              >
                <PanelLeft className="h-5 w-5" />
              </button>

              <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                  <span className="truncate">Aura Career Mentor</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    AI Copilot
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Telemetry Grounded</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewSession}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 min-h-[44px] px-2"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Consultation</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 touch-scroll min-w-0">
            {messages.length === 0 ? (
              <div className="max-w-xl mx-auto text-center py-6 sm:py-12 space-y-5 px-2">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 mx-auto border border-blue-200/80 shadow-xs">
                  <Bot className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Hello, I&apos;m Aura
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Your personal AI career mentor. Ask me about your roadmap, skill gaps, resume keyword fixes, or technical interview prep.
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
                        className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 sm:p-3.5 text-xs font-semibold text-slate-700 hover:bg-blue-50/50 hover:text-blue-800 hover:border-blue-200 text-left transition-all shadow-2xs flex items-center justify-between group min-h-[44px]"
                      >
                        <span className="break-words pr-2">{chip}</span>
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
                    className={`flex items-start gap-2.5 sm:gap-3 ${
                      isUser
                        ? 'ml-auto flex-row-reverse max-w-[90%] sm:max-w-2xl'
                        : 'mr-auto max-w-[95%] sm:max-w-3xl'
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isUser
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xs'
                      }`}
                    >
                      {isUser ? <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </div>

                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group min-w-0 overflow-hidden ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-slate-50/90 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                      {!isUser && (
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-slate-700 py-1 px-1.5 rounded transition-colors"
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
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Aura is formulating contextual career guidance...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Multiline Chat Input Bar (Pinned cleanly with safe-area padding) */}
          <div className="border-t border-slate-200/80 p-2.5 sm:p-4 bg-white shrink-0 pb-safe">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2 max-w-4xl mx-auto"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aura about skills, roadmap, or interview prep... (Shift+Enter for newline)"
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition-colors resize-none max-h-32 min-h-[44px] leading-relaxed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 transition-all hover:-translate-y-0.5"
                title="Send Message"
                aria-label="Send Message"
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
