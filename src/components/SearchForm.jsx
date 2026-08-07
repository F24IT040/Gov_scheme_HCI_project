import React, { useEffect, useRef, useState } from 'react';
import { Send, Mic } from 'lucide-react';
import QuickPrompts from './QuickPrompts';

export default function SearchForm({ value, onChange, onSubmit, onSelectPrompt }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const currentValueRef = useRef(value);

  useEffect(() => {
    currentValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      if (transcript) {
        const nextValue = currentValueRef.current
          ? `${currentValueRef.current} ${transcript}`.trim()
          : transcript;
        onChange(nextValue);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const handleVoiceToggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  return (
    <footer className="border-t border-white/70 bg-white/72 px-4 py-4 backdrop-blur md:px-9 select-none">
      <div className="mx-auto w-full max-w-4xl">
        <QuickPrompts onSelectPrompt={onSelectPrompt} />

        <form id="query-form" onSubmit={onSubmit} className="glass-panel flex items-center gap-2 rounded-2xl p-2">
          <label htmlFor="scheme-query" className="sr-only">
            Ask about government schemes
          </label>
          <textarea
            id="scheme-query"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="canva-input min-h-[48px] flex-1 resize-none border-0 bg-transparent px-3 py-3 leading-5 focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400"
            rows={1}
            placeholder="Ask about a scheme or describe what you need…"
            style={{ fontWeight: 400, fontStyle: 'normal', fontSize: '16px' }}
          />
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`canva-button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${isListening ? 'border-amber-500 bg-amber-100 text-amber-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className="canva-button flex h-11 w-11 shrink-0 self-center items-center justify-center rounded-xl text-white transition hover:brightness-95 active:scale-95"
            aria-label="Send search query"
            style={{ background: 'var(--brand-500)', color: 'rgb(255, 255, 255)' }}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

        <p
          className="canva-text mt-2 text-center text-xs"
          style={{ color: 'rgb(115, 118, 134)', fontWeight: 500, fontStyle: 'normal', fontSize: '12px' }}
        >
          Sarathi AI can make mistakes. Verify important information with official government sources.
        </p>
      </div>
    </footer>
  );
}
