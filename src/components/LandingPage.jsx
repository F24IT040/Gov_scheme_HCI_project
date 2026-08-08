import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import imgStudents from '../assets/download.jpg';
import imgFarmer from '../assets/farmer.jpg';
import imgWomen from '../assets/saheli-women.jpg';
import imgBank from '../assets/bank.jpg';
import imgHealth from '../assets/health.jpg';
import imgHousing from '../assets/ghar.jpg';

/* Only EN and HI for now */
const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
];

export default function LandingPage({ onSignIn, onStartNow, onCardClick }) {
  const { t, i18n } = useTranslation();
  const cursorGlowRef    = useRef(null);
  const parallaxOrbsRef  = useRef(null);
  const parallaxGridRef  = useRef(null);
  const parallaxLinesRef = useRef(null);

  const [query, setQuery]           = useState('');
  const [activeLang, setActiveLang] = useState(
    () => localStorage.getItem('nayanta_lang') || 'en'
  );

  /* Parallax / cursor glow */
  useEffect(() => {
    const cursor = cursorGlowRef.current;
    const orbs   = parallaxOrbsRef.current;
    const grid   = parallaxGridRef.current;
    const lines  = parallaxLinesRef.current;
    const onMove = (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const mx = (e.clientX - cx) / cx, my = (e.clientY - cy) / cy;
      requestAnimationFrame(() => {
        if (cursor) cursor.style.transform = `translate(${e.clientX - 300}px,${e.clientY - 300}px)`;
        if (orbs)   orbs.style.transform   = `translate(${mx * -30}px,${my * -30}px)`;
        if (grid)   grid.style.transform   = `translate(${mx *  10}px,${my *  10}px)`;
        if (lines)  lines.style.transform  = `translate(${mx * -15}px,${my * -15}px)`;
      });
    };
    const onLeave = () => {
      if (cursor) cursor.style.opacity = '0';
      [orbs, grid, lines].forEach(el => el && (el.style.transform = 'translate(0,0)'));
    };
    const onEnter = () => { if (cursor) cursor.style.opacity = '1'; };
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  const handleLangChange = (code) => {
    setActiveLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('nayanta_lang', code);
  };

  const handleSearch = () => {
    const q = query.trim();
    if (q) { onCardClick(q); }
  };

  const CARDS = [
    { query: 'Show me scholarships and education schemes for students',    img: imgStudents, badge: t('landing.badge'),        icon: 'fa-user-graduate',      title: t('landing.categories.students'), desc: t('landing.categories.studentsDesc'), hover: 'hover:shadow-brand-500/40',  iconHover: 'group-hover:bg-brand-500 group-hover:border-brand-400' },
    { query: 'What schemes are available for farmers and agriculture?',    img: imgFarmer,   badge: null,                       icon: 'fa-tractor',            title: t('landing.categories.farmers'),  desc: t('landing.categories.farmersDesc'),  hover: 'hover:shadow-green-500/40',  iconHover: 'group-hover:bg-green-500 group-hover:border-green-400' },
    { query: 'Show me empowerment and welfare schemes for women',          img: imgWomen,    badge: null,                       icon: 'fa-hands-holding-child', title: t('landing.categories.women'),    desc: t('landing.categories.womenDesc'),    hover: 'hover:shadow-purple-500/40', iconHover: 'group-hover:bg-purple-500 group-hover:border-purple-400' },
    { query: 'Show me government loans, pensions, and financial schemes',  img: imgBank,     badge: null,                       icon: 'fa-building-columns',   title: t('landing.categories.banking'),  desc: t('landing.categories.bankingDesc'),  hover: 'hover:shadow-blue-500/40',   iconHover: 'group-hover:bg-blue-600 group-hover:border-blue-500' },
    { query: 'What government health insurance and medical schemes exist?', img: imgHealth,  badge: null,                       icon: 'fa-kit-medical',        title: t('landing.categories.health'),   desc: t('landing.categories.healthDesc'),   hover: 'hover:shadow-rose-500/40',   iconHover: 'group-hover:bg-rose-500 group-hover:border-rose-400' },
    { query: 'How to apply for PM Awas Yojana and housing subsidies?',    img: imgHousing,  badge: null,                       icon: 'fa-house-chimney',      title: t('landing.categories.housing'),  desc: t('landing.categories.housingDesc'),  hover: 'hover:shadow-amber-500/40',  iconHover: 'group-hover:bg-amber-500 group-hover:border-amber-400' },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F9F4EA', color: '#0F172A' }}>
      <div className="bg-grain" />
      <div ref={parallaxOrbsRef} className="fixed pointer-events-none overflow-hidden z-[-3]"
        style={{ inset:0,width:'110%',height:'110%',left:'-5%',top:'-5%',willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}>
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
      </div>
      <div ref={parallaxGridRef} className="bg-grid" style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={parallaxLinesRef} className="bg-lines" style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={cursorGlowRef} style={{ position:'fixed',top:0,left:0,width:600,height:600,borderRadius:'50%',pointerEvents:'none',zIndex:-2,willChange:'transform',transition:'opacity 0.3s ease',transform:'translate(-50%,-50%)',background:'radial-gradient(circle,rgba(198,141,141,0.15) 0%,rgba(198,141,141,0) 60%)' }}/>

      {/* ── HEADER ── */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-20 animate-fade-in-up opacity-0 relative">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-[12px] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-accent flex items-center justify-center shadow-lg shadow-brand-500/30 overflow-hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-bold tracking-tight text-slate-900 leading-none" style={{ letterSpacing: '-0.03em' }}>Nayanta</span>
            <span className="text-[9px] font-semibold text-slate-500/70 mt-0.5 tracking-widest uppercase">Government Guide</span>
          </div>
        </div>

        {/* Nav — desktop only */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-500">
          <a href="#" className="font-semibold relative py-1" style={{ color: 'var(--brand-600)' }}>
            {t('nav.home')}
            <span className="absolute bottom-0 left-0 w-full h-[2px] rounded-full" style={{ background: 'var(--brand-600)' }}/>
          </a>
          <a href="#" className="hover:text-slate-900 transition-colors">{t('nav.schemes')}</a>
          <a href="#" className="hover:text-slate-900 transition-colors">{t('nav.help')}</a>
        </nav>

        {/* Right: EN/HI pill + Sign in */}
        <div className="flex items-center gap-3">
          {/* Language toggle pill */}
          <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-sm">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => handleLangChange(code)}
                className="rounded-full px-3 py-1 text-[12px] font-bold transition-all"
                style={
                  activeLang === code
                    ? { background: 'var(--brand-600)', color: '#fff' }
                    : { color: 'rgb(100,110,130)' }
                }
                aria-label={code === 'en' ? t('lang.switchToEnglish') : t('lang.switchToHindi')}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={onSignIn}
            className="rounded-full px-5 py-2 text-[13px] font-semibold text-white shadow-md transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
            style={{ background: 'var(--brand-600)' }}
          >
            {t('nav.signIn')}
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="w-full max-w-5xl mx-auto px-4 pt-14 pb-20 flex flex-col items-center relative z-10">

        {/* Badge */}
        <div className="animate-fade-in-up opacity-0 delay-100 mb-7 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-slate-200/60">
          <i className="fa-solid fa-sparkles text-[13px]" style={{ color: 'var(--brand-500)' }}/>
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-slate-700">
            {t('landing.badge')} <span className="text-slate-300 mx-1">•</span> {t('landing.badgeSeparator')}
          </span>
        </div>

        {/* Hero */}
        <h1 className="animate-fade-in-up opacity-0 delay-200 text-[38px] sm:text-[52px] md:text-[60px] font-extrabold leading-[1.06] text-center tracking-tight text-slate-900 mb-5">
          {t('landing.heroLine1')}<br/>
          <span className="text-gradient">{t('landing.heroLine2')}</span>{' '}
          {t('landing.heroLine3')}
        </h1>
        <p className="animate-fade-in-up opacity-0 delay-300 text-[15px] sm:text-[17px] text-slate-500 text-center max-w-xl leading-relaxed mb-10 font-medium">
          {t('landing.subtitle')}
        </p>

        {/* ── Search card ── */}
        <div className="animate-fade-in-up opacity-0 delay-400 w-full max-w-[820px] glass-panel rounded-[26px] shadow-glass p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center border" style={{ background: 'var(--brand-50)', borderColor: 'var(--brand-100)', color: 'var(--brand-600)' }}>
              <i className="fa-solid fa-robot text-[12px]"/>
            </div>
            <h2 className="text-[17px] font-semibold text-slate-900">{t('landing.searchTitle')}</h2>
          </div>

          {/* Input row */}
          <div className="relative w-full mb-4">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('landing.searchPlaceholder')}
              className="w-full bg-white/70 backdrop-blur-sm rounded-[16px] py-4 pl-5 pr-[60px] text-[15px] text-slate-800 shadow-input focus:outline-none focus:shadow-input-focus focus:bg-white transition-all"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[12px] text-white flex items-center justify-center transition-all hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}
            >
              <i className="fa-solid fa-arrow-right text-[13px]"/>
            </button>
          </div>

          {/* Quick suggest chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <i className="fa-solid fa-lightbulb text-amber-400 mr-1"/>
              {t('landing.tryAsking')}
            </span>
            <button
              onClick={() => onCardClick('How to apply for PM Awas Yojana?')}
              className="text-[12px] px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
            >🏠 PM Awas Yojana</button>
            <button
              onClick={() => onCardClick('Scholarships for degree students')}
              className="text-[12px] px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
            >🎓 {t('landing.categories.studentsDesc')}</button>
            <button
              onClick={() => onCardClick('PM Kisan farmer scheme benefits')}
              className="hidden sm:inline-flex text-[12px] px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
            >🌾 PM-Kisan</button>
          </div>
        </div>

        {/* Privacy note */}
        <div className="animate-fade-in-up opacity-0 delay-400 flex items-center gap-2 text-[12px] text-slate-400 mb-14 font-medium">
          <i className="fa-regular fa-shield-check"/> {t('landing.privacy')}
        </div>

        {/* ── Category cards ── */}
        <div className="animate-fade-in-up opacity-0 delay-400 w-full max-w-[820px] mb-12">
          <div className="flex justify-between items-end mb-5 px-1">
            <div>
              <h3 className="text-[19px] font-bold text-slate-900 tracking-tight">{t('landing.tailoredTitle')}</h3>
              <p className="text-[13px] text-slate-500 mt-0.5">{t('landing.tailoredSubtitle')}</p>
            </div>
            <button
              onClick={onSignIn}
              className="text-[12px] font-semibold transition-colors flex items-center gap-1 group"
              style={{ color: 'var(--brand-600)' }}
            >
              {t('landing.viewAll')}
              <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"/>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CARDS.map((card, idx) => (
              <div
                key={idx}
                onClick={() => onCardClick(card.query)}
                className={`group relative rounded-[22px] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl ${card.hover} transition-all duration-500 h-[260px] bg-slate-100 border border-slate-200/60 hover:-translate-y-1.5`}
              >
                <img
                  src={card.img}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/35 to-transparent z-10"/>
                {card.badge && (
                  <div className="absolute top-3 left-3 z-20">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-white/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                      <span className="text-white text-[10px] font-bold tracking-wider uppercase">{card.badge}</span>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 p-5 w-full z-20 group-hover:-translate-y-1.5 transition-transform duration-500">
                  <div className={`w-10 h-10 rounded-[12px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3 border border-white/30 ${card.iconHover} transition-all duration-300`}>
                    <i className={`fa-solid ${card.icon} text-[16px]`}/>
                  </div>
                  <h4 className="text-white font-bold text-[18px] leading-tight mb-1">{card.title}</h4>
                  <p className="text-slate-200 text-[12px] font-medium flex items-center gap-1">
                    {card.desc}
                    <i className="fa-solid fa-arrow-right text-[9px] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"/>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust bar ── */}
        <div className="animate-fade-in-up opacity-0 delay-400 w-full max-w-[820px] glass-panel rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
              <i className="fa-regular fa-shield-check text-slate-600 text-[16px]"/>
            </div>
            <div className="leading-tight">
              <p className="text-[11px] text-slate-500 font-medium">{t('landing.verifiedFrom')}</p>
              <p className="text-[13px] text-slate-900 font-semibold">{t('landing.officialSources')}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
            {/* myScheme */}
            <div className="flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <span className="text-[13px] font-extrabold text-slate-800">myScheme</span>
            </div>
            {/* Digital India */}
            <div className="flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-[8px]">DI</div>
              <span className="text-[12px] font-bold text-slate-700">Digital India</span>
            </div>
            {/* UMANG */}
            <div className="flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <div className="w-5 h-5 rounded flex items-center justify-center text-white font-bold text-[8px]" style={{ background: 'var(--brand-600)' }}>U</div>
              <span className="text-[12px] font-bold text-slate-700">UMANG</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
