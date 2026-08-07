import React from 'react';
import { Sprout, Award, BookOpenCheck, GraduationCap, Rocket, ArrowUpRight } from 'lucide-react';

const iconMap = {
  Sprout,
  Award,
  BookOpenCheck,
  GraduationCap,
  Rocket
};

export default function SchemeCard({ scheme, isSelected, onSelect, onViewProcess, isSingle }) {
  const IconComponent = iconMap[scheme.icon] || Award;

  if (isSingle) {
    return (
      <button
        type="button"
        onClick={() => onSelect(scheme)}
        className={`scheme-card single-card w-full rounded-2xl p-5 text-left transition-all ${
          isSelected ? 'selected' : ''
        }`}
        aria-label={`Open ${scheme.fullTitle || scheme.title} details`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div
              className="canva-container flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: scheme.iconBg, color: scheme.iconColor }}
            >
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <p
                className="canva-text font-semibold uppercase tracking-wider"
                style={{ color: scheme.iconColor, fontWeight: 700, fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.06rem' }}
              >
                {scheme.kicker}
              </p>
              <h3
                className="canva-text mt-1 font-bold"
                style={{ color: 'rgb(25, 28, 30)', fontWeight: 700, fontStyle: 'normal', fontSize: '20px' }}
              >
                {scheme.fullTitle || scheme.title}
              </h3>
              <p
                className="canva-text mt-2 leading-6"
                style={{ color: 'rgb(92, 99, 112)', fontWeight: 400, fontStyle: 'normal', fontSize: '14px' }}
              >
                {scheme.copy}
              </p>
            </div>
          </div>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--brand-600)' }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 items-center">
          <span
            className="canva-tag rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: scheme.tagBg, color: scheme.tagColor, fontWeight: 600, fontStyle: 'normal', fontSize: '12px' }}
          >
            {scheme.tag}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewProcess?.(scheme); }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold transition hover:border-slate-300 hover:bg-slate-50"
            style={{ color: 'var(--brand-600)' }}
          >
            View Process →
          </button>
          <span
            className="canva-text py-1 text-sm font-semibold ml-auto"
            style={{ color: 'var(--brand-600)', fontWeight: 600, fontStyle: 'normal', fontSize: '14px' }}
          >
            View eligibility summary →
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(scheme)}
      className={`scheme-card scholarship-card rounded-2xl p-5 text-left transition-all ${
        isSelected ? 'selected' : ''
      }`}
      aria-label={`Open ${scheme.fullTitle || scheme.title} details`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="canva-container flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: scheme.iconBg, color: scheme.iconColor }}
        >
          <IconComponent className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4" style={{ color: 'var(--brand-600)' }} />
      </div>

      <p
        className="canva-text mt-4 font-semibold uppercase tracking-wider"
        style={{ color: scheme.iconColor, fontWeight: 700, fontStyle: 'normal', fontSize: '10px', letterSpacing: '0.06rem' }}
      >
        {scheme.kicker}
      </p>

      <h3
        className="canva-text mt-1 font-bold"
        style={{ color: 'rgb(25, 28, 30)', fontWeight: 700, fontStyle: 'normal', fontSize: '17px' }}
      >
        {scheme.title}
      </h3>

      <p
        className="canva-text mt-2 leading-5"
        style={{ color: 'rgb(92, 99, 112)', fontWeight: 400, fontStyle: 'normal', fontSize: '13px' }}
      >
        {scheme.copy}
      </p>

      <span
        className="canva-tag mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold"
        style={{ background: scheme.tagBg, color: scheme.tagColor, fontWeight: 600, fontStyle: 'normal', fontSize: '12px' }}
      >
        {scheme.tag}
      </span>
      <div className="mt-3">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onViewProcess?.(scheme); }}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold transition hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5"
          style={{ color: 'var(--brand-600)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          View Process Simulator
        </button>
      </div>
    </button>
  );
}
