import React from 'react';
import { X } from 'lucide-react';

export default function DetailPanel({ scheme, onClose }) {
  if (!scheme) return null;

  return (
    <section
      id="detail-panel"
      className="glass-panel max-w-3xl rounded-2xl p-5 reveal mb-6"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p id="detail-kicker" className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--brand-600)' }}>
            {scheme.kicker}
          </p>
          <h2 id="detail-title" className="mt-1 text-xl font-bold text-slate-900">
            {scheme.fullTitle || scheme.title}
          </h2>
        </div>
        <button
          id="close-detail"
          type="button"
          onClick={onClose}
          className="canva-button rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition"
          style={{ background: 'rgb(241, 245, 249)', color: 'rgb(92, 99, 112)' }}
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p id="detail-copy" className="mt-3 leading-6 text-slate-600">
        {scheme.copy}
      </p>

      {scheme.eligibility && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Eligibility</p>
          <p className="mt-1 text-sm text-slate-700">{scheme.eligibility}</p>
        </div>
      )}

      {scheme.benefit && (
        <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-600)' }}>Benefit Summary</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--brand-900)' }}>{scheme.benefit}</p>
        </div>
      )}

      {(scheme.applicationProcess || scheme.process_steps || scheme.application_process) && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Application Process</p>
          <div className="mt-3 space-y-3">
            {(scheme.applicationProcess || scheme.process_steps || scheme.application_process).map((step, idx) => (
              <div key={idx} className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p
        className="canva-text mt-4 text-xs leading-5"
        style={{ color: 'rgb(115, 118, 134)', fontWeight: 400, fontStyle: 'italic', fontSize: '13px' }}
      >
        This is a quick guide, not an application decision. Confirm the latest rules, documents and dates on the official government portal.
      </p>
    </section>
  );
}
