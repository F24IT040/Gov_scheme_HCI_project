import React from 'react';

export default function QuickPrompts({ onSelectPrompt }) {
  const prompts = [
    { id: "prompt-scholarships", text: "I am a student. I want scholarship" },
    { id: "prompt-pmkisan", text: "Tell me about PM-Kisan" }
  ];

  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
      {prompts.map((p) => (
        <button
          key={p.id}
          id={p.id}
          type="button"
          onClick={() => onSelectPrompt(p.text)}
          className="canva-button whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition"
          style={{
            background: 'rgb(255, 255, 255)',
            color: 'var(--brand-600)',
            borderColor: 'var(--brand-100)',
            fontWeight: 500,
            fontStyle: 'normal',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--brand-50)';
            e.currentTarget.style.color = 'var(--brand-600)';
            e.currentTarget.style.borderColor = 'var(--brand-100)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgb(255, 255, 255)';
            e.currentTarget.style.color = 'var(--brand-600)';
            e.currentTarget.style.borderColor = 'var(--brand-100)';
          }}
        >
          {p.text}
        </button>
      ))}
    </div>
  );
}
