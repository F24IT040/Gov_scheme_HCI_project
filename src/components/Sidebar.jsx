import React from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';

export default function Sidebar({ onNewSearch, onCategorySelect, activeCategory }) {
  return (
    <nav
      className="canva-menu hidden w-72 shrink-0 flex-col border-r border-slate-200/70 p-4 md:flex select-none"
      style={{ background: 'rgba(242, 244, 246, 0.82)' }}
    >
      <header className="mb-7 flex items-center gap-3 px-3 pt-3">
        <div
          className="canva-container brand-mark flex h-11 w-11 items-center justify-center rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500), var(--brand-accent))' }}
        >
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <h1
            className="canva-text font-bold"
            style={{ color: 'var(--brand-600)', fontWeight: 700, fontStyle: 'normal', fontSize: '22px' }}
          >
            Sarathi AI
          </h1>
          <p
            className="canva-text mt-0.5 uppercase tracking-widest"
            style={{ color: 'rgb(92, 99, 112)', fontWeight: 600, fontStyle: 'normal', fontSize: '10px', letterSpacing: '0.08rem' }}
          >
            Government Navigator
          </p>
        </div>
      </header>

      <button
        id="new-search"
        type="button"
        onClick={onNewSearch}
        className="canva-button mb-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition hover:brightness-95 active:scale-[0.99]"
        style={{ background: 'var(--brand-500)', color: 'rgb(255, 255, 255)', fontWeight: 600, fontStyle: 'normal', fontSize: '16px' }}
      >
        Start a new search
      </button>

      <div className="space-y-1">
        <button
          type="button"
          onClick={onNewSearch}
          className="nav-link canva-link flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-semibold"
          style={{ background: 'var(--brand-500)', color: 'rgb(255, 255, 255)', fontWeight: 600, fontStyle: 'normal', fontSize: '16px' }}
        >
          AI Workspace
        </button>

        <p
          className="canva-text px-3 pb-2 pt-7 font-semibold uppercase tracking-widest"
          style={{ color: 'rgb(115, 118, 134)', fontWeight: 700, fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.08rem' }}
        >
          Explore by need
        </p>

        <button
          id="scholarship-nav"
          type="button"
          onClick={() => onCategorySelect('scholarship')}
          className={`nav-link canva-link flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-white ${
            activeCategory === 'scholarship' ? 'bg-white font-semibold' : ''
          }`}
          style={{ color: 'rgb(67, 70, 85)', fontWeight: 500, fontStyle: 'normal', fontSize: '16px' }}
        >
          Scholarships
        </button>

        <button
          id="farming-nav"
          type="button"
          onClick={() => onCategorySelect('farming')}
          className={`nav-link canva-link flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-white ${
            activeCategory === 'farming' ? 'bg-white font-semibold' : ''
          }`}
          style={{ color: 'rgb(67, 70, 85)', fontWeight: 500, fontStyle: 'normal', fontSize: '16px' }}
        >
          Farming support
        </button>
      </div>

      <div className="mt-auto rounded-2xl border border-slate-200 bg-brand-50/80 p-4" style={{ borderColor: 'var(--brand-100)' }}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
          <p
            className="canva-text font-semibold"
            style={{ color: 'var(--brand-600)', fontWeight: 600, fontStyle: 'normal', fontSize: '13px' }}
          >
            Official information matters
          </p>
        </div>
        <p
          className="canva-text mt-2 leading-5"
          style={{ color: 'rgb(67, 70, 85)', fontWeight: 400, fontStyle: 'normal', fontSize: '12px' }}
        >
          Always verify deadlines and eligibility on the official scheme portal before applying.
        </p>
      </div>
    </nav>
  );
}
