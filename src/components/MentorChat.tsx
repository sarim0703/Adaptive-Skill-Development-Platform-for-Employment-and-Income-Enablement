"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";
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
  const getGreetingText = (type: string): string => {
    switch (type) {
      case 'stuck':
        return t("mentor.chat.msg1");
      case 'repeated_failure':
        return t("mentor.proactive.repeated_failure");
      case 'performing_well':
        return t("mentor.proactive.performing_well");
      default:
        return t("mentor.proactive.default");
    }
  };

  const [messages, setMessages] = useState<any[]>(triggerType ? [{
    id: 'system-greeting',
    role: 'assistant',
    content: getGreetingText(triggerType),
  }] : []);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const userMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          subtopicId,
          triggerType,
          timeSpentSeconds,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) return;

      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, content: fullContent } : m
        ));
      }
    } catch (error) {
      console.error("[MentorChat] Error:", error);
    } finally {
      setIsLoading(false);
    }
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
              const content = msg.content || (msg as any).parts?.map((p: any) => p.text || '').join('') || '';
              
              if (!content && role === 'user') return null;

              return (
              <div key={msg.id} className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-md'
                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm'
                }`}>
                  {content}
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
