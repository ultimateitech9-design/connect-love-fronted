"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search, Send } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Gender = "female" | "male";
type Failure = {
  id: string; name: string; email: string; gender: string | null;
  subject: string | null; error: string | null; attemptedAt: string | null; createdAt: string;
};
type FailureList = { failures: Failure[]; total: number; page: number; limit: number };
type Selection = { gender: Gender; search: string; selectAll: boolean; ids: string[]; excludedIds: string[]; count: number; ready: boolean };
const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";
export function FailedEmails({ gender }: { gender: Gender }) {
  const [selections, setSelections] = useState<Partial<Record<Gender, Selection>>>({});
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  const onSelection = useCallback((selection: Selection) => {
    setSelections(current => ({ ...current, [selection.gender]: selection }));
    requestId.current = null;
  }, []);
  const count = selections[gender]?.count || 0;
  const ready = Boolean(selections[gender]?.ready);
  const resend = async () => {
    if (submitting.current || !ready || !count) return;
    submitting.current = true; setBusy(true); setError(""); setNotice("");
    requestId.current ||= crypto.randomUUID();
    try {
      const result = await apiFetch<{ total: number | null; alreadyQueued: boolean }>("/admin-email/failures/retry", {
        method: "POST", body: JSON.stringify({ requestId: requestId.current, selections: Object.values(selections).filter(value => value.count > 0).map(({ gender, search, selectAll, ids, excludedIds }) => ({ gender, search, selectAll, ids, excludedIds })) }),
      });
      setNotice(result.alreadyQueued ? "This resend request is already queued." : `${result.total} emails queued for resend. Check Recent emails for delivery status.`);
      setRefresh(value => value + 1);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not queue selected emails. Try again."); }
    finally { submitting.current = false; setBusy(false); }
  };
  return <div className="mt-6 space-y-6">
    <p className="text-xs text-muted-foreground">Each row is a failed email attempt; the same email can appear in different campaigns.</p>
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm">Resend uses the original campaign&apos;s subject, message and photo. Only selected failed emails are queued.</p>
      <div className="flex flex-wrap items-center gap-3">
        <span aria-live="polite" className="text-sm font-semibold">{count.toLocaleString()} failed entries selected</span>
        <button type="button" disabled={busy || !ready || !count} onClick={resend} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{busy ? "Queuing resend..." : `Resend selected (${count.toLocaleString()})`}</button>
      </div>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
    </div>
    <FailedEmailList gender={gender} busy={busy} batchRefresh={refresh} onSelection={onSelection} />
  </div>;
}

function FailedEmailList({ gender, busy, batchRefresh, onSelection }: { gender: Gender; busy: boolean; batchRefresh: number; onSelection: (selection: Selection) => void }) {
  const title = gender === "female" ? "Women - Failed emails" : "Men - Failed emails";
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState<FailureList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const selectionReady = !loading && !error && query === search.trim();
  const selectedCount = selectAll ? Math.max(0, (data?.total || 0) - excluded.size) : selected.size;
  const resetSelection = () => { setSelected(new Set()); setExcluded(new Set()); setSelectAll(false); };

  useEffect(() => { resetSelection(); }, [batchRefresh]);
  useEffect(() => {
    onSelection({ gender, search: query, selectAll, ids: [...selected], excludedIds: [...excluded], count: selectedCount, ready: selectionReady });
  }, [gender, query, selectAll, selected, excluded, selectedCount, selectionReady, onSelection]);

  useEffect(() => {
    if (search.trim() === query) return;
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search, query]);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    const params = new URLSearchParams({ gender, search: query, page: String(page) });
    apiFetch<FailureList>(`/admin-email/failures?${params}`)
      .then(value => { if (active) setData(value); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Could not load failed emails."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [gender, query, page, refresh, batchRefresh]);

  const toggle = (id: string) => {
    const update = (current: Set<string>) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; };
    if (selectAll) setExcluded(update); else setSelected(update);
  };

  return <section aria-label={title} className={`min-w-0 rounded-2xl border bg-card p-5 shadow-sm ${gender === "female" ? "border-rose-200" : "border-blue-200"}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <h3 className={`font-bold ${gender === "female" ? "text-rose-600" : "text-blue-600"}`}>{title}</h3>
      <button type="button" disabled={loading || busy} onClick={() => { resetSelection(); setRefresh(value => value + 1); }} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw className="h-4 w-4" />Refresh failed emails</button>
    </div>
    <div className="mt-4">
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label="Search failed emails" placeholder="Search name, email or campaign..." maxLength={100} disabled={busy} value={search} onChange={event => { setSearch(event.target.value); resetSelection(); }} className={`${input} pl-9`} /></div>
    </div>
    <label className="mt-4 flex items-center gap-2 rounded-xl bg-muted p-3 text-sm font-semibold"><input type="checkbox" aria-label="Select all failed emails" disabled={busy || !selectionReady || !data?.total} checked={selectAll && excluded.size === 0} onChange={event => { setSelectAll(event.target.checked); setSelected(new Set()); setExcluded(new Set()); }} />Select all {data?.total.toLocaleString() || 0} matching failed emails (all pages)</label>
    {error ? <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p> : loading ? <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading failed emails...</div> : <>
      <p aria-live="polite" className="mt-4 text-sm font-semibold text-rose-600">{data?.total.toLocaleString() || 0} failed emails</p>
      {!data?.failures.length ? <p className="py-8 text-center text-sm text-muted-foreground">No failed emails found.</p> : <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs text-muted-foreground"><tr><th className="py-3 pr-3">Select</th><th className="py-3 pr-4">User / Email</th><th className="pr-4">Campaign</th><th className="pr-4">Failure reason</th><th>Date</th></tr></thead><tbody className="divide-y divide-border">{data.failures.map(item => <tr key={item.id}>
        <td className="pr-3"><input type="checkbox" aria-label={`Select failed email ${item.email}`} disabled={busy} checked={selectAll ? !excluded.has(item.id) : selected.has(item.id)} onChange={() => toggle(item.id)} /></td>
        <td className="min-w-48 max-w-64 break-words py-3 pr-4"><p className="font-semibold">{item.name || "Deleted user"}</p><p className="mt-1 text-xs text-muted-foreground">{item.email}</p></td>
        <td className="min-w-40 max-w-64 break-words pr-4">{item.subject || "Campaign unavailable"}</td>
        <td className="min-w-56 max-w-80 break-words pr-4 text-xs text-rose-600">{item.error || "The mail server did not confirm delivery."}</td>
        <td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(item.attemptedAt || item.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
      </tr>)}</tbody></table></div>}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>Page {page} of {Math.max(1, Math.ceil((data?.total || 0) / (data?.limit || 10)))} · 10 per page</span><div className="flex gap-2">
        <button type="button" aria-label="Previous failed emails page" disabled={busy || page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" aria-label="Next failed emails page" disabled={busy || page * (data?.limit || 10) >= (data?.total || 0)} onClick={() => setPage(value => value + 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
      </div></div>
    </>}
  </section>;
}
