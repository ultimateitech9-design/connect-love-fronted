"use client";
import { API_ORIGIN } from "@/config/runtime";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, MailCheck } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const API_BASE = API_ORIGIN;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "reset" | "done">("email");
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
      setStep("otp");
    } catch {
      setError("Could not send your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    setStep("reset");
  };

  const resetPassword = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    setStep("done");
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

        {step === "done" ? (
          <div className="mt-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-4 text-2xl font-black text-slate-950">Password updated</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Your new password is ready. You can sign in with {email}.</p>
            <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-rose-500 px-6 py-3 text-sm font-bold text-white">Return to sign in</Link>
          </div>
        ) : step === "otp" ? (
          <form onSubmit={verifyOtp} className="mt-8">
            <MailCheck className="h-10 w-10 text-rose-500" />
            <h1 className="mt-4 text-2xl font-black text-slate-950">Enter OTP</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">We sent an OTP to {email}. For now any OTP will work.</p>
            <label htmlFor="recovery-otp" className="mt-6 block text-sm font-bold text-slate-700">OTP code</label>
            <input id="recovery-otp" value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" autoComplete="one-time-code" required className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-lg font-black tracking-[0.35em] outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" placeholder="000000" />
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-black text-white">
              Verify OTP
            </button>
            <button type="button" onClick={() => { setStep("email"); setError(""); }} className="mt-3 h-11 w-full rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:text-rose-600">
              Change email
            </button>
          </form>
        ) : step === "reset" ? (
          <form onSubmit={resetPassword} className="mt-8">
            <LockKeyhole className="h-10 w-10 text-rose-500" />
            <h1 className="mt-4 text-2xl font-black text-slate-950">Create new password</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Choose a new password and confirm it to finish recovery.</p>
            <label htmlFor="new-password" className="mt-6 block text-sm font-bold text-slate-700">New password</label>
            <div className="relative mt-2">
              <input id="new-password" type={showPassword ? "text" : "password"} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" placeholder="New password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <label htmlFor="confirm-new-password" className="mt-4 block text-sm font-bold text-slate-700">Confirm password</label>
            <input id="confirm-new-password" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100" placeholder="Confirm password" />
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            <button type="submit" className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-black text-white">
              Update password
            </button>
          </form>
        ) : (
          <form onSubmit={submit} className="mt-8">
            <KeyRound className="h-10 w-10 text-rose-500" />
            <h1 className="mt-4 text-2xl font-black text-slate-950">Forgot your password?</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Enter your account email. We will send an OTP to reset your password.</p>
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
