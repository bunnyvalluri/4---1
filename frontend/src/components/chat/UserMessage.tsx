'use client';

import React from 'react';
import { User } from 'lucide-react';
import { AssistantMessage } from '@/lib/hooks/useAssistant';

interface UserMessageProps {
  message: AssistantMessage;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-end mb-4 animate-in fade-in-50 duration-150">
      <div className="max-w-[85%] md:max-w-[70%]">
        <div className="bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs text-xs md:text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-800">
          {message.content}
        </div>
        {message.created_at && (
          <p className="text-[10px] text-slate-400 text-right mt-1 px-1">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
};
