"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Heart, Loader2, LockKeyhole, Mail, UserRound, X } from "lucide-react";
import { clearOnboardingRequired, isAuthenticated, setToken } from "@/lib/auth";
import { API_ORIGIN } from "@/config/runtime";

type AuthMode = "register" | "login";

export function AuthPromptModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const goToAuthPage = () => router.push(mode === "register" ? "/register" : "/login");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "register") {
      router.push("/register");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_ORIGIN}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(Array.isArray(body.message) ? body.message[0] : body.message);
      }
      setToken(body.access_token);
      clearOnboardingRequired();
      window.location.href = "/user/discover";
    } catch (reason) {
      setError(reason instanceof Error && reason.message ? reason.message : "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-prompt-title"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-[305px] overflow-hidden rounded-[20px] border border-white/70 bg-white px-4 pb-4 pt-3.5 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.35)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close account popup"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 via-pink-500 to-violet-600 shadow-lg shadow-pink-500/25">
              <Heart className="h-[18px] w-[18px] fill-white text-white" />
            </div>

            <div className="mt-3 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
              {(["register", "login"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMode(tab)}
                  className={`rounded-md py-1.5 text-[11px] font-semibold capitalize transition-all ${
                    mode === tab
                      ? "bg-white text-rose-500 shadow-sm ring-1 ring-rose-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mb-3 mt-3 text-center">
              <h2 id="auth-prompt-title" className="text-lg font-bold tracking-tight">
                {mode === "register" ? "Create Your Account" : "Welcome Back"}
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {mode === "register" ? "Join and start connecting" : "Sign in and continue connecting"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-2">
              {mode === "register" && (
                <button type="button" onClick={goToAuthPage} className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 text-left text-[11px] text-slate-500 transition hover:border-rose-300 hover:bg-rose-50/40">
                  <UserRound className="h-4 w-4" /> Full Name
                </button>
              )}
              <label className="flex h-8 w-full items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-500 transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <input
                  type="email"
                  required={mode === "login"}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onClick={() => mode === "register" && router.push("/register")}
                  placeholder="Email Address"
                  className="min-w-0 flex-1 bg-transparent text-[11px] leading-none outline-none placeholder:text-[11px] placeholder:text-slate-500"
                />
              </label>
              <label className="flex h-8 w-full items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-[11px] text-slate-500 transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
                <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required={mode === "login"}
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onClick={() => mode === "register" && router.push("/register")}
                  placeholder="Password"
                  className="min-w-0 flex-1 bg-transparent text-[11px] leading-none outline-none placeholder:text-[11px] placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </label>

              {error && <p className="rounded-lg bg-rose-50 px-2.5 py-2 text-[10px] font-medium text-rose-600">{error}</p>}

              <button
                type={mode === "register" ? "button" : "submit"}
                onClick={() => {
                  if (mode === "register") router.push("/register");
                }}
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 py-2.5 text-[11px] font-bold text-white shadow-lg shadow-pink-500/25 transition hover:-translate-y-0.5 hover:shadow-pink-500/35 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {mode === "register" ? "Create Account" : loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="my-3 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> or continue with <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={goToAuthPage} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>
                Google
              </button>
              <button type="button" onClick={goToAuthPage} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M17.05 12.54c-.03-3.05 2.49-4.53 2.6-4.6a5.58 5.58 0 0 0-4.39-2.37c-1.84-.2-3.63 1.1-4.57 1.1-.96 0-2.42-1.08-3.98-1.05a5.82 5.82 0 0 0-4.9 2.99c-2.12 3.67-.54 9.07 1.5 12.03 1.02 1.46 2.2 3.08 3.76 3.02 1.52-.06 2.09-.97 3.92-.97 1.81 0 2.35.97 3.94.93 1.64-.02 2.67-1.46 3.65-2.93a12 12 0 0 0 1.67-3.4 5.24 5.24 0 0 1-3.2-4.75ZM14.06 3.62A5.3 5.3 0 0 0 15.27 0a5.4 5.4 0 0 0-3.49 1.72 5.02 5.02 0 0 0-1.24 3.48 4.46 4.46 0 0 0 3.52-1.58Z"/></svg>
                Apple
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              {mode === "register" ? "Already have an account?" : "New to ConnectLove?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                className="font-bold text-violet-600 hover:text-violet-700"
              >
                {mode === "register" ? "Log In" : "Register"}
              </button>
            </p>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
