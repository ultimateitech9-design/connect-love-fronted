"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Coins, Gift, Loader2, Search, UserRound } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { api, managementFetch } from "@/lib/api";

type Member = { id: string; name: string; email: string; role: string; plan: string; city: string; status: string };
type CreditResult = { success: boolean; coinsAdded: number; coinBalance: number; user: { id: string; name: string; email: string } };

export default function GiftCoinsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CreditResult | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      api.users(query, 1, 100).then((response) => {
        setMembers(response.users.filter((user) => user.role === "user"));
      }).catch((reason) => setError(reason instanceof Error ? reason.message : "Users could not be loaded."))
        .finally(() => setLoading(false));
    }, query.trim() ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [query]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setResult(null);
    const coins = Number(amount);
    if (!selected) return setError("Please select a member first.");
    if (!Number.isInteger(coins) || coins < 1 || coins > 1000000) return setError("Enter a whole coin amount between 1 and 1,000,000.");
    if (!window.confirm(`Give ${coins.toLocaleString()} gift coins to ${selected.name}?`)) return;

    setSubmitting(true);
    try {
      const response = await managementFetch<CreditResult>("/users/admin/coins/credit", {
        method: "POST",
        body: JSON.stringify({ userId: selected.id, amount: coins, note }),
      });
      setResult(response);
      setNote("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Coins could not be credited.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div>
    <PageHeader title="Gift Coins" description="Give spendable gift-wallet coins directly to a member." />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.75fr)]">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><UserRound className="h-5 w-5" /></div><div><h2 className="font-bold">Select member</h2><p className="text-xs text-muted-foreground">Search by name, email, or user ID.</p></div></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member..." className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" /></div>
        <div className="mt-4 max-h-[460px] space-y-2 overflow-y-auto pr-1">
          {loading ? <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading members...</div> : members.length === 0 ? <p className="py-16 text-center text-sm text-muted-foreground">No member found.</p> : members.slice(0, query.trim() ? 100 : 12).map((member) => <button key={member.id} type="button" onClick={() => { setSelected(member); setResult(null); }} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${selected?.id === member.id ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100" : "border-border hover:border-rose-200 hover:bg-rose-50/40"}`}><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-black text-slate-600">{member.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{member.name}</p><p className="truncate text-xs text-muted-foreground">{member.email}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold capitalize text-slate-600">{member.plan}</span></button>)}
        </div>
      </section>

      <section className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600"><Gift className="h-6 w-6" /></div><div><h2 className="font-bold">Credit coins</h2><p className="text-xs text-muted-foreground">Coins can be spent on gifts and themes.</p></div></div>
        {selected ? <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 p-3"><p className="text-xs font-semibold text-rose-600">Selected member</p><p className="mt-1 font-bold">{selected.name}</p><p className="text-xs text-muted-foreground">{selected.email}</p></div> : <div className="mb-5 rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Select a member from the list.</div>}
        <form onSubmit={submit} className="space-y-4">
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">Coin amount</span><div className="relative"><Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" /><input type="number" min="1" max="1000000" step="1" required value={amount} onChange={(event) => setAmount(event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm font-bold outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100" /></div></label>
          <div className="flex flex-wrap gap-2">{[50, 100, 500, 1000].map((coins) => <button key={coins} type="button" onClick={() => setAmount(String(coins))} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100">+{coins}</button>)}</div>
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">Reason / note <span className="font-normal text-muted-foreground">(optional)</span></span><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={90} rows={3} placeholder="Promotional reward, support adjustment..." className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" /></label>
          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>}
          {result && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" /> Coins added successfully</div><p className="mt-1 text-sm">{result.coinsAdded.toLocaleString()} coins added to {result.user.name}. New balance: <strong>{result.coinBalance.toLocaleString()} coins</strong>.</p></div>}
          <button type="submit" disabled={!selected || submitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}{submitting ? "Adding coins..." : "Give Gift Coins"}</button>
        </form>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">This action is recorded in Transaction History as a Super Admin credit. Credited coins are spendable and cannot be withdrawn as gift earnings.</p>
      </section>
    </div>
  </div>;
}
