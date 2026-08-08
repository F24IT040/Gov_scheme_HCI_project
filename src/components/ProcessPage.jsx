import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/* ─── Static workflow stages ─────────────────────────────────────────── */
const WORKFLOW = [
  {
    id: 1, title: 'Eligibility Check',
    subtitle: 'Verify you meet the criteria',
    detailType: 'eligibility',
    time: '~5 min', action: 'Confirm Eligibility',
    tips: [
      'Confirm land ownership eligibility before proceeding.',
      'Keep Aadhaar and active bank account details ready.',
      'Ensure uploaded documents are clear and under 2MB.',
    ],
    mistake: 'Name on Aadhaar must exactly match land records to avoid rejection.',
  },
  {
    id: 2, title: 'Documents',
    subtitle: 'Gather required paperwork',
    detailType: 'documents',
    time: '~3 min', action: 'Confirm Documents',
    tips: [
      'Double-check IFSC code on bank passbook.',
      'Sign the self-declaration clearly.',
    ],
    mistake: 'Illegible documents or cropped images will fail OCR checks.',
  },
  {
    id: 3, title: 'Application',
    subtitle: 'Walk through the official portal',
    detailType: 'application',
    time: '~2 min', action: 'Continue',
    tips: ['Review all fields before submitting. Edits may not be possible after submission.'],
    mistake: null,
  },
  {
    id: 4, title: 'Complete',
    subtitle: 'You\'re done — next steps',
    detailType: 'tracking',
    time: '~1 min', action: 'Finish',
    tips: ['Visit the official portal to check application status.'],
    mistake: null,
  },
];

const FALLBACK = {
  eligibilityCriteria: [
    'Applicant is a small or marginal farmer',
    "Cultivable land is recorded in the applicant's name",
    'Applicant has a valid Aadhaar-linked identity',
  ],
  requiredDocuments: ['Aadhaar Card', 'Land Record (Khatauni)', 'Bank Passbook', 'Self Declaration'],
  officialPortal: 'https://pmkisan.gov.in/',
  applicationNote: 'eKYC is mandatory. After submission use Know Your Status on the portal.',
  applicationFlow: [
    { id: 's0', title: 'Open Portal',         source: 'Official site',     icon: 'account_balance',   status: 'active' },
    { id: 's1', title: 'Select Scheme',       source: 'Registration',      icon: 'person_search',     status: 'future' },
    { id: 's2', title: 'Enter Details',       source: 'Farmer info',       icon: 'badge',             status: 'future' },
    { id: 's3', title: 'Verify Info',         source: 'Identity check',    icon: 'verified_user',     status: 'future' },
    { id: 's4', title: 'Submit',              source: 'Submission',        icon: 'send',              status: 'future' },
    { id: 's5', title: 'Acknowledgement',     source: 'Application status',icon: 'confirmation_number',status: 'future' },
  ],
};

