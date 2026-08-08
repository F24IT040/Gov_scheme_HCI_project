import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Award, BookOpenCheck, GraduationCap, Rocket, ArrowUpRight, PlayCircle, AlertCircle } from 'lucide-react';

const iconMap = { Sprout, Award, BookOpenCheck, GraduationCap, Rocket };

/** True when the backend returned a placeholder "no match" object */
function isNoMatch(scheme) {
  return (
    scheme?.isNoMatch === true ||
    scheme?.id === '__no_match__' ||
    scheme?.confidence === 'Low' && !scheme?.official_url
  );
}

/* ── No-match card ─────────────────────────────────────────────────── */
function NoMatchCard({ scheme }) {
  const { t } = useTranslation();
  return (
    <div className="scheme-card w-full rounded-2xl p-5 text-left border-dashed opacity-80">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <AlertCircle className="h-5 w-5 text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-700" style={{ fontSize: '16px' }}>
          {scheme.fullTitle || scheme.title}
        </h3>
      </div>
      <p className="text-sm text-slate-500 leading-6">{scheme.copy || t('chat.noMatchDesc')}</p>
    </div>
  );
}

/* ── Single-result card (full-width) ───────────────────────────────── */
function SingleCard({ scheme, isSelected, onSelect, onViewProcess }) {
  const { t } = useTranslation();
  const IconComponent = iconMap[scheme.icon] || Award;
  const hasProcess = Array.isArray(scheme.process_steps) && scheme.process_steps.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(scheme)}
      className={`scheme-card w-full rounded-2xl p-5 text-left transition-all focus-visible:outline-none ${isSelected ? 'selected' : ''}`}
      aria-pressed={isSelected}
      aria-label={`Open ${scheme.fullTitle || scheme.title} details`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{ background: scheme.iconBg, color: scheme.iconColor }}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold uppercase tracking-wider truncate"
              style={{ color: scheme.iconColor, fontSize: '11px', letterSpacing: '0.06rem' }}>
              {scheme.kicker}
            </p>
            <h3 className="mt-1 font-bold leading-tight" style={{ color: 'rgb(25,28,30)', fontSize: '20px' }}>
              {scheme.fullTitle || scheme.title}
            </h3>
            <p className="mt-2 leading-6" style={{ color: 'rgb(92,99,112)', fontSize: '14px' }}>
              {scheme.copy}
            </p>
          </div>
        </div>
        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0" style={{ color: 'var(--brand-600)' }} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: scheme.tagBg, color: scheme.tagColor }}>
          {scheme.tag}
        </span>

        {/* Only show View Process when the scheme has actual process steps */}
        {hasProcess && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewProcess?.(scheme); }}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold transition hover:border-brand-200 hover:bg-brand-50"
            style={{ color: 'var(--brand-600)' }}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {t('process.simulator')}
          </button>
        )}

        {isSelected ? (
          <span className="ml-auto py-1 text-sm font-semibold" style={{ color: 'var(--brand-600)', fontSize: '13px' }}>
            {t('chat.checkBeforeDesc').split('.')[0]} ↓
          </span>
        ) : (
          <span className="ml-auto py-1 text-sm font-medium" style={{ color: 'var(--brand-600)', fontSize: '13px' }}>
            {t('chat.checkBefore')} →
          </span>
        )}
      </div>
    </button>
  );
}

/* ── Grid card ──────────────────────────────────────────────────────── */
function GridCard({ scheme, isSelected, onSelect, onViewProcess }) {
  const { t } = useTranslation();
  const IconComponent = iconMap[scheme.icon] || Award;
  const hasProcess = Array.isArray(scheme.process_steps) && scheme.process_steps.length > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(scheme)}
      className={`scheme-card scholarship-card flex flex-col rounded-2xl p-5 text-left transition-all focus-visible:outline-none ${isSelected ? 'selected' : ''}`}
      aria-pressed={isSelected}
      aria-label={`Open ${scheme.fullTitle || scheme.title} details`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
          style={{ background: scheme.iconBg, color: scheme.iconColor }}>
          <IconComponent className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--brand-600)' }} />
      </div>

      <p className="mt-4 font-semibold uppercase tracking-wider"
        style={{ color: scheme.iconColor, fontSize: '10px', letterSpacing: '0.06rem' }}>
        {scheme.kicker}
      </p>

      <h3 className="mt-1 font-bold leading-snug" style={{ color: 'rgb(25,28,30)', fontSize: '17px' }}>
        {scheme.title}
      </h3>

      <p className="mt-2 leading-5 flex-1" style={{ color: 'rgb(92,99,112)', fontSize: '13px' }}>
        {scheme.copy}
      </p>

      <span className="mt-4 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold"
        style={{ background: scheme.tagBg, color: scheme.tagColor }}>
        {scheme.tag}
      </span>

      {/* Only show View Process when scheme has actual steps */}
      {hasProcess && (
        <div className="mt-3">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onViewProcess?.(scheme); }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold transition hover:border-brand-200 hover:bg-brand-50 flex items-center justify-center gap-1.5"
            style={{ color: 'var(--brand-600)' }}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {t('process.simulator')}
          </button>
        </div>
      )}
    </button>
  );
}

/* ── Public export ──────────────────────────────────────────────────── */
export default function SchemeCard({ scheme, isSelected, onSelect, onViewProcess, isSingle }) {
  if (isNoMatch(scheme)) {
    return <NoMatchCard scheme={scheme} />;
  }
  if (isSingle) {
    return <SingleCard scheme={scheme} isSelected={isSelected} onSelect={onSelect} onViewProcess={onViewProcess} />;
  }
  return <GridCard scheme={scheme} isSelected={isSelected} onSelect={onSelect} onViewProcess={onViewProcess} />;
}
