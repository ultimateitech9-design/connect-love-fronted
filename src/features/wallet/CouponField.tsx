"use client";

import { useState } from "react";
import { Check, Loader2, TicketPercent, X } from "lucide-react";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";

export type WalletCoupon = { code: string; discountPercent: number };

/** Price in rupees after a coupon; mirrors the server (never below ₹1). */
export function couponPrice(pack: number, coupon: WalletCoupon | null) {
  if (!coupon) return pack;
  return Math.max(1, pack - Math.floor((pack * coupon.discountPercent) / 100));
}

/** "Have a coupon?" box for coin recharges. The buyer still gets every coin of the pack. */
export function CouponField({ coupon, onChange }: { coupon: WalletCoupon | null; onChange: (coupon: WalletCoupon | null) => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const apply = async () => {
    const value = code.trim().toUpperCase();
    if (!value || checking) return;
    setChecking(true);
    setError("");
    try {
      const response = await fetch(`${API_ORIGIN}/wallet/razorpay/coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ couponCode: value }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "This coupon could not be applied.");
      onChange({ code: data.code, discountPercent: Number(data.discountPercent) });
      setOpen(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This coupon could not be applied.");
    } finally {
      setChecking(false);
    }
  };

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <span className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
          <Check className="h-4 w-4" /> {coupon.code} applied · {coupon.discountPercent}% off
        </span>
        <button type="button" onClick={() => { onChange(null); setCode(""); }} className="text-xs font-bold text-muted-foreground hover:text-foreground">Remove</button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-500">
        <TicketPercent className="h-4 w-4" /> Have a coupon code?
      </button>
    );
  }

  return (
    <div>
      <form onSubmit={(event) => { event.preventDefault(); void apply(); }} className="flex gap-2">
        <input
          autoFocus
          value={code}
          onChange={(event) => { setCode(event.target.value.toUpperCase()); setError(""); }}
          maxLength={32}
          placeholder="Enter coupon code"
          aria-label="Coupon code"
          className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-semibold uppercase tracking-wide outline-none focus:border-rose-400"
        />
        <button type="submit" disabled={!code.trim() || checking} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-foreground px-4 text-sm font-bold text-background disabled:opacity-50">
          {checking && <Loader2 className="h-4 w-4 animate-spin" />} Apply
        </button>
        <button type="button" onClick={() => { setOpen(false); setError(""); }} aria-label="Close coupon" className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </form>
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
