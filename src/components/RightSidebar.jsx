import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, ChevronRight, Inbox, Maximize2, Minimize2, Zap, FileText, Volume2 } from 'lucide-react';

export default function RightSidebar({ selectedScheme, width, isExpanded, onToggleExpand }) {
  const [isReading, setIsReading] = useState(false);
  const [highlightSection, setHighlightSection] = useState('');
  const speechIndexRef = useRef(0);
  const speechQueueRef = useRef([]);

  const supportsSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const highlightStyle = (key) =>
    highlightSection === key
      ? { boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.35)', backgroundColor: 'rgba(219, 234, 254, 0.8)' }
      : {};

  const readSections = useMemo(() => {
    if (!selectedScheme) return [];

    const sections = [];
    if (Array.isArray(selectedScheme.documents) && selectedScheme.documents.length > 0) {
      sections.push({
        key: 'documents',
        title: 'Required documents',
        text: selectedScheme.documents.join('. ')
      });
    }

    if (selectedScheme.benefitsSection || selectedScheme.benefit) {
      sections.push({
        key: 'benefits',
        title: 'Benefits',
        text: String(selectedScheme.benefitsSection || selectedScheme.benefit || '')
      });
    }

    const eligibilityText = Array.isArray(selectedScheme.eligibilityCriteria)
      ? selectedScheme.eligibilityCriteria.map((item) => `${item.label}: ${item.value}`).join('. ')
      : selectedScheme.eligibility || '';

    if (eligibilityText) {
      sections.push({
        key: 'eligibility',
        title: 'Eligibility criteria',
        text: eligibilityText
      });
    }

    if (Array.isArray(selectedScheme.importantDates) && selectedScheme.importantDates.length > 0) {
      sections.push({
        key: 'importantDates',
        title: 'Important dates',
        text: selectedScheme.importantDates.map((item) => `${item.label}: ${item.value}`).join('. ')
      });
    }

    if (Array.isArray(selectedScheme.applicationProcess) && selectedScheme.applicationProcess.length > 0) {
      sections.push({
        key: 'applicationProcess',
        title: 'Application process',
        text: selectedScheme.applicationProcess.map((step, idx) => `Step ${idx + 1}: ${step}`).join('. ')
      });
    }

    if (Array.isArray(selectedScheme.rejectionReasons) && selectedScheme.rejectionReasons.length > 0) {
      sections.push({
        key: 'rejectionReasons',
        title: 'Common rejection reasons',
        text: selectedScheme.rejectionReasons.join('. ')
      });
    }

    const personalized = selectedScheme.personalizedEligibility;
    if (personalized) {
      sections.push({
        key: 'personalizedEligibility',
        title: 'Personalized eligibility',
        text: `Status: ${personalized.status || 'Unknown'}. Why: ${personalized.why || ''}. Missing: ${personalized.missing || ''}. Next steps: ${personalized.nextSteps || ''}`
      });
    }

    return sections;
  }, [selectedScheme]);

  useEffect(() => {
    return () => {
      if (supportsSpeech) {
        window.speechSynthesis.cancel();
      }
    };
  }, [supportsSpeech]);

  useEffect(() => {
    if (!selectedScheme) {
      setIsReading(false);
      setHighlightSection('');
      if (supportsSpeech) window.speechSynthesis.cancel();
    }
  }, [selectedScheme, supportsSpeech]);

  const stopReading = () => {
    if (supportsSpeech) {
      window.speechSynthesis.cancel();
    }
    speechQueueRef.current = [];
    speechIndexRef.current = 0;
    setIsReading(false);
    setHighlightSection('');
  };

  const speakSection = (section) => {
    if (!supportsSpeech) return;
    const utterance = new SpeechSynthesisUtterance(`${section.title}. ${section.text}`);
    utterance.lang = 'en-IN';
    utterance.rate = 1;
    utterance.onstart = () => {
      setHighlightSection(section.key);
    };
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

  const toggleReading = () => {
    if (isReading) {
      stopReading();
      return;
    }
    startReading();
  };

  return (
    <aside
      className={`canva-sidebar glass-panel hidden shrink-0 border-y-0 border-r-0 p-6 lg:flex lg:flex-col select-none overflow-y-auto transition-[width] duration-300 ${isExpanded ? 'w-[26rem]' : 'w-80'}`}
      style={{ background: 'rgba(255, 255, 255, 0.64)', width: `${width}px` }}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p
            className="canva-text font-semibold uppercase tracking-widest"
            style={{ color: 'var(--brand-600)', fontWeight: 700, fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.08rem' }}
          >
            Scheme details
          </p>
          <h2
            className="canva-text mt-1 font-bold leading-tight"
            style={{ color: 'rgb(25, 28, 30)', fontWeight: 700, fontStyle: 'normal', fontSize: '20px' }}
          >
            {isExpanded ? 'Expanded view' : 'Quick view'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleReading}
            disabled={!supportsSpeech || readSections.length === 0}
            className={`flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition ${isReading ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-[#c68d8d] bg-[#fdf8f8] text-[#b87777] hover:bg-[#faefef] shadow-sm'}`}
            aria-label={isReading ? 'Stop reading details' : 'Read aloud scheme details'}
          >
            <Volume2 className="h-4 w-4" />
            <span>{isReading ? 'Stop' : 'Read'}</span>
          </button>
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label={isExpanded ? 'Collapse right sidebar' : 'Expand right sidebar'}
            title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!selectedScheme ? (
        <div id="guide-content">
          <p
            className="canva-text font-semibold uppercase tracking-widest"
            style={{ color: 'var(--brand-600)', fontWeight: 700, fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.08rem' }}
          >
            Your quick guide
          </p>
          <h2
            className="canva-text mt-2 font-bold leading-tight"
            style={{ color: 'rgb(25, 28, 30)', fontWeight: 700, fontStyle: 'normal', fontSize: '24px' }}
          >
            A simpler way to explore schemes
          </h2>

          <div className="mt-7 space-y-5">
            <div className="flex gap-3">
              <div
                className="canva-tag flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', fontWeight: 700, fontStyle: 'normal', fontSize: '14px' }}
              >
                1
              </div>
              <div>
                <h3
                  className="canva-text font-semibold"
                  style={{ color: 'rgb(25, 28, 30)', fontWeight: 600, fontStyle: 'normal', fontSize: '14px' }}
                >
                  Ask naturally
                </h3>
                <p
                  className="canva-text mt-1 text-sm leading-5"
                  style={{ color: 'rgb(92, 99, 112)', fontWeight: 400, fontStyle: 'normal', fontSize: '13px' }}
                >
                  Use a scheme name, or describe your situation in plain language.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="canva-tag flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', fontWeight: 700, fontStyle: 'normal', fontSize: '14px' }}
              >
                2
              </div>
              <div>
                <h3
                  className="canva-text font-semibold"
                  style={{ color: 'rgb(25, 28, 30)', fontWeight: 600, fontStyle: 'normal', fontSize: '14px' }}
                >
                  Explore matching cards
                </h3>
                <p
                  className="canva-text mt-1 text-sm leading-5"
                  style={{ color: 'rgb(92, 99, 112)', fontWeight: 400, fontStyle: 'normal', fontSize: '13px' }}
                >
                  A specific request returns one direct card. Broad needs return a useful set.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="canva-tag flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: 'rgb(255, 243, 223)', color: 'rgb(164, 82, 0)', fontWeight: 700, fontStyle: 'normal', fontSize: '14px' }}
              >
                3
              </div>
              <div>
                <h3
                  className="canva-text font-semibold"
                  style={{ color: 'rgb(25, 28, 30)', fontWeight: 600, fontStyle: 'normal', fontSize: '14px' }}
                >
                  Check before applying
                </h3>
                <p
                  className="canva-text mt-1 text-sm leading-5"
                  style={{ color: 'rgb(92, 99, 112)', fontWeight: 400, fontStyle: 'normal', fontSize: '13px' }}
                >
                  Open a card for a clear summary, then verify the latest official requirements.
                </p>
              </div>
            </div>
          </div>

          <div
            className="canva-panel mt-8 rounded-2xl p-4"
            style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <p
                className="canva-text font-semibold"
                style={{ color: 'var(--brand-600)', fontWeight: 600, fontStyle: 'normal', fontSize: '13px' }}
              >
                Helpful tip
              </p>
            </div>
            <p
              className="canva-text mt-2 text-sm leading-5"
              style={{ color: 'rgb(67, 70, 85)', fontWeight: 400, fontStyle: 'normal', fontSize: '13px' }}
            >
              Use specific names like PM-Kisan when you already know the scheme you need.
            </p>
          </div>
        </div>
      ) : (
        <div id="documents-content" className="reveal">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="canva-text text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'rgb(92, 99, 112)', fontWeight: 700, fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.06rem' }}
              >
                Required documents
              </p>
              <h2 className="mt-2 font-bold text-slate-900 text-lg leading-tight">
                {selectedScheme.fullTitle || selectedScheme.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4" style={{ color: 'var(--brand-600)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--brand-600)' }}>
              {selectedScheme.confidence} Confidence Score
            </p>
          </div>

          <div id="sidebar-documents" className="space-y-2">
            {selectedScheme.documents && selectedScheme.documents.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2.5">
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700 font-medium">{doc}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('benefits')}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-600)' }}>Benefits</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {selectedScheme.benefitsSection || selectedScheme.benefit}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('eligibility')}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Eligibility Criteria</p>
              <div className="mt-3 space-y-3">
                {(selectedScheme.eligibilityCriteria || []).map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm leading-6 text-slate-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('importantDates')}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Important Dates</p>
              <div className="mt-3 space-y-2">
                {(selectedScheme.importantDates || []).map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm leading-6 text-slate-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {selectedScheme.applicationProcess && selectedScheme.applicationProcess.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('applicationProcess')}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Application Process</p>
                <div className="mt-3 space-y-3">
                  {selectedScheme.applicationProcess.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full" style={{ background: 'var(--brand-50)', color: 'var(--brand-900)' }}>{idx + 1}</span>
                      <p className="text-sm leading-6 text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" style={highlightStyle('rejectionReasons')}>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Common Reasons for Rejection</p>
              <div className="mt-3 space-y-2">
                {(selectedScheme.rejectionReasons || []).map((reason) => (
                  <div key={reason} className="flex items-start gap-3 rounded-lg bg-rose-50 px-3 py-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <span className="text-sm leading-6 text-slate-700">{reason}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-brand-50 p-4 shadow-sm" style={{ borderColor: 'var(--brand-100)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-600)' }}>Personalized Eligibility & Next Steps</p>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--brand-900)' }}>
                  {selectedScheme.personalizedEligibility?.status || 'Eligible'}
                </p>
              </div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                <p><span className="font-semibold text-slate-900">Why:</span> {selectedScheme.personalizedEligibility?.why}</p>
                <p className="flex gap-2"><Inbox className="mt-1 h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} /><span><span className="font-semibold text-slate-900">What’s missing:</span> {selectedScheme.personalizedEligibility?.missing}</span></p>
                <p><span className="font-semibold text-slate-900">Next step:</span> {selectedScheme.personalizedEligibility?.nextSteps}</p>
              </div>
            </section>
          </div>

          <p
            className="canva-text mt-6 text-xs leading-5"
            style={{ color: 'rgb(115, 118, 134)', fontWeight: 400, fontStyle: 'italic', fontSize: '12px' }}
          >
            This is a quick guide, not an application decision. Confirm the latest rules, documents and dates on the official government portal.
          </p>
        </div>
      )}
    </aside>
  );
}
