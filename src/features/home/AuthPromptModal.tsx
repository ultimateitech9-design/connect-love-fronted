"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Heart, Loader2, LockKeyhole, Mail, UserRound, X } from "lucide-react";
import { clearOnboardingRequired, isAuthenticated, setToken } from "@/lib/auth";
import { API_ORIGIN } from "@/config/runtime";

type AuthMode = "register" | "login";

export function AuthPromptModal() {
  const router = useRouter();
  const pathname = usePathname();
  const shownThisPageLoad = useRef(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const excludedRoutes = [
      "/login", "/register", "/forgot-password", "/user", "/discover",
      "/admin", "/super-admin", "/management", "/marketing", "/sales", "/support",
    ];
    const isExcludedRoute = excludedRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
    if (isExcludedRoute || isAuthenticated()) {
      setOpen(false);
      return;
    }
    if (shownThisPageLoad.current) return;

    const timer = window.setTimeout(() => {
      shownThisPageLoad.current = true;
      setOpen(true);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

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

  const goToAuthPage = (targetMode: AuthMode = mode) => {
    setOpen(false);
    router.push(targetMode === "register" ? "/register" : "/login");
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "register") {
      goToAuthPage("register");
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
            className="relative w-full max-w-[430px] overflow-hidden rounded-[24px] border border-white/70 bg-white px-6 pb-6 pt-5 text-slate-900 shadow-[0_28px_90px_rgba(15,23,42,0.35)]"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close account popup"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-pink-500 to-violet-600 shadow-lg shadow-pink-500/25">
              <Heart className="h-6 w-6 fill-white text-white" />
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              {(["register", "login"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMode(tab)}
                  className={`rounded-lg py-2.5 text-sm font-semibold capitalize transition-all ${
                    mode === tab
                      ? "bg-white text-rose-500 shadow-sm ring-1 ring-rose-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mb-5 mt-5 text-center">
              <h2 id="auth-prompt-title" className="text-2xl font-bold tracking-tight">
                {mode === "register" ? "Create Your Account" : "Welcome Back"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "register" ? "Join and start connecting" : "Sign in and continue connecting"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              {mode === "register" && (
                <button type="button" onClick={() => goToAuthPage("register")} className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-left text-sm text-slate-500 transition hover:border-rose-300 hover:bg-rose-50/40">
                  <UserRound className="h-5 w-5" /> Full Name
                </button>
              )}
              <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-500 transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
                <Mail className="h-4.5 w-4.5 shrink-0" />
                <input
                  type="email"
                  required={mode === "login"}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onClick={() => mode === "register" && goToAuthPage("register")}
                  placeholder="Email Address"
                  className="min-w-0 flex-1 bg-transparent text-sm leading-none outline-none placeholder:text-sm placeholder:text-slate-500"
                />
              </label>
              <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-sm text-slate-500 transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
                <LockKeyhole className="h-4.5 w-4.5 shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  required={mode === "login"}
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onClick={() => mode === "register" && goToAuthPage("register")}
                  placeholder="Password"
                  className="min-w-0 flex-1 bg-transparent text-sm leading-none outline-none placeholder:text-sm placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </label>

              {error && <p className="rounded-lg bg-rose-50 px-2.5 py-2 text-[10px] font-medium text-rose-600">{error}</p>}

              <button
                type={mode === "register" ? "button" : "submit"}
                onClick={() => {
                  if (mode === "register") goToAuthPage("register");
                }}
                disabled={loading}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition hover:-translate-y-0.5 hover:shadow-pink-500/35 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {mode === "register" ? "Create Account" : loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              {mode === "register" ? "Already have an account?" : "New to ConnectLove?"}{" "}
              <button
                type="button"
                onClick={() => {
                  if (mode === "login") {
                    goToAuthPage("register");
                  } else {
                    setMode("login");
                  }
                }}
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
