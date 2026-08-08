import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, MapPin, Phone, UserRound, X } from 'lucide-react';

export default function UserProfile({ user, onClose }) {
  const { i18n } = useTranslation();
  const hi = i18n.language?.startsWith('hi');
  const labels = hi
    ? { title: 'मेरी प्रोफ़ाइल', name: 'नाम', mobile: 'मोबाइल नंबर', email: 'ईमेल', location: 'स्थान', profile: 'नागरिक प्रोफ़ाइल', language: 'भाषा', occupation: 'व्यवसाय', income: 'वार्षिक आय', interests: 'रुचियाँ', close: 'बंद करें' }
    : { title: 'My Profile', name: 'Name', mobile: 'Mobile number', email: 'Email', location: 'Location', profile: 'Citizen profile', language: 'Language', occupation: 'Occupation', income: 'Annual income', interests: 'Interests', close: 'Close' };
  const location = [user?.district, user?.state].filter(Boolean).join(', ') || '—';
  const initial = String(user?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={labels.title}>
      <section className="w-full max-w-lg rounded-3xl bg-[#F9F4EA] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--brand-accent))' }}>{initial}</div>
            <div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{labels.profile}</p><h2 className="text-xl font-bold text-slate-900">{labels.title}</h2></div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-white" aria-label={labels.close}><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Info icon={UserRound} label={labels.name} value={user?.name} />
          <Info icon={Phone} label={labels.mobile} value={user?.mobile ? `+91 ${user.mobile}` : '—'} />
          <Info icon={Mail} label={labels.email} value={user?.email || '—'} />
          <Info icon={MapPin} label={labels.location} value={location} />
          <Info label={labels.language} value={user?.language || '—'} />
          <Info label={labels.occupation} value={user?.occupation || '—'} />
          <Info label={labels.income} value={user?.income || '—'} />
          <Info label={labels.interests} value={Array.isArray(user?.interests) && user.interests.length ? user.interests.join(', ') : '—'} />
        </div>
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white/80 p-3"><p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{Icon && <Icon className="h-3.5 w-3.5" />}{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-700">{value || '—'}</p></div>;
}
