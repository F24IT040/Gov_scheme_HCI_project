import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  onSelectSuggestion,
}) {
  const { t } = useTranslation();
  const [showAllOptions, setShowAllOptions] = useState(false);

  const hasSchemes     = Array.isArray(schemes)     && schemes.length > 0;
  const hasSuggestions = Array.isArray(suggestions) && suggestions.length > 0;

  if (!hasSchemes && !hasSuggestions && !summary) return null;

  const visibleSchemes = showAllOptions || isSingle ? schemes : schemes.slice(0, 4);

  return (
    <section id="results-panel" className="reveal mb-6" aria-labelledby="results-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold uppercase tracking-widest" style={{ color: 'var(--brand-600)', fontSize: '10px', letterSpacing: '0.08rem' }}>
            {t('chat.results')}
          </p>
          <h2 id="results-heading" className="mt-1 font-bold text-slate-900" style={{ fontSize: '22px' }}>
            {t('chat.schemesForYou')}
          </h2>
        </div>

        <button
          id="clear-results"
          type="button"
          onClick={onClearResults}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-95"
        >
          {t('chat.clearResults')}
        </button>
      </div>

      <p id="result-summary" className="mb-5 text-sm leading-6 text-slate-600">{summary}</p>

      {hasSuggestions && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSelectSuggestion?.(suggestion)}
              className="whitespace-nowrap rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-600 transition-all hover:bg-brand-100 active:scale-95"
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
          <div id="scholarship-results" className="grid gap-4 sm:grid-cols-2 items-stretch">
            {visibleSchemes.map((scheme) => (
              <div key={scheme.id} className="flex">
                <SchemeCard
                  scheme={scheme}
                  isSelected={selectedSchemeId === scheme.id}
                  onSelect={onSelectScheme}
                  onViewProcess={onViewProcess}
                  isSingle={false}
                />
              </div>
            ))}
          </div>

          {schemes.length > 4 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowAllOptions(c => !c)}
                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-95"
              >
                {showAllOptions
                  ? t('chat.showFewer')
                  : t('chat.showAll', { count: schemes.length })}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
