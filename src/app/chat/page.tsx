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
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ChatAssistantPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
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
  };

  const promptChips = [
    'What should I learn next on my roadmap?',
    'Why is my top career match recommended?',
    'How can I improve my resume ATS score?',
    'What portfolio projects should I build?',
    'What skills am I missing for senior roles?',
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar userName={userProfile?.name} userEmail={userProfile?.email} />

      {/* Main Chat Layout */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-slate-50/50">
        {/* Left: Chat Session History */}
        <div className="w-full md:w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleNewSession}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
                Recent Consultations
              </span>
              {sessions.map((sess) => (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => {
                    setActiveSessionId(sess.id);
                    setMessages(sess.messages || []);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs truncate transition-colors ${
                    activeSessionId === sess.id
                      ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {sess.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Grounded Mentorship</span>
            </div>
            <p className="text-[11px]">
              Aura directly analyzes your verified skills, current roadmap, and resume.
            </p>
          </div>
        </div>

        {/* Center: Conversation Stream & Input */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {/* Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="max-w-xl mx-auto text-center py-12 space-y-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 mx-auto shadow-sm">
                  <Bot className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">Hello, I&apos;m Aura</h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your contextual AI career guidance mentor. Ask me about your roadmap, skill gaps, or interview strategies.
                  </p>
                </div>

                <div className="space-y-2 text-left pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                    Suggested Questions
                  </span>
                  <div className="flex flex-col gap-2">
                    {promptChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSendMessage(chip)}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-200 text-left transition-colors shadow-2xs"
                      >
                        {chip}
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
                    className={`flex items-start gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isUser ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-blue-600" />}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none space-y-2'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex items-center gap-3 mr-auto max-w-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-blue-600 border border-slate-200">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  Aura is formulating contextual advice...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="border-t border-slate-200 p-4 bg-white">
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
                placeholder="Ask anything about your career..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
