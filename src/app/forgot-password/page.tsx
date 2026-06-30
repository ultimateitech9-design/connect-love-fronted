"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Password recovery request",
          email,
          subject: "Password recovery",
          message: "I cannot access my ConnectLove account and need help resetting my password.",
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      setSent(true);
    } catch {
      setError("Could not send your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-rose-50 via-white to-purple-50 px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-7 shadow-2xl shadow-rose-200/40 sm:p-9">
        <Link href="/login" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-600">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <div className="flex items-center gap-3">
          <BrandLogo className="h-11 w-11" priority />
          <div><p className="font-black text-slate-950">ConnectLove</p><p className="text-xs text-slate-400">Account recovery</p></div>
        </div>

        {sent ? (
          <div className="mt-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-4 text-2xl font-black text-slate-950">Request received</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Support will verify your account and contact you at {email}.</p>
            <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-rose-500 px-6 py-3 text-sm font-bold text-white">Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8">
            <KeyRound className="h-10 w-10 text-rose-500" />
            <h1 className="mt-4 text-2xl font-black text-slate-950">Forgot your password?</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Enter your account email. A recovery request will be securely sent to support.</p>
            <label htmlFor="recovery-email" className="mt-6 block text-sm font-bold text-slate-700">Email address</label>
            <input id="recovery-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" placeholder="you@email.com" />
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <button type="submit" disabled={loading} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-black text-white disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Sending..." : "Request recovery"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
