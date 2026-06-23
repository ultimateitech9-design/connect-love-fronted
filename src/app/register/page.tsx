/* eslint-disable */
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Heart, Loader2, MapPin, ShieldCheck, Sparkles, UserRoundPlus } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain an uppercase letter").regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  birthDate: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select a gender"),
  city: z.string().max(150, "City name is too long").optional(),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupData = z.infer<typeof signupSchema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({ resolver: zodResolver(signupSchema) });

  const password = watch("password", "");
  const checks = useMemo(() => [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ], [password]);

  const detectLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Location is not supported in this browser.");
      return;
    }

    setLocationStatus("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7)),
        };
        setCoords(nextCoords);
        setLocationStatus("Location saved with this signup.");
      },
      () => {
        setLocationStatus("Location permission was not allowed. You can still enter your city.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const onSubmit = async (data: SignupData) => {
    setError("");
    try {
      const regRes = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          birthDate: data.birthDate,
          gender: data.gender,
          city: data.city?.trim() || undefined,
          locationLatitude: coords?.latitude,
          locationLongitude: coords?.longitude,
        }),
      });

      if (!regRes.ok) {
        const body = await regRes.json();
        setError(body.message || "Registration failed. Please try again.");
        return;
      }

      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (loginRes.ok) {
        const { access_token } = await loginRes.json();
        setToken(access_token);
        window.location.href = "/user/onboarding";
        return;
      }

      window.location.href = "/login";
    } catch {
      setError("Cannot connect to server. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,rgba(244,63,94,0.13),transparent_30%),radial-gradient(circle_at_88%_88%,rgba(168,85,247,0.12),transparent_28%),linear-gradient(135deg,#fff7fa_0%,#fff0f6_48%,#f7fbff_100%)] px-4 py-6 sm:px-6 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid overflow-hidden rounded-[2rem] border border-white/75 bg-white shadow-2xl shadow-rose-200/45 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br from-[#160827] via-[#401055] to-[#101d3c] p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.32),transparent_26%),radial-gradient(circle_at_72%_70%,rgba(236,72,153,0.22),transparent_30%)]" />
            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
            </div>

            <div className="relative z-10">
              <div className="mb-8 grid h-20 w-20 place-items-center rounded-[1.6rem] bg-white/12 shadow-xl shadow-rose-500/20 backdrop-blur">
                <UserRoundPlus className="h-10 w-10 text-rose-200" />
              </div>
              <h1 className="max-w-sm text-4xl font-black leading-tight tracking-tight">
                Create a profile that feels like you.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
                Start with the basics. You will add photos, interests, and deeper profile details during onboarding.
              </p>
            </div>

            <div className="relative z-10 grid gap-3">
              {[
                ["Verified community", ShieldCheck],
                ["Better matches", Sparkles],
                ["Private messaging", Heart],
              ].map(([label, Icon]: any) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/82 backdrop-blur">
                  <Icon className="h-4 w-4 text-rose-200" />
                  {label}
                </div>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[620px] flex-col justify-center p-5 sm:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-2xl">
              <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-600 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>

              <div className="mb-7 flex items-center gap-3">
                <BrandLogo className="h-12 w-12 shadow-lg shadow-rose-500/25" priority />
                <div>
                  <p className="text-lg font-black text-slate-950">Connect Love</p>
                  <p className="text-xs font-semibold text-slate-400">New member account</p>
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-950">Create your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">A clean start for real matches. No clutter, no oversized modal.</p>

              {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name" error={errors.name?.message}>
                    <input {...register("name")} id="signup-name" placeholder="Jane Doe" className="field-input" />
                  </Field>
                  <Field label="Date of Birth" error={errors.birthDate?.message}>
                    <input {...register("birthDate")} id="signup-dob" type="date" className="field-input" />
                  </Field>
                </div>

                <Field label="Email Address" error={errors.email?.message}>
                  <input {...register("email")} id="signup-email" type="email" placeholder="you@email.com" className="field-input" />
                </Field>

                <Field label="Gender" error={errors.gender?.message}>
                  <select {...register("gender")} id="signup-gender" className="field-input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </Field>

                <Field label="Location" error={errors.city?.message}>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input {...register("city")} id="signup-city" placeholder="Your city" className="field-input" />
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
                    >
                      <MapPin className="h-4 w-4" />
                      Use GPS
                    </button>
                  </div>
                  {locationStatus && <p className="mt-1.5 text-xs text-slate-500">{locationStatus}</p>}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Password" error={errors.password?.message}>
                    <div className="relative">
                      <input {...register("password")} id="signup-password" type={showPass ? "text" : "password"} placeholder="Strong password" className="field-input pr-12" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700" aria-label={showPass ? "Hide password" : "Show password"}>
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm Password" error={errors.confirmPassword?.message}>
                    <input {...register("confirmPassword")} id="signup-confirm-password" type="password" placeholder="Re-enter password" className="field-input" />
                  </Field>
                </div>

                {password && (
                  <div className="flex flex-wrap gap-2">
                    {checks.map((c) => (
                      <span key={c.label} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${c.ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        <Check className="h-3.5 w-3.5" />
                        {c.label}
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                    <input {...register("agreeTerms")} id="signup-agree-terms" type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-rose-600 focus:ring-rose-400" />
                    <span>I agree to the Terms of Service and Privacy Policy. I confirm I am 18+.</span>
                  </label>
                  {errors.agreeTerms && <p className="mt-1.5 text-xs text-rose-500">{errors.agreeTerms.message}</p>}
                </div>

                <button id="signup-submit-btn" type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-black text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.01] hover:from-rose-400 hover:to-pink-500 active:scale-[0.99] disabled:opacity-70">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Creating account..." : "Create My Account"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                Already have an account? <Link href="/login" className="font-black text-rose-500 hover:text-rose-600">Sign In</Link>
              </p>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .field-input {
          height: 3rem;
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0 1rem;
          font-size: 0.875rem;
          color: rgb(15 23 42);
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .field-input:focus {
          border-color: rgb(244 63 94);
          background: white;
          box-shadow: 0 0 0 4px rgb(255 228 230);
        }
      `}</style>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