/* ─── Global styles (injected once) ─────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap');
  .msym { font-family:'Material Symbols Outlined'; font-style:normal; font-size:inherit;
    font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; user-select:none; }
  .msym-fill { font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
  @keyframes pp-slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .pp-slide { animation:pp-slide-up .35s ease-out both; }
  @keyframes pp-glow {
    0%  { box-shadow:0 0 0 0 rgba(220,161,161,.5); }
    70% { box-shadow:0 0 0 8px rgba(220,161,161,0); }
    100%{ box-shadow:0 0 0 0 rgba(220,161,161,0); }
  }
  .pp-glow { animation:pp-glow 2s infinite; }
  .pp-card {
    background:rgba(255,255,255,.92); backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,.6);
    border-radius:20px;
    box-shadow:0 4px 20px rgba(0,0,0,.06);
  }
  .pp-check-done { text-decoration:line-through; color:#94a3b8; }
  .pp-step-btn:disabled { cursor:not-allowed; }
`;

function Icon({ n, cls = '' }) {
  return <span className={`msym ${cls}`}>{n}</span>;
}

/* ─── Checklist ──────────────────────────────────────────────────────── */
function Checklist({ title, items, stepIdx, ck, state, onToggle }) {
  if (!items.length) return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-400 text-center">
      No {title.toLowerCase()} data available for this scheme.
    </div>
  );
  const done  = items.filter((_, i) => state.has(`${stepIdx}-${ck}-${i}`)).length;
  const allOk = done === items.length;
  return (
    <div className="pp-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h4>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${allOk ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {done}/{items.length}
        </span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => {
          const key = `${stepIdx}-${ck}-${i}`;
          const checked = state.has(key);
          return (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => onToggle(key, !checked)}
                className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  checked ? 'border-transparent' : 'border-slate-300 group-hover:border-[#c68d8d]'
                }`}
                style={checked ? { background: '#c68d8d' } : {}}
              >
                {checked && <Icon n="check" cls="text-white text-[13px]" />}
              </div>
              <span className={`text-sm leading-relaxed transition-all ${checked ? 'pp-check-done' : 'text-slate-700'}`}>
                {item}
              </span>
            </label>
          );
        })}
      </div>
      {allOk ? (
        <div className="mt-4 flex items-center gap-2 text-emerald-700 text-xs font-semibold">
          <Icon n="check_circle" cls="text-[16px]" /> All items confirmed — you can continue
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-400">Check all items above to unlock the next step.</p>
      )}
    </div>
  );
}

/* ─── Application flow ───────────────────────────────────────────────── */
function AppFlow({ blocks, portal, intro, note, schemeName }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!blocks.length) return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-400 text-center">
      Application flow steps will appear here based on scheme data.
    </div>
  );

  const current = blocks[activeStep];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#b87777' }}>Official Portal Flow</p>
          <h4 className="text-base font-bold text-slate-900">How to apply for {schemeName}</h4>
          {intro && <p className="mt-1 text-xs text-slate-500">{intro}</p>}
        </div>
        {portal && (
          <a href={portal} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80 flex-shrink-0"
            style={{ borderColor: '#ebc8c8', color: '#b87777', background: '#fdf8f8' }}>
            Open Portal <Icon n="open_in_new" cls="text-[14px]" />
          </a>
        )}
      </div>

      {/* Horizontal flow graph — all steps shown */}
      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: `${Math.max(blocks.length * 120, 600)}px` }} className="relative px-4">
          {/* Track line */}
          <div className="absolute top-[22px] left-8 right-8 h-[2px] bg-slate-200 rounded-full" />
          {/* Progress line */}
          <div className="absolute top-[22px] left-8 h-[2px] rounded-full transition-all duration-700"
            style={{ background: '#dca1a1', width: `calc(${(activeStep / Math.max(blocks.length - 1, 1)) * 100}% - 16px)` }} />

          {/* Step nodes */}
          <div className="relative z-10 flex items-start justify-between gap-2">
            {blocks.map((block, i) => {
              const isPast   = i < activeStep;
              const isCurrent = i === activeStep;
              const isFuture  = i > activeStep;
              return (
                <button key={block.id || i} onClick={() => setActiveStep(i)}
                  className="flex flex-col items-center gap-2 flex-1 min-w-[90px] transition-all cursor-pointer group">
                  {/* Node circle */}
                  <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all ${
                    isPast    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' :
                    isCurrent ? 'bg-white border-[#dca1a1] text-[#c68d8d] shadow-lg ring-4 ring-[#dca1a1]/20' :
                                'bg-white border-slate-200 text-slate-400 group-hover:border-[#dca1a1] group-hover:text-[#c68d8d]'
                  }`}>
                    {isPast ? <Icon n="check" cls="text-[16px]" /> : i + 1}
                  </div>
                  {/* Label */}
                  <div className="text-center">
                    <p className={`text-[11px] font-semibold leading-tight ${isCurrent ? 'text-slate-900' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {block.title}
                    </p>
                    {block.source && <p className="text-[10px] text-slate-400 mt-0.5">{block.source}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step detail card — expands below the graph */}
      <div className="pp-card p-5 transition-all" style={{ background: '#fdf8f8', border: '1px solid #ebc8c8' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-bold flex-shrink-0"
            style={{ background: '#c68d8d' }}>
            {activeStep + 1}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Step {activeStep + 1} of {blocks.length}</p>
            <h5 className="text-sm font-bold text-slate-900">{current.title}</h5>
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setActiveStep(i => Math.max(0, i - 1))} disabled={activeStep === 0}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition hover:bg-slate-100 disabled:opacity-30">
              <Icon n="chevron_left" cls="text-[18px] text-slate-600" />
            </button>
            <button onClick={() => setActiveStep(i => Math.min(blocks.length - 1, i + 1))} disabled={activeStep === blocks.length - 1}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition hover:bg-slate-100 disabled:opacity-30">
              <Icon n="chevron_right" cls="text-[18px] text-slate-600" />
            </button>
          </div>
        </div>
        {current.description && (
          <p className="text-sm text-slate-600 leading-relaxed mt-1">{current.description}</p>
        )}
        {!current.description && current.source && (
          <p className="text-sm text-slate-500 mt-1">Visit <strong className="text-slate-700">{current.source}</strong> to complete this step.</p>
        )}
        {portal && activeStep === blocks.length - 1 && (
          <a href={portal} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 transition hover:opacity-80"
            style={{ background: '#c68d8d', color: '#fff' }}>
            Go to official portal <Icon n="open_in_new" cls="text-[13px]" />
          </a>
        )}
      </div>

      {/* Step list — all steps visible at once */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">All Steps</p>
        {blocks.map((block, i) => (
          <button key={i} onClick={() => setActiveStep(i)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border ${
              i === activeStep
                ? 'border-[#ebc8c8] bg-[#fdf8f8]'
                : i < activeStep
                  ? 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50'
                  : 'border-transparent hover:border-slate-200 hover:bg-white'
            }`}>
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5 ${
              i < activeStep  ? 'bg-emerald-500 text-white' :
              i === activeStep ? 'text-white' : 'bg-slate-100 text-slate-500'
            }`} style={i === activeStep ? { background: '#c68d8d' } : {}}>
              {i < activeStep ? <Icon n="check" cls="text-[12px]" /> : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${i === activeStep ? 'text-slate-900' : i < activeStep ? 'text-emerald-700' : 'text-slate-500'}`}>
                {block.title}
              </p>
              {block.source && <p className="text-xs text-slate-400 mt-0.5">{block.source}</p>}
            </div>
            {i === activeStep && <Icon n="arrow_forward" cls="text-[16px] text-[#c68d8d] mt-0.5 flex-shrink-0" />}
          </button>
        ))}
      </div>

      {note && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600">
          <Icon n="info" cls="text-[16px] text-[#c68d8d] mt-0.5 flex-shrink-0" />
          <p><strong className="text-slate-800">Note: </strong>{note}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────── */
export default function ProcessPage({ scheme, onBack }) {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language?.startsWith('hi');
  const workflowText = [
    ['eligibilityCheck', 'eligibilitySubtitle', 'confirmEligibility'],
    ['documents', 'documentsSubtitle', 'confirmDocuments'],
    ['application', 'applicationSubtitle', 'continue'],
    ['completeStep', 'completeSubtitle', 'finish'],
  ];
  const workflow = WORKFLOW.map((item, index) => ({
    ...item,
    title: t(`process.${workflowText[index][0]}`),
    subtitle: t(`process.${workflowText[index][1]}`),
    action: t(`process.${workflowText[index][2]}`),
  }));
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [viewedIdx,  setViewedIdx]  = useState(0);
  const [processing, setProcessing] = useState(false);
  const [completed,  setCompleted]  = useState(false);
  const [checklist,  setChecklist]  = useState(new Set());

  const schemeName = scheme?.fullTitle || scheme?.title || 'This Scheme';
  const portal     = scheme?.website || scheme?.official_url || FALLBACK.officialPortal;

  /* build flow from backend steps */
  const ICONS = ['account_balance','person_search','badge','verified_user','send','confirmation_number','check_circle'];
  const rawSteps =
    (Array.isArray(scheme?.application_process) && scheme.application_process.length) ? scheme.application_process :
    (Array.isArray(scheme?.process_steps)       && scheme.process_steps.length)       ? scheme.process_steps :
    (Array.isArray(scheme?.steps)               && scheme.steps.length)               ? scheme.steps : null;

  const genericSteps = isHindi
    ? [
        'पोर्टल खोलें — आधिकारिक वेबसाइट खोलें और नई आवेदन/पंजीकरण सेवा चुनें।',
        'पंजीकरण करें — मोबाइल नंबर और पहचान विवरण दर्ज करें, फिर OTP से सत्यापन पूरा करें।',
        'आवेदन भरें — व्यक्तिगत, बैंक और योजना से जुड़ी जानकारी सावधानी से दर्ज करें।',
        'दस्तावेज़ अपलोड करें — साफ़ और वैध दस्तावेज़ सही श्रेणी में अपलोड करके दोबारा जाँचें।',
        'जाँचकर जमा करें — सभी विवरण सत्यापित करें, आवेदन जमा करें और रसीद/आवेदन संख्या सुरक्षित रखें।',
      ]
    : [
        'Open the portal — Visit the official website and choose the new application or registration service.',
        'Register — Enter your mobile number and identity details, then complete OTP verification.',
        'Complete the form — Fill in your personal, bank, and scheme information carefully.',
        'Upload documents — Upload clear, valid documents in the correct category and review them.',
        'Review and submit — Verify every detail, submit the application, and save the acknowledgement number.',
      ];
  const detailedSteps = rawSteps?.length >= 5 ? rawSteps : [...(rawSteps || []), ...genericSteps].slice(0, 5);
  const appFlow = detailedSteps.map((value, i) => {
    const clean = String(value).replace(/^\s*(?:step|चरण)?\s*\d+\s*[:.\)-]?\s*/i, '').trim();
    const [title, ...description] = clean.split(/\s*[—–-]\s*/);
    return {
      id: `s${i}`,
      title: title.slice(0, 70),
      description: description.join(' — ') || clean,
      source: `${isHindi ? 'चरण' : 'Step'} ${i + 1}`,
      icon: ICONS[i] || 'arrow_forward',
      status: i === 0 ? 'active' : 'future',
    };
  });

  const sc = {
    eligibility: scheme?.eligibility?.length       ? scheme.eligibility       : FALLBACK.eligibilityCriteria,
    documents:   scheme?.documents?.length         ? scheme.documents         : (scheme?.required_documents?.length ? scheme.required_documents : FALLBACK.requiredDocuments),
    portal,
    appIntro:    isHindi ? `${schemeName} के आधिकारिक आवेदन चरण नीचे दिए गए हैं।` : `Walk through the official ${schemeName} application steps below.`,
    appNote:     scheme?.benefit || FALLBACK.applicationNote,
    appFlow,
  };

  const total       = workflow.length;
  const progressPct = completed ? 100 : Math.round(((activeIdx + 1) / total) * 100);
  const linePct     = completed ? 100 : ((activeIdx + 0.5) / total) * 100;

  const toggleCheck = useCallback((key, checked) => {
    setChecklist(prev => { const n = new Set(prev); checked ? n.add(key) : n.delete(key); return n; });
  }, []);

  const checklistDone = (items, key) =>
    items.length > 0 && items.every((_, i) => checklist.has(`${viewedIdx}-${key}-${i}`));

  const step     = workflow[viewedIdx];
  const isActive = viewedIdx === activeIdx && !completed;
  const isDone   = viewedIdx < activeIdx || completed;

  const ckItems = step.detailType === 'eligibility' ? sc.eligibility : step.detailType === 'documents' ? sc.documents : [];
  const ckKey   = step.detailType === 'eligibility' ? 'el' : step.detailType === 'documents' ? 'doc' : '';
  const locked  = ckKey ? !checklistDone(ckItems, ckKey) : false;

  function viewStep(i) {
    if (processing || (i > activeIdx && !completed)) return;
    setViewedIdx(i);
  }

  function executeStep() {
    if (processing || locked) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (activeIdx === total - 1) { setCompleted(true); setViewedIdx(total - 1); }
      else { const n = activeIdx + 1; setActiveIdx(n); setViewedIdx(n); }
    }, 1500);
  }

  return (
    <div className="min-h-screen font-sans antialiased text-slate-700 p-4 md:p-8" style={{ background: '#F9F4EA' }}>
      <style>{STYLES}</style>
      <div className="max-w-5xl mx-auto">

        {/* ── Topbar ── */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-white">
            <Icon n="arrow_back" cls="text-[18px]" /> {t('process.backToResults')}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">{progressPct}% {t('process.complete')}</span>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width:`${progressPct}%`, background:'#dca1a1' }} />
            </div>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background:'#faefef', color:'#884e4f' }}>
            <Icon n="account_balance" cls="text-[14px]" /> {t('process.simulator')}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{schemeName}</h1>
          <p className="mt-1.5 text-slate-500 text-sm">{t('process.subtitle')}</p>
        </div>

        {/* ── Journey stepper ── */}
        <div className="pp-card p-5 mb-6" style={{ hover: 'none' }}>
          <div className="relative">
            {/* track line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 rounded-full" />
            <div className="absolute top-5 left-5 h-0.5 rounded-full transition-all duration-700" style={{ width:`calc(${linePct}% - 20px)`, background:'#dca1a1' }} />

            <div className="relative flex justify-between gap-2">
              {workflow.map((s, i) => {
                const done2   = completed || i < activeIdx;
                const active2 = i === activeIdx && !completed;
                const viewed  = i === viewedIdx;
                const canClick = done2 || active2 || completed;

                return (
                  <button key={i} onClick={() => viewStep(i)} disabled={!canClick}
                    className={`flex flex-col items-center gap-2 flex-1 min-w-0 transition-all ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}>
                    {/* dot */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all flex-shrink-0 ${
                      done2   ? 'bg-emerald-500 border-emerald-500 text-white' :
                      active2 ? `bg-white border-[#dca1a1] text-[#c68d8d] ${viewed ? 'pp-glow' : ''}` :
                      'bg-white border-slate-200 text-slate-400'
                    } ${viewed && !done2 ? 'ring-2 ring-offset-2 ring-[#dca1a1]' : ''}`}>
                      {done2 ? <Icon n="check" cls="text-[16px]" /> : i + 1}
                    </div>
                    {/* label */}
                    <div className="text-center">
                      <p className={`text-xs font-semibold leading-tight ${viewed ? 'text-slate-900' : 'text-slate-500'}`}>{s.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">{s.time}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Details (left, 2/3) */}
          <div className="lg:col-span-2">
            <div className="pp-card p-6 min-h-[400px] flex flex-col pp-slide" key={viewedIdx}>

              {/* Step label */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-sm flex-shrink-0"
                  style={{ background: completed ? '#10b981' : '#c68d8d' }}>
                  {completed ? <Icon n="check" cls="text-[18px]" /> : activeIdx + 1}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {isHindi ? `चरण ${viewedIdx + 1} / ${total}` : `Step ${viewedIdx + 1} of ${total}`}
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">{step.title}</h2>
                  <p className="text-xs text-slate-400">{step.subtitle}</p>
                </div>
                {isDone && !completed && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <Icon n="check_circle" cls="text-[14px]" /> Done
                  </span>
                )}
                {viewedIdx !== activeIdx && !completed && (
                  <button onClick={() => viewStep(activeIdx)}
                    className="ml-auto text-xs font-medium flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
                    style={{ color: '#b87777' }}>
                    <Icon n="undo" cls="text-[14px]" /> Back to current
                  </button>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1">
                {/* Completed final screen */}
                {completed && viewedIdx === total - 1 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                      <Icon n="check_circle" cls="text-5xl text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('process.tutorialComplete')}</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">{t('process.tutorialCompleteDesc')} {schemeName}.</p>
                    {sc.portal && (
                      <a href={sc.portal} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                        style={{ background: '#c68d8d' }}>
                        {t('process.applyOnPortal')} <Icon n="open_in_new" cls="text-[16px]" />
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    {step.detailType === 'eligibility' && (
                      <Checklist title={t('process.eligibilityCheck')} items={sc.eligibility}
                        stepIdx={viewedIdx} ck="el" state={checklist} onToggle={toggleCheck} />
                    )}
                    {step.detailType === 'documents' && (
                      <Checklist title={t('process.documents')} items={sc.documents}
                        stepIdx={viewedIdx} ck="doc" state={checklist} onToggle={toggleCheck} />
                    )}
                    {step.detailType === 'application' && (
                      <AppFlow blocks={sc.appFlow} portal={sc.portal}
                        intro={sc.appIntro} note={sc.appNote} schemeName={schemeName} />
                    )}
                    {step.detailType === 'tracking' && (
                      <div className="pp-card p-5 bg-slate-50 text-center">
                        <Icon n="flag" cls="text-5xl text-[#c68d8d] mb-3" />
                        <h4 className="text-lg font-bold text-slate-900 mb-1">Almost there!</h4>
                        <p className="text-sm text-slate-500 mb-4">{isHindi ? 'ट्यूटोरियल पूर्ण करने के लिए नीचे दिए बटन पर क्लिक करें।' : 'Click below to mark the tutorial as complete.'}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action button */}
              {isActive && !completed && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button onClick={executeStep} disabled={locked || processing}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[.98]"
                    style={locked ? { background:'#f1f5f9', color:'#94a3b8', cursor:'not-allowed' } : { background:'#c68d8d', color:'#fff' }}>
                    {processing
                      ? <><Icon n="progress_activity" cls="text-[20px] animate-spin" /> {t('process.processing')}</>
                      : locked
                        ? <><Icon n="lock" cls="text-[18px]" /> {t('process.checkAll')}</>
                        : <>{step.action} <Icon n="arrow_forward" cls="text-[18px]" /></>
                    }
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Tips (right, 1/3) */}
          <div>
            <div className="pp-card p-5 sticky top-4">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-50 rounded-full blur-2xl opacity-60 pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Icon n="lightbulb" cls="text-[18px] text-amber-500" /> Tips
                </h3>
                <span className="text-[9px] font-bold px-2 py-1 rounded-full text-white flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg,#D86D00,#F58B14)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AI
                </span>
              </div>
              <ul className="space-y-3">
                {(completed && viewedIdx === total - 1
                  ? ['You have successfully completed the tutorial. Apply on the official portal to begin your application.']
                  : step.tips
                ).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <Icon n="info" cls="text-[15px] text-[#c68d8d] mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
              {step.mistake && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs">
                  <Icon n="warning" cls="text-[15px] text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 leading-relaxed">{step.mistake}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
