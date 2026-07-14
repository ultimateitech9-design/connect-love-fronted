'use client';
import { useEffect, useState } from 'react';
import { Check, Loader2, ShieldCheck, X, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { activateBoost, getBoostPlans, getBoostStatus, type BoostPlan, type BoostPlanKey } from './api';

const defaults: BoostPlan[] = [
  { key: '30_minutes', name: '30 Minutes Boost', durationMinutes: 30, price: 29, currency: 'INR' },
  { key: '1_hour', name: '1 Hour Boost', durationMinutes: 60, price: 49, currency: 'INR' },
  { key: '3_hours', name: '3 Hours Boost', durationMinutes: 180, price: 99, currency: 'INR' },
  { key: '24_hours', name: '24 Hours Boost', durationMinutes: 1440, price: 249, currency: 'INR' },
];

export function BoostDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [plans, setPlans] = useState(defaults);
  const [selected, setSelected] = useState<BoostPlanKey>('30_minutes');
  const [busy, setBusy] = useState(false);
  const [activeUntil, setActiveUntil] = useState<string | null>(null);
  useEffect(() => { if (open) Promise.all([getBoostPlans(), getBoostStatus()]).then(([p, s]) => { if (p.length) setPlans(p); setActiveUntil(s.boost?.endsAt ?? null); }).catch(() => undefined); }, [open]);
  useEffect(() => { if (!open) return; const close = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', close); document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', close); document.body.style.overflow = ''; }; }, [open, onClose]);
  if (!open) return null;
  const chosen = plans.find((p) => p.key === selected) ?? plans[0];
  const confirm = async () => { setBusy(true); try { const result = await activateBoost(chosen.key, crypto.randomUUID()); setActiveUntil(result.endsAt); toast.success(`${chosen.name} is active`); } catch { toast.error('Boost could not be activated. Please try again.'); } finally { setBusy(false); } };
  return <div role="dialog" aria-modal="true" aria-labelledby="boost-title" className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 p-5 backdrop-blur sm:p-6"><div className="min-w-0"><span className="mb-2 grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Zap className="h-6 w-6" fill="currentColor" /></span><h2 id="boost-title" className="text-xl font-bold text-foreground sm:text-2xl">Boost your profile</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Get priority visibility, more profile views, more likes, and faster match opportunities.</p></div><button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground" aria-label="Close Boost"><X className="h-5 w-5" /></button></header>
      <div className="space-y-5 p-5 sm:p-6">
        {activeUntil && new Date(activeUntil) > new Date() && <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">Boost active until {new Date(activeUntil).toLocaleString()}</div>}
        <div className="grid gap-3 sm:grid-cols-2">{plans.map((p) => <button key={p.key} onClick={() => setSelected(p.key)} aria-pressed={selected === p.key} className={`flex min-w-0 items-center justify-between gap-3 rounded-2xl border p-4 text-left ${selected === p.key ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 dark:bg-amber-950/20' : 'border-border'}`}><span className="min-w-0"><b className="block truncate text-sm text-foreground">{p.name}</b><small className="text-muted-foreground">Priority ranking</small></span><strong className="shrink-0 text-foreground">₹{p.price}</strong></button>)}</div>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">{['Priority profile placement', 'More profile views', 'More chances of likes', 'Stack with an active Boost'].map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-emerald-500" />{x}</li>)}</ul>
        <button disabled={busy} onClick={confirm} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 font-bold text-slate-950 disabled:opacity-60">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" fill="currentColor" />}{busy ? 'Activating…' : `Activate ${chosen.name} · ₹${chosen.price}`}</button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />Secure purchase · Boost starts immediately</p>
      </div>
    </div>
  </div>;
}
