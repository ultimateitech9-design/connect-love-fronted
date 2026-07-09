/* eslint-disable */
"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Heart, Loader2, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clearOnboardingRequired, setToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

function LoveScene() {
  return (
    <div className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-br from-[#140827] via-[#3a0b42] to-[#091934] p-6 text-white lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(244,63,94,0.24),transparent_28%),radial-gradient(circle_at_76%_64%,rgba(168,85,247,0.14),transparent_32%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <div className="mx-auto grid h-[230px] w-[280px] place-items-center [perspective:760px]">
          <div className="relative h-44 w-44">
            <div className="love-orbit absolute inset-0 [transform-style:preserve-3d]">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-white/10 shadow-xl shadow-rose-500/20 backdrop-blur-md"
                  style={{
                    transform: `rotateY(${i * 30}deg) translateZ(88px) rotateX(${i % 2 ? 16 : -16}deg)`,
                  }}
                >
                  <Heart className="h-5 w-5 fill-rose-400 text-rose-400" strokeWidth={0} />
                </div>
              ))}
            </div>
            <BrandLogo className="absolute left-1/2 top-1/2 z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-[28%] ring-2 ring-white/50 shadow-2xl shadow-rose-500/50" priority />
          </div>
        </div>

        <div>
          <div className="mb-4 flex gap-2">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Verified dating
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Real matches
            </div>
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight">
            Step back into your love story.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/62">
            Message your matches, continue conversations, and keep discovering people who feel aligned with you.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [showManagementLogin, setShowManagementLogin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginData) => {
    setError("");
    setShowManagementLogin(false);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        const message = body.message || "Invalid email or password.";
        setError(message);
        setShowManagementLogin(message.toLowerCase().includes("management login"));
        return;
      }

      const { access_token } = await res.json();
      setToken(access_token);
      clearOnboardingRequired();
      window.location.href = "/user/discover";
    } catch {
      setError("Cannot connect to server. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,rgba(244,63,94,0.10),transparent_28%),radial-gradient(circle_at_90%_85%,rgba(236,72,153,0.12),transparent_30%),linear-gradient(135deg,#fff7fa_0%,#fff0f5_45%,#f8fbff_100%)] px-4 py-6 sm:px-6 lg:p-6">
      <style jsx global>{`
        @keyframes love-orbit {
          0% { transform: rotateX(16deg) rotateY(0deg) rotateZ(-2deg); }
          50% { transform: rotateX(16deg) rotateY(180deg) rotateZ(2deg); }
          100% { transform: rotateX(16deg) rotateY(360deg) rotateZ(-2deg); }
        }
        .love-orbit {
          animation: love-orbit 6s linear infinite;
          transform-style: preserve-3d;
          will-change: transform;
        }
      `}</style>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-rose-200/45 lg:grid-cols-[1.05fr_0.95fr]">
        <LoveScene />

        <section className="relative mx-auto flex min-h-[560px] w-full max-w-none flex-col justify-center bg-white p-6 sm:p-10">
          <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-rose-600 lg:hidden">
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <BrandLogo className="h-12 w-12 shadow-lg shadow-rose-500/30" priority />
            <div>
              <p className="text-lg font-black text-slate-900">Connect Love</p>
              <p className="text-xs font-medium text-slate-400">Welcome back</p>
            </div>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-950">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Continue to your matches, messages, and profile.</p>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
              {showManagementLogin && (
                <Link href="/management/super-admin" className="mt-3 flex w-fit rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500">
                  Open Super Admin Login
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
              <input
                {...register("email")}
                id="login-email"
                type="email"
                placeholder="you@email.com"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
              />
              {errors.email && <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-rose-500 hover:text-rose-600">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  {...register("password")}
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.01] hover:from-rose-400 hover:to-pink-500 active:scale-[0.99] disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-rose-500 hover:text-rose-600">
              Create account
            </Link>
          </p>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}
