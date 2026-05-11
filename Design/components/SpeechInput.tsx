"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpeechInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SpeechInput({ 
  onResult, 
  placeholder = "Speak now...",
  className = "w-16 h-16 rounded-full"
}: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]);

  const startListening = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (isListening) return;
    
    setError(null);
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch (err) {
      console.log("Recognition already started or error:", err);
    }
  };

  const stopListening = () => {
    if (!isListening) return;
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setIsListening(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tooltip */}
      <div className={`text-sm font-medium transition-all duration-300 ${
        showTip || isListening ? "opacity-100 -translate-y-2" : "opacity-0 translate-y-0"
      }`}>
        {isListening ? "Listening..." : "Hold to speak"}
      </div>

      <button
        type="button"
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={() => {
          stopListening();
          setShowTip(false);
        }}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        onMouseEnter={() => setShowTip(true)}
        className={`transition-all flex items-center justify-center relative ${
          isListening 
            ? "bg-rose-500 text-white scale-110 shadow-[0_0_30px_rgba(244,63,94,0.5)]" 
            : "bg-blue-600 text-white hover:bg-blue-500 shadow-xl"
        } ${className}`}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Mic className="w-8 h-8" />
          </motion.div>
        ) : (
          <Mic className="w-8 h-8" />
        )}

        {/* Pulse effect when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-30" />
        )}
      </button>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 text-rose-500 text-xs mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100"
          >
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
