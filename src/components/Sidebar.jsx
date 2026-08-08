import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, PlusCircle, GraduationCap, Tractor, Home, HeartPulse, LogOut, MessageSquare, UserRound } from 'lucide-react';

export default function Sidebar({ onNewSearch, onCategorySelect, activeCategory, onLogout, user, onProfile }) {
  const { t, i18n } = useTranslation();

  const categories = [
    { id: 'scholarship', labelKey: 'chat.scholarships', icon: GraduationCap },
    { id: 'farming',     labelKey: 'chat.farming',      icon: Tractor },
    { id: 'housing',     labelKey: 'chat.housing',      icon: Home },
    { id: 'health',      labelKey: 'chat.health',       icon: HeartPulse },
  ];

  const activeLang = i18n.language?.slice(0, 2) || 'en';
  const handleLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('nayanta_lang', code);
  };

  return (
    <nav
      className="hidden w-64 shrink-0 flex-col border-r md:flex select-none"
      style={{
        background: 'rgba(249,244,234,0.95)',
        borderColor: 'rgba(198,141,141,0.15)',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Brand header */}
      <header className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(198,141,141,0.12)' }}>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[10px] shadow-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-500), var(--brand-accent))' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="white"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold leading-none text-slate-900 truncate" style={{ fontSize: '16px', letterSpacing: '-0.02em' }}>
            Nayanta
          </h1>
          <p className="mt-0.5 uppercase tracking-widest truncate" style={{ color: 'rgb(155,158,175)', fontSize: '9px', fontWeight: 600 }}>
            Government Guide
          </p>
        </div>

        {/* EN / HI inline pill */}
        <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-sm shrink-0">
          {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }].map(({ code, label }) => (
            <button key={code} onClick={() => handleLang(code)}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold transition-all"
              style={activeLang === code ? { background: 'var(--brand-600)', color: '#fff' } : { color: 'rgb(120,130,150)' }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col flex-1 overflow-y-auto px-3 py-4 gap-1 min-h-0">
        {/* New Search CTA */}
        <button
          type="button"
          onClick={onNewSearch}
          className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-sm"
          style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))', fontSize: '14px' }}
        >
          <PlusCircle className="h-4 w-4" />
          {t('chat.newSearch')}
        </button>

        {/* AI Workspace indicator */}
        <div
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 mb-1"
          style={{ background: 'rgba(198,141,141,0.10)', borderLeft: '3px solid var(--brand-600)' }}
        >
          <MessageSquare className="h-4 w-4 shrink-0" style={{ color: 'var(--brand-600)' }} />
          <span className="font-semibold text-left truncate" style={{ color: 'var(--brand-600)', fontSize: '13px' }}>
            {t('chat.aiWorkspace')}
          </span>
          <span className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>
            {t('chat.active')}
          </span>
        </div>

        {/* Category nav */}
        <p className="px-3 pb-1 pt-4 uppercase tracking-widest" style={{ color: 'rgb(155,158,175)', fontSize: '10px', fontWeight: 700 }}>
          {t('chat.exploreByNeed')}
        </p>

        {categories.map(({ id, labelKey, icon: Icon }) => {
          const isActive = activeCategory === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onCategorySelect(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-white/80 ${isActive ? 'bg-white shadow-sm' : ''}`}
              style={{ color: isActive ? 'var(--brand-600)' : 'rgb(75,80,95)', fontSize: '14px', fontWeight: isActive ? 600 : 400 }}
            >
              <Icon className="h-4 w-4 shrink-0 transition-colors"
                style={{ color: isActive ? 'var(--brand-600)' : 'rgb(170,175,190)' }} />
              <span className="truncate">{t(labelKey)}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--brand-600)' }} aria-hidden="true"/>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: trust note + logout */}
      <div className="px-3 pb-4 space-y-2 shrink-0">
        <div className="rounded-2xl border p-3" style={{ borderColor: 'var(--brand-100)', background: 'var(--brand-50)' }}>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--brand-600)' }} />
            <p className="font-semibold" style={{ color: 'var(--brand-600)', fontSize: '12px' }}>
              {t('chat.officialInfo')}
            </p>
          </div>
          <p style={{ color: 'rgb(90,95,110)', fontSize: '11px', lineHeight: '1.5' }}>
            {t('chat.officialInfoDesc')}
          </p>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-red-50 active:scale-[0.98]"
            style={{ color: 'rgb(180,60,60)', fontSize: '13px', fontWeight: 500 }}
          >
            <LogOut className="h-4 w-4" />
            {t('chat.signOut')}
          </button>
        )}
        {onProfile && user && (
          <button type="button" onClick={onProfile} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-white active:scale-[0.98]" style={{ color: 'rgb(75,80,95)', fontSize: '13px', fontWeight: 500 }}>
            <UserRound className="h-4 w-4" />
            <span className="truncate">{user.name || 'My profile'}</span>
          </button>
        )}
      </div>
    </nav>
  );
}
