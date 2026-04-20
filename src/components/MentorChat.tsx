"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useLanguage } from "@/context/LanguageContext";
import SpeechInput from "./SpeechInput";

type MentorChatProps = {
  subtopicId: string;
  triggerType: string | null;
  timeSpentSeconds: number;
  isPulsing?: boolean;
};

const LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN'
};

export default function MentorChat({ subtopicId, triggerType, timeSpentSeconds, isPulsing = false }: MentorChatProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getGreetingText = (type: string): string => {
    switch (type) {
      case 'stuck':
        return t("mentor.chat.msg1");
      case 'repeated_failure':
        return "I see you've been trying hard on this assessment. Don't worry — struggling is part of learning! Let me help you understand the concepts better before your next attempt.";
      case 'performing_well':
        return "You're doing amazing! 🔥 You've been consistently crushing it. Want me to challenge you with something a bit harder?";
      default:
        return "Hi there! How can I help you with your current task?";
    }
  };

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        subtopicId,
        triggerType,
        timeSpentSeconds,
      },
    }),
    messages: triggerType ? [{
      id: 'system-greeting',
      role: 'assistant' as const,
      content: getGreetingText(triggerType),
      parts: [{ type: 'text' as const, text: getGreetingText(triggerType) }],
    }] : [],
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const shouldAutoOpen = triggerType === 'stuck' || triggerType === 'repeated_failure';
  useEffect(() => {
    if (shouldAutoOpen) {
      queueMicrotask(() => setIsOpen(true));
    }
  }, [shouldAutoOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    await sendMessage({ text: msg });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all ${isPulsing ? 'animate-bounce' : ''}`}
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[400px] h-[70vh] sm:h-[540px] sm:bottom-6 sm:right-6 bg-white border border-slate-200 sm:rounded-2xl flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 sm:rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{t("mentor.chat.name")}</h3>
                <p className="text-xs text-slate-400">{t("mentor.chat.status")}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 mt-8">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium">Ask me anything!</p>
                <p className="text-xs mt-1">I know what you&apos;re working on 😊</p>
              </div>
            )}
            {messages.map((msg) => {
              const role = msg.role as string;
              return (
              <div key={msg.id} className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-md'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
              );
            })}
            {isLoading && messages.length > 0 && (messages[messages.length - 1].role as string) === 'user' && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your mentor..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
            />
            <SpeechInput 
              language={LANG_MAP[language]} 
              onResult={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
              className="w-[42px] h-[42px]"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
