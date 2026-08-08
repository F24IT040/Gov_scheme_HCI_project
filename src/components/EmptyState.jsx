import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, RotateCcw } from 'lucide-react';

export default function EmptyState({ message, onSelectPrompt, onRetry }) {
  const { t } = useTranslation();

  const SUGGESTIONS = [
    { emoji: '🎓', textKey: 'chat.suggestScholarships', promptKey: 'chat.promptStudent' },
    { emoji: '🌾', textKey: 'chat.suggestFarmer',       promptKey: 'chat.promptKisan' },
    { emoji: '🏠', textKey: 'chat.suggestHousing',      promptKey: 'chat.promptAwas' },
    { emoji: '💊', textKey: 'chat.suggestHealth',       promptKey: 'chat.promptAyushman' },
  ];

  const REPHRASE_TIPS = [
    t('chat.rephrase1'),
    t('chat.rephrase2'),
    t('chat.rephrase3'),
  ];

  return (
    <section className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 reveal mb-6 backdrop-blur-sm">
      {/* Icon + message */}
      <div className="text-center mb-5">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'rgba(198,141,141,0.10)' }}>
          <SearchX className="h-6 w-6" style={{ color: 'var(--brand-600)' }}/>
        </div>
        <h2 className="font-semibold text-slate-800" style={{ fontSize: '17px' }}>{t('chat.noMatch')}</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
          {message || t('chat.noMatchDesc')}
        </p>
      </div>

      {/* Rephrase tips */}
      <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('chat.rephraseTitle')}</p>
        <ul className="space-y-1.5">
          {REPHRASE_TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--brand-500)' }} aria-hidden="true"/>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Retry */}
      {onRetry && (
        <div className="mb-4 flex justify-center">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-95 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5"/>
            {t('chat.tryAgain')}
          </button>
        </div>
      )}

      {/* Suggestion chips */}
      {onSelectPrompt && (
        <div className="flex flex-wrap justify-center gap-2 pt-3 border-t border-slate-100">
          <p className="w-full text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {t('chat.tryOneOf')}
          </p>
          {SUGGESTIONS.map(({ emoji, textKey, promptKey }) => (
            <button
              key={textKey}
              type="button"
              onClick={() => onSelectPrompt(t(promptKey))}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-95"
            >
              <span>{emoji}</span> {t(textKey)}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
