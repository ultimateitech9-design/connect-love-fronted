"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Share2, Wallet, X } from 'lucide-react';
import { ReferralPanel } from './ReferralPanel';
import styles from './ReferralEntry.module.css';

export const isWomanMember = (gender?: string) => ['female', 'woman', 'women', 'girl', 'ladies', 'f'].includes(String(gender || '').trim().toLowerCase());

export function ReferralDialog({ onClose, welcome = false }: { onClose: () => void; welcome?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { ref.current?.close(); document.body.style.overflow = overflow; opener?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} aria-labelledby="referral-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[90dvh] w-[min(94vw,680px)] max-w-none overflow-y-auto overscroll-contain rounded-3xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-slate-950/60">
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-4"><h2 id="referral-dialog-title" className="font-bold">{welcome ? 'Welcome! Share & earn ₹100' : 'Share & earn · Referral wallet'}</h2><button type="button" aria-label="Close referral wallet" onClick={onClose} className="rounded-full bg-muted p-2"><X className="h-5 w-5" /></button></header>
    <div className="p-4 sm:p-6"><ReferralPanel /></div>
  </dialog>;
}

export function ReferralEntry({ gender, compact = false }: { gender?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!isWomanMember(gender)) return null;
  return <>
    <div className={`flex flex-wrap items-center gap-2 ${compact ? 'mt-3' : ''}`} data-testid="women-referral-entry">
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-100"><Share2 className={`${styles.shareIcon} h-4 w-4`} />Share & earn ₹100</button>
      <Link href="/user/referrals" aria-label="Open referral wallet" className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Wallet className="h-4 w-4" />Wallet</Link>
    </div>
    {open && <ReferralDialog onClose={() => setOpen(false)} />}
  </>;
}
