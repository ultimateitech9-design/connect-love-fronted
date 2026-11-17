"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Coins, Loader2, PhoneCall, Save } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { managementFetch } from "@/lib/api";

type Settings = {
  enabled: boolean;
  videoRatePerMinute: number;
  audioRatePerMinute: number;
  freeCallsPerMonth: number;
  freeVideoSeconds: number;
  freeAudioSeconds: number;
  receiverPercent: number;
  agentPercent: number;
  maxCallsPerReceiverPerDay: number;
  packs: number[];
};

type Totals = { minutes: number; paidCalls: number; coins: number; receiverCoins: number; agentCoins: number; platformCoins: number };
type Stats = { month: Totals & { answeredCalls: number; freeCalls: number }; allTime: Totals };

type NumberField = Exclude<keyof Settings, "enabled" | "packs">;

const FIELDS: Array<{ key: NumberField; label: string; hint: string; suffix: string }> = [
  { key: "videoRatePerMinute", label: "Video call rate", hint: "Coins charged per started minute", suffix: "coins/min" },
  { key: "audioRatePerMinute", label: "Audio call rate", hint: "Coins charged per started minute", suffix: "coins/min" },
  { key: "freeCallsPerMonth", label: "Free calls per month", hint: "Answered calls, audio and video combined", suffix: "calls" },
  { key: "freeVideoSeconds", label: "Free video call length", hint: "Free calls are cut after this", suffix: "seconds" },
  { key: "freeAudioSeconds", label: "Free audio call length", hint: "Free calls are cut after this", suffix: "seconds" },
  { key: "receiverPercent", label: "Receiver share", hint: "Gets the agent share too when there is no agent", suffix: "%" },
  { key: "agentPercent", label: "Agent share", hint: "Agent who created the receiver's account", suffix: "%" },
  { key: "maxCallsPerReceiverPerDay", label: "Calls to one person per day", hint: "Spam limit per caller", suffix: "calls" },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function DirectCallsAdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [packsText, setPacksText] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    managementFetch<Settings>("/direct-calls/admin/settings")
      .then((data) => { setSettings(data); setPacksText(data.packs.join(", ")); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Settings could not be loaded."));
    managementFetch<Stats>("/direct-calls/admin/stats").then(setStats).catch(() => undefined);
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!settings) return;
    setError("");
    setSaved(false);
    const packs = packsText.split(",").map((value) => Number(value.trim())).filter((value) => value > 0);
    if (settings.receiverPercent + settings.agentPercent > 100) return setError("Receiver and agent shares cannot be more than 100%.");
    if (!window.confirm("Save direct call settings? They apply to new calls immediately.")) return;
    setSaving(true);
    try {
      const next = await managementFetch<Settings>("/direct-calls/admin/settings", { method: "PATCH", body: JSON.stringify({ ...settings, packs }) });
      setSettings(next);
      setPacksText(next.packs.join(", "));
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const platformPercent = settings ? 100 - settings.receiverPercent - settings.agentPercent : 0;

  return <div>
    <PageHeader title="Direct Calls" description="Paid calls between users who have not matched: rates, free allowance, coin packs and revenue." />

    {stats && <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Coins from calls this month" value={stats.month.coins.toLocaleString()} sub={`${stats.month.minutes.toLocaleString()} paid minutes · ${stats.month.paidCalls.toLocaleString()} paid calls`} />
      <StatCard label="Platform share this month" value={stats.month.platformCoins.toLocaleString()} sub={`Receivers ${stats.month.receiverCoins.toLocaleString()} · Agents ${stats.month.agentCoins.toLocaleString()}`} />
      <StatCard label="Answered direct calls this month" value={stats.month.answeredCalls.toLocaleString()} sub={`${stats.month.freeCalls.toLocaleString()} on the free allowance`} />
      <StatCard label="Coins from calls, all time" value={stats.allTime.coins.toLocaleString()} sub={`Platform ${stats.allTime.platformCoins.toLocaleString()}`} />
    </div>}

    {!settings ? (
      error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        : <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading settings…</div>
    ) : (
      <form onSubmit={save} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <label className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-border p-4">
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600"><PhoneCall className="h-5 w-5" /></span>
            <span><span className="block font-bold">Direct calls enabled</span><span className="text-xs text-muted-foreground">When off, users can only call their matches.</span></span>
          </span>
          <input type="checkbox" checked={settings.enabled} onChange={(event) => setSettings({ ...settings, enabled: event.target.checked })} className="h-5 w-5 accent-rose-600" />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1 block text-sm font-semibold">{field.label}</span>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={settings[field.key]}
                  onChange={(event) => setSettings({ ...settings, [field.key]: Number(event.target.value) })}
                  className="h-11 w-full rounded-xl border border-border bg-background pl-3 pr-24 text-sm font-bold outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{field.suffix}</span>
              </div>
              <span className="mt-1 block text-xs text-muted-foreground">{field.hint}</span>
            </label>
          ))}
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-semibold">Coin packs in the upgrade popup</span>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
              <input value={packsText} onChange={(event) => setPacksText(event.target.value)} placeholder="299, 499, 999" className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm font-bold outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
            </div>
            <span className="mt-1 block text-xs text-muted-foreground">Comma separated coin amounts (1 coin = ₹1), up to 6 packs.</span>
          </label>
        </div>

        <p className="mt-5 rounded-xl bg-muted p-3 text-sm">
          Split of every charged minute: receiver <strong>{settings.receiverPercent}%</strong>, agent <strong>{settings.agentPercent}%</strong>, platform <strong className={platformPercent < 0 ? "text-rose-600" : ""}>{platformPercent}%</strong>.
          {" "}Example: a {settings.videoRatePerMinute}-coin video minute pays the receiver {Math.floor(settings.videoRatePerMinute * settings.receiverPercent / 100)}, the agent {Math.floor(settings.videoRatePerMinute * settings.agentPercent / 100)} and the platform the rest.
        </p>

        {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</div>}
        {saved && <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-5 w-5" /> Settings saved. New calls use them right away.</div>}

        <button type="submit" disabled={saving} className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:brightness-105 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings
        </button>
      </form>
    )}
  </div>;
}
