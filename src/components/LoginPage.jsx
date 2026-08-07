import React, { useEffect, useRef, useState } from 'react';

const HIGHLIGHTS = [
  '3 new scholarship schemes added',
  'Housing subsidy applications open',
  'Check your pension eligibility',
];

const SUBTITLES = [
  'Discover government schemes faster',
  'Know your eligibility instantly',
  'Simplify application processes',
];

const LOGIN_STEPS = [
  'Checking profile...',
  'Matching citizen information...',
  'Preparing personalized dashboard...',
];

export default function LoginPage({ onBack, onLogin, onRegister }) {
  const cursorGlowRef    = useRef(null);
  const parallaxOrbsRef  = useRef(null);
  const parallaxGridRef  = useRef(null);
  const parallaxLinesRef = useRef(null);

  const [mobile, setMobile]             = useState('');
  const [remember, setRemember]         = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [subtitleIdx, setSubtitleIdx]   = useState(0);
  const [highlightOut, setHighlightOut] = useState(false);
  const [subtitleOut, setSubtitleOut]   = useState(false);
  const [btnLabel, setBtnLabel]         = useState('Login');
  const [btnSpin, setBtnSpin]           = useState(false);
  const [btnCheck, setBtnCheck]         = useState(false);
  const [btnSuccess, setBtnSuccess]     = useState(false);
  const [showOverlay, setShowOverlay]   = useState(false);
  const [progress, setProgress]         = useState(0);
  const [loadingTip, setLoadingTip]     = useState('Checking eligibility...');
  const [busy, setBusy]                 = useState(false);

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

  useEffect(() => {
    const id = setInterval(() => {
      setHighlightOut(true);
      setTimeout(() => { setHighlightIdx(i => (i + 1) % HIGHLIGHTS.length); setHighlightOut(false); }, 500);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setSubtitleOut(true);
      setTimeout(() => { setSubtitleIdx(i => (i + 1) % SUBTITLES.length); setSubtitleOut(false); }, 500);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handleMobile = (e) => { const v = e.target.value.replace(/\D/g,''); setMobile(v.slice(0,10)); };

  const handleLogin = () => {
    if (busy) return;
    setBusy(true); let step = 0; setBtnSpin(true); setBtnLabel(LOGIN_STEPS[0]);
    const seq = setInterval(() => {
      step++;
      if (step < LOGIN_STEPS.length) { setBtnLabel(LOGIN_STEPS[step]); }
      else {
        clearInterval(seq); setBtnSpin(false); setBtnCheck(true); setBtnSuccess(true); setBtnLabel('Login Successful');
        setTimeout(() => {
          setShowOverlay(true);
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => setLoadingTip('Loading saved recommendations...'), 1000);
            setTimeout(() => {
              setShowOverlay(false); setProgress(0); setBtnLabel('Login'); setBtnSpin(false);
              setBtnCheck(false); setBtnSuccess(false); setBusy(false); setLoadingTip('Checking eligibility...');
              onLogin(remember);
            }, 2000);
          }, 100);
        }, 500);
      }
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-x-hidden antialiased" style={{ backgroundColor: '#F9F4EA', color: '#0F172A' }}>
      <div className="bg-grain" />
      <div ref={parallaxOrbsRef} className="fixed pointer-events-none overflow-hidden z-[-3]"
        style={{ inset:0,width:'110%',height:'110%',left:'-5%',top:'-5%',willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}>
        <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
      </div>
      <div ref={parallaxGridRef} className="bg-grid" style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={parallaxLinesRef} className="bg-lines" style={{ willChange:'transform',transition:'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}/>
      <div ref={cursorGlowRef} style={{ position:'fixed',top:0,left:0,width:600,height:600,borderRadius:'50%',pointerEvents:'none',zIndex:-2,willChange:'transform',opacity:0,transition:'opacity 0.3s ease',transform:'translate(-50%,-50%)',background:'radial-gradient(circle,rgba(220,161,161,0.15) 0%,rgba(220,161,161,0) 60%)' }}/>

      {/* LEFT PANEL */}
      <div className="w-full lg:w-[45%] min-h-screen flex flex-col relative z-10 px-10 lg:px-24 py-16">
        <div className="mb-12 animate-fade-in-up opacity-0">
          <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-brand-600 transition-colors">
            <i className="fa-solid fa-arrow-left text-[11px]"/> Back to home
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-10 h-10 rounded-[12px] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-accent flex items-center justify-center shadow-lg shadow-brand-500/30 overflow-hidden">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="relative z-10">
                <path d="M5.5 19V6.5C5.5 5.67157 6.17157 5 7 5H8.5C9.32843 5 10 5.67157 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.8284 4 18.5 4.67157 18.5 5.5V19C18.5 19.8284 17.8284 20.5 17 20.5H15.5C14.6716 20.5 14 19.8284 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67157 21 5.5 20.3284 5.5 19Z" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-bold tracking-tight text-slate-900 leading-none" style={{letterSpacing:'-0.03em'}}>Nayanta</span>
              <span className="text-[10.5px] font-semibold text-slate-500/80 mt-0.5 tracking-wide uppercase">Government Guide</span>
            </div>
          </div>
          <h1 className="text-[36px] sm:text-[42px] font-extrabold leading-[1.1] tracking-tight text-slate-900 mb-3">Welcome back 👋</h1>
          <p className="text-[15px] text-slate-500 max-w-md leading-relaxed font-medium">Continue exploring government schemes personalized for you.</p>
        </div>

        {/* Glass card */}
        <div className="animate-fade-in-up opacity-0 delay-100 glass-panel rounded-[28px] p-8 relative w-full max-w-md shadow-glass transition-transform duration-300 hover:shadow-float-hover">
          <div className="absolute top-6 right-6">
            <button className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-brand-600 transition-colors">
              <i className="fa-solid fa-globe text-[14px]"/><span>English</span><i className="fa-solid fa-chevron-down text-[10px] opacity-60"/>
            </button>
          </div>
          <div className="mb-6">
            <label className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">Mobile Number</label>
            <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-[16px] h-14 px-5 shadow-input transition-all focus-within:shadow-input-focus relative">
              <span className="text-slate-500 text-[15px] font-medium mr-2">+91</span>
              <input type="tel" inputMode="numeric" value={mobile} onChange={handleMobile} placeholder="Enter mobile number" className="w-full bg-transparent border-none focus:outline-none text-slate-800 text-[15px]"/>
              {mobile.length >= 10 && (
                <svg className="w-5 h-5 text-emerald-500 absolute right-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray:50,strokeDashoffset:0,transition:'stroke-dashoffset 0.4s ease' }}/>
                </svg>
              )}
            </div>
            <p className="text-[12px] text-brand-600/80 mt-2">Registered mobile number used during profile creation.</p>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="remember-me" checked={remember} onChange={()=>setRemember(r=>!r)} className="w-4 h-4 text-brand-600 bg-white border-slate-300 rounded focus:ring-brand-500 focus:ring-2"/>
              <label htmlFor="remember-me" className="text-[13px] text-slate-500 font-medium cursor-pointer">Keep me signed in on this device</label>
            </div>
          </div>
          <div className="mb-6 bg-brand-50/70 border border-brand-100 rounded-[14px] p-3 h-[48px] flex items-center overflow-hidden">
            <i className="fa-solid fa-bell text-brand-500 text-[15px] mr-2 flex-shrink-0"/>
            <p className="text-[13px] font-medium text-brand-700 transition-all duration-500" style={{ opacity:highlightOut?0:1,transform:highlightOut?'translateY(-8px)':'translateY(0)' }}>
              {HIGHLIGHTS[highlightIdx]}
            </p>
          </div>
          <button onClick={handleLogin} disabled={busy}
            className={`w-full text-white text-[13px] font-bold uppercase tracking-wider rounded-full py-4 transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${btnSuccess?'bg-emerald-500':'bg-brand-600 hover:bg-brand-500 hover:-translate-y-0.5'} ${busy?'pointer-events-none':''}`}>
            <span>{btnLabel}</span>
            {btnSpin&&<i className="fa-solid fa-arrows-rotate animate-spin text-[13px]"/>}
            {btnCheck&&!btnSpin&&<i className="fa-solid fa-check text-[13px]"/>}
            {!btnSpin&&!btnCheck&&<i className="fa-solid fa-arrow-right text-[13px]"/>}
          </button>
          <div className="flex justify-center gap-6 mt-8 border-t border-slate-200/60 pt-6">
            <button onClick={onRegister} className="text-[13px] font-medium text-slate-500 hover:text-brand-600 transition-colors">Create New Account</button>
            <a href="#" className="text-[13px] font-medium text-slate-500 hover:text-brand-600 transition-colors">Need Help?</a>
          </div>
        </div>
        <div className="mt-8 max-w-md animate-fade-in-up opacity-0 delay-200">
          <p className="text-[13px] text-slate-500 leading-relaxed text-center px-4 font-medium">Sign in to access your saved schemes, personalized recommendations, eligibility history, and document checklists.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden lg:flex w-[55%] min-h-screen flex-col p-12 py-16 border-l border-slate-200/50 z-10 relative">
        <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full">
          <div className="mb-10 text-center animate-fade-in-up opacity-0 delay-100">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm border border-slate-200/60">
              <i className="fa-solid fa-sparkles text-brand-500 text-[13px] animate-pulse-slow"/>
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-700">AI-Powered <span className="text-slate-300 mx-1">•</span> Citizen First</span>
            </div>
            <h2 className="text-[30px] sm:text-[34px] font-extrabold leading-[1.15] tracking-tight text-slate-900 mb-4">
              Your Personal Government{' '}
              <span style={{ background:'linear-gradient(135deg,#c68d8d 0%,#b87777 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
                Scheme Assistant
              </span>
            </h2>
            <div className="relative h-[28px] overflow-hidden">
              <p className="text-[15px] text-slate-500 max-w-lg mx-auto font-medium transition-all duration-500"
                style={{ opacity:subtitleOut?0:1,transform:subtitleOut?'translateY(10px)':'translateY(0)' }}>
                {SUBTITLES[subtitleIdx]}
              </p>
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center relative w-full mb-12 min-h-[300px] animate-fade-in-up opacity-0 delay-200">
            <img src="https://lh3.googleusercontent.com/aida/AP1WRLtjLbWvRGjYNZLYM66wW6FxF6RParNvJr8bB-82HfT0sjmMKZX64d0dBmVz0gqhtTj2SuFhMOaiTU0BsaBg3g6nqliINi_DWwhz3wxH0GO5xKZqBxOIEl5WHQnoVTKVfo4_D9uOIGXtJmtdsqz5c_Fq3iri9tNjd973sbdQTma9hdpmFGs6zwZ_1qcOrB2tGspigQvsrZzh7L8_u4DzaOPpsVGzgcEKe3VctIWWtKou7xwG91x28Hw1WJ0"
              alt="Citizens interacting with digital government services"
              className="object-contain w-full h-full max-h-[50vh] drop-shadow-sm mix-blend-multiply"/>
            <div className="absolute bottom-4 right-4 px-4 py-2 rounded-2xl rounded-br-sm shadow-lg flex items-center gap-2 cursor-pointer hover:shadow-xl transition-shadow animate-float"
              style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.75) 0%,rgba(255,255,255,0.55) 100%)',backdropFilter:'blur(18px)',border:'1px solid rgba(255,255,255,0.6)' }}>
              <span className="text-xl">🤖</span>
              <span className="text-[13px] font-semibold text-slate-800">Hello! Need help?</span>
            </div>
          </div>

          <div className="glass-panel rounded-[24px] p-6 mb-8 shadow-glass animate-fade-in-up opacity-0 delay-300">
            <ul className="space-y-4">
              {[
                { icon:'fa-shield-halved', text:'Personalized recommendations based on your saved profile.' },
                { icon:'fa-file-lines',    text:'Information is sourced from official government portals.' },
                { icon:'fa-wand-magic-sparkles', text:'AI explains schemes in simple language.' },
                { icon:'fa-triangle-exclamation', text:'Final applications are always completed on official government websites.' },
              ].map(({icon,text},i)=>(
                <li key={i} className="flex items-start gap-3 p-2 rounded-lg border border-transparent hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                  <i className={`fa-solid ${icon} text-brand-500 mt-0.5 text-[18px]`}/>
                  <span className="text-[14px] text-slate-600 font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center mt-auto">
            <p className="text-[12px] text-slate-400 px-8 font-medium">We guide you through government services. Final applications are always submitted on official government portals.</p>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm" style={{ backgroundColor:'rgba(249,244,234,0.9)' }}>
          <div className="w-64 text-center glass-panel rounded-[24px] p-8 shadow-glass">
            <div className="mb-4 flex items-center justify-center h-12">
              <i className="fa-solid fa-arrows-rotate text-4xl text-brand-500 animate-spin"/>
            </div>
            <h3 className="text-[20px] font-bold text-slate-900 mb-2 tracking-tight">Preparing Dashboard...</h3>
            <p className="text-[13px] text-slate-500 mb-6 font-medium transition-opacity duration-300">{loadingTip}</p>
            <div className="h-2 w-full bg-slate-200/70 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width:`${progress}%`,transition:'width 2s ease-in-out' }}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
