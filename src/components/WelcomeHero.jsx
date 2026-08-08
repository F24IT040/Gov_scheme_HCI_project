import React from 'react';
import { useTranslation } from 'react-i18next';

const SUGGESTION_KEYS = [
  { emoji: '🎓', textKey: 'chat.suggestScholarships', promptKey: 'chat.promptStudent' },
  { emoji: '🌾', textKey: 'chat.suggestFarmer',       promptKey: 'chat.promptKisan' },
  { emoji: '🏠', textKey: 'chat.suggestHousing',      promptKey: 'chat.promptAwas' },
  { emoji: '💊', textKey: 'chat.suggestHealth',       promptKey: 'chat.promptAyushman' },
  { emoji: '👩', textKey: 'chat.suggestWomen',        promptKey: 'chat.promptWomen' },
  { emoji: '💼', textKey: 'chat.suggestLoans',        promptKey: 'chat.suggestLoans' },
];

export default function WelcomeHero({ onSelectPrompt }) {
  const { t } = useTranslation();

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="mb-7 flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl mt-0.5"
          style={{ background: 'rgba(198,141,141,0.14)', color: 'var(--brand-600)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="max-w-2xl">
          <p className="mb-1 font-bold uppercase tracking-widest" style={{ color: 'var(--brand-600)', fontSize: '10px', letterSpacing: '0.08rem' }}>
            Nayanta · {t('landing.badge')}
          </p>
          <h2 className="font-bold leading-tight text-slate-900" style={{ fontSize: '23px' }}>
            {t('chat.welcomeTitle')}
          </h2>
          <p className="mt-2 leading-6 text-slate-500" style={{ fontSize: '14px' }}>
            {t('chat.welcomeSubtitle')}
          </p>
        </div>
      </div>

      {/* Suggestion chips — 1-col xs, 2-col sm, 3-col md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {SUGGESTION_KEYS.map(({ emoji, textKey, promptKey }) => (
          <button
            key={textKey}
            type="button"
            onClick={() => onSelectPrompt?.(t(promptKey))}
            className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-[13px] font-medium text-slate-700 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-[0.98] shadow-sm"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <span className="text-[17px] leading-none shrink-0">{emoji}</span>
            <span className="leading-snug">{t(textKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
