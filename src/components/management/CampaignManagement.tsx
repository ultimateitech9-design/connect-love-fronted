"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgePercent, Check, Clock3, Eye, Loader2, Megaphone, MousePointerClick, Pause, Plus, Send, Trash2, X } from "lucide-react";
import { api, type CampaignInput, type CampaignRecord } from "@/lib/api";

type CampaignRole = "sales" | "admin" | "super_admin";

const emptyForm = {
  campaign: "",
  description: "",
  audience: "All users",
  discountPercent: "30",
  ctaLabel: "View offer",
  ctaUrl: "/user/premium",
  startsAt: "",
  endsAt: "",
};

function statusLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(status: CampaignRecord["status"]) {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "pending_approval") return "bg-amber-100 text-amber-800";
  if (status === "rejected") return "bg-rose-100 text-rose-700";
  if (status === "paused") return "bg-violet-100 text-violet-700";
  return "bg-slate-100 text-slate-700";
}

export function CampaignManagement({ role }: { role: CampaignRole }) {
  const isApprover = role === "admin" || role === "super_admin";
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.notifications();
      setCampaigns(response.notifications);
    } catch {
      setError("Campaign records database se load nahi hue. Session/role check karein.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    total: campaigns.length,
    pending: campaigns.filter((campaign) => campaign.status === "pending_approval").length,
    active: campaigns.filter((campaign) => campaign.status === "active").length,
    impressions: campaigns.reduce((sum, campaign) => sum + Number(campaign.impressions || 0), 0),
    clicks: campaigns.reduce((sum, campaign) => sum + Number(campaign.clicks || 0), 0),
  }), [campaigns]);

  const buildPayload = (publish: boolean): CampaignInput => ({
    campaign: form.campaign.trim(),
    description: form.description.trim(),
    audience: form.audience,
    type: "In-app",
    discountPercent: form.discountPercent ? Number(form.discountPercent) : undefined,
    ctaLabel: form.ctaLabel.trim() || "View offer",
    ctaUrl: form.ctaUrl.trim() || "/user/premium",
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    status: publish && isApprover ? "active" : "draft",
  });

  const create = async (publish: boolean) => {
    if (!form.campaign.trim() || form.description.trim().length < 3) {
      setError("Campaign title aur offer description required hai.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const created = await api.createNotification(buildPayload(publish));
      if (role === "sales" && publish) {
        await api.submitNotification(created.id);
        setMessage("Campaign Admin approval ke liye submit ho gaya.");
      } else {
        setMessage(publish ? "Campaign user dashboard par live ho gaya." : "Campaign draft save ho gaya.");
      }
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch {
      setError("Campaign save nahi hua. Fields aur role permission check karein.");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      await load();
    } catch {
      setError("Campaign action complete nahi hua.");
    }
  };

  const reject = (campaign: CampaignRecord) => {
    const reason = window.prompt("Sales ko rejection reason batayein:");
    if (!reason?.trim()) return;
    void runAction(() => api.rejectNotification(campaign.id, reason.trim()), "Campaign Sales ko changes ke liye return kar diya.");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Database-backed workflow</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">Campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isApprover ? "Create campaigns directly or approve Sales submissions." : "Create an offer and submit it to Admin; it goes live only after approval."}
          </p>
        </div>
        <button type="button" onClick={() => setShowForm((open) => !open)} className="inline-flex h-11 items-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-500/20">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {showForm ? "Close" : "New campaign"}
        </button>
      </header>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Campaigns" value={stats.total} icon={Megaphone} />
        <Metric label="Pending approval" value={stats.pending} icon={Clock3} />
        <Metric label="Live" value={stats.active} icon={BadgePercent} />
        <Metric label="Impressions" value={stats.impressions} icon={Eye} />
        <Metric label="Clicks" value={stats.clicks} icon={MousePointerClick} />
      </div>

      {showForm && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Campaign title"><input value={form.campaign} onChange={(event) => setForm({ ...form, campaign: event.target.value })} placeholder="30% Premium Upgrade Offer" /></Field>
            <Field label="Audience"><select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}><option>All users</option><option>Free users</option><option>Premium users</option><option>Gold users</option><option>Platinum users</option></select></Field>
            <Field label="Discount %"><input type="number" min={1} max={100} value={form.discountPercent} onChange={(event) => setForm({ ...form, discountPercent: event.target.value })} /></Field>
            <Field label="CTA label"><input value={form.ctaLabel} onChange={(event) => setForm({ ...form, ctaLabel: event.target.value })} /></Field>
            <Field label="CTA link"><input value={form.ctaUrl} onChange={(event) => setForm({ ...form, ctaUrl: event.target.value })} placeholder="/user/premium" /></Field>
            <Field label="Start time"><input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></Field>
            <Field label="End time"><input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></Field>
            <Field label="Offer description" className="md:col-span-2"><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Upgrade today and save 30% on your plan." /></Field>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button disabled={saving} type="button" onClick={() => void create(false)} className="rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground disabled:opacity-50">Save draft</button>
            <button disabled={saving} type="button" onClick={() => void create(true)} className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {isApprover ? "Publish now" : "Submit for approval"}
            </button>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Audience</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Performance</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr> : campaigns.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Database me abhi koi campaign nahi hai.</td></tr> : campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-t border-border align-top">
                  <td className="max-w-sm px-4 py-4"><p className="font-bold text-foreground">{campaign.campaign}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{campaign.description}</p>{campaign.rejectionReason && <p className="mt-2 text-xs font-semibold text-rose-600">Reason: {campaign.rejectionReason}</p>}</td>
                  <td className="px-4 py-4">{campaign.audience}<p className="mt-1 text-xs text-muted-foreground">{campaign.discountPercent ? `${campaign.discountPercent}% off` : "No percentage"}</p></td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(campaign.status)}`}>{statusLabel(campaign.status)}</span></td>
                  <td className="px-4 py-4 text-xs"><p>{campaign.impressions.toLocaleString()} views</p><p>{campaign.clicks.toLocaleString()} clicks · {campaign.ctr}% CTR</p></td>
                  <td className="px-4 py-4 text-xs text-muted-foreground"><p>{campaign.startsAt ? new Date(campaign.startsAt).toLocaleString() : "Starts after approval"}</p><p>{campaign.endsAt ? new Date(campaign.endsAt).toLocaleString() : "No end date"}</p></td>
                  <td className="px-4 py-4"><div className="flex flex-wrap justify-end gap-2">
                    {role === "sales" && (campaign.status === "draft" || campaign.status === "rejected") && <Action onClick={() => void runAction(() => api.submitNotification(campaign.id), "Campaign approval ke liye submit ho gaya.")} icon={Send} label="Submit" />}
                    {isApprover && campaign.status === "pending_approval" && <><Action onClick={() => void runAction(() => api.approveNotification(campaign.id), "Campaign approved aur live ho gaya.")} icon={Check} label="Approve" /><Action onClick={() => reject(campaign)} icon={X} label="Reject" danger /></>}
                    {isApprover && campaign.status === "draft" && <Action onClick={() => void runAction(() => api.approveNotification(campaign.id), "Campaign approved aur live ho gaya.")} icon={Check} label="Publish" />}
                    {isApprover && campaign.status === "active" && <Action onClick={() => void runAction(() => api.updateNotificationStatus(campaign.id, "paused"), "Campaign paused.")} icon={Pause} label="Pause" />}
                    {isApprover && campaign.status === "paused" && <Action onClick={() => void runAction(() => api.updateNotificationStatus(campaign.id, "active"), "Campaign live.")} icon={Check} label="Activate" />}
                    {((role === "sales" && ["draft", "rejected"].includes(campaign.status)) || isApprover) && <Action onClick={() => void runAction(() => api.deleteNotification(campaign.id), "Campaign deleted.")} icon={Trash2} label="Delete" danger />}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Megaphone }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><Icon className="h-5 w-5 text-rose-600" /><p className="mt-3 text-2xl font-black text-foreground">{value.toLocaleString()}</p><p className="text-xs font-semibold text-muted-foreground">{label}</p></div>;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={`block text-xs font-bold uppercase tracking-wider text-muted-foreground ${className}`}><span className="mb-1.5 block">{label}</span><div className="[&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-input [&_input]:bg-background [&_input]:px-3 [&_select]:h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-input [&_select]:bg-background [&_select]:px-3 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-input [&_textarea]:bg-background [&_textarea]:p-3 [&_textarea]:normal-case [&_textarea]:tracking-normal">{children}</div></label>;
}

function Action({ onClick, icon: Icon, label, danger = false }: { onClick: () => void; icon: typeof Send; label: string; danger?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${danger ? "border-rose-200 text-rose-700 hover:bg-rose-50" : "border-border text-foreground hover:bg-muted"}`}><Icon className="h-3.5 w-3.5" />{label}</button>;
}
