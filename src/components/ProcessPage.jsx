import React from 'react';

export default function ProcessPage({ scheme, onBack }) {
  if (!scheme) {
    return (
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Process</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Select a scheme to view the application process</h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to results
          </button>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-50 p-6 text-slate-700">
          <p className="text-sm leading-7">
            You can use the Process button on any scheme card to jump here. Once a scheme is selected, this page will show the eligibility and application steps, required documents, and important dates.
          </p>
        </div>
      </section>
    );
  }

  const processSteps = scheme.applicationProcess || scheme.process_steps || scheme.application_process || [];
  const importantDates = scheme.importantDates || [];
  const documents = scheme.documents || [];
  const eligibilityText = scheme.eligibility || scheme.personalizedEligibility?.why || 'Refer to the scheme details for eligibility information.';
  const nextSteps = scheme.personalizedEligibility?.nextSteps || scheme.nextSteps || '';

  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_30px_60px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Process</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{scheme.fullTitle || scheme.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{scheme.copy}</p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="h-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Back to results
        </button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Eligibility summary</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Who can apply?</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{eligibilityText}</p>
          </div>

          {processSteps && processSteps.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Application process</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">Step-by-step guide</h2>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{processSteps.length} steps</span>
              </div>

              <div className="mt-6 space-y-4">
                {processSteps.map((step, idx) => (
                  <div key={idx} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">Step {idx + 1}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {nextSteps && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Next steps</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{nextSteps}</p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Required documents</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">Prepare these items</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
              {documents.length > 0 ? (
                documents.map((document, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[0.65rem] font-bold uppercase text-slate-700">{idx + 1}</span>
                    <span>{document}</span>
                  </li>
                ))
              ) : (
                <li>No document list available for this scheme.</li>
              )}
            </ul>
          </div>

          {importantDates.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Important dates</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Timing to track</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                {importantDates.map((item, idx) => (
                  <div key={idx} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Quick note</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Always verify the latest details on the official portal. This page helps you prepare, but policy updates may change eligibility and application deadlines.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
