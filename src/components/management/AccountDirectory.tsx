'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type Row = { id: string; name: string; email: string; createdAt: string; userCount?: number; activeUserCount?: number; accountType?: string; role?: string; status?: string };
type Result = { agents?: Row[]; accounts?: Row[]; total: number; page: number; pages: number };
export function AccountDirectory({ kind }: { kind: 'agents' | 'accounts' }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Result | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  useEffect(() => { if (new URLSearchParams(window.location.search).get('status') === 'all') setStatus('all'); }, []);
  useEffect(() => {
    const abort = new AbortController(); setBusy(true); setError('');
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ search: query, page: String(page), limit: '25', status });
      apiFetch<Result>(`/${kind}?${params}`, { signal: abort.signal }).then(setData).catch(err => {
        if (!abort.signal.aborted) setError(err instanceof Error ? err.message : 'Unable to load accounts.');
      }).finally(() => { if (!abort.signal.aborted) setBusy(false); });
    }, 200);
    return () => { abort.abort(); clearTimeout(timer); };
  }, [kind, query, page, status, refresh]);
  const rows = kind === 'agents' ? data?.agents || [] : data?.accounts || [];
  const title = kind === 'agents' ? 'Registered Agents' : status === 'active' ? 'Active Users & Agents' : 'All Users & Agents';
  return <main className="space-y-5 pb-12"><Link href="/super-admin" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ArrowLeft size={15} />Dashboard</Link><header><h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{kind === 'agents' ? 'Agent accounts only. View the users created by each agent separately.' : 'User and agent accounts together, including direct and agent-created users.'}</p></header>
    <div className="flex flex-wrap items-center justify-between gap-3"><label className="relative w-full sm:w-80"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label="Search accounts" placeholder="Search name, email or account ID" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground" /></label>{kind === 'accounts' && <select aria-label="Account status filter" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground"><option value="active">Active accounts</option><option value="all">All accounts</option></select>}<span className="text-xs font-semibold text-muted-foreground">{data?.total ?? 0} accounts</span></div>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}<button className="ml-3 underline" onClick={() => setRefresh(value => value + 1)}>Retry</button></div>}
    <div className="overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full min-w-[660px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-4">{kind === 'agents' ? 'Agent' : 'Account'}</th><th className="p-4">{kind === 'agents' ? 'Created users' : 'Account type'}</th><th className="p-4">{kind === 'agents' ? 'Active created users' : 'Status'}</th><th className="p-4">Registered</th>{kind === 'agents' && <th className="p-4">Users</th>}</tr></thead><tbody>{busy ? <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Loading accounts...</td></tr> : rows.length ? rows.map(row => <tr key={`${row.accountType || 'agent'}-${row.id}`} className="border-b border-border last:border-0"><td className="p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500"><Users size={18} /></span><div><strong className="font-semibold text-foreground">{row.name}</strong><p className="mt-1 text-xs text-muted-foreground">{row.email}</p></div></div></td><td className="p-4 text-foreground">{kind === 'agents' ? row.userCount : row.accountType === 'agent' ? 'Agent' : (row.role || 'user').replaceAll('_', ' ')}</td><td className="p-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${kind === 'agents' || row.status === 'active' ? 'bg-emerald-50 text-emerald-700' : row.status === 'banned' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{kind === 'agents' ? row.activeUserCount : row.status}</span></td><td className="p-4 text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>{kind === 'agents' && <td className="p-4"><Link href={`/super-admin/users?source=agent&creator=${encodeURIComponent(row.email)}`} className="font-semibold text-rose-600">View created users</Link></td>}</tr>) : <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No matching accounts.</td></tr>}</tbody></table></div>
    {data && <footer className="flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>Page {data.page} of {data.pages}</span><div className="flex gap-2"><button disabled={busy || page <= 1} onClick={() => setPage(value => value - 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 disabled:opacity-40"><ChevronLeft size={15} />Previous</button><button disabled={busy || page >= data.pages} onClick={() => setPage(value => value + 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 disabled:opacity-40">Next<ChevronRight size={15} /></button></div></footer>}
  </main>;
}
