'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AssistantMessage as IAssistantMessage, StructuredAction } from '@/lib/hooks/useAssistant';

interface AssistantMessageProps {
  message: IAssistantMessage;
  onRetry?: () => void;
  onActionClick?: (action: StructuredAction) => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  onRetry,
  onActionClick,
}) => {
  const router = useRouter();
  const [copiedBlockIndex, setCopiedBlockIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockIndex(index);
    setTimeout(() => setCopiedBlockIndex(null), 2000);
  };

  // Safe markdown and code block parser
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const language = lines[0].trim() || 'code';
        const codeText = lines.slice(1).join('\n') || lines[0];

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-sm text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">{language}</span>
              <button
                onClick={() => copyToClipboard(codeText, index)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors p-1"
                title="Copy code"
              >
                {copiedBlockIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Format headings, bold, bullet points
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, lIdx) => {
            const trimmed = line.trim();

            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={lIdx} className="text-sm font-bold text-slate-900 mt-3 mb-1">
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h2 key={lIdx} className="text-base font-bold text-slate-900 mt-4 mb-2">
                  {trimmed.replace('## ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const text = trimmed.slice(2);
              return (
                <li key={lIdx} className="ml-4 list-disc text-slate-700 leading-relaxed text-xs md:text-sm">
                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(text) }} />
                </li>
              );
            }
            if (/^\d+\.\s/.test(trimmed)) {
              return (
                <li key={lIdx} className="ml-4 list-decimal text-slate-700 leading-relaxed text-xs md:text-sm">
                  <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.replace(/^\d+\.\s/, '')) }} />
                </li>
              );
            }
            if (!trimmed) {
              return <div key={lIdx} className="h-1" />;
            }
            return (
              <p
                key={lIdx}
                className="text-xs md:text-sm text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
              />
            );
          })}
        </div>
      );
    });
  };

  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-mono text-[11px]">$1</code>');
  };

  const handleActionNavigation = (action: StructuredAction) => {
    if (onActionClick) {
      onActionClick(action);
    } else if (action.route) {
      router.push(action.route);
    }
  };

  const isFailed = message.status === 'FAILED';

  return (
    <div className="flex items-start gap-3 mb-5 animate-in fade-in-50 duration-150">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 max-w-[92%] md:max-w-[85%]">
        {/* Container */}
        <div
          className={`p-4 rounded-2xl rounded-tl-xs border transition-all ${
            isFailed
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Aura</span>
              <span className="text-[10px] text-slate-400 font-medium">Career Copilot</span>
            </div>
            {message.created_at && (
              <span className="text-[10px] text-slate-400">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="prose-xs text-slate-800">{renderFormattedContent(message.content)}</div>

          {/* Structured Action Cards */}
          {message.actions && message.actions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recommended Actions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.actions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleActionNavigation(act)}
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-300 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-blue-900 truncate">{act.title}</p>
                      {act.description && (
                        <p className="text-[10px] text-blue-700/80 truncate mt-0.5">
                          {act.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Context Transparency Attribution */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 flex-wrap">
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Derived from:</span>
              {message.sources.map((src, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                >
                  {src}
                </span>
              ))}
            </div>
          )}

          {/* Failed state retry */}
          {isFailed && onRetry && (
            <div className="mt-3 pt-2 border-t border-rose-200 flex items-center justify-between">
              <span className="text-xs text-rose-700">Response could not be completed.</span>
              <button
                onClick={onRetry}
                className="flex items-center gap-1 px-3 py-1 bg-white border border-rose-300 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
