import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic } from 'lucide-react';
import QuickPrompts from './QuickPrompts';

export default function SearchForm({ value, onChange, onSubmit, onSelectPrompt }) {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef    = useRef(null);
  const currentValueRef   = useRef(value);

  useEffect(() => { currentValueRef.current = value; }, [value]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // default to Hindi-India for voice
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0]?.transcript || '')
        .join(' ')
        .trim();
      if (transcript) {
        const next = currentValueRef.current
          ? `${currentValueRef.current} ${transcript}`.trim()
          : transcript;
        onChange(next);
      }
    };
    recognition.onend  = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e); }
  };

  const handleTextareaChange = (e) => {
    onChange(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const handleVoiceToggle = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) { rec.stop(); setIsListening(false); return; }
    try { rec.start(); setIsListening(true); } catch { setIsListening(false); }
  };

  return (
    <footer className="border-t border-slate-200/60 bg-white/80 px-4 py-4 backdrop-blur-md md:px-9 select-none">
      <div className="mx-auto w-full max-w-4xl">
        <QuickPrompts onSelectPrompt={onSelectPrompt} />

        <form id="query-form" onSubmit={onSubmit} className="glass-panel flex items-end gap-2 rounded-2xl p-2">
          <label htmlFor="scheme-query" className="sr-only">{t('chat.searchPlaceholder')}</label>
          <textarea
            id="scheme-query"
            value={value}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="min-h-[48px] max-h-[140px] flex-1 resize-none border-0 bg-transparent px-3 py-3 leading-6 focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400"
            rows={1}
            placeholder={t('chat.searchPlaceholder')}
            style={{ fontWeight: 400, fontSize: '15px', overflowY: 'auto' }}
          />
          <div className="flex items-center gap-1.5 pb-1 shrink-0">
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
                isListening
                  ? 'border-amber-400 bg-amber-50 text-amber-600 shadow-sm'
                  : 'border-slate-200 bg-white/80 text-slate-500 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600'
              }`}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              <Mic className="h-4 w-4"/>
            </button>
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:brightness-110 active:scale-95 shadow-sm"
              aria-label={t('chat.searchPlaceholder')}
              style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}
            >
              <Send className="h-4 w-4"/>
            </button>
          </div>
        </form>

        <p className="mt-2 text-center" style={{ color: 'rgb(160,163,174)', fontSize: '11px', fontWeight: 500 }}>
          {t('chat.disclaimer')}
        </p>
      </div>
    </footer>
  );
}
