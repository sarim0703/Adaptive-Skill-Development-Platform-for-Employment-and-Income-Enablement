"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

type SpeechInputProps = {
  onResult: (text: string) => void;
  onInterimResult?: (text: string) => void;
  language?: string; // e.g. 'en-US', 'hi-IN', 'kn-IN'
  className?: string;
};

// ... (types)

export default function SpeechInput({ onResult, onInterimResult, language = "en-IN", className = "" }: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = true; // Use continuous for live updates
      recog.interimResults = true;
      recog.lang = language;

      recog.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript.trim());
          if (onInterimResult) onInterimResult(""); // Clear interim when final arrives
        } else if (interimTranscript && onInterimResult) {
          onInterimResult(interimTranscript);
        }
      };

      recog.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, [language, onResult]);

  const startListening = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isListening) return;
    
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (err) {
      console.error("Speech recognition start error", err);
    }
  };

  const stopListening = () => {
    if (!isListening) return;
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  if (!isSupported) return null;

  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip hint */}
      <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-foreground text-background text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl transition-all duration-300 pointer-events-none ${
        showTip || isListening ? "opacity-100 -translate-y-2" : "opacity-0 translate-y-0"
      }`}>
        {isListening ? "Listening..." : "Hold to speak"}
      </div>

      <button
        type="button"
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={stopListening}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className={`transition-all flex items-center justify-center relative ${
          isListening 
            ? "bg-rose-500 text-white scale-110 shadow-[0_0_30px_rgba(244,63,94,0.5)]" 
            : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl"
        } ${className}`}
      >
        {isListening && (
          <span className="absolute inset-0 rounded-inherit bg-rose-500 animate-ping opacity-20" />
        )}
        {isListening ? (
          <MicOff className="w-5 h-5 relative z-10" />
        ) : (
          <Mic className="w-5 h-5 relative z-10" />
        )}
      </button>
    </div>
  );
}
