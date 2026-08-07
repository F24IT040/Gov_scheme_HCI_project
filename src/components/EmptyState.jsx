import React from 'react';

const SUGGESTIONS = [
  { emoji: '🎓', text: 'Scholarships for students' },
  { emoji: '🌾', text: 'PM-Kisan farming scheme' },
  { emoji: '🏠', text: 'PM Awas Yojana housing' },
  { emoji: '💊', text: 'Ayushman Bharat health' },
];

export default function EmptyState({ message, onSelectPrompt }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 reveal mb-6 backdrop-blur-sm">
      <div className="text-center mb-5">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'rgba(220,161,161,0.12)' }}>
          <span className="text-2xl">🔍</span>
        </div>
        <h2 className="font-semibold" style={{ color: 'rgb(15,23,42)', fontSize: '17px' }}>
          No exact match found
        </h2>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
          {message || 'Try a scheme name or describe your situation. For example: "I am a student, I want scholarship".'}
        </p>
      </div>

      {onSelectPrompt && (
        <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-slate-100">
          <p className="w-full text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Try one of these</p>
          {SUGGESTIONS.map(({ emoji, text }) => (
            <button
              key={text}
              type="button"
              onClick={() => onSelectPrompt(text)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
            >
              <span>{emoji}</span> {text}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
