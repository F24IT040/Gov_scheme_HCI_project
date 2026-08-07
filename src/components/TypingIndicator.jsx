import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-5 reveal">
      {/* Nayanta avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm"
        style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="white"/>
        </svg>
      </div>

      {/* Bubble */}
      <div className="glass-panel rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
        <span className="text-[11px] font-medium text-slate-500 mr-2">Nayanta is thinking</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{
              background: 'var(--brand-500)',
              animation: 'typingDot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
