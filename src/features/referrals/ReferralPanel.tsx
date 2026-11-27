"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Gift, Loader2, Share2, Wallet } from 'lucide-react';
import { directFetch } from '@/lib/api';
import { referralInvitationText, referralShareLink } from './shareInvitation';

type Summary = {
  rewardPaise?: number; referralGroup?: 'men' | 'women'; withdrawalStepPaise?: number;
  sharePath: string; availablePaise: number; lockedPaise: number; totalEarnedPaise: number;
  pendingWithdrawalPaise: number; paidPaise: number; invitedCount: number; activeDays: number | null; bonusEarned: boolean;
  rewards: { id: string; kind: string; amountPaise: number; unlockAt: string; status: string }[];
  withdrawals: { id: string; amountPaise: number; status: string; createdAt: string }[];
  minimumWithdrawalPaise: number;
  successfulReferrals: number;
  referrals: { id: string; memberName: string; registeredAt: string; rewardPaise: number; unlockAt: string | null }[];
  referralsHasMore?: boolean;
  referralsNextPage?: number;
};
type Account = { id: string; method: string; upiId?: string; bankName?: string; accountNumberMasked?: string };
const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(paise / 100);
const date = (value: string) => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const field = 'w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-rose-300';

export function ReferralPanel() {
  const [data, setData] = useState<Summary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('1000');
  const [upi, setUpi] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [reviewWithdrawal, setReviewWithdrawal] = useState(false);
  const request = useRef<string | null>(null);
  const submitting = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(false);
  const refreshSequence = useRef(0);
  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    const value = await directFetch<Summary>('/referrals/me');
    if (mounted.current && sequence === refreshSequence.current) setData(value);
  }, []);
  useEffect(() => {
    let active = true;
    mounted.current = true;
    Promise.all([refresh(), directFetch<{ accounts: Account[] } | Account[]>('/wallet/payout-accounts')]).then(([, saved]) => {
      if (!active) return;
      const list = Array.isArray(saved) ? saved : saved.accounts;
      setAccounts(list || []); setAccountId(list?.[0]?.id || '');
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Referral wallet could not be loaded.'); })
      .finally(() => { if (active) setLoading(false); });
    const onFocus = () => { if (document.visibilityState === 'visible') void refresh().catch(() => {}); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('connect-love-referral-changed', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    // Recover missed events while a wallet remains open, without reloading the page.
    const timer = setInterval(onFocus, 10000);
    return () => {
      active = false; mounted.current = false; refreshSequence.current++;
      clearInterval(timer); clearTimeout(copyTimer.current);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('connect-love-referral-changed', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh]);
  const shareLink = data ? referralShareLink(data.sharePath) : '';
  const reward = data?.rewardPaise ?? 10000;
  const men = data?.referralGroup === 'men';
  const withdrawalStep = data?.withdrawalStepPaise ?? 5000;
  const balance = (data?.availablePaise || 0) + (data?.lockedPaise || 0);
  const minimum = data?.minimumWithdrawalPaise || 100000;
  const requestedPaise = Number(amount) * 100;
  const validAmount = Number.isInteger(requestedPaise) && requestedPaise >= minimum && requestedPaise % withdrawalStep === 0;
  const canConfirmWithdrawal = validAmount && !!accountId && requestedPaise <= (data?.availablePaise || 0);
  const copy = async (value = shareLink) => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(value); setCopied(true);
      clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch { setError('Copy the invitation link from the field above.'); }
  };
  const share = async () => {
    if (!shareLink || sharing) return;
    setSharing(true); setError('');
    try {
      // A single text payload keeps the message and clickable link together in
      // WhatsApp and targets that ignore the Web Share API's separate URL field.
      const text = referralInvitationText(shareLink, reward);
      if (navigator.share) await navigator.share({ title: 'Join me on Connect Love', text });
      else await copy(text);
    } catch (reason) { if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError('Sharing could not open. Copy the link instead.'); }
    finally { setSharing(false); }
  };
  const addUpi = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const saved = await directFetch<Account>('/wallet/payout-accounts', { method: 'POST', body: JSON.stringify({ method: 'upi', upiId: upi }) });
      setAccounts(current => [...current, saved]); setAccountId(saved.id); setUpi(''); setReviewWithdrawal(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'UPI account could not be saved.'); }
    finally { setBusy(false); }
  };
  const review = () => {
    setError(''); setNotice('');
    if (!validAmount) return setError(`Minimum withdrawal is ${money(minimum)}, in multiples of ${money(withdrawalStep)}.`);
    if (requestedPaise > balance) return setError('The amount cannot exceed your referral balance.');
    if (!accountId) return setError('Select or add a payout account first.');
    setReviewWithdrawal(true);
  };
  const withdraw = async () => {
    if (submitting.current || !data) return;
    const paise = Number(amount) * 100;
    if (!reviewWithdrawal || !canConfirmWithdrawal) return;
    submitting.current = true; setBusy(true); setError(''); setNotice('');
    request.current ||= crypto.randomUUID();
    try {
      const result = await directFetch<{ status: string }>('/referrals/withdrawals', { method: 'POST', body: JSON.stringify({ requestId: request.current, amountPaise: paise, accountId }) });
      request.current = null;
      setReviewWithdrawal(false);
      setNotice(result.status === 'completed' ? 'This withdrawal has already been paid.' : result.status === 'rejected' ? 'This request was rejected. Your reward balance has been returned.' : 'Withdrawal requested. The team will transfer your money and update the status.');
      await refresh(); window.dispatchEvent(new Event('connect-love-wallet-changed'));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Withdrawal could not be submitted.'); }
    finally { submitting.current = false; setBusy(false); }
  };

  const moreAccounts = async () => {
    if (!data || loadingAccounts) return;
    setLoadingAccounts(true);
    try {
      const result = await directFetch<{ items: Summary['referrals']; hasMore: boolean; nextPage: number }>(`/referrals/accounts?page=${data.referralsNextPage || 1}`);
      setData(current => current ? { ...current, referrals: [...new Map([...current.referrals, ...result.items].map(row => [row.id, row])).values()], referralsHasMore: result.hasMore, referralsNextPage: result.nextPage } : current);
    } catch { setError('More referred accounts could not be loaded. Please try again.'); }
    finally { setLoadingAccounts(false); }
  };

  if (loading) return <p role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading referral wallet...</p>;
  if (!data) return <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error || 'Referral rewards are available to active men and women members.'}</p>;
  return <div className="space-y-5">
    <section className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-5 text-slate-800">
      <Gift className="mb-2 h-7 w-7 text-rose-500" /><h2 className="text-xl font-black">Invite a {men ? 'man' : 'woman'}. Both get {money(reward)}.</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Every new {men ? 'man' : 'woman'} who registers using your link and verifies their email earns {money(reward)} for you and {money(reward)} for themselves. Only {men ? 'male' : 'female'} signups through your link earn these rewards.</p>
      <p className="mt-2 text-sm font-semibold text-rose-700">Extra {money(reward)} for the invited member when they use the app on 30 different days.</p>
      <p className="mt-2 text-xs text-slate-500">Sharing or clicking alone does not earn money. Each new member can use one invitation.</p>
      <label className="mt-4 block text-xs font-semibold">Your invitation link<input readOnly aria-label="Your referral link" value={shareLink} className={`${field} mt-1.5 bg-white font-normal`} onFocus={event => event.target.select()} /></label>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={sharing} onClick={() => void share()} className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-bold text-white"><Share2 className="h-4 w-4" />{sharing ? 'Opening...' : 'Share invitation'}</button><button type="button" onClick={() => void copy()} className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy link'}</button></div>
    </section>
    <p className="text-sm text-muted-foreground">Your referral balance is <strong className="text-foreground">{money(balance)}</strong>. Minimum withdrawal: <strong>{money(minimum)}</strong>.</p>
    <section aria-label="Referral balances" className="grid grid-cols-2 gap-3">{[['Referral balance', balance], ['Total earned', data.totalEarnedPaise], ['Withdrawal pending', data.pendingWithdrawalPaise], ['Already paid', data.paidPaise]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-black">{money(Number(value))}</p></div>)}</section>
    <section aria-label="Successful referrals" className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4"><h3 className="font-bold">{men ? 'Male' : 'Female'} signups through your link: {data.successfulReferrals ?? data.invitedCount}</h3><p className="mt-1 text-sm text-muted-foreground">{money(reward)} per eligible account · Total referral wallet earnings: {money(data.totalEarnedPaise)}</p>{!!data.referrals?.length && <ul className="mt-3 max-h-60 divide-y divide-border overflow-y-auto">{data.referrals.map(row => <li key={row.id} className="flex justify-between gap-3 py-3 text-sm"><div className="min-w-0"><p className="break-words font-semibold">{row.memberName}</p><p className="mt-1 text-xs text-muted-foreground">Registered {date(row.registeredAt)}</p></div><strong className="shrink-0">{money(row.rewardPaise)}</strong></li>)}</ul>}</section>
    {data.referralsHasMore && <button type="button" disabled={loadingAccounts} onClick={() => void moreAccounts()} className="text-sm font-semibold text-rose-600">{loadingAccounts ? 'Loading accounts...' : 'Load more referred accounts'}</button>}
    {data.activeDays !== null && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><p className="text-sm font-bold">{data.bonusEarned ? `${money(reward)} activity bonus earned!` : `Activity bonus: ${Math.min(data.activeDays, 30)} / 30 active days`}</p><p className="mt-1 text-xs">One active day per India calendar date. Days need not be consecutive.</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100"><div className="h-full bg-amber-500" style={{ width: `${Math.min(data.activeDays, 30) / 30 * 100}%` }} /></div></div>}
    <section className="rounded-2xl border border-border p-4"><h3 className="flex items-center gap-2 font-bold"><Wallet className="h-4 w-4 text-emerald-600" />Withdraw referral rewards</h3><p className="mt-1 text-xs text-muted-foreground">Minimum withdrawal: {money(minimum)}. Enter the amount and select your bank or UPI account to review your request.</p>
      <fieldset disabled={busy} className="mt-4 space-y-3">
        <label className="block text-xs font-semibold">Amount (₹)<input type="number" min={minimum / 100} step={withdrawalStep / 100} value={amount} onChange={event => { setAmount(event.target.value); request.current = null; setReviewWithdrawal(false); }} className={`${field} mt-1`} /></label>
        {!!accounts.length && <label className="block text-xs font-semibold">Payout account<select aria-label="Referral payout account" value={accountId} onChange={event => { setAccountId(event.target.value); request.current = null; setReviewWithdrawal(false); }} className={`${field} mt-1`}>{accounts.map(account => <option key={account.id} value={account.id}>{account.method === 'upi' ? account.upiId : `${account.bankName || 'Bank'} · ${account.accountNumberMasked || 'saved account'}`}</option>)}</select></label>}
        {!accounts.length && <div className="space-y-2"><input aria-label="UPI ID for referral withdrawal" value={upi} onChange={event => setUpi(event.target.value)} placeholder="UPI ID, e.g. name@upi" className={field} /><button type="button" onClick={() => void addUpi()} disabled={!upi.trim()} className="text-sm font-semibold text-rose-600">Save UPI account</button></div>}
        <Link href="/user/withdraw" className="inline-block text-xs font-semibold text-rose-600 underline">Manage bank / UPI accounts</Link>
        <button type="button" disabled={busy || !accountId || balance < minimum} onClick={review} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">Request withdrawal</button>
        {reviewWithdrawal && <section role="region" aria-label="Withdrawal review" className={`space-y-3 rounded-xl border p-4 text-sm ${canConfirmWithdrawal ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
          <h4 className="font-bold">Review withdrawal — {money(requestedPaise)}</h4>
          {canConfirmWithdrawal ? <p role="status">Your rewards are eligible. You can request withdrawal now.</p> : <>
            <p>Referral signup rewards can be withdrawn 30 days after registration. Submitting this request does not start a new waiting period.</p>
            <p className="text-xs">Activity bonuses keep the original reward's unlock date, with no extra waiting period.</p>
            <p role="status">There are not enough eligible rewards for this amount yet. Rewards in their 30-day waiting period cannot be withdrawn.</p>
          </>}
          <p>Eligible to withdraw now: <strong>{money(data.availablePaise)}</strong>.</p>
          <div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !canConfirmWithdrawal} onClick={() => void withdraw()} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 font-bold text-white disabled:opacity-40">{busy && <Loader2 className="h-4 w-4 animate-spin" />}Confirm withdrawal</button><button type="button" disabled={busy} onClick={() => setReviewWithdrawal(false)} className="rounded-full border border-amber-300 px-4 py-2 font-semibold">Back to form</button></div>
        </section>}
      </fieldset>
    </section>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    <section><h3 className="font-bold">Reward history</h3>{!data.rewards.length ? <p className="mt-2 text-sm text-muted-foreground">No rewards yet. Share your invitation to get started.</p> : <ul className="mt-3 divide-y divide-border">{data.rewards.map(reward => <li key={reward.id} className="flex items-start justify-between gap-3 py-3 text-sm"><div><p className="font-semibold">{reward.kind === 'activity_bonus' ? 'Activity bonus' : reward.kind === 'welcome' ? 'Welcome reward' : 'Invitation reward'}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{(['locked', 'available'].includes(reward.status) ? 'credited' : reward.status.replaceAll('_', ' '))}</p></div><strong>{money(reward.amountPaise)}</strong></li>)}</ul>}</section>
    {!!data.withdrawals.length && <section><h3 className="font-bold">Withdrawal requests</h3><ul className="mt-2 divide-y divide-border">{data.withdrawals.map(row => <li key={row.id} className="flex justify-between gap-3 py-3 text-sm"><div><p className="font-semibold">{money(row.amountPaise)}</p><p className="text-xs text-muted-foreground">{date(row.createdAt)}</p></div><span className="capitalize">{row.status === 'completed' ? 'Paid' : row.status}</span></li>)}</ul></section>}
  </div>;
}
