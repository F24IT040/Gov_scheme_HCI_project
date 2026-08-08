import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LoginPage({ onBack, onLogin, onRegister }) {
  const { t, i18n } = useTranslation();

  const cursorGlowRef   = useRef(null);
  const parallaxOrbsRef = useRef(null);
  const parallaxGridRef = useRef(null);
  const parallaxLinesRef = useRef(null);

  const [mobile,      setMobile]      = useState('');
  const [error,       setError]       = useState('');
  const [remember,    setRemember]    = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [highlightOut, setHighlightOut] = useState(false);
  const [btnLabel,    setBtnLabel]    = useState('');
  const [btnSpin,     setBtnSpin]     = useState(false);
  const [btnCheck,    setBtnCheck]    = useState(false);
  const [btnSuccess,  setBtnSuccess]  = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [loadingTip,  setLoadingTip]  = useState('');
  const [busy,        setBusy]        = useState(false);

  /* Update btn label on language change */
  useEffect(() => { setBtnLabel(t('login.login')); }, [t]);
  useEffect(() => { setLoadingTip(t('login.overlayTip1')); }, [t]);

  const HIGHLIGHTS = [t('login.highlight1'), t('login.highlight2'), t('login.highlight3')];
  const LOGIN_STEPS = [t('login.step1'), t('login.step2'), t('login.step3')];

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

  /* Rotating highlights */
  useEffect(() => {
    const id = setInterval(() => {
      setHighlightOut(true);
      setTimeout(() => { setHighlightIdx(i => (i + 1) % HIGHLIGHTS.length); setHighlightOut(false); }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, [HIGHLIGHTS.length]);

  const handleMobile = (e) => {
    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  const handleLogin = async () => {
    if (busy) return;
    setError('');
    if (mobile.length !== 10) {
      setError('Enter your registered 10-digit mobile number.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://govschemehciproject-production.up.railway.app'}/auth/login`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Sign in failed.');
      onLogin(data.user);
    } catch (loginError) {
      setError(loginError.message || 'Sign in failed.');
    } finally {
      setBusy(false);
    }
    /*
    let step = 0;
    setBtnSpin(true);
    setBtnLabel(LOGIN_STEPS[0]);
    const seq = setInterval(() => {
      step++;
      if (step < LOGIN_STEPS.length) {
        setBtnLabel(LOGIN_STEPS[step]);
      } else {
        clearInterval(seq);
        setBtnSpin(false); setBtnCheck(true); setBtnSuccess(true);
        setBtnLabel(t('login.loginSuccessful'));
        setTimeout(() => {
          setShowOverlay(true);
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => setLoadingTip(t('login.overlayTip2')), 1000);
            setTimeout(() => {
              setShowOverlay(false); setProgress(0);
              setBtnLabel(t('login.login')); setBtnSpin(false);
              setBtnCheck(false); setBtnSuccess(false); setBusy(false);
              setLoadingTip(t('login.overlayTip1'));
              onLogin(remember);
            }, 2200);
          }, 100);
        }, 500);
      }
    }, 800);
    */
  };

  /* Language toggle — same pill as landing */
  const activeLang = i18n.language?.slice(0, 2) || 'en';
  const handleLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('nayanta_lang', code);
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-x-hidden antialiased" style={{ backgroundColor: '#F9F4EA', color: '#0F172A' }}>
      <div className="bg-grain"/>
      <div ref={parallaxOrbsRef} className="fixed pointer-events-none overflow-hidden z-[-3]"
        style={{ inset:0,width:'110%',height:'110%',left:'-5%',top:'-5%',willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}>
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
      </div>
      <div ref={parallaxGridRef}  className="bg-grid"  style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={parallaxLinesRef} className="bg-lines" style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={cursorGlowRef} style={{ position:'fixed',top:0,left:0,width:600,height:600,borderRadius:'50%',pointerEvents:'none',zIndex:-2,willChange:'transform',opacity:0,transition:'opacity 0.3s ease',transform:'translate(-50%,-50%)',background:'radial-gradient(circle,rgba(198,141,141,0.14) 0%,rgba(198,141,141,0) 60%)' }}/>

      {/* ── LEFT PANEL ── */}
      <div className="w-full lg:w-[48%] min-h-screen flex flex-col relative z-10 px-8 lg:px-20 py-14">

        {/* Top row: back + lang */}
        <div className="flex items-center justify-between mb-10 animate-fade-in-up opacity-0">
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

          {error && <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}
        </div>

        {/* Logo + headline */}
        <div className="mb-8 animate-fade-in-up opacity-0 delay-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="white"/>
              </svg>
            </div>
            <div>
              <span className="text-[20px] font-bold text-slate-900 leading-none" style={{ letterSpacing: '-0.02em' }}>Nayanta</span>
              <p className="text-[9px] font-semibold text-slate-500/70 uppercase tracking-widest mt-0.5">Government Guide</p>
            </div>
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-extrabold leading-[1.1] tracking-tight text-slate-900 mb-2">
            {t('login.welcomeBack')}
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed font-medium">{t('login.subtitle')}</p>
        </div>

        {/* Glass form card */}
        <div className="animate-fade-in-up opacity-0 delay-200 glass-panel rounded-[26px] p-7 w-full max-w-md">

          {/* Mobile input */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
              {t('login.mobileLabel')}
            </label>
            <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-[14px] h-13 px-4 shadow-input transition-all focus-within:shadow-input-focus relative" style={{ height: '52px' }}>
              <span className="text-slate-500 text-[14px] font-semibold mr-2 shrink-0">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={handleMobile}
                placeholder={t('login.mobilePlaceholder')}
                className="w-full bg-transparent border-none focus:outline-none text-slate-800 text-[15px]"
              />
              {mobile.length >= 10 && (
                <svg className="w-5 h-5 text-emerald-500 absolute right-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--brand-600)', opacity: 0.8 }}>
              {t('login.mobileHint')}
            </p>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2 mb-5">
            <input type="checkbox" id="remember-me" checked={remember} onChange={() => setRemember(r => !r)}
              className="w-4 h-4 rounded border-slate-300 accent-brand-600 cursor-pointer"/>
            <label htmlFor="remember-me" className="text-[13px] text-slate-500 font-medium cursor-pointer">
              {t('login.rememberMe')}
            </label>
          </div>

          {/* Notification ticker */}
          <div className="mb-5 rounded-[12px] border px-3 py-2.5 flex items-center gap-2 overflow-hidden" style={{ background: 'var(--brand-50)', borderColor: 'var(--brand-100)', minHeight: '44px' }}>
            <i className="fa-solid fa-bell shrink-0 text-[13px]" style={{ color: 'var(--brand-600)' }}/>
            <p className="text-[12px] font-medium transition-all duration-400"
              style={{ color: 'var(--brand-700)', opacity: highlightOut ? 0 : 1, transform: highlightOut ? 'translateY(-6px)' : 'translateY(0)' }}>
              {HIGHLIGHTS[highlightIdx]}
            </p>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={busy}
            className={`w-full text-white text-[13px] font-bold tracking-wider rounded-full py-3.5 transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${btnSuccess ? 'bg-emerald-500' : 'hover:-translate-y-0.5'} ${busy ? 'pointer-events-none' : ''}`}
            style={!btnSuccess ? { background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' } : {}}
          >
            <span>{btnLabel || t('login.login')}</span>
            {btnSpin  && <i className="fa-solid fa-arrows-rotate animate-spin text-[12px]"/>}
            {btnCheck && !btnSpin && <i className="fa-solid fa-check text-[12px]"/>}
            {!btnSpin && !btnCheck && <i className="fa-solid fa-arrow-right text-[12px]"/>}
          </button>

          {/* Footer links */}
          <div className="flex justify-center gap-6 mt-6 pt-5 border-t border-slate-200/50">
            <button onClick={onRegister} className="text-[13px] font-medium text-slate-500 hover:text-brand-600 transition-colors">
              {t('login.createAccount')}
            </button>
            <a href="#" className="text-[13px] font-medium text-slate-500 hover:text-brand-600 transition-colors">
              {t('login.needHelp')}
            </a>
          </div>
        </div>

        {/* Trust note */}
        <p className="mt-6 max-w-md text-[12px] text-slate-400 text-center leading-relaxed animate-fade-in-up opacity-0 delay-300">
          {t('login.trustNote')}
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="hidden lg:flex w-[52%] min-h-screen flex-col items-center justify-center p-12 border-l border-slate-200/40 z-10 relative">
        <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full gap-8 animate-fade-in-up opacity-0 delay-200">

          {/* Headline */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-slate-200/60">
              <i className="fa-solid fa-sparkles text-[12px] animate-pulse-slow" style={{ color: 'var(--brand-500)' }}/>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-700">{t('login.rightSub')}</span>
            </div>
            <h2 className="text-[28px] font-extrabold leading-tight tracking-tight text-slate-900">
              {t('login.rightTitle')}{' '}
              <span style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('login.rightTitleHighlight')}
              </span>
            </h2>
          </div>

          {/* Illustration */}
          <div className="w-full max-w-sm rounded-[22px] overflow-hidden shadow-float border border-white/60 bg-white">
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLtjLbWvRGjYNZLYM66wW6FxF6RParNvJr8bB-82HfT0sjmMKZX64d0dBmVz0gqhtTj2SuFhMOaiTU0BsaBg3g6nqliINi_DWwhz3wxH0GO5xKZqBxOIEl5WHQnoVTKVfo4_D9uOIGXtJmtdsqz5c_Fq3iri9tNjd973sbdQTma9hdpmFGs6zwZ_1qcOrB2tGspigQvsrZzh7L8_u4DzaOPpsVGzgcEKe3VctIWWtKou7xwG91x28Hw1WJ0"
              alt="Nayanta assistant"
              className="w-full object-cover mix-blend-multiply"
              style={{ maxHeight: '340px' }}
            />
          </div>

          {/* 3 brief feature pills */}
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { icon: 'fa-shield-halved', text: i18n.language === 'hi' ? 'आधिकारिक स्रोतों से जानकारी' : 'Info from official sources' },
              { icon: 'fa-wand-magic-sparkles', text: i18n.language === 'hi' ? 'AI सरल भाषा में समझाए' : 'AI explains in simple language' },
              { icon: 'fa-file-lines', text: i18n.language === 'hi' ? 'दस्तावेज़ चेकलिस्ट' : 'Document checklist' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-[12px] font-medium text-slate-700 shadow-sm">
                <i className={`fa-solid ${icon} text-[13px]`} style={{ color: 'var(--brand-600)' }}/>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Loading overlay ── */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(249,244,234,0.92)' }}>
          <div className="w-64 text-center glass-panel rounded-[22px] p-8">
            <i className="fa-solid fa-arrows-rotate text-4xl animate-spin mb-4 block" style={{ color: 'var(--brand-500)' }}/>
            <h3 className="text-[18px] font-bold text-slate-900 mb-2">{t('login.overlayTitle')}</h3>
            <p className="text-[12px] text-slate-500 mb-5 transition-opacity duration-300">{loadingTip}</p>
            <div className="h-2 w-full bg-slate-200/70 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'var(--brand-500)', transition: 'width 2s ease-in-out' }}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
