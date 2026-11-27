'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Download, Gift, Globe } from 'lucide-react';
import { saveSignupReferral } from './signupAttribution';
import { referralPlayStoreLink } from './shareInvitation';

export function ReferralInvite({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const registration = `/register?ref=${encodeURIComponent(code)}`;
  useEffect(() => { saveSignupReferral(code); }, [code]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setCopyError(''); }
    catch { setCopyError('Select and copy the invitation code from the field.'); }
  };
  return <main className="grid min-h-dvh place-items-center bg-background px-4 py-10 text-foreground">
    <section className="w-full max-w-lg space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
      <Link href="/" className="inline-flex items-center gap-2 font-bold"><img src="/connect-love-logo.png" alt="" className="h-9 w-9 rounded-xl" />Connect Love</Link>
      <div><Gift className="mb-3 h-9 w-9 text-rose-500" /><h1 className="text-2xl font-black">You&apos;ve been invited!</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Register using this invitation to receive your eligible referral reward. You can join on the website or download the app.</p></div>
      <div className="rounded-2xl border border-border p-4"><label htmlFor="invitation-code" className="text-xs font-semibold">Your invitation code</label><div className="mt-2 flex items-center gap-2"><input id="invitation-code" readOnly value={code} onFocus={event => event.target.select()} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm" /><button type="button" onClick={() => void copy()} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-semibold">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy code'}</button></div>{copyError && <p role="status" className="mt-2 text-xs text-muted-foreground">{copyError}</p>}</div>
      <div className="space-y-3">
        <Link href={registration} onClick={() => saveSignupReferral(code)} className="flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 font-bold text-white"><Globe className="h-4 w-4" />Register on website</Link>
        <a href={referralPlayStoreLink(registration)} onClick={() => saveSignupReferral(code)} className="flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 font-semibold"><Download className="h-4 w-4" />Download Android app</a>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">After installing, return to this invitation to register, or enter the invitation code when registering in the app. Rewards are credited after an eligible new account verifies its email.</p>
    </section>
  </main>;
}
