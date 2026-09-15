'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Banknote, Gift, WalletCards } from 'lucide-react';
import { API_ORIGIN } from '@/config/runtime';
import { getToken } from '@/lib/auth';

type Method = 'upi' | 'bank';

export default function WithdrawPage() {
  const [available, setAvailable] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Method>('upi');
  const [form, setForm] = useState({ upiId: '', accountHolder: '', accountNumber: '', ifsc: '', bankName: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_ORIGIN}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data?.message || 'Could not load wallet.'); setAvailable(Number(data?.earnedCoinBalance || data?.user?.earnedCoinBalance || 0)); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load wallet.'));
  }, []);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    const coins = Number(amount);
    if (!Number.isInteger(coins) || coins < 50) return setError('Minimum withdrawal is 50 coins.');
    if (coins > available) return setError('You can withdraw only your gift earnings balance.');
    if (method === 'upi' && !form.upiId.trim()) return setError('Enter your UPI ID.');
    if (method === 'bank' && (!form.accountHolder.trim() || !form.accountNumber.trim() || !form.ifsc.trim())) return setError('Fill account holder, account number and IFSC.');
    const token = getToken(); if (!token) return setError('Please sign in again.');
    setBusy(true);
    try {
      const response = await fetch(`${API_ORIGIN}/wallet/razorpay/withdrawals`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ coins, payout: { method, ...form } }) });
      const data = await response.json().catch(() => null); if (!response.ok) throw new Error(data?.message || 'Withdrawal request failed.');
      setAvailable((current) => current - coins); setAmount(''); setMessage('Request submitted. Our team will verify and pay it shortly.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Withdrawal request failed.'); } finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 px-4 py-8 text-slate-900"><div className="mx-auto max-w-xl"><button onClick={() => window.history.back()} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4" /> Back</button><section className="rounded-3xl border border-rose-100 bg-white p-6 shadow-xl"><div className="mb-6 flex items-center gap-3"><div className="rounded-2xl bg-rose-100 p-3 text-rose-600"><Banknote /></div><div><h1 className="text-2xl font-bold">Withdraw gift earnings</h1><p className="text-sm text-slate-500">Only coins received from gifts are eligible.</p></div></div><div className="mb-6 flex items-center justify-between rounded-2xl bg-amber-50 p-4"><span className="flex items-center gap-2 font-semibold"><Gift className="h-5 w-5 text-amber-600" /> Available gift earnings</span><strong className="text-xl text-amber-700">{available} coins</strong></div><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">Amount (minimum 50 coins)<input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="50" max={available} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400" placeholder="Enter coins" /></label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setMethod('upi')} className={`rounded-xl border p-3 text-sm font-bold ${method === 'upi' ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-slate-200'}`}>UPI</button><button type="button" onClick={() => setMethod('bank')} className={`rounded-xl border p-3 text-sm font-bold ${method === 'bank' ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-slate-200'}`}>Bank account</button></div>{method === 'upi' ? <label className="block text-sm font-semibold">UPI ID<input value={form.upiId} onChange={(e) => update('upiId', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="name@upi" /></label> : <div className="space-y-3"><input value={form.accountHolder} onChange={(e) => update('accountHolder', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Account holder name" /><input value={form.bankName} onChange={(e) => update('bankName', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Bank name (optional)" /><input value={form.accountNumber} onChange={(e) => update('accountNumber', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="Account number" /><input value={form.ifsc} onChange={(e) => update('ifsc', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 uppercase" placeholder="IFSC code" /></div>}{error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<button disabled={busy || available < 50} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 px-4 py-3 font-bold text-white disabled:opacity-50"><WalletCards className="h-5 w-5" />{busy ? 'Submitting...' : 'Submit withdrawal request'}</button></form></section></div></main>;
}
