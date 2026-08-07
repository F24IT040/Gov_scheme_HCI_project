import React from 'react';

const PROMPTS = [
  { id: 'p1', emoji: '🎓', text: 'I am a student. I want scholarship' },
  { id: 'p2', emoji: '🌾', text: 'Tell me about PM-Kisan' },
  { id: 'p3', emoji: '🏠', text: 'How to apply for PM Awas Yojana?' },
  { id: 'p4', emoji: '💊', text: 'Ayushman Bharat health scheme' },
  { id: 'p5', emoji: '👩', text: 'Women empowerment schemes' },
];

export default function QuickPrompts({ onSelectPrompt }) {
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      {PROMPTS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelectPrompt(p.text)}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-95"
          style={{ color: 'var(--brand-600)' }}
        >
          <span>{p.emoji}</span>
          {p.text}
        </button>
      ))}
    </div>
  );
}
