import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WelcomeHero() {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div
        className="canva-container flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: 'rgba(220, 161, 161, 0.18)', color: 'var(--brand-600)' }}
      >
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="max-w-2xl">
        <p
          className="canva-text mb-1 font-semibold uppercase tracking-widest"
          style={{ color: 'var(--brand-600)', fontWeight: 700, fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.08rem' }}
        >
          Scheme discovery, made clear
        </p>
        <h2
          className="canva-text font-bold leading-tight"
          style={{ color: 'rgb(25, 28, 30)', fontWeight: 700, fontStyle: 'normal', fontSize: '24px' }}
        >
          Find the right government scheme.
        </h2>
        <p
          className="canva-text mt-3 leading-6"
          style={{ color: 'rgb(92, 99, 112)', fontWeight: 400, fontStyle: 'normal', fontSize: '16px' }}
        >
          Ask for a specific scheme and I’ll show one focused card. Describe a need like “I am a student, I want scholarship” and I’ll show relevant schemes you can explore.
        </p>
      </div>
    </div>
  );
}
