import React, { useEffect, useRef, useState } from 'react';

const INTERESTS = [
  { key: 'education', icon: 'fa-graduation-cap', label: 'Education' },
  { key: 'agriculture', icon: 'fa-seedling',     label: 'Agriculture' },
  { key: 'housing',    icon: 'fa-house',          label: 'Housing' },
  { key: 'jobs',       icon: 'fa-briefcase',      label: 'Jobs' },
  { key: 'health',     icon: 'fa-heart-pulse',    label: 'Health' },
  { key: 'startup',    icon: 'fa-rocket',         label: 'Startup' },
];

export default function RegisterPage({ onBack, onSubmit, onLogin }) {
  const cursorGlowRef    = useRef(null);
  const parallaxOrbsRef  = useRef(null);
  const parallaxGridRef  = useRef(null);
  const parallaxLinesRef = useRef(null);

  const [form, setForm] = useState({
    name: '', mobile: '', email: '', language: 'English',
    state: '', district: '', age: '', gender: 'Female',
    occupation: 'Student', income: 'Below 1 Lakh',
  });
  const [selected, setSelected] = useState(['education', 'health']);
  const [loading, setLoading] = useState(false);

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
  const toggleInterest = (key) => setSelected(s => s.includes(key) ? s.filter(k => k !== key) : [...s, key]);
  const handleSubmit = () => { setLoading(true); setTimeout(() => { setLoading(false); onSubmit(); }, 900); };

  const inputStyle = { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', boxShadow: '0 2px 6px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(0,0,0,0.04)' };

  return (
    <div className="relative h-screen overflow-hidden flex antialiased" style={{ backgroundColor: '#F9F4EA', color: '#0F172A' }}>
      <div className="bg-grain" />
      <div ref={parallaxOrbsRef} className="fixed pointer-events-none overflow-hidden z-[-3]"
        style={{ inset: 0, width: '110%', height: '110%', left: '-5%', top: '-5%', willChange: 'transform', transition: 'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }}>
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>
      <div ref={parallaxGridRef} className="bg-grid" style={{ willChange: 'transform', transition: 'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }} />
      <div ref={parallaxLinesRef} className="bg-lines" style={{ willChange: 'transform', transition: 'transform 0.1s cubic-bezier(0.2,0,0.2,1)' }} />
      <div ref={cursorGlowRef} style={{ position: 'fixed', top: 0, left: 0, width: 600, height: 600, borderRadius: '50%', pointerEvents: 'none', zIndex: -2, willChange: 'transform', opacity: 0, transition: 'opacity 0.3s ease', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(220,161,161,0.15) 0%, rgba(220,161,161,0) 60%)' }} />

      {/* LEFT PANEL */}
      <main className="w-full lg:w-1/2 h-full overflow-y-auto px-6 py-10 lg:px-[60px] flex flex-col gap-8 relative z-10 pb-32">
        <header className="flex flex-col gap-2 animate-fade-in-up opacity-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-12 h-12 rounded-[14px] bg-gradient-to-br from-brand-600 via-brand-500 to-brand-accent flex items-center justify-center shadow-lg shadow-brand-500/30 overflow-hidden">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5.5 19V6.5C5.5 5.67 6.17 5 7 5H8.5C9.33 5 10 5.67 10 6.5V14.5L14.7 5.25C15.1 4.45 15.9 4 16.8 4H17C17.83 4 18.5 4.67 18.5 5.5V19C18.5 19.83 17.83 20.5 17 20.5H15.5C14.67 20.5 14 19.83 14 19V10L8.8 19.75C8.4 20.55 7.6 21 6.7 21H6.5C5.67 21 5.5 20.33 5.5 19Z" fill="white"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[26px] font-bold tracking-tight text-slate-900 leading-none" style={{ letterSpacing: '-0.03em' }}>Nayanta</span>
              <span className="text-[10.5px] font-semibold text-slate-500/80 mt-1 tracking-wide uppercase">Government Guide</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full w-max mb-1 shadow-sm border border-slate-200/60">
            <i className="fa-solid fa-sparkles text-brand-500 text-[13px] animate-pulse-slow" />
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-700">AI Personalized Recommendations</span>
          </div>
          <h1 className="text-[32px] sm:text-[38px] font-extrabold leading-[1.1] tracking-tight text-slate-900">
            Complete your <span className="text-gradient">profile</span>
          </h1>
          <p className="text-[15px] text-slate-500 leading-relaxed max-w-md font-medium">
            We'll personalize government schemes, documents and services for you in under a minute.
          </p>
        </header>

        {/* Stepper */}
        <div className="flex items-center gap-4 animate-fade-in-up opacity-0 delay-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[12px] shadow-sm shadow-brand-500/40">1</div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Basic Details</span>
          </div>
          <div className="w-8 h-[2px] bg-slate-200 rounded-full" />
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center font-bold text-[12px]">2</div>
            <span className="text-[11px] font-bold uppercase tracking-wider">Citizen Profile</span>
          </div>
        </div>

        {/* Personal Details */}
        <div className="glass-panel rounded-[24px] p-6 flex flex-col gap-4 animate-fade-in-up opacity-0 delay-200 hover:-translate-y-0.5 hover:shadow-float-hover transition-all duration-300">
          <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-200/60 pb-4">
            <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <i className="fa-solid fa-user text-[14px]" />
            </span>
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
              <div className="relative"><i className="fa-solid fa-id-badge absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                <input type="text" value={form.name} onChange={set('name')} placeholder="Enter your name as per Aadhaar" className="w-full rounded-[14px] py-3 pl-10 pr-3 text-[14px] text-slate-800 outline-none" style={inputStyle} /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mobile Number *</label>
              <div className="relative"><i className="fa-solid fa-mobile-screen absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                <input type="tel" inputMode="numeric" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g,'').slice(0,10) }))} placeholder="+91" className="w-full rounded-[14px] py-3 pl-10 pr-3 text-[14px] text-slate-800 outline-none" style={inputStyle} /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email ID (Optional)</label>
              <div className="relative"><i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="For important updates" className="w-full rounded-[14px] py-3 pl-10 pr-3 text-[14px] text-slate-800 outline-none" style={inputStyle} /></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Preferred Language</label>
              <div className="relative"><i className="fa-solid fa-language absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[15px]" />
                <select value={form.language} onChange={set('language')} className="w-full rounded-[14px] py-3 pl-10 pr-8 text-[14px] text-slate-800 appearance-none outline-none" style={inputStyle}>
                  <option>English</option><option>Hindi (हिंदी)</option><option>Marathi (मराठी)</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] pointer-events-none" /></div>
            </div>
          </div>
        </div>

        {/* Citizen Profile */}
        <div className="glass-panel rounded-[24px] p-6 flex flex-col gap-4 animate-fade-in-up opacity-0 delay-300 hover:-translate-y-0.5 hover:shadow-float-hover transition-all duration-300">
          <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-200/60 pb-4">
            <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100">
              <i className="fa-solid fa-id-card text-[14px]" />
            </span>
            Citizen Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {[['State *', 'state', ['Select State','Maharashtra','Karnataka','Delhi','Tamil Nadu','Uttar Pradesh','Gujarat']],
              ['District *', 'district', ['Select District','Pune','Mumbai','Nagpur']],
            ].map(([label, key, opts]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                <select value={form[key]} onChange={set(key)} className="w-full rounded-[14px] p-3 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Age *</label>
              <input type="number" value={form.age} onChange={set('age')} placeholder="Years" className="w-full rounded-[14px] p-3 text-[14px] text-slate-800 outline-none" style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gender *</label>
              <select value={form.gender} onChange={set('gender')} className="w-full rounded-[14px] p-3 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="h-[1px] w-full bg-slate-200/60 my-1" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Occupation</label>
              <select value={form.occupation} onChange={set('occupation')} className="w-full rounded-[14px] p-3 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                <option>Student</option><option>Farmer</option><option>Self-Employed</option><option>Salaried</option><option>Business</option><option>Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Annual Income</label>
              <select value={form.income} onChange={set('income')} className="w-full rounded-[14px] p-3 text-[14px] text-slate-800 outline-none" style={inputStyle}>
                <option>Below 1 Lakh</option><option>1 - 5 Lakhs</option><option>Above 5 Lakhs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Areas of Interest */}
        <div className="flex flex-col gap-3 animate-fade-in-up opacity-0 delay-400">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Areas of Interest (Select multiple)</label>
          <div className="flex flex-wrap gap-2.5">
            {INTERESTS.map(({ key, icon, label }) => {
              const active = selected.includes(key);
              return (
                <button key={key} type="button" onClick={() => toggleInterest(key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium shadow-sm border transition-all duration-200"
                  style={active ? { background: 'linear-gradient(135deg, #c68d8d 0%, #dca1a1 100%)', color: '#ffffff', borderColor: 'transparent', boxShadow: '0 8px 20px -6px rgba(198,141,141,0.5)' } : { background: '#ffffff', color: '#334155', borderColor: '#e2e8f0' }}>
                  <i className={`fa-solid ${icon} text-[14px]`} /> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trust strip */}
        <div className="glass-panel rounded-[18px] p-4 flex flex-col md:flex-row gap-4 items-center justify-center text-center md:text-left animate-fade-in-up opacity-0 delay-400">
          <div className="flex gap-4 text-brand-600 flex-shrink-0 text-[22px]">
            <i className="fa-solid fa-lock" /><i className="fa-solid fa-file-lines" /><i className="fa-solid fa-robot" />
          </div>
          <p className="text-[13px] text-slate-500 leading-relaxed">Your data is securely encrypted. We only use this information to find relevant schemes through our AI matching engine. No spam, ever.</p>
        </div>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 w-full lg:w-1/2 border-t border-slate-200/60 px-6 py-4 lg:px-[60px] flex justify-between items-center z-20"
        style={{ background: 'rgba(249,244,234,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 -10px 30px rgba(0,0,0,0.03)' }}>
        <button type="button" onClick={onLogin} className="text-[14px] font-medium text-brand-600 hover:text-brand-900 transition-colors">
          Already have an account? Login
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="bg-brand-600 text-white hover:bg-brand-500 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-[15px] font-semibold px-6 py-3 rounded-[16px] shadow-md shadow-brand-500/25 flex items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Creating...' : 'Create My Profile'}
          {!loading && <i className="fa-solid fa-arrow-right text-[15px] group-hover:translate-x-1 transition-transform" />}
          {loading && <i className="fa-solid fa-circle-notch animate-spin text-[15px]" />}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <aside className="hidden lg:flex w-1/2 h-full relative overflow-hidden flex-col items-center justify-center p-10 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-brand-50/40 z-0" />
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0 animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="relative z-10 w-full max-w-lg flex flex-col gap-8 items-center animate-fade-in-up opacity-0 delay-200">
          <div className="w-full h-80 rounded-[24px] overflow-hidden shadow-float relative bg-white border border-white/60">
            <img src="https://lh3.googleusercontent.com/aida/AP1WRLtjLbWvRGjYNZLYM66wW6FxF6RParNvJr8bB-82HfT0sjmMKZX64d0dBmVz0gqhtTj2SuFhMOaiTU0BsaBg3g6nqliINi_DWwhz3wxH0GO5xKZqBxOIEl5WHQnoVTKVfo4_D9uOIGXtJmtdsqz5c_Fq3iri9tNjd973sbdQTma9hdpmFGs6zwZ_1qcOrB2tGspigQvsrZzh7L8_u4DzaOPpsVGzgcEKe3VctIWWtKou7xwG91x28Hw1WJ0" alt="Citizens" className="w-full h-full object-cover" />
          </div>
          <div className="w-full grid grid-cols-2 gap-4">
            {[
              { icon: 'fa-magnifying-glass', title: 'Discover Schemes', desc: 'AI finds 100+ matching central & state schemes instantly.' },
              { icon: 'fa-circle-check',     title: 'Check Eligibility', desc: 'Know exactly what you qualify for before applying.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="glass-panel rounded-[20px] p-4 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-float-hover transition-all duration-300 cursor-default">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-1 border border-brand-100">
                  <i className={`fa-solid ${icon} text-[16px]`} />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
            <div className="glass-panel rounded-[20px] p-4 flex flex-row items-center gap-4 col-span-2 hover:-translate-y-0.5 hover:shadow-float-hover transition-all duration-300 cursor-default">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0 border border-brand-100">
                <i className="fa-solid fa-folder-open text-[16px]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">Know Required Documents</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed">Get a personalized checklist of documents needed for your applications.</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
