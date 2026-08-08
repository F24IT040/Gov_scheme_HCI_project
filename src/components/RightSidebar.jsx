import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle, ChevronRight, Inbox, Maximize2, Minimize2,
  Zap, FileText, Volume2, VolumeX, Search, MousePointerClick, ShieldCheck
} from 'lucide-react';

export default function RightSidebar({ selectedScheme, conversationText, width, isExpanded, onToggleExpand }) {
  const { t, i18n } = useTranslation();
  const [isReading, setIsReading] = useState(false);
  const [highlightSection, setHighlightSection] = useState('');
  const speechIndexRef = useRef(0);
  const speechQueueRef = useRef([]);

  const supportsSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const highlightStyle = (key) =>
    highlightSection === key
      ? {
          boxShadow: '0 0 0 2px rgba(198,141,141,0.4)',
          backgroundColor: 'rgba(252,246,246,0.9)',
          transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        }
      : { transition: 'background-color 0.3s ease, box-shadow 0.3s ease' };

  const readSections = useMemo(() => {
    if (!selectedScheme) {
      return conversationText
        ? [{ key: 'conversation', title: i18n.language?.startsWith('hi') ? 'उत्तर' : 'Answer', text: conversationText }]
        : [];
    }
    const sections = [];

    if (Array.isArray(selectedScheme.documents) && selectedScheme.documents.length > 0) {
      sections.push({ key: 'documents', title: 'Required documents', text: selectedScheme.documents.join('. ') });
    }
    if (selectedScheme.benefitsSection || selectedScheme.benefit) {
      sections.push({ key: 'benefits', title: 'Benefits', text: String(selectedScheme.benefitsSection || selectedScheme.benefit || '') });
    }
    const eligibilityText = Array.isArray(selectedScheme.eligibilityCriteria)
      ? selectedScheme.eligibilityCriteria.map((item) => `${item.label}: ${item.value}`).join('. ')
      : selectedScheme.eligibility || '';
    if (eligibilityText) {
      sections.push({ key: 'eligibility', title: 'Eligibility criteria', text: eligibilityText });
    }
    if (Array.isArray(selectedScheme.importantDates) && selectedScheme.importantDates.length > 0) {
      sections.push({ key: 'importantDates', title: 'Important dates', text: selectedScheme.importantDates.map((item) => `${item.label}: ${item.value}`).join('. ') });
    }
    if (Array.isArray(selectedScheme.applicationProcess) && selectedScheme.applicationProcess.length > 0) {
      sections.push({ key: 'applicationProcess', title: 'Application process', text: selectedScheme.applicationProcess.map((step, idx) => `Step ${idx + 1}: ${step}`).join('. ') });
    }
    if (Array.isArray(selectedScheme.rejectionReasons) && selectedScheme.rejectionReasons.length > 0) {
      sections.push({ key: 'rejectionReasons', title: 'Common rejection reasons', text: selectedScheme.rejectionReasons.join('. ') });
    }
    const personalized = selectedScheme.personalizedEligibility;
    if (personalized) {
      sections.push({
        key: 'personalizedEligibility',
        title: 'Personalized eligibility',
        text: `Status: ${personalized.status || 'Unknown'}. Why: ${personalized.why || ''}. Missing: ${personalized.missing || ''}. Next steps: ${personalized.nextSteps || ''}`,
      });
    }
    return sections;
  }, [selectedScheme, conversationText, i18n.language]);

  useEffect(() => {
    return () => { if (supportsSpeech) window.speechSynthesis.cancel(); };
  }, [supportsSpeech]);

  useEffect(() => {
    if (!selectedScheme) {
      setIsReading(false);
      setHighlightSection('');
      if (supportsSpeech) window.speechSynthesis.cancel();
    }
  }, [selectedScheme, conversationText, supportsSpeech]);

  const stopReading = () => {
    if (supportsSpeech) window.speechSynthesis.cancel();
    speechQueueRef.current = [];
    speechIndexRef.current = 0;
    setIsReading(false);
    setHighlightSection('');
  };

  const speakSection = (section) => {
    if (!supportsSpeech) return;
    const utterance = new SpeechSynthesisUtterance(`${section.title}. ${section.text}`);
    utterance.lang = i18n.language?.startsWith('hi') ? 'hi-IN' : 'en-IN';
    utterance.rate = 1;
    utterance.onstart = () => setHighlightSection(section.key);
    utterance.onend = () => {
      speechIndexRef.current += 1;
      if (speechIndexRef.current < speechQueueRef.current.length) {
        speakSection(speechQueueRef.current[speechIndexRef.current]);
      } else {
        stopReading();
      }
    };
    utterance.onerror = stopReading;
    window.speechSynthesis.speak(utterance);
  };

  const startReading = () => {
    if (!supportsSpeech || readSections.length === 0) return;
    stopReading();
    speechQueueRef.current = readSections;
    speechIndexRef.current = 0;
    setIsReading(true);
    speakSection(readSections[0]);
  };

  const toggleReading = () => (isReading ? stopReading() : startReading());

  /* ── Width is driven entirely by a CSS var so Tailwind transition fires ── */
  return (
    <aside
      className="glass-panel hidden shrink-0 border-y-0 border-r-0 p-6 lg:flex lg:flex-col select-none overflow-y-auto"
      style={{
        width: `${width}px`,
        transition: 'width 280ms cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(255,255,255,0.72)',
      }}
    >
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between gap-3 shrink-0">
        <div>
          <p className="font-semibold uppercase tracking-widest" style={{ color: 'var(--brand-600)', fontSize: '10px', letterSpacing: '0.08rem' }}>
            {t('chat.schemeDetails')}
          </p>
          <h2 className="mt-1 font-bold leading-tight text-slate-900" style={{ fontSize: '19px' }}>
            {isExpanded ? t('chat.expandedView') : t('chat.quickView')}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Read aloud */}
          <button
            type="button"
            onClick={toggleReading}
            disabled={!supportsSpeech || readSections.length === 0}
            className={`flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              isReading
                ? 'border-brand-400 bg-brand-100 text-brand-700 shadow-inner'
                : 'border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100 shadow-sm'
            }`}
            aria-label={isReading ? t('chat.stopReading') : t('chat.readAloud')}
          >
            {isReading ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isReading ? t('chat.stopReading') : t('chat.readAloud')}</span>
          </button>

          {/* Expand / collapse */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Empty state — no scheme selected ── */}
      {!selectedScheme ? (
        <div id="guide-content" className="flex flex-col gap-6">
          <div>
            <p className="font-semibold uppercase tracking-widest" style={{ color: 'var(--brand-600)', fontSize: '10px', letterSpacing: '0.08rem' }}>
              {t('chat.quickView')}
            </p>
            <h2 className="mt-2 font-bold leading-snug text-slate-900" style={{ fontSize: '22px' }}>
              {t('chat.welcomeTitle')}
            </h2>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {[
              {
                icon: Search,
                num: '1',
                title: t('chat.askNaturally'),
                body: t('chat.askNaturallyDesc'),
                bg: 'var(--brand-50)',
                color: 'var(--brand-600)',
              },
              {
                icon: MousePointerClick,
                num: '2',
                title: t('chat.exploreCards'),
                body: t('chat.exploreCardsDesc'),
                bg: 'var(--brand-50)',
                color: 'var(--brand-600)',
              },
              {
                icon: ShieldCheck,
                num: '3',
                title: t('chat.checkBefore'),
                body: t('chat.checkBeforeDesc'),
                bg: 'rgb(255,243,223)',
                color: 'rgb(161,80,0)',
              },
            ].map(({ icon: Icon, num, title, body, bg, color }) => (
              <div key={num} className="flex gap-3 items-start rounded-xl p-3 hover:bg-slate-50/80 transition-colors">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: bg, color }}
                >
                  {num}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800" style={{ fontSize: '13px' }}>{title}</h3>
                  <p className="mt-0.5 leading-5 text-slate-500" style={{ fontSize: '12px' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip panel */}
          <div className="rounded-2xl p-4" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
              <p className="font-semibold" style={{ color: 'var(--brand-600)', fontSize: '12px' }}>{t('chat.tip')}</p>
            </div>
            <p className="leading-5 text-slate-600" style={{ fontSize: '12px' }}>
              {t('chat.tipDesc')}
            </p>
          </div>
        </div>
      ) : (

        /* ── Scheme detail content ── */
        <div id="documents-content" className="reveal flex flex-col gap-5">
          {/* Scheme name + confidence */}
          <div>
            <h2 className="font-bold text-slate-900 leading-snug" style={{ fontSize: '17px' }}>
              {selectedScheme.fullTitle || selectedScheme.title}
            </h2>
            {selectedScheme.confidence && (
              <div className="mt-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" style={{ color: 'var(--brand-600)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--brand-600)' }}>
                  {selectedScheme.confidence} Confidence
                </span>
              </div>
            )}
          </div>

          {/* Documents */}
          {selectedScheme.documents && selectedScheme.documents.length > 0 && (
            <section style={highlightStyle('documents')}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Required Documents</p>
              <div className="space-y-1.5">
                {selectedScheme.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{doc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Benefits */}
          {(selectedScheme.benefitsSection || selectedScheme.benefit) && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('benefits')}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-600)' }}>Benefits</p>
              <p className="text-sm leading-6 text-slate-700">{selectedScheme.benefitsSection || selectedScheme.benefit}</p>
            </section>
          )}

          {/* Eligibility */}
          {selectedScheme.eligibilityCriteria && selectedScheme.eligibilityCriteria.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('eligibility')}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Eligibility Criteria</p>
              <div className="space-y-3">
                {selectedScheme.eligibilityCriteria.map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-sm leading-5 text-slate-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Important dates */}
          {selectedScheme.importantDates && selectedScheme.importantDates.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('importantDates')}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Important Dates</p>
              <div className="space-y-2">
                {selectedScheme.importantDates.map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-sm leading-5 text-slate-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Application process */}
          {selectedScheme.applicationProcess && selectedScheme.applicationProcess.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('applicationProcess')}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Application Process</p>
              <div className="space-y-2">
                {selectedScheme.applicationProcess.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-lg bg-slate-50 px-3 py-2">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: 'var(--brand-50)', color: 'var(--brand-900)' }}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-5 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rejection reasons */}
          {selectedScheme.rejectionReasons && selectedScheme.rejectionReasons.length > 0 && (
            <section className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm" style={highlightStyle('rejectionReasons')}>
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-rose-600">Common Rejection Reasons</p>
              <div className="space-y-2">
                {selectedScheme.rejectionReasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-2.5 rounded-lg bg-rose-50 px-3 py-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span className="text-sm leading-5 text-slate-700">{reason}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Personalized eligibility */}
          {selectedScheme.personalizedEligibility && (
            <section
              className="rounded-2xl p-4 shadow-sm"
              style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)', ...highlightStyle('personalizedEligibility') }}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-600)' }}>
                Personalized Eligibility
              </p>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--brand-900)' }}>
                  {selectedScheme.personalizedEligibility.status || 'Eligible'}
                </p>
              </div>
              <div className="space-y-2 text-sm leading-5 text-slate-700">
                {selectedScheme.personalizedEligibility.why && (
                  <p><span className="font-semibold text-slate-800">Why: </span>{selectedScheme.personalizedEligibility.why}</p>
                )}
                {selectedScheme.personalizedEligibility.missing && (
                  <p className="flex gap-2">
                    <Inbox className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                    <span><span className="font-semibold text-slate-800">Missing: </span>{selectedScheme.personalizedEligibility.missing}</span>
                  </p>
                )}
                {selectedScheme.personalizedEligibility.nextSteps && (
                  <p><span className="font-semibold text-slate-800">Next step: </span>{selectedScheme.personalizedEligibility.nextSteps}</p>
                )}
              </div>
            </section>
          )}

          <p className="text-xs italic leading-5 text-slate-400">
            Quick guide only — verify latest rules, documents, and dates on the official government portal.
          </p>
        </div>
      )}
    </aside>
  );
}
