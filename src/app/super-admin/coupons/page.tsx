"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Loader2, Plus, Power, TicketPercent, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type Coupon = { id: string; code: string; discountPercent: number; applicablePlan: "all" | "gold" | "platinum"; expiresAt: string | null; maxUses: number | null; usedCount: number; active: boolean; createdAt: string };
const emptyForm = { code: "", discountPercent: "", applicablePlan: "all", expiresAt: "", maxUses: "" };
const today = new Date().toISOString().slice(0, 10);

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    try { setCoupons(await apiFetch<Coupon[]>("/coupons")); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Coupons could not be loaded."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const createCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[A-Z0-9@_-]{3,32}$/.test(form.code.trim().toUpperCase())) return toast.error("Coupon code can use letters, numbers, @, _ and - only.");
    if (form.expiresAt && form.expiresAt < today) return toast.error("Expiry date cannot be in the past. Choose today or a future date.");
    setSaving(true);
    try {
      await apiFetch("/coupons", { method: "POST", body: JSON.stringify({ code: form.code, discountPercent: Number(form.discountPercent), applicablePlan: form.applicablePlan, expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null, maxUses: form.maxUses ? Number(form.maxUses) : null }) });
      toast.success("Coupon created successfully."); setForm(emptyForm); setOpen(false); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Coupon could not be created."); }
    finally { setSaving(false); }
  };

  const toggle = async (coupon: Coupon) => {
    try { await apiFetch(`/coupons/${coupon.id}`, { method: "PATCH", body: JSON.stringify({ active: !coupon.active }) }); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Coupon could not be updated."); }
  };
  const remove = async (coupon: Coupon) => {
    if (!confirm(`Remove coupon ${coupon.code}? Used coupons will be deactivated to preserve payment history.`)) return;
    try { await apiFetch(`/coupons/${coupon.id}`, { method: "DELETE" }); toast.success("Coupon removed."); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Coupon could not be removed."); }
  };

  return <div className="space-y-6 p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-rose-500">Payments</p><h1 className="mt-1 text-3xl font-black text-foreground">Coupons</h1><p className="mt-1 text-sm text-muted-foreground">Create discount codes for Gold and Diamond plan payments.</p></div>
      <button onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 text-sm font-bold text-white shadow-lg"><Plus className="h-4 w-4" /> Create Coupon</button>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <Metric label="Total coupons" value={coupons.length} /><Metric label="Active coupons" value={coupons.filter(c => c.active).length} /><Metric label="Total redemptions" value={coupons.reduce((sum, c) => sum + c.usedCount, 0)} />
    </div>

    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Code</th><th>Discount</th><th>Plan</th><th>Usage</th><th>Expires</th><th>Status</th><th className="pr-4 text-right">Actions</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan={7} className="p-12 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-rose-500" /></td></tr> : coupons.map(coupon => <tr key={coupon.id} className="border-b border-border last:border-0"><td className="p-4"><span className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 font-black tracking-wider text-rose-600"><TicketPercent className="h-4 w-4" />{coupon.code}</span></td><td className="font-bold text-emerald-600">{coupon.discountPercent}% OFF</td><td className="capitalize">{coupon.applicablePlan === "platinum" ? "Diamond" : coupon.applicablePlan}</td><td>{coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : " / Unlimited"}</td><td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "No expiry"}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${coupon.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{coupon.active ? "Active" : "Inactive"}</span></td><td className="pr-4"><div className="flex justify-end gap-2"><button onClick={() => toggle(coupon)} className="grid h-9 w-9 place-items-center rounded-full border border-border" title={coupon.active ? "Deactivate" : "Activate"}><Power className={`h-4 w-4 ${coupon.active ? "text-emerald-600" : "text-slate-400"}`} /></button><button onClick={() => remove(coupon)} className="grid h-9 w-9 place-items-center rounded-full border border-rose-100 text-rose-500" title="Remove"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
      {!loading && coupons.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">No coupons yet. Create your first discount coupon.</div>}
    </div>

    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"><form onSubmit={createCoupon} className="relative w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl"><button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button><div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500"><TicketPercent className="h-6 w-6" /></div><h2 className="mt-4 text-2xl font-black">Create Coupon</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Coupon code"><input required maxLength={32} pattern="[A-Za-z0-9@_-]{3,32}" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="LOVE@1234" /></Field><Field label="Discount percentage"><input required type="number" min="1" max="99" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} placeholder="20" /></Field><Field label="Applicable plan"><select value={form.applicablePlan} onChange={e => setForm({ ...form, applicablePlan: e.target.value })}><option value="all">All paid plans</option><option value="gold">Gold</option><option value="platinum">Diamond</option></select></Field><Field label="Usage limit"><input type="number" min="1" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} placeholder="Unlimited" /></Field><Field label="Expiry date"><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input type="date" min={today} className="!pl-9" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} /></div></Field></div><button disabled={saving} className="mt-6 h-12 w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 font-bold text-white disabled:opacity-60">{saving ? "Creating..." : "Create Coupon"}</button></form></div>}
  </div>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-semibold"><span>{label}</span><div className="mt-2 [&_input]:h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-border [&_input]:bg-background [&_input]:px-3 [&_select]:h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-border [&_select]:bg-background [&_select]:px-3">{children}</div></label>; }
