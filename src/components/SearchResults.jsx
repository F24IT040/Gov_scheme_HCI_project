import React, { useState } from 'react';
import SchemeCard from './SchemeCard';

export default function SearchResults({
  summary,
  schemes = [],
  selectedSchemeId,
  onSelectScheme,
  onViewProcess,
  onClearResults,
  isSingle,
  suggestions = [],
  onSelectSuggestion
}) {
  const [showAllOptions, setShowAllOptions] = useState(false);
  const hasSchemes = Array.isArray(schemes) && schemes.length > 0;
  const hasSuggestions = Array.isArray(suggestions) && suggestions.length > 0;

  if (!hasSchemes && !hasSuggestions && !summary) return null;

  const visibleSchemes = showAllOptions || isSingle ? schemes : schemes.slice(0, 4);

  return (
    <section id="results-panel" className="reveal mb-6" aria-labelledby="results-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="canva-text font-semibold uppercase tracking-widest"
            style={{ color: 'var(--brand-600)', fontWeight: 700, fontStyle: 'normal', fontSize: '11px', letterSpacing: '0.08rem' }}
          >
            Search results
          </p>
          <h2
            id="results-heading"
            className="canva-text mt-1 font-bold"
            style={{ color: 'rgb(25, 28, 30)', fontWeight: 700, fontStyle: 'normal', fontSize: '24px' }}
          >
            Schemes for you
          </h2>
        </div>

        <button
          id="clear-results"
          type="button"
          onClick={onClearResults}
          className="canva-button rounded-lg border border-slate-200 px-3 py-2 font-medium transition hover:bg-slate-50 text-slate-700"
          style={{ background: 'rgb(255, 255, 255)', color: 'rgb(67, 70, 85)', fontWeight: 500, fontStyle: 'normal', fontSize: '14px' }}
        >
          Clear results
        </button>
      </div>

      <p id="result-summary" className="mb-5 text-sm leading-6 text-slate-600">
        {summary}
      </p>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectSuggestion?.(suggestion)}
              className="canva-button whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition"
              style={{
                background: 'rgb(255, 255, 255)',
                color: 'var(--brand-600)',
                borderColor: 'var(--brand-100)',
                fontWeight: 500,
                fontStyle: 'normal',
                fontSize: '14px'
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {isSingle && hasSchemes ? (
        <div id="single-result" className="max-w-2xl">
          <SchemeCard
            scheme={schemes[0]}
            isSelected={selectedSchemeId === schemes[0].id}
            onSelect={onSelectScheme}
            onViewProcess={onViewProcess}
            isSingle={true}
          />
        </div>
      ) : (
        <>
          <div id="scholarship-results" className="grid gap-4 sm:grid-cols-2">
            {visibleSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                isSelected={selectedSchemeId === scheme.id}
                onSelect={onSelectScheme}
                onViewProcess={onViewProcess}
                isSingle={false}
              />
            ))}
          </div>

          {schemes.length > 4 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowAllOptions((current) => !current)}
                className="canva-button rounded-full border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 hover:border-slate-300"
                style={{ background: 'rgb(255, 255, 255)', color: 'rgb(33, 37, 41)', fontWeight: 600 }}
              >
                {showAllOptions ? 'Show fewer options' : `Show all ${schemes.length} options`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
