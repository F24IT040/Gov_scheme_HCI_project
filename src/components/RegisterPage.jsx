import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const INTEREST_KEYS = [
  { key: 'education',  icon: 'fa-graduation-cap', labelKey: 'register.interestEducation' },
  { key: 'agriculture',icon: 'fa-seedling',        labelKey: 'register.interestAgriculture' },
  { key: 'housing',    icon: 'fa-house',           labelKey: 'register.interestHousing' },
  { key: 'jobs',       icon: 'fa-briefcase',       labelKey: 'register.interestJobs' },
  { key: 'health',     icon: 'fa-heart-pulse',     labelKey: 'register.interestHealth' },
  { key: 'startup',    icon: 'fa-rocket',          labelKey: 'register.interestStartup' },
];

export default function RegisterPage({ onBack, onSubmit, onLogin }) {
  const { t, i18n } = useTranslation();

  const cursorGlowRef    = useRef(null);
  const parallaxOrbsRef  = useRef(null);
  const parallaxGridRef  = useRef(null);
  const parallaxLinesRef = useRef(null);

  const [form, setForm] = useState({
    name: '', mobile: '', email: '', language: 'English',
    state: '', district: '', age: '', gender: '',
    occupation: '', income: '',
  });
  const [selected, setSelected] = useState(['education', 'health']);
  const [loading,  setLoading]  = useState(false);
  const [error, setError] = useState('');

  /* Parallax */
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

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleInterest = (key) =>
    setSelected(s => s.includes(key) ? s.filter(k => k !== key) : [...s, key]);
  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || form.mobile.length !== 10) {
      setError('Enter your name and a 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/auth/register`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, interests: selected }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Could not create your account.');
      onSubmit(data.user);
    } catch (registerError) {
      setError(registerError.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  const activeLang = i18n.language?.slice(0, 2) || 'en';
  const handleLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('nayanta_lang', code);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(0,0,0,0.05)',
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden antialiased" style={{ backgroundColor: '#F9F4EA', color: '#0F172A' }}>
      <div className="bg-grain"/>
      <div ref={parallaxOrbsRef} className="fixed pointer-events-none overflow-hidden z-[-3]"
        style={{ inset:0,width:'110%',height:'110%',left:'-5%',top:'-5%',willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}>
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
      </div>
      <div ref={parallaxGridRef}  className="bg-grid"  style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={parallaxLinesRef} className="bg-lines" style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={cursorGlowRef} style={{ position:'fixed',top:0,left:0,width:600,height:600,borderRadius:'50%',pointerEvents:'none',zIndex:-2,willChange:'transform',opacity:0,transition:'opacity 0.3s ease',transform:'translate(-50%,-50%)',background:'radial-gradient(circle,rgba(198,141,141,0.14) 0%,rgba(198,141,141,0) 60%)' }}/>

      {/* ── SINGLE COLUMN FORM — centred, max-w-xl ── */}
      <main className="relative z-10 min-h-screen flex flex-col px-4 py-10">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-7 pb-28">

          {/* Top bar */}
          <div className="flex items-center justify-between animate-fade-in-up opacity-0">
            <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-brand-600 transition-colors">
              <i className="fa-solid fa-arrow-left text-[11px]"/>
              {t('login.backHome')}
            </button>
            {/* EN / HI pill */}
            <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 shadow-sm">
              {[{ code: 'en', label: 'EN' }, { code: 'hi', label: 'हि' }].map(({ code, label }) => (
                <button key={code} onClick={() => handleLang(code)}
                  className="rounded-full px-3 py-1 text-[12px] font-bold transition-all"
                  style={activeLang === code ? { background: 'var(--brand-600)', color: '#fff' } : { color: 'rgb(100,110,130)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Header */}
          <header className="flex flex-col gap-2 animate-fade-in-up opacity-0 delay-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="white"/>
                </svg>
              </div>
              <div>
                <span className="text-[20px] font-bold text-slate-900 leading-none" style={{ letterSpacing: '-0.02em' }}>Nayanta</span>
                <p className="text-[9px] font-semibold text-slate-500/70 uppercase tracking-widest mt-0.5">Government Guide</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full w-max shadow-sm border border-slate-200/60 mt-1">
              <i className="fa-solid fa-sparkles text-[11px] animate-pulse-slow" style={{ color: 'var(--brand-500)' }}/>
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-700">{t('register.badge')}</span>
            </div>

            <h1 className="text-[28px] sm:text-[34px] font-extrabold leading-[1.1] tracking-tight text-slate-900 mt-1">
              {t('register.title')} <span className="text-gradient">{t('register.titleHighlight')}</span>
            </h1>
            <p className="text-[14px] text-slate-500 leading-relaxed font-medium">{t('register.subtitle')}</p>
          </header>

          {/* ── Personal Details ── */}
          <section className="glass-panel rounded-[22px] p-5 flex flex-col gap-4 animate-fade-in-up opacity-0 delay-200">
            <h2 className="text-[16px] font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200/50 pb-3">
              <span className="w-7 h-7 rounded-full flex items-center justify-center border text-[12px]" style={{ background: 'var(--brand-50)', borderColor: 'var(--brand-100)', color: 'var(--brand-600)' }}>
                <i className="fa-solid fa-user"/>
              </span>
              {t('register.personalDetails')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.fullName')}</label>
                <div className="relative">
                  <i className="fa-solid fa-id-badge absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]"/>
                  <input type="text" value={form.name} onChange={set('name')}
                    placeholder={t('register.fullNamePlaceholder')}
                    className="w-full rounded-[12px] py-2.5 pl-9 pr-3 text-[14px] text-slate-800 outline-none" style={inputStyle}/>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.mobile')}</label>
                <div className="relative">
                  <i className="fa-solid fa-mobile-screen absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]"/>
                  <input type="tel" inputMode="numeric" value={form.mobile}
                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g,'').slice(0,10) }))}
                    placeholder="+91"
                    className="w-full rounded-[12px] py-2.5 pl-9 pr-3 text-[14px] text-slate-800 outline-none" style={inputStyle}/>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.email')}</label>
                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]"/>
                  <input type="email" value={form.email} onChange={set('email')}
                    placeholder={t('register.emailPlaceholder')}
                    className="w-full rounded-[12px] py-2.5 pl-9 pr-3 text-[14px] text-slate-800 outline-none" style={inputStyle}/>
                </div>
              </div>

              {/* Language */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.language')}</label>
                <div className="relative">
                  <i className="fa-solid fa-language absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]"/>
                  <select value={form.language} onChange={set('language')}
                    className="w-full rounded-[12px] py-2.5 pl-9 pr-7 text-[14px] text-slate-800 appearance-none outline-none" style={inputStyle}>
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी</option>
                    <option value="Marathi">मराठी</option>
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"/>
                </div>
              </div>
            </div>
          </section>

          {/* ── Citizen Profile ── */}
          <section className="glass-panel rounded-[22px] p-5 flex flex-col gap-4 animate-fade-in-up opacity-0 delay-300">
            <h2 className="text-[16px] font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-200/50 pb-3">
              <span className="w-7 h-7 rounded-full flex items-center justify-center border text-[12px]" style={{ background: 'var(--brand-50)', borderColor: 'var(--brand-100)', color: 'var(--brand-600)' }}>
                <i className="fa-solid fa-id-card"/>
              </span>
              {t('register.citizenProfile')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* State */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.state')}</label>
                <select value={form.state} onChange={set('state')}
                  className="w-full rounded-[12px] p-2.5 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                  <option value="">{t('register.selectState')}</option>
                  {['Maharashtra','Karnataka','Delhi','Tamil Nadu','Uttar Pradesh','Gujarat','Rajasthan','Bihar','West Bengal'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.district')}</label>
                <input type="text" value={form.district} onChange={set('district')}
                  placeholder={t('register.selectDistrict')}
                  className="w-full rounded-[12px] p-2.5 text-[14px] text-slate-800 outline-none" style={inputStyle}/>
              </div>

              {/* Age */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.age')}</label>
                <input type="number" value={form.age} onChange={set('age')}
                  placeholder={t('register.agePlaceholder')}
                  className="w-full rounded-[12px] p-2.5 text-[14px] text-slate-800 outline-none" style={inputStyle}/>
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.gender')}</label>
                <select value={form.gender} onChange={set('gender')}
                  className="w-full rounded-[12px] p-2.5 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                  <option value="">{t('register.gender')}</option>
                  <option value="Female">{t('register.genderFemale')}</option>
                  <option value="Male">{t('register.genderMale')}</option>
                  <option value="Other">{t('register.genderOther')}</option>
                </select>
              </div>

              {/* Occupation */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.occupation')}</label>
                <select value={form.occupation} onChange={set('occupation')}
                  className="w-full rounded-[12px] p-2.5 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                  <option value="">{t('register.occupation')}</option>
                  <option value="Student">{t('register.occStudent')}</option>
                  <option value="Farmer">{t('register.occFarmer')}</option>
                  <option value="Self-Employed">{t('register.occSelfEmployed')}</option>
                  <option value="Salaried">{t('register.occSalaried')}</option>
                  <option value="Business">{t('register.occBusiness')}</option>
                  <option value="Other">{t('register.occOther')}</option>
                </select>
              </div>

              {/* Income */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.income')}</label>
                <select value={form.income} onChange={set('income')}
                  className="w-full rounded-[12px] p-2.5 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                  <option value="">{t('register.income')}</option>
                  <option value="below1">{t('register.incBelow1')}</option>
                  <option value="1to5">{t('register.inc1to5')}</option>
                  <option value="above5">{t('register.incAbove5')}</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Areas of Interest ── */}
          <div className="flex flex-col gap-2.5 animate-fade-in-up opacity-0 delay-400">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('register.interests')}</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_KEYS.map(({ key, icon, labelKey }) => {
                const active = selected.includes(key);
                return (
                  <button key={key} type="button" onClick={() => toggleInterest(key)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium border transition-all"
                    style={active
                      ? { background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))', color: '#fff', borderColor: 'transparent', boxShadow: '0 6px 16px -4px rgba(198,141,141,0.5)' }
                      : { background: '#fff', color: '#334155', borderColor: '#e2e8f0' }}>
                    <i className={`fa-solid ${icon} text-[13px]`}/>
                    {t(labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Trust strip ── */}
          <div className="glass-panel rounded-[18px] p-4 flex items-center gap-3 animate-fade-in-up opacity-0 delay-400">
            <div className="flex gap-3 shrink-0 text-[18px]" style={{ color: 'var(--brand-600)' }}>
              <i className="fa-solid fa-lock"/>
              <i className="fa-solid fa-robot"/>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">{t('register.trustNote')}</p>
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
        </div>

        {/* ── Fixed bottom bar ── */}
        <div className="fixed bottom-0 left-0 w-full border-t border-slate-200/60 px-5 py-4 flex justify-between items-center z-20"
          style={{ background: 'rgba(249,244,234,0.88)', backdropFilter: 'blur(14px)' }}>
          <button type="button" onClick={onLogin}
            className="text-[13px] font-medium transition-colors"
            style={{ color: 'var(--brand-600)' }}>
            {t('register.alreadyHaveAccount')}
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="text-white text-[14px] font-semibold px-6 py-2.5 rounded-[14px] shadow-md transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}>
            {loading ? t('register.creating') : t('register.createProfile')}
            {!loading && <i className="fa-solid fa-arrow-right text-[13px]"/>}
            {loading  && <i className="fa-solid fa-circle-notch animate-spin text-[13px]"/>}
          </button>
        </div>
      </main>
    </div>
  );
}
