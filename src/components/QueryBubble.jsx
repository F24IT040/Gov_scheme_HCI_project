import React from 'react';

export default function QueryBubble({ query }) {
  if (!query) return null;

  return (
    <div className="flex justify-end mb-5 animate-fade-in-up opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-end gap-2 max-w-xl">
        <div
          className="rounded-2xl rounded-br-sm px-4 py-3 text-white shadow-md font-medium text-[15px] leading-relaxed"
          style={{ background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-accent) 100%)' }}
        >
          {query}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-[13px] font-bold shadow-sm mb-0.5"
          style={{ background: 'var(--brand-600)' }}>
          U
        </div>
      </div>
    </div>
  );
}
