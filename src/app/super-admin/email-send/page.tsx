"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, ImagePlus, Loader2, Mail, Search, Send, X } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { apiFetch } from "@/lib/api";
import { FailedEmails } from "@/features/admin-email/FailedEmails";

type Audience = "all" | "female" | "male" | "inactive" | "failed_female" | "failed_male";
type Member = { id: string; name: string; email: string; gender?: string };
type Recipients = { users: Member[]; total: number; page: number; limit: number; smtpConfigured: boolean };
type Campaign = { id: string; subject: string; audience: Audience; total: number; sent: number; failed: number; pending: number; status: string; createdAt: string; failures?: { email: string; error: string }[] };
const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100";
const card = "rounded-2xl border border-border bg-card p-5 shadow-sm";
const audienceLabel = (value: Audience) => value === "female" ? "Women" : value === "male" ? "Men" : value === "inactive" ? "Inactive (7+ days)" : value === "failed_female" ? "Failed emails - Women" : value === "failed_male" ? "Failed emails - Men" : "All users";

export default function EmailSendPage() {
  const [audience, setAudience] = useState<Audience>("all");
  const failedGender = audience === "failed_female" ? "female" : audience === "failed_male" ? "male" : null;
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Recipients | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [result, setResult] = useState<Campaign | null>(null);
  const [historyError, setHistoryError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const requestId = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const selectedCount = selectAll ? Math.max(0, (data?.total || 0) - excluded.size) : selected.size;
  const recipientsReady = !loading && !listError && search.trim() === query;
  const ready = !failedGender && recipientsReady && !!data?.smtpConfigured;

  const resetSelection = () => {
    setSelected(new Set()); setExcluded(new Set()); setSelectAll(false); requestId.current = null;
  };
  const changed = () => { requestId.current = null; setError(""); };

  useEffect(() => {
    if (search.trim() === query) return;
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search, query]);

  useEffect(() => {
    let active = true;
    if (audience === "failed_female" || audience === "failed_male") {
      setData(null); setLoading(false); setListError("");
      return () => { active = false; };
    }
    setLoading(true); setListError("");
    const params = new URLSearchParams({ audience, search: query, page: String(page) });
    apiFetch<Recipients>(`/admin-email/recipients?${params}`).then(value => { if (active) setData(value); })
      .catch(reason => { if (active) setListError(reason instanceof Error ? reason.message : "Could not load users."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [audience, query, page]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const value = await apiFetch<{ campaigns: Campaign[] }>("/admin-email/campaigns");
        if (active) { setCampaigns(value.campaigns); setHistoryError(""); }
      } catch { if (active) setHistoryError("Could not refresh email history. Retrying..."); }
      if (active) timer = setTimeout(refresh, 5000);
    };
    void refresh();
    return () => { active = false; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!result?.id) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const value = await apiFetch<Campaign>(`/admin-email/campaigns/${result.id}`);
        if (active) setResult(value);
        if (active && value.pending > 0) timer = setTimeout(refresh, 3000);
      } catch { if (active) timer = setTimeout(refresh, 5000); }
    };
    void refresh();
    return () => { active = false; clearTimeout(timer); };
  }, [result?.id]);

  const toggle = (id: string) => {
    changed();
    const update = (current: Set<string>) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; };
    if (selectAll) setExcluded(update); else setSelected(update);
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    changed();
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Choose a JPEG, PNG or WebP photo.");
    if (file.size > 3 * 1024 * 1024) return setError("Photo must be 3 MB or smaller.");
    setImageLoading(true);
    try {
      const value = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Photo could not be opened."));
        reader.readAsDataURL(file);
      });
      setImage(value); setImageName(file.name);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Photo could not be opened."); }
    finally { setImageLoading(false); }
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (submittingRef.current || !ready || imageLoading) return;
    if (!selectedCount) return setError("Select at least one user.");
    submittingRef.current = true;
    setSubmitting(true); setError("");
    requestId.current ||= crypto.randomUUID();
    try {
      const value = await apiFetch<Campaign>("/admin-email/campaigns", { method: "POST", body: JSON.stringify({
        requestId: requestId.current, audience, search: query, selectAll,
        userIds: [...selected], excludedUserIds: [...excluded], subject: subject.trim(), message: message.trim(),
        ...(image ? { imageDataUrl: image } : {}),
      }) });
      setResult(value); setCampaigns(current => [value, ...current.filter(item => item.id !== value.id)].slice(0, 20));
      resetSelection(); setSubject(""); setMessage(""); setImage(""); setImageName(""); setShowPreview(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Email could not be queued. Try again."); }
    finally { submittingRef.current = false; setSubmitting(false); }
  };

  return <div>
    <PageHeader title="Email Send" description="Send a message and photo to all users, women, men, or members inactive for 7+ days." />
    <div className={`grid items-start gap-6 ${failedGender ? "" : "xl:grid-cols-[minmax(0,1.15fr)_minmax(350px,1fr)]"}`}>
      <section className={card} aria-label="Email recipients">
        <div className="mb-5 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><Mail className="h-5 w-5" /></div><div><h2 className="font-bold">Select recipients</h2><p className="text-xs text-muted-foreground">Members&apos; registered email addresses</p></div></div>
        <fieldset disabled={submitting} className="space-y-4 disabled:opacity-60">
          <label className="block text-sm font-semibold">Recipient filter
            <select aria-label="Recipient filter" value={audience} onChange={event => { setAudience(event.target.value as Audience); setPage(1); resetSelection(); changed(); }} className={`${input} mt-1.5 font-normal`}>
              {(["all", "female", "male", "inactive", "failed_female", "failed_male"] as Audience[]).map(value => <option key={value} value={value}>{audienceLabel(value)}</option>)}
            </select>
          </label>
          {failedGender ? <FailedEmails key={failedGender} gender={failedGender} /> : <>
          {audience === "inactive" && <p className="text-xs text-muted-foreground">Users last active at least 7 days ago. Users who have never been active are included 7 days after registration.</p>}
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label="Search users" value={search} onChange={event => { setSearch(event.target.value); resetSelection(); }} maxLength={100} placeholder="Search name or email..." className={`${input} pl-9`} /></div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-rose-50 px-3 py-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 font-semibold"><input type="checkbox" aria-label="Select all matching users" checked={selectAll && excluded.size === 0} disabled={!recipientsReady || !data?.total} onChange={event => { changed(); setSelectAll(event.target.checked); setSelected(new Set()); setExcluded(new Set()); }} className="h-4 w-4 accent-rose-500" />Select all {data?.total.toLocaleString() || 0} matching users</label>
            <span className="font-bold text-rose-600" aria-live="polite">{selectedCount.toLocaleString()} selected</span>
          </div>
          {selectAll && <p className="text-xs text-muted-foreground">All matching users across every page are selected. Uncheck any user to exclude them.</p>}
          {listError ? <p role="alert" className="py-8 text-sm text-rose-600">{listError}</p> : loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading users...</div> : !data?.users.length ? <p className="py-16 text-center text-sm text-muted-foreground">No users found.</p> : <div className="max-h-[520px] divide-y divide-border overflow-auto rounded-xl border border-border">{data.users.map(user => <label key={user.id} className="flex cursor-pointer items-center gap-3 px-3 py-3 hover:bg-rose-50/50"><input type="checkbox" aria-label={`Select ${user.email}`} checked={selectAll ? !excluded.has(user.id) : selected.has(user.id)} onChange={() => toggle(user.id)} className="h-4 w-4 shrink-0 accent-rose-500" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="break-all text-xs text-muted-foreground">{user.email}</p></div><span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] capitalize text-muted-foreground">{user.gender || "Unspecified"}</span></label>)}</div>}
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Page {page} of {Math.max(1, Math.ceil((data?.total || 0) / 50))}</span><div className="flex gap-2"><button type="button" aria-label="Previous page" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Next page" disabled={loading || page * 50 >= (data?.total || 0)} onClick={() => setPage(value => value + 1)} className="rounded-lg border p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></div>
          </>}
        </fieldset>
      </section>

      {!failedGender && <section className={card} aria-label="Compose email">
        <h2 className="font-bold">Compose email</h2><p className="mt-1 text-xs text-muted-foreground">Each recipient gets a separate email. Other addresses stay private.</p>
        {data && !data.smtpConfigured && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Email delivery is not configured. Configure SMTP before sending.</p>}
        <form onSubmit={send} className="mt-5 space-y-4">
          <fieldset disabled={submitting} className="space-y-4 disabled:opacity-60">
            <label className="block text-sm font-semibold">Subject<input required maxLength={200} value={subject} onChange={event => { setSubject(event.target.value); changed(); }} placeholder="Write your email subject" className={`${input} mt-1.5 font-normal`} /></label>
            <label className="block text-sm font-semibold">Message<textarea required rows={8} maxLength={10000} value={message} onChange={event => { setMessage(event.target.value); changed(); }} placeholder="Write your message to members..." className={`${input} mt-1.5 resize-y font-normal`} /></label>
            <div><input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Email photo" className="sr-only" onChange={uploadImage} disabled={imageLoading} /><button type="button" disabled={imageLoading} onClick={() => imageInput.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-rose-300 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"><ImagePlus className="h-4 w-4" />{imageLoading ? "Opening photo..." : image ? "Change photo" : "Add photo"}</button><p className="mt-1.5 text-xs text-muted-foreground">Optional · JPEG, PNG or WebP · Up to 3 MB</p></div>
            {image && <div className="relative overflow-hidden rounded-xl border border-border bg-muted"><img src={image} alt="Email attachment preview" className="max-h-64 w-full object-contain" /><div className="flex items-center justify-between gap-2 bg-card p-2"><span className="truncate text-xs text-muted-foreground">{imageName}</span><button type="button" aria-label="Remove photo" onClick={() => { setImage(""); setImageName(""); changed(); }} className="rounded-lg p-1 text-rose-600 hover:bg-rose-50"><X className="h-4 w-4" /></button></div></div>}
            <button type="button" onClick={() => setShowPreview(value => !value)} className="text-sm font-semibold text-rose-600 underline underline-offset-4">{showPreview ? "Hide preview" : "Preview message"}</button>
            {showPreview && <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4"><p className="text-xs font-bold text-rose-600">Connect Love</p><h3 className="mt-2 break-words font-bold">{subject || "Your subject"}</h3><p className="mt-3 whitespace-pre-wrap break-words text-sm">{message || "Your message will appear here."}</p>{image && <img src={image} alt="Photo in email preview" className="mt-3 max-h-64 w-full rounded-lg object-contain" />}</div>}
            <p className="rounded-xl bg-muted p-3 text-sm">Send to <strong>{selectedCount.toLocaleString()} {audienceLabel(audience).toLowerCase()}</strong>{query && <> matching &ldquo;{query}&rdquo;</>}.</p>
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <button type="submit" disabled={!ready || !selectedCount || !subject.trim() || !message.trim() || submitting || imageLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{submitting ? "Queuing emails..." : `Send Email (${selectedCount.toLocaleString()})`}</button>
          </fieldset>
        </form>
        {result && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" />{result.pending ? "Emails queued — sending in background" : "Email campaign completed"}</div><p className="mt-2">{result.sent} sent · {result.pending} pending · {result.failed} failed</p>{!!result.failures?.length && <details className="mt-3"><summary className="cursor-pointer font-semibold">Failed recipients (up to 20)</summary><ul className="mt-2 space-y-2">{result.failures.map(item => <li key={item.email} className="break-words">{item.email}: {item.error}</li>)}</ul></details>}</div>}
      </section>}
    </div>

    <section className={`${card} mt-6`} aria-label="Email history"><h2 className="font-bold">Recent emails</h2><p className="mt-1 text-xs text-muted-foreground">Sent means accepted by the mail server. Counts update automatically.</p>{historyError && <p className="mt-3 text-sm text-amber-700">{historyError}</p>}<div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b text-xs text-muted-foreground"><tr><th className="py-3 pr-3">Subject</th><th className="pr-3">Audience</th><th className="pr-3">Sent</th><th className="pr-3">Pending</th><th className="pr-3">Failed</th><th>Date</th></tr></thead><tbody className="divide-y">{campaigns.map(item => <tr key={item.id}><td className="max-w-64 py-3 pr-3"><button type="button" onClick={() => setResult(item)} className="text-left font-semibold text-rose-600 hover:underline">{item.subject}</button></td><td className="pr-3">{audienceLabel(item.audience)}</td><td className="pr-3 text-emerald-700">{item.sent}</td><td className="pr-3">{item.pending}</td><td className="pr-3 text-rose-600">{item.failed}</td><td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td></tr>)}</tbody></table>{!campaigns.length && !historyError && <p className="py-6 text-center text-sm text-muted-foreground">No emails sent yet.</p>}</div></section>
  </div>;
}
