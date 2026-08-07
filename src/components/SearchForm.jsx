import React from 'react';
import { Send } from 'lucide-react';
import QuickPrompts from './QuickPrompts';

export default function SearchForm({ value, onChange, onSubmit, onSelectPrompt }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <footer className="border-t border-white/70 bg-white/72 px-4 py-4 backdrop-blur md:px-9 select-none">
      <div className="mx-auto w-full max-w-4xl">
        <QuickPrompts onSelectPrompt={onSelectPrompt} />

        <form id="query-form" onSubmit={onSubmit} className="glass-panel flex items-end gap-2 rounded-2xl p-2">
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
            type="submit"
            className="canva-button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition hover:brightness-95 active:scale-95"
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
