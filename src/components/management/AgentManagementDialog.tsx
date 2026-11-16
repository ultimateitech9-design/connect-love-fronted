'use client';
import { useEffect, useRef, useState } from 'react';
import { Ban, ChevronLeft, ChevronRight, Loader2, ShieldCheck, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

export type ManagedAgent = { id: string; name: string; email: string; status?: string; createdAt: string; userCount?: number; activeUserCount?: number; bannedUserCount?: number };
export type AgentAction = 'view' | 'ban' | 'unban' | 'delete';
type Details = { agent: ManagedAgent; users: { id: string; name: string; email: string; city?: string; status: string; createdAt: string }[]; page: number; pages: number; total: number };

export function AgentManagementDialog({ agent, initialAction, onClose, onChanged }: { agent: ManagedAgent; initialAction: AgentAction; onClose: () => void; onChanged: (message: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState(initialAction);
  const [details, setDetails] = useState<Details | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const current = details?.agent || agent;
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => {
    if (action !== 'view') return;
    const abort = new AbortController(); setLoading(true); setError('');
    apiFetch<Details>(`/agents/${agent.id}?page=${page}&limit=10`, { signal: abort.signal }).then(result => {
      if (abort.signal.aborted) return;
      if (page > result.pages) { setPage(result.pages); return; }
      setDetails(result);
    }).catch(err => { if (!abort.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load agent details.'); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [agent.id, action, page, retry]);
  async function confirmAction() {
    if (saving || action === 'view') return;
    setSaving(true); setError('');
    try {
      const response = await apiFetch<{ success: boolean; message: string }>(action === 'delete' ? `/agents/${agent.id}` : `/agents/${agent.id}/status`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        ...(action === 'delete' ? {} : { body: JSON.stringify({ status: action === 'ban' ? 'banned' : 'active' }) }),
      });
      onChanged(response.message);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to update agent.'); }
    finally { setSaving(false); }
  }
  const title = action === 'view' ? 'Agent details' : action === 'delete' ? 'Delete agent account?' : action === 'ban' ? 'Ban agent?' : 'Unban agent?';
  return <dialog ref={dialog} aria-labelledby="agent-management-title" onCancel={event => { if (saving) event.preventDefault(); else onClose(); }} onClick={event => { if (!saving && event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[88dvh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm">
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card p-5"><h2 id="agent-management-title" className="text-lg font-bold">{title}</h2><button autoFocus type="button" disabled={saving} aria-label="Close agent details" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"><X size={20} /></button></header>
    <div className="space-y-5 p-5 sm:p-6">
      <div className="rounded-xl border border-border bg-muted/20 p-4"><h3 className="break-words text-lg font-bold">{current.name}</h3><p className="mt-1 break-all text-sm text-muted-foreground">{current.email}</p><p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">ID: {current.id}</p><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${current.status === 'banned' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{current.status || 'active'}</span></div>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}{action === 'view' && <button className="ml-2 underline" onClick={() => setRetry(value => value + 1)}>Retry</button>}</div>}
      {action === 'view' ? <>
        <div className="grid grid-cols-3 gap-3">{[['Created users', current.userCount || 0], ['Active users', current.activeUserCount || 0], ['Banned users', current.bannedUserCount || 0]].map(([label, value]) => <div key={label} className="rounded-xl border border-border p-3"><p className="text-[11px] text-muted-foreground">{label}</p><strong className="mt-2 block text-2xl font-bold">{value}</strong></div>)}</div>
        <div><h3 className="text-sm font-bold">Users added by this agent</h3><p className="mt-1 text-xs text-muted-foreground">Registered {new Date(current.createdAt).toLocaleDateString('en-IN')} &middot; {details?.total ?? current.userCount ?? 0} total users</p></div>
        <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[500px] text-left text-xs"><thead className="border-b border-border bg-muted/40 text-muted-foreground"><tr><th className="p-3">User</th><th className="p-3">City</th><th className="p-3">Status</th><th className="p-3">Added</th></tr></thead><tbody>{loading ? <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading created users...</td></tr> : details?.users.length ? details.users.map(user => <tr key={user.id} className="border-b border-border last:border-0"><td className="p-3"><Link href={`/super-admin/user-360?user=${encodeURIComponent(user.id)}`} className="font-semibold text-rose-600">{user.name}</Link><p className="mt-1 text-muted-foreground">{user.email}</p></td><td className="p-3">{user.city || '-'}</td><td className="p-3 capitalize">{user.status}</td><td className="p-3">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td></tr>) : <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">This agent has not added any users yet.</td></tr>}</tbody></table></div>
        {details && details.pages > 1 && <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>Page {details.page} of {details.pages}</span><div className="flex gap-2"><button disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 disabled:opacity-40"><ChevronLeft size={14} />Previous users</button><button disabled={loading || page >= details.pages} onClick={() => setPage(value => value + 1)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 disabled:opacity-40">Next users<ChevronRight size={14} /></button></div></div>}
        <div className="flex flex-wrap gap-2 border-t border-border pt-4"><button onClick={() => { setError(''); setAction(current.status === 'banned' ? 'unban' : 'ban'); }} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-semibold">{current.status === 'banned' ? <ShieldCheck size={16} /> : <Ban size={16} />}{current.status === 'banned' ? 'Unban agent' : 'Ban agent'}</button><button onClick={() => { setError(''); setAction('delete'); }} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700"><Trash2 size={16} />Delete agent</button></div>
      </> : <>
        <p className="text-sm leading-6 text-muted-foreground">{action === 'delete' ? `This removes the agent account and dashboard access. Their ${current.userCount || 0} created user accounts and creator history will be preserved.` : action === 'ban' ? 'This agent will be signed out of their dashboard and blocked from signing in or creating users. Existing user accounts stay available.' : 'This agent can sign in again. Previously issued sessions remain revoked.'}</p>
        <div className="flex justify-end gap-3"><button disabled={saving} onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50">Cancel</button><button disabled={saving} onClick={() => void confirmAction()} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{saving && <Loader2 size={15} className="animate-spin" />}{action === 'delete' ? 'Confirm delete agent' : action === 'ban' ? 'Confirm ban agent' : 'Confirm unban agent'}</button></div>
      </>}
    </div>
  </dialog>;
}
