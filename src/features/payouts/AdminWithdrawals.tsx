"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Banknote, CheckCircle2, Copy, Loader2, RefreshCw, Search, Wallet, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { managementFetch } from '@/lib/api';

type Status = 'all' | 'pending' | 'completed' | 'rejected';
type Withdrawal = {
  id: string; status: 'pending' | 'completed' | 'rejected'; walletSource: string; coins: number;
  amountPaise: number; amountEstimated: boolean; createdAt: string; label?: string;
  user: { id: string; name: string; email: string; phone?: string; gender?: string; age?: number; city?: string; profession?: string; status: string; photo?: string } | null;
  agent: { id: string; name: string; email: string } | null;
  payout: { method: string | null; accountHolder: string | null; bankName: string | null; accountNumber: string | null; ifsc: string | null; upiId: string | null };
};
type Page = { items: Withdrawal[]; page: number; limit: number; total: number; hasMore: boolean; summary: { total: number; pending: number; paid: number; rejected: number; pendingPaise: number } };
const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
const when = (value: string) => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
const input = 'rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-rose-300';

export function AdminWithdrawals() {
  const [data, setData] = useState<Page | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<Status>('all');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [acting, setActing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const activeAction = useRef(false);
  const sequence = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const load = useCallback(async (signal?: AbortSignal) => {
    const current = ++sequence.current;
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25', status, source, search: query });
      const result = await managementFetch<Page>(`/users/admin/withdrawals?${params}`, { signal, cache: 'no-store' });
      if (signal?.aborted || current !== sequence.current) return;
      if (!result.items.length && page > 1) { setPage(page - 1); return; }
      setData(result); setError(''); setUpdated(new Date());
    } catch (reason) { if (!signal?.aborted && current === sequence.current) setError(reason instanceof Error ? reason.message : 'Withdrawals could not be loaded.'); }
    finally { if (!signal?.aborted && current === sequence.current) setLoading(false); }
  }, [page, status, source, query]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true);
    void load(controller.signal);
    return () => { controller.abort(); sequence.current++; };
  }, [load]);
  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const changeStatus = async (row: Withdrawal, next: 'completed' | 'rejected') => {
    if (activeAction.current || loading || search.trim() !== query) return;
    const name = row.user?.name || row.agent?.name || 'this member';
    const question = next === 'completed' ? `Mark ${money(row.amountPaise)} paid to ${name}? Confirm after transferring the money.` : `Reject ${money(row.amountPaise)} for ${name} and return the balance?`;
    if (!window.confirm(question)) return;
    activeAction.current = true; setActing(row.id); setError(''); setNotice('');
    try {
      await managementFetch(`/users/admin/coin-transactions/${row.id}/withdrawal`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
      sequence.current++; // Discard any list response that started before this mutation.
      setData(current => current ? { ...current, items: current.items.map(item => item.id === row.id ? { ...item, status: next } : item) } : current);
      setNotice(next === 'completed' ? 'Withdrawal marked as Paid.' : 'Withdrawal rejected. The balance has been returned to the correct wallet.');
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Withdrawal could not be updated.'); }
    finally { activeAction.current = false; setActing(null); }
  };
  const copy = async (row: Withdrawal) => {
    const member = row.user || row.agent;
    const payout = row.payout;
    const text = [`Withdrawal: ${row.id}`, `User: ${member?.name || 'Unavailable'}`, `User ID: ${member?.id || ''}`, `Email: ${member?.email || ''}`,
      `Phone: ${row.user?.phone || 'Not provided'}`, `Gender: ${row.user?.gender || 'Not provided'}`, `City: ${row.user?.city || 'Not provided'}`,
      `Source: ${row.walletSource === 'referral' ? 'Referral rewards' : row.agent ? 'Agent earnings' : 'Call / gift earnings'}`,
      `Amount: ${money(row.amountPaise)}${row.amountEstimated ? ' (calculated from coins)' : ''}`, `Status: ${row.status}`, `Requested: ${when(row.createdAt)}`,
      `Method: ${payout.method || 'Not provided'}`, ...(payout.method === 'upi' ? [`UPI ID: ${payout.upiId || 'Not provided'}`] : [`Account holder: ${payout.accountHolder || 'Not provided'}`, `Bank: ${payout.bankName || 'Not provided'}`, `Account number: ${payout.accountNumber || 'Not provided'}`, `IFSC: ${payout.ifsc || 'Not provided'}`])].join('\n');
    try { await navigator.clipboard.writeText(text); setCopied(row.id); clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(null), 2000); }
    catch { setError('Payment details could not be copied.'); }
  };
  const summary = data?.summary;
  return <div>
    <PageHeader title="Withdrawals" description="Referral and earnings withdrawal requests from every bank / UPI payout screen.">
      <button type="button" onClick={() => void load()} disabled={loading || !!acting} className={`${input} inline-flex items-center gap-2`}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button>
    </PageHeader>
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[
      { label: 'All requests', count: summary?.total || 0, value: 'all', icon: Wallet },
      { label: 'Pending', count: summary?.pending || 0, value: 'pending', icon: Banknote },
      { label: 'Paid', count: summary?.paid || 0, value: 'completed', icon: CheckCircle2 },
      { label: 'Rejected', count: summary?.rejected || 0, value: 'rejected', icon: XCircle },
    ].map(item => <button type="button" key={item.value} disabled={!!acting} onClick={() => { setStatus(item.value as Status); setPage(1); }} aria-pressed={status === item.value} className={`rounded-2xl border bg-card p-4 text-left shadow-sm ${status === item.value ? 'border-rose-300 ring-2 ring-rose-100' : 'border-border'}`}><item.icon className="mb-2 h-5 w-5 text-rose-500" /><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 text-2xl font-bold">{item.count}</p>{item.value === 'pending' && <p className="mt-1 text-xs font-semibold text-amber-700">{money(summary?.pendingPaise || 0)} pending</p>}</button>)}</div>
    <div className="mb-4 flex flex-wrap items-center gap-3"><div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label="Search withdrawals" disabled={!!acting} maxLength={100} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, email, phone, UPI or request ID..." className={`${input} w-full pl-9`} /></div><select aria-label="Withdrawal source" disabled={!!acting} value={source} onChange={event => { setSource(event.target.value); setPage(1); }} className={input}><option value="all">All wallets</option><option value="referral">Referral rewards</option><option value="coins">Call / gift / agent earnings</option></select></div>
    <div aria-live="polite">{error && <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{notice && <p role="status" className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}</div>
    {updated && <p className="mb-3 text-xs text-muted-foreground">Last updated {updated.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}.</p>}
    {loading ? <p role="status" className="flex justify-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading withdrawals...</p> : !data?.items.length ? <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No withdrawal requests found.</p> : <div className="space-y-4">{data.items.map(row => <article key={row.id} aria-label={`Withdrawal ${row.id}`} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${row.status === 'pending' ? 'bg-amber-50 text-amber-700' : row.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{row.status === 'completed' ? 'Paid' : row.status === 'pending' ? 'Pending' : 'Rejected'}</span><span className="text-xs text-muted-foreground">{when(row.createdAt)}</span></div>
      <div className="grid gap-5 md:grid-cols-3">
        <div><div className="flex items-center gap-3"><Avatar className="h-12 w-12 shrink-0"><AvatarImage src={row.user?.photo || undefined} alt="" /><AvatarFallback>{(row.user?.name || row.agent?.name || '?')[0]}</AvatarFallback></Avatar><div className="min-w-0"><h2 className="break-words font-bold">{row.user?.name || row.agent?.name || 'Account unavailable'}</h2><p className="break-all text-xs text-muted-foreground">{row.user?.email || row.agent?.email}</p></div></div>
          {row.user && <dl className="mt-3 space-y-1 text-xs text-muted-foreground"><Detail label="Phone" value={row.user.phone} /><Detail label="Gender" value={row.user.gender} /><Detail label="Age" value={row.user.age?.toString()} /><Detail label="City" value={row.user.city} /><Detail label="Profession" value={row.user.profession} /></dl>}
          <p className="mt-2 break-all text-[10px] text-muted-foreground">{row.agent ? 'Agent' : 'User'} ID: {row.user?.id || row.agent?.id || 'Unavailable'}</p>
        </div>
        <section aria-label="Payout details"><h3 className="mb-2 text-sm font-bold">{row.payout.method === 'upi' ? 'UPI payment details' : row.payout.method === 'bank' ? 'Bank payment details' : 'Payment details'}</h3><dl className="space-y-1.5 text-xs"><Detail label="Method" value={row.payout.method?.toUpperCase()} />{row.payout.method === 'upi' ? <Detail label="UPI ID" value={row.payout.upiId} /> : <><Detail label="Account holder" value={row.payout.accountHolder} /><Detail label="Bank name" value={row.payout.bankName} /><Detail label="Account number" value={row.payout.accountNumber} /><Detail label="IFSC" value={row.payout.ifsc} /></>}</dl><button type="button" onClick={() => void copy(row)} className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-semibold"><Copy className="h-3.5 w-3.5" />{copied === row.id ? 'Copied' : 'Copy payment details'}</button></section>
        <div><p className="text-xs text-muted-foreground">Requested amount</p><p className="mt-1 text-2xl font-black">{money(row.amountPaise)}</p>{row.amountEstimated && <p className="mt-1 text-xs text-amber-700">Calculated from saved coins (legacy request)</p>}<p className="mt-2 text-xs font-semibold text-rose-600">{row.walletSource === 'referral' ? 'Referral rewards' : row.agent ? 'Agent earnings' : 'Call / gift earnings'}</p>{row.walletSource !== 'referral' && <p className="mt-1 text-xs text-muted-foreground">{row.coins} coins</p>}<p className="mt-2 break-all text-[10px] text-muted-foreground">Request ID: {row.id}</p>
          {row.status === 'pending' && <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={!!acting || loading || search.trim() !== query} onClick={() => void changeStatus(row, 'completed')} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{acting === row.id ? 'Updating...' : 'Mark Paid'}</button><button type="button" disabled={!!acting || loading || search.trim() !== query} onClick={() => void changeStatus(row, 'rejected')} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 disabled:opacity-50">Reject</button></div>}
        </div>
      </div>
    </article>)}</div>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><span>{data?.total || 0} requests · Page {page} of {Math.max(1, Math.ceil((data?.total || 0) / 25))}</span><div className="flex gap-2"><button type="button" disabled={page <= 1 || loading || !!acting} onClick={() => setPage(current => current - 1)} className={`${input} disabled:opacity-40`}>Previous</button><button type="button" disabled={!data?.hasMore || loading || !!acting} onClick={() => setPage(current => current + 1)} className={`${input} disabled:opacity-40`}>Next</button></div></div>
  </div>;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="flex flex-wrap gap-x-1"><dt className="text-muted-foreground">{label}:</dt><dd className="break-all font-medium">{value || 'Not provided'}</dd></div>;
}
