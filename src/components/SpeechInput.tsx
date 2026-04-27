"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

type SpeechInputProps = {
  onResult: (text: string) => void;
  language?: string; // e.g. 'en-US', 'hi-IN', 'kn-IN'
  className?: string;
};

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export default function SpeechInput({ onResult, language = "en-IN", className = "" }: SpeechInputProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = language;

      recog.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
        setIsListening(false);
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

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition start error", err);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`transition-all flex items-center justify-center ${
        isListening 
          ? "bg-red-500 text-white animate-pulse ring-4 ring-red-500/20" 
          : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg"
      } ${className}`}
      title={isListening ? "Stop Recording" : "Start Voice Input"}
    >
      {isListening ? (
        <MicOff className="w-1/2 h-1/2" />
      ) : (
        <Mic className="w-1/2 h-1/2" />
      )}
    </button>
  );
}
