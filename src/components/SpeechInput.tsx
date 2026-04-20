"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

type SpeechInputProps = {
  onResult: (text: string) => void;
  language?: string; // e.g. 'en-US', 'hi-IN', 'kn-IN'
  className?: string;
};

export default function SpeechInput({ onResult, language = "en-IN", className = "" }: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = language;

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [language, onResult]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      try {
        recognition?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition start error", err);
      }
    }
  };

  if (!recognition) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all flex items-center justify-center ${
        isListening 
          ? "bg-red-100 text-red-600 animate-pulse ring-4 ring-red-50" 
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      } ${className}`}
      title={isListening ? "Stop Recording" : "Start Voice Input"}
    >
      {isListening ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
