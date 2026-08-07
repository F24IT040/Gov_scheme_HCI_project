import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import imgStudents from '../assets/download.jpg';
import imgFarmer from '../assets/farmer.jpg';
import imgWomen from '../assets/saheli-women.jpg';
import imgBank from '../assets/bank.jpg';
import imgHealth from '../assets/health.jpg';
import imgHousing from '../assets/ghar.jpg';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
];

export default function LandingPage({ onSignIn, onStartNow, onCardClick }) {
  const { t, i18n } = useTranslation();
  const cursorGlowRef = useRef(null);
  const parallaxOrbsRef = useRef(null);
  const parallaxGridRef = useRef(null);
  const parallaxLinesRef = useRef(null);

  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [responseVisible, setResponseVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [actionCardVisible, setActionCardVisible] = useState(false);
  const [activeLang, setActiveLang] = useState(() => localStorage.getItem('nayanta_lang') || 'en');

  useEffect(() => {
    const cursor = cursorGlowRef.current;
    const orbs = parallaxOrbsRef.current;
    const grid = parallaxGridRef.current;
    const lines = parallaxLinesRef.current;
    const onMove = (e) => {
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      const mx = (e.clientX - cx) / cx, my = (e.clientY - cy) / cy;
      requestAnimationFrame(() => {
        if (cursor) cursor.style.transform = `translate(${e.clientX - 300}px,${e.clientY - 300}px)`;
        if (orbs) orbs.style.transform = `translate(${mx * -30}px,${my * -30}px)`;
        if (grid) grid.style.transform = `translate(${mx * 10}px,${my * 10}px)`;
        if (lines) lines.style.transform = `translate(${mx * -15}px,${my * -15}px)`;
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

  const fillQuery = (text) => { setQuery(text); if (!text.includes('...')) triggerSearch(text); };

  const triggerSearch = (q) => {
    const trimmed = (q !== undefined ? q : query).trim();
    if (!trimmed) return;
    setResponse('loading'); setResponseVisible(true); setTypedText(''); setActionCardVisible(false);
    const msg = 'Based on your selected category, we have retrieved verified schemes from official portals matching your requirements with 98% eligibility confidence.';
    setTimeout(() => {
      setResponse('result');
      let i = 0;
      const tick = () => { if (i < msg.length) { setTypedText(msg.slice(0, i + 1)); i++; setTimeout(tick, 15); } else setActionCardVisible(true); };
      tick();
    }, 1200);
  };

  const closeResponse = () => { setResponseVisible(false); setTimeout(() => { setResponse(null); setQuery(''); }, 300); };

  const handleLangChange = (code) => {
    setActiveLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('nayanta_lang', code);
  };

  const CARDS = [
    { query: 'Show me scholarships and education schemes for students', img: imgStudents, badge: 'Live Apps', icon: 'fa-user-graduate', title: t('landing.categories.students'), desc: t('landing.categories.studentsDesc'), hover: 'hover:shadow-brand-500/40', iconHover: 'group-hover:bg-brand-500 group-hover:border-brand-400' },
    { query: 'What schemes are available for farmers and agriculture?', img: imgFarmer, badge: 'New Schemes', icon: 'fa-tractor', title: t('landing.categories.farmers'), desc: t('landing.categories.farmersDesc'), hover: 'hover:shadow-green-500/40', iconHover: 'group-hover:bg-green-500 group-hover:border-green-400' },
    { query: 'Show me empowerment and welfare schemes for women', img: imgWomen, badge: 'Trending', icon: 'fa-hands-holding-child', title: t('landing.categories.women'), desc: t('landing.categories.womenDesc'), hover: 'hover:shadow-purple-500/40', iconHover: 'group-hover:bg-purple-500 group-hover:border-purple-400' },
    { query: 'Show me government loans, pensions, and financial inclusion schemes', img: imgBank, badge: null, icon: 'fa-building-columns', title: t('landing.categories.banking'), desc: t('landing.categories.bankingDesc'), hover: 'hover:shadow-blue-500/40', iconHover: 'group-hover:bg-blue-600 group-hover:border-blue-500' },
    { query: 'What government health insurance and medical schemes am I eligible for?', img: imgHealth, badge: null, icon: 'fa-kit-medical', title: t('landing.categories.health'), desc: t('landing.categories.healthDesc'), hover: 'hover:shadow-rose-500/40', iconHover: 'group-hover:bg-rose-500 group-hover:border-rose-400' },
    { query: 'How to apply for PM Awas Yojana and housing subsidies?', img: imgHousing, badge: null, icon: 'fa-house-chimney', title: t('landing.categories.housing'), desc: t('landing.categories.housingDesc'), hover: 'hover:shadow-amber-500/40', iconHover: 'group-hover:bg-amber-500 group-hover:border-amber-400' },
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
      <div ref={cursorGlowRef} style={{ position:'fixed',top:0,left:0,width:600,height:600,borderRadius:'50%',pointerEvents:'none',zIndex:-2,willChange:'transform',transition:'opacity 0.3s ease',transform:'translate(-50%,-50%)',background:'radial-gradient(circle,rgba(220,161,161,0.15) 0%,rgba(220,161,161,0) 60%)' }}/>

      {/* HEADER */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-20 animate-fade-in-up opacity-0 relative">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={()=>{}}>
          <div className="relative w-10 h-10 rounded-[12px] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-accent flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-[1.03] transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700"/>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="relative z-10">
              <path d="M5.5 19V6.5C5.5 5.67157 6.17157 5 7 5H8.5C9.32843 5 10 5.67157 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.8284 4 18.5 4.67157 18.5 5.5V19C18.5 19.8284 17.8284 20.5 17 20.5H15.5C14.6716 20.5 14 19.8284 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67157 21 5.5 20.3284 5.5 19Z" fill="white"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[22px] font-bold tracking-tight text-slate-900 leading-none" style={{letterSpacing:'-0.03em'}}>Nayanta</span>
            <span className="text-[10.5px] font-semibold text-slate-500/80 mt-0.5 tracking-wide uppercase">Government Guide</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-500">
          <a href="#" className="text-brand-600 font-semibold relative py-1">{t('nav.home')}<span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-600 rounded-full"/></a>
          <a href="#" className="hover:text-slate-900 transition-colors">{t('nav.services')}</a>
          <a href="#" className="hover:text-slate-900 transition-colors">{t('nav.schemes')}</a>
          <a href="#" className="hover:text-slate-900 transition-colors">{t('nav.resources')}</a>
          <a href="#" className="hover:text-slate-900 transition-colors">{t('nav.help')}</a>
        </nav>
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors px-2">
            <i className="fa-solid fa-globe text-[14px]"/> {t('nav.language')} <i className="fa-solid fa-chevron-down text-[10px] ml-0.5 opacity-60"/>
          </button>
          <button onClick={onSignIn} className="bg-slate-900 text-white rounded-full px-5 py-2 text-[14px] font-medium shadow-md shadow-slate-900/10 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            {t('nav.signIn')}
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full max-w-5xl mx-auto px-4 pt-16 pb-20 flex flex-col items-center z-10 flex-1 relative">
        <div className="animate-fade-in-up opacity-0 delay-100 mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-slate-200/60">
          <i className="fa-solid fa-sparkles text-brand-500 text-[13px] animate-pulse-slow"/>
          <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-700">{t('landing.badge')} <span className="text-slate-300 mx-1">•</span> {t('landing.badgeSeparator')}</span>
        </div>
        <h1 className="animate-fade-in-up opacity-0 delay-200 text-[42px] sm:text-[56px] md:text-[64px] font-extrabold leading-[1.05] text-center tracking-tight text-slate-900 mb-6">
          {t('landing.heroLine1')}<br/><span className="text-gradient">{t('landing.heroLine2')}</span> {t('landing.heroLine3')}
        </h1>
        <p className="animate-fade-in-up opacity-0 delay-300 text-[16px] sm:text-[18px] text-slate-500 text-center max-w-2xl leading-relaxed mb-12 font-medium">{t('landing.subtitle')}</p>

        {/* Search card */}
        <div className="animate-fade-in-up opacity-0 delay-400 w-full max-w-[840px] glass-panel rounded-[28px] shadow-glass p-6 sm:p-8 mb-8 transition-transform duration-300 hover:shadow-float-hover">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <i className="fa-solid fa-message-bot text-[13px]"/>
            </div>
            <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight">{t('landing.searchTitle')}</h2>
          </div>
          <div className="relative w-full mb-5 group">
            <input type="text" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&triggerSearch()}
              placeholder={t('landing.searchPlaceholder')}
              className="w-full bg-white/70 backdrop-blur-sm rounded-[18px] py-4 pl-6 pr-[68px] text-[15px] text-slate-800 shadow-input focus:outline-none focus:shadow-input-focus focus:bg-white transition-all duration-300"/>
            <button onClick={()=>triggerSearch()} className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-brand-600 text-white rounded-[12px] flex items-center justify-center hover:bg-brand-500 hover:scale-[1.04] active:scale-95 transition-all shadow-md shadow-brand-500/20">
              <i className="fa-solid fa-arrow-right text-[14px]"/>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={()=>fillQuery('Voice search initiated...')} className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/50 transition-all shadow-sm">
              <i className="fa-solid fa-microphone text-brand-500"/> {t('landing.speakInstead')}
            </button>
            <button onClick={()=>fillQuery('Document upload initiated...')} className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/50 transition-all shadow-sm">
              <i className="fa-solid fa-paperclip text-brand-500"/> {t('landing.uploadDocument')}
            </button>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-200/50 flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1"><i className="fa-solid fa-lightbulb text-amber-400 mr-1"/> {t('landing.tryAsking')}</span>
            <button onClick={()=>fillQuery('How to apply for PM Awas Yojana?')} className="text-[12px] px-3.5 py-1.5 rounded-full bg-white/60 border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">🏠 PM Awas Yojana</button>
            <button onClick={()=>fillQuery('Scholarships for degree students')} className="text-[12px] px-3.5 py-1.5 rounded-full bg-white/60 border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">🎓 Degree Scholarships</button>
            <button onClick={()=>fillQuery('Get a new PAN card')} className="hidden sm:inline-flex text-[12px] px-3.5 py-1.5 rounded-full bg-white/60 border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm">💳 PAN Card</button>
          </div>
        </div>

        {/* AI Response panel */}
        {response && (
          <div className={`w-full max-w-[840px] glass-panel rounded-[24px] shadow-glass p-6 sm:p-8 mb-10 transition-all duration-500 ${responseVisible?'opacity-100 translate-y-0':'opacity-0 -translate-y-4'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-accent text-white flex items-center justify-center shadow-md"><i className="fa-solid fa-robot"/></div>
                <div><h3 className="font-semibold text-slate-900">Nayanta Assistant</h3><p className="text-[12px] text-emerald-600 font-medium flex items-center gap-1"><i className="fa-solid fa-circle-check"/> Verified Data</p></div>
              </div>
              <button onClick={closeResponse} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"><i className="fa-solid fa-xmark"/></button>
            </div>
            {response==='loading'&&<div className="flex items-center gap-3 text-brand-600 font-medium"><i className="fa-solid fa-circle-notch animate-spin text-[18px]"/>Analyzing official government schemes...</div>}
            {response==='result'&&(
              <div className="bg-brand-50/50 rounded-[16px] p-5 border border-brand-100/50">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2"><i className="fa-solid fa-sparkles text-brand-500"/> Best Match Found</h4>
                <div className="text-[14px] text-slate-600 mb-4 min-h-[42px] leading-relaxed">{typedText}</div>
                <div className={`transition-opacity duration-700 bg-white rounded-[12px] p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${actionCardVisible?'opacity-100':'opacity-0'}`}>
                  <div><h5 className="font-semibold text-[14px] text-slate-900">Verified Government Scheme</h5><p className="text-[12px] text-slate-500 mt-0.5">Direct Portal Access • Financial Assistance</p></div>
                  <button onClick={onStartNow} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap group">
                    View Details <i className="fa-solid fa-arrow-right ml-1 text-[11px] group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="animate-fade-in-up opacity-0 delay-400 flex items-center justify-center gap-2 text-[13px] text-slate-500 mb-16 font-medium">
          <i className="fa-regular fa-shield-check text-slate-400"/> {t('landing.privacy')}
        </div>

        {/* Category cards */}
        <div className="animate-fade-in-up opacity-0 delay-400 w-full max-w-[840px] mb-12">
          <div className="flex justify-between items-end mb-6 px-1">
            <div><h3 className="text-[20px] font-bold text-slate-900 tracking-tight">{t('landing.tailoredTitle')}</h3><p className="text-[14px] text-slate-500 mt-1">{t('landing.tailoredSubtitle')}</p></div>
            <button className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1.5 group">{t('landing.viewAll')} <i className="fa-solid fa-arrow-right text-[11px] group-hover:translate-x-1 transition-transform"/></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CARDS.map((card, idx) => (
              <div key={idx} onClick={()=>onCardClick(card.query)}
                className={`group relative rounded-[24px] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl ${card.hover} transition-all duration-500 h-[280px] bg-slate-100 border border-slate-200/60 transform hover:-translate-y-1.5`}>
                <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out z-0"/>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent z-10"/>
                {card.badge&&<div className="absolute top-4 left-4 z-20"><div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/20 shadow-sm"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-white text-[10px] font-bold tracking-wider uppercase">{card.badge}</span></div></div>}
                <div className="absolute bottom-0 left-0 p-6 w-full z-20 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className={`w-12 h-12 rounded-[14px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-4 border border-white/30 ${card.iconHover} transition-all duration-300`}>
                    <i className={`fa-solid ${card.icon} text-[18px]`}/>
                  </div>
                  <h4 className="text-white font-bold text-[20px] leading-tight mb-1.5">{card.title}</h4>
                  <p className="text-slate-200 text-[13px] font-medium opacity-90 group-hover:opacity-100 transition-opacity flex items-center">
                    {card.desc}<i className="fa-solid fa-arrow-right ml-2 text-[10px] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300"/>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language selector */}
        <div className="animate-fade-in-up opacity-0 delay-400 w-full max-w-[840px] mb-8">
          <h4 className="text-[14px] font-semibold text-slate-900 mb-4 px-1">{t('landing.chooseLanguage')}</h4>
          <div className="flex flex-wrap gap-3">
            {LANGS.map(({code,label})=>(
              <button key={code} onClick={()=>handleLangChange(code)}
                className={`rounded-full px-5 py-2.5 flex items-center gap-2 text-[13px] transition-all shadow-sm ${activeLang===code?'bg-brand-50 border border-brand-200 font-semibold text-brand-600':'bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                {activeLang===code&&<div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold">{label.charAt(0)}</div>}
                {label}
              </button>
            ))}
            <button className="bg-white border border-slate-200 border-dashed rounded-full px-5 py-2.5 flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50 transition-all shadow-sm">
              <i className="fa-solid fa-ellipsis"/> More
            </button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="animate-fade-in-up opacity-0 delay-400 w-full max-w-[840px] glass-panel rounded-2xl p-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center gap-3 min-w-fit">
            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
              <i className="fa-regular fa-shield-check text-slate-600 text-[18px]"/>
            </div>
            <div className="leading-tight">
              <p className="text-[12px] text-slate-500 font-medium">{t('landing.verifiedFrom')}</p>
              <p className="text-[13px] text-slate-900 font-semibold">{t('landing.officialSources')}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="absolute text-brand-600 w-6 h-6 ml-2 mt-1" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                <svg className="absolute text-amber-500 w-5 h-5 -ml-3 -mt-2 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <span className="text-[14px] font-extrabold text-slate-800 leading-none tracking-tight">myScheme</span>
            </div>
            <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">DI</div>
              <div className="flex flex-col"><span className="text-[12px] font-bold text-slate-800 leading-none">Digital India</span><span className="text-[7px] text-slate-500 uppercase font-semibold mt-0.5">Power To Empower</span></div>
            </div>
            <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">U</div>
              <div className="flex flex-col"><span className="text-[12px] font-bold text-slate-800 leading-none">UMANG</span><span className="text-[7px] text-slate-500 uppercase font-semibold mt-0.5">The Spirit of New India</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
