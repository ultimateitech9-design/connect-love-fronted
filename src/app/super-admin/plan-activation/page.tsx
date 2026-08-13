"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Crown, Loader2, Search, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { api, apiFetch } from "@/lib/api";

type UserOption = {
  id: string;
  name: string;
  email: string;
  city: string;
  plan: "free" | "gold" | "platinum";
  account: string;
  status: string;
};

type Plan = "free" | "gold" | "platinum";

const plans: { key: Plan; name: string; amount: string; description: string; tone: string }[] = [
  { key: "free", name: "Free", amount: "₹0", description: "Remove paid access and use Free plan limits.", tone: "border-slate-200 bg-slate-50 text-slate-700" },
  { key: "gold", name: "Gold", amount: "₹299", description: "20 likes/day, unlimited messages and Gold features.", tone: "border-amber-300 bg-amber-50 text-amber-900" },
  { key: "platinum", name: "Diamond", amount: "₹499", description: "40 likes/day and all Diamond plan features.", tone: "border-violet-300 bg-violet-50 text-violet-900" },
];

function displayPlan(plan: Plan) {
  return plan === "platinum" ? "Diamond" : plan[0].toUpperCase() + plan.slice(1);
}

export default function PlanActivationPage() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [plan, setPlan] = useState<Plan>("gold");
  const [durationDays, setDurationDays] = useState("30");
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const result = await api.users(search, 1, 100);
      setUsers(result.users as UserOption[]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Users could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadUsers(query); }, 250);
    return () => window.clearTimeout(timer);
  }, [query, loadUsers]);

  const matchingUsers = useMemo(() => users.slice(0, 12), [users]);
  const paidPlan = plan !== "free";

  const activate = async () => {
    if (!selectedUser) return toast.error("Select the user whose plan you want to activate.");
    const days = Number(durationDays);
    if (paidPlan && (!Number.isInteger(days) || days < 1 || days > 365)) {
      return toast.error("Duration must be between 1 and 365 days.");
    }

    setSaving(true);
    try {
      const result = await apiFetch<{ message: string; plan: Plan; expiresAt: string | null }>("/plan-activations", {
        method: "POST",
        body: JSON.stringify({ userId: selectedUser.id, plan, durationDays: paidPlan ? days : undefined }),
      });
      setSelectedUser({ ...selectedUser, plan, account: displayPlan(plan) });
      setUsers((current) => current.map((user) => user.id === selectedUser.id ? { ...user, plan, account: displayPlan(plan) } : user));
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Plan could not be activated.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-6 p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Subscription control</p>
        <h1 className="mt-1 text-3xl font-black text-foreground">Plan Activation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manually activate a plan for any user. Access updates immediately across the website.</p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Super Admin only</div>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-black">1. Select user</h2>
        <p className="mt-1 text-sm text-muted-foreground">Search by name, email, or exact user ID.</p>
        <div className="relative mt-5"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search user..." className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-0 transition focus:border-rose-400" /></div>
        <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {loading ? <div className="grid h-36 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-rose-500" /></div> : matchingUsers.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No user found. Try name, email, or full ID.</p> : matchingUsers.map((user) => {
            const active = selectedUser?.id === user.id;
            return <button type="button" key={user.id} onClick={() => setSelectedUser(user)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100" : "border-border hover:border-rose-200 hover:bg-rose-50/40"}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"><UserCheck className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate font-bold text-foreground">{user.name}</span><span className="block truncate text-xs text-muted-foreground">{user.email} · {user.city || "Unknown city"}</span><span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Current: {displayPlan(user.plan)}</span></span>
              {active && <CheckCircle2 className="h-5 w-5 shrink-0 text-rose-500" />}
            </button>;
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-black">2. Activate plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">The selected user gets the complete plan access immediately.</p>
        <div className="mt-5 space-y-3">{plans.map((item) => <button type="button" key={item.key} onClick={() => setPlan(item.key)} className={`w-full rounded-2xl border p-4 text-left transition ${plan === item.key ? `${item.tone} ring-2 ring-rose-200` : "border-border bg-background hover:border-rose-200"}`}><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 font-black"><Crown className="h-4 w-4" /> {item.name}</span><span className="font-black">{item.amount}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.description}</p></button>)}</div>
        {paidPlan && <label className="mt-5 block text-sm font-bold">Plan duration (days)<input type="number" min="1" max="365" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-rose-400" /></label>}
        <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm"><p className="font-bold">{selectedUser ? selectedUser.name : "No user selected"}</p><p className="mt-1 text-muted-foreground">{selectedUser ? `${displayPlan(plan)} ${paidPlan ? `for ${durationDays || 0} day(s)` : "limits"} will be applied.` : "Choose an account first."}</p></div>
        <button type="button" disabled={!selectedUser || saving} onClick={activate} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{saving ? "Activating..." : `Activate ${displayPlan(plan)}`}</button>
      </section>
    </div>
  </div>;
}
