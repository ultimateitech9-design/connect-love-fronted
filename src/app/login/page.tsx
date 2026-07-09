/* eslint-disable */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Heart, Loader2, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clearOnboardingRequired, setToken } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginData = z.infer<typeof loginSchema>;

function FloatingHearts() {
  const [hearts, setHearts] = useState<{ id: number; x: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate 18 floating hearts with randomized properties
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage left
      size: Math.random() * 24 + 12, // size in px
      duration: Math.random() * 14 + 10, // speed in seconds
      delay: Math.random() * 8, // start delay
    }));
    setHearts(generated);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute bottom-0 text-rose-500/20 fill-rose-500/10"
          style={{
            left: `${heart.x}%`,
            width: heart.size,
            height: heart.size,
          }}
          initial={{ y: 50, opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{
            y: "-110vh",
            opacity: [0, 0.45, 0.45, 0],
            scale: [0.5, 1, 1, 0.7],
            rotate: [0, 60, -60, 120],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear",
          }}
        >
          <Heart className="w-full h-full text-rose-400/25 fill-rose-400/15" />
        </motion.div>
      ))}
    </div>
  );
}

function LoveScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-tr from-[#0f051d] via-[#2f0b3b] via-[#4d0c4d] to-[#0e172c] p-8 text-white lg:flex lg:flex-col lg:justify-between animate-gradient-bg">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(244,63,94,0.22),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.18),transparent_40%)] pointer-events-none" />

      {/* Floating Hearts Particle System */}
      {mounted && <FloatingHearts />}

      {/* Back button */}
      <div className="relative z-20">
        <Link 
          href="/" 
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-lg hover:shadow-pink-500/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </div>

      {/* Central Visual Showcase */}
      <div className="relative z-10 mx-auto flex h-[280px] w-full max-w-[320px] items-center justify-center">
        {/* Pulsing Outer Glow Aura */}
        <motion.div
          className="absolute h-56 w-56 rounded-full bg-rose-500/10 blur-[60px]"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Orbit Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Ring 1 - Dashed glass ring */}
          <motion.div 
            className="absolute h-48 w-48 rounded-full border border-dashed border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          {/* Ring 2 - solid colored thin ring with tilt */}
          <motion.div 
            className="absolute h-56 w-56 rounded-full border border-rose-500/20 [transform:rotateX(60deg)_rotateY(15deg)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          {/* Ring 3 - small accent glow ring */}
          <motion.div 
            className="absolute h-40 w-40 rounded-full border border-pink-500/15"
            animate={{ rotate: 180 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Floating Orbs on Orbit */}
        {mounted && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Orbiting Heart 1 */}
            <motion.div
              className="absolute left-1/2 top-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ width: 0, height: 0 }}
            >
              <motion.div
                className="absolute -left-3 -top-12 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-rose-500/40 backdrop-blur-sm"
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-4 w-4 fill-white text-white" />
              </motion.div>
            </motion.div>

            {/* Orbiting Heart 2 */}
            <motion.div
              className="absolute left-1/2 top-1/2"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ width: 0, height: 0 }}
            >
              <motion.div
                className="absolute -left-12 top-12 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 border border-white/20 shadow-md shadow-pink-500/20 backdrop-blur-md"
                animate={{ scale: [1, 0.8, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <Heart className="h-3 w-3 fill-rose-400 text-rose-400" />
              </motion.div>
            </motion.div>

            {/* Glowing Spark 1 */}
            <motion.div
              className="absolute left-1/2 top-1/2"
              animate={{ rotate: 120 }}
              style={{ width: 0, height: 0 }}
            >
              <motion.div
                className="absolute left-16 -top-16 h-2 w-2 rounded-full bg-amber-300 shadow-md shadow-amber-300/50"
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.7, 1.3, 0.7],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        )}

        {/* Central Logo Container */}
        <motion.div
          className="relative z-10 flex h-32 w-32 items-center justify-center rounded-[32%] bg-white/5 border border-white/15 shadow-2xl shadow-rose-500/30 backdrop-blur-lg cursor-pointer"
          animate={{
            y: [-6, 6, -6],
            scale: [1, 1.03, 1],
          }}
          transition={{
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
          whileHover={{
            scale: 1.08,
            boxShadow: "0 25px 50px -12px rgba(244, 63, 94, 0.5)",
            borderColor: "rgba(255, 255, 255, 0.3)"
          }}
        >
          <BrandLogo className="h-20 w-20 rounded-[28%] ring-1 ring-white/30 shadow-xl shadow-rose-500/40 transition-transform duration-300 hover:scale-105" priority />
        </motion.div>
      </div>

      {/* Badges & Description */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10"
      >
        <div className="mb-5 flex gap-2.5">
          <motion.div 
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md shadow-sm cursor-default"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Verified dating
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md shadow-sm cursor-default"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)" }}
          >
            <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
            Real matches
          </motion.div>
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white via-pink-100 to-rose-200 bg-clip-text text-transparent">
          Step back into your love story.
        </h1>
        <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-white/70">
          Message your matches, continue conversations, and keep discovering people who feel aligned with you.
        </p>
      </motion.div>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,rgba(244,63,94,0.12),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(236,72,153,0.14),transparent_35%),linear-gradient(135deg,#fff8fb_0%,#fff2f7_45%,#f5f9ff_100%)] px-4 py-6 sm:px-6 lg:p-6 flex items-center justify-center overflow-x-hidden">
      <style>{`
        @keyframes gradient-bg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradient-bg 15s ease infinite;
        }
      `}</style>
      <div className="mx-auto w-full max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid w-full overflow-hidden rounded-[2.5rem] border border-white/80 bg-white shadow-2xl shadow-rose-200/50 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <LoveScene />

          <section className="relative flex flex-col justify-center bg-white p-8 sm:p-12 min-h-[560px]">
            <div className="w-full max-w-md mx-auto">
              {/* Mobile Back Home Button */}
              <Link 
                href="/" 
                className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-rose-500 lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>

              <div className="mb-8 flex items-center gap-3.5">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BrandLogo className="h-12 w-12 shadow-lg shadow-rose-500/25" priority />
                </motion.div>
                <div>
                  <p className="text-lg font-black tracking-tight text-slate-900">Connect Love</p>
                  <p className="text-xs font-semibold text-slate-400">Welcome back</p>
                </div>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Sign in</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">Continue to your matches, messages, and profile.</p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm"
                >
                  {error}
                  {showManagementLogin && (
                    <Link 
                      href="/management/super-admin" 
                      className="mt-3 flex w-fit rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
                    >
                      Open Super Admin Login
                    </Link>
                  )}
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-slate-700">Email Address</label>
                  <input
                    {...register("email")}
                    id="login-email"
                    type="email"
                    placeholder="you@email.com"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:shadow-sm"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-bold text-slate-700">Password</label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 relative group transition-colors"
                    >
                      Forgot password?
                      <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-rose-500 transform scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left" />
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      {...register("password")}
                      id="login-password"
                      type={showPass ? "text" : "password"}
                      placeholder="Password"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition-all duration-300 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:shadow-sm"
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      <AnimatePresence mode="wait">
                        {showPass ? (
                          <motion.div
                            key="eye-off"
                            initial={{ opacity: 0, rotate: -45 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.15 }}
                          >
                            <EyeOff className="h-5 w-5" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="eye"
                            initial={{ opacity: 0, rotate: 45 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -45 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Eye className="h-5 w-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{errors.password.message}</p>}
                </div>

                <motion.button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(244, 63, 94, 0.35)" }}
                  whileTap={{ scale: 0.99 }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all duration-300 hover:from-rose-400 hover:to-pink-500 disabled:opacity-75 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link 
                  href="/register" 
                  className="font-bold text-rose-500 hover:text-rose-600 relative group transition-colors"
                >
                  Create account
                  <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-rose-500 transform scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left" />
                </Link>
              </p>
            </div>
          </section>
        </motion.div>
      </div>
    </main>
  );
}

