import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ message }) {
  return (
    <section id="empty-panel" className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-6 text-center reveal mb-6">
      <SearchX className="mx-auto h-7 w-7 text-slate-400" />
      <h2
        className="canva-text mt-3 font-semibold"
        style={{ color: 'rgb(25, 28, 30)', fontWeight: 600, fontStyle: 'normal', fontSize: '18px' }}
      >
        Try a scheme name or a life need
      </h2>
      <p
        className="canva-text mx-auto mt-1 max-w-md text-sm leading-6"
        style={{ color: 'rgb(92, 99, 112)', fontWeight: 400, fontStyle: 'normal', fontSize: '16px' }}
      >
        {message || 'For example, ask “PM-Kisan scheme” or “I am a student, I want scholarship”.'}
      </p>
    </section>
  );
}
