import React from 'react';
import { ShieldCheck, PlusCircle, GraduationCap, Tractor, Home, HeartPulse, LogOut } from 'lucide-react';

export default function Sidebar({ onNewSearch, onCategorySelect, activeCategory, onLogout }) {
  const categories = [
    { id: 'scholarship', label: 'Scholarships & Education', icon: GraduationCap },
    { id: 'farming',     label: 'Farming & Agriculture',   icon: Tractor },
    { id: 'housing',     label: 'Housing & Shelter',       icon: Home },
    { id: 'health',      label: 'Health & Wellness',       icon: HeartPulse },
  ];

  return (
    <nav
      className="hidden w-64 shrink-0 flex-col border-r border-slate-200/70 md:flex select-none"
      style={{ background: 'rgba(249,244,234,0.92)', height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Brand header */}
      <header className="flex items-center gap-3 px-5 py-5 border-b border-slate-200/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] shadow-sm"
          style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500), var(--brand-accent))' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="white"/>
          </svg>
        </div>
        <div>
          <h1 className="font-bold leading-none" style={{ color: '#0F172A', fontSize: '17px', letterSpacing: '-0.02em' }}>Nayanta</h1>
          <p className="mt-0.5 uppercase tracking-widest" style={{ color: 'rgb(92,99,112)', fontSize: '9px', fontWeight: 600 }}>
            Government Guide
          </p>
        </div>
      </header>

      <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 gap-1">
        {/* New search CTA */}
        <button
          type="button"
          onClick={onNewSearch}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white transition hover:brightness-95 active:scale-[0.99]"
          style={{ background: 'var(--brand-600)', fontSize: '14px' }}
        >
          <PlusCircle className="h-4 w-4" />
          New Search
        </button>

        {/* AI Workspace — subtle, not CTA */}
        <button
          type="button"
          onClick={onNewSearch}
          className="nav-link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-semibold transition"
          style={{
            background: 'rgba(198,141,141,0.12)',
            color: 'var(--brand-600)',
            fontSize: '14px',
            borderLeft: '3px solid var(--brand-600)'
          }}
        >
          <span className="text-[15px]">💬</span> AI Workspace
        </button>

        {/* Category nav */}
        <p className="px-3 pb-1 pt-5 uppercase tracking-widest" style={{ color: 'rgb(115,118,134)', fontSize: '10px', fontWeight: 700 }}>
          Explore by need
        </p>

        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onCategorySelect(id)}
            className={`nav-link flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white ${
              activeCategory === id ? 'bg-white font-semibold shadow-sm' : ''
            }`}
            style={{ color: activeCategory === id ? 'var(--brand-600)' : 'rgb(67,70,85)', fontSize: '14px' }}
          >
            <Icon className="h-4 w-4 shrink-0" style={{ color: activeCategory === id ? 'var(--brand-600)' : 'rgb(150,155,170)' }} />
            {label}
          </button>
        ))}
      </div>

      {/* Bottom: trust note + logout */}
      <div className="px-3 pb-4 space-y-2">
        <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--brand-100)', background: 'var(--brand-50)' }}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--brand-600)' }} />
            <p className="font-semibold" style={{ color: 'var(--brand-600)', fontSize: '12px' }}>Official info only</p>
          </div>
          <p style={{ color: 'rgb(67,70,85)', fontSize: '11px', lineHeight: '1.5' }}>
            Verify deadlines and eligibility on the official portal before applying.
          </p>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition hover:bg-red-50"
            style={{ color: 'rgb(150,60,60)', fontSize: '13px', fontWeight: 500 }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
