import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function QuickPrompts({ onSelectPrompt }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);

  const PROMPTS = [
    { id: 'p1', emoji: '🎓', textKey: 'chat.suggestScholarships', promptKey: 'chat.promptStudent' },
    { id: 'p2', emoji: '🌾', textKey: 'chat.suggestFarmer',       promptKey: 'chat.promptKisan' },
    { id: 'p3', emoji: '🏠', textKey: 'chat.suggestHousing',      promptKey: 'chat.promptAwas' },
    { id: 'p4', emoji: '💊', textKey: 'chat.suggestHealth',       promptKey: 'chat.promptAyushman' },
    { id: 'p5', emoji: '👩', textKey: 'chat.suggestWomen',        promptKey: 'chat.promptWomen' },
  ];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <div className="relative mb-3">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {PROMPTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectPrompt(t(p.promptKey))}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 active:scale-95"
          >
            <span>{p.emoji}</span>
            {t(p.textKey)}
          </button>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-10 transition-opacity duration-200"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.95))', opacity: atEnd ? 0 : 1 }}
        aria-hidden="true"
      />
    </div>
  );
}
