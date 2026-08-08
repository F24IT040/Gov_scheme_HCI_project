import React from 'react';
import { User } from 'lucide-react';

export default function QueryBubble({ query }) {
  if (!query) return null;

  return (
    <div
      className="flex justify-end mb-5"
      style={{
        animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <div className="flex items-end gap-2 max-w-[80%]">
        {/* Bubble */}
        <div
          className="rounded-2xl rounded-br-sm px-4 py-3 text-white shadow-md text-[15px] leading-relaxed font-medium"
          style={{
            background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-accent) 100%)',
            wordBreak: 'break-word',
          }}
        >
          {query}
        </div>

        {/* Avatar — person icon inside brand circle */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm mb-0.5"
          style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}
          aria-hidden="true"
        >
          <User className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
