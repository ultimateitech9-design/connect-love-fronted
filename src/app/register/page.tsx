/* eslint-disable */
"use client";
import { API_ORIGIN } from "@/config/runtime";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Heart, Loader2, MailCheck, MapPin, ShieldCheck, Sparkles, UserRoundPlus } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requireOnboarding, setToken } from "@/lib/auth";
import { REGISTRATION_GENDER_OPTIONS } from "@/features/discovery/gender-options";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

const API_BASE = API_ORIGIN;

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain an uppercase letter").regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
  birthDate: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select a gender"),
  city: z.string().max(150, "City name is too long").optional(),
  agreeTerms: z.boolean().refine(Boolean, "You must accept the terms"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupData = z.infer<typeof signupSchema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingSignup, setPendingSignup] = useState<SignupData | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      gender: "",
      city: "",
      agreeTerms: false,
    },
  });

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

    setDetectingLocation(true);
    setLocationStatus("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = {
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7)),
        };
        setCoords(nextCoords);

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${nextCoords.latitude}&longitude=${nextCoords.longitude}&localityLanguage=en`,
          );
          const place = await res.json();
          const locationParts = [
            place.locality,
            place.city,
            place.principalSubdivision,
          ].filter((part, index, parts) => part && parts.indexOf(part) === index);
          const locationName = locationParts.join(", ") || place.countryName;

          if (locationName) {
            setValue("city", locationName, { shouldDirty: true, shouldValidate: true });
            setLocationStatus("Location saved with this signup.");
          } else {
            setLocationStatus("Location saved. Please enter your city.");
          }
        } catch {
          setLocationStatus("Location saved. Please enter your city.");
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        setLocationStatus("Location permission was not allowed. You can still enter your city.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const createAccount = async (data: SignupData) => {
    setError("");
    setCreatingAccount(true);
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
        requireOnboarding();
        window.location.href = "/user/onboarding";
        return;
      }

      window.location.href = "/login";
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setCreatingAccount(false);
    }
  };

  const onSubmit = (data: SignupData) => {
    setError("");
    setOtp("");
    setPendingSignup(data);
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    if (!pendingSignup) return;
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    await createAccount(pendingSignup);
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(244,63,94,0.13),transparent_30%),radial-gradient(circle_at_88%_88%,rgba(168,85,247,0.12),transparent_28%),linear-gradient(135deg,#fff7fa_0%,#fff0f6_48%,#f7fbff_100%)] px-3 py-2 sm:px-5 lg:p-3">
      <div className="mx-auto grid min-h-[calc(100dvh-1rem)] max-w-5xl items-center md:min-h-[calc(100dvh-1.5rem)]">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-white/75 bg-white shadow-2xl shadow-rose-200/40 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="relative hidden min-h-[560px] overflow-hidden bg-gradient-to-br from-[#160827] via-[#401055] to-[#101d3c] p-6 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,63,94,0.32),transparent_26%),radial-gradient(circle_at_72%_70%,rgba(236,72,153,0.22),transparent_30%)]" />
            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/75 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
            </div>

            <div className="relative z-10">
              <div className="mb-6 grid h-16 w-16 place-items-center rounded-[1.25rem] bg-white/12 shadow-xl shadow-rose-500/20 backdrop-blur">
                <UserRoundPlus className="h-8 w-8 text-rose-200" />
              </div>
              <h1 className="max-w-sm text-3xl font-black leading-tight tracking-tight">
                Create a profile that feels like you.
              </h1>
              <p className="mt-3 max-w-sm text-xs leading-5 text-white/65">
                Start with the basics. You will add photos, interests, and deeper profile details during onboarding.
              </p>
            </div>

            <div className="relative z-10 grid gap-2">
              {[
                ["Verified community", ShieldCheck],
                ["Better matches", Sparkles],
                ["Private messaging", Heart],
              ].map(([label, Icon]: any) => (
                <div key={label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white/82 backdrop-blur">
                  <Icon className="h-4 w-4 text-rose-200" />
                  {label}
                </div>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[520px] flex-col justify-center p-4 sm:p-5 lg:p-7">
            <div className="mx-auto w-full max-w-xl">
              <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-rose-600 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>

              <div className="mb-4 flex items-center gap-3">
                <BrandLogo className="h-9 w-9 shadow-lg shadow-rose-500/25" priority />
                <div>
                  <p className="text-base font-black text-slate-950">Connect Love</p>
                  <p className="text-xs font-semibold text-slate-400">New member account</p>
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-slate-950">{pendingSignup ? "Verify your email" : "Create your account"}</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {pendingSignup ? `Enter the OTP sent to ${pendingSignup.email}. For now any OTP will work.` : "A clean start for real matches. No clutter, no oversized modal."}
              </p>

              {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

              {pendingSignup ? (
                <form onSubmit={verifyOtp} className="mt-6 grid gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
                    <MailCheck className="h-7 w-7" />
                  </div>
                  <Field label="OTP Code">
                    <input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Enter any OTP"
                      className="field-input h-12 text-center text-lg font-black tracking-[0.35em]"
                    />
                  </Field>
                  <div className="grid gap-2 sm:grid-cols-[auto_1fr]">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingSignup(null);
                        setError("");
                      }}
                      className="h-11 rounded-xl border border-slate-200 px-5 text-xs font-black text-slate-600 transition hover:border-rose-200 hover:text-rose-600"
                    >
                      Edit details
                    </button>
                    <button type="submit" disabled={creatingAccount} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-xs font-black text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.01] hover:from-rose-400 hover:to-pink-500 active:scale-[0.99] disabled:opacity-70">
                      {creatingAccount && <Loader2 className="h-4 w-4 animate-spin" />}
                      {creatingAccount ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </form>
              ) : (
              <div>
                <div className="mt-4">
                  <GoogleAuthButton mode="signup" />
                  <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
                    By continuing with Google, you confirm you are 18+ and agree to the Terms of Service and Privacy Policy.
                  </p>
                </div>
                <div className="my-3 flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">or register with email</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2.5">
                <div className="grid gap-3 sm:grid-cols-2">
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
                    {REGISTRATION_GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Location" error={errors.city?.message}>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input {...register("city")} id="signup-city" placeholder="Your city" className="field-input" />
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={detectingLocation}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-black text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                      {detectingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                      {detectingLocation ? "Finding..." : "Use GPS"}
                    </button>
                  </div>
                  {locationStatus && <p className="mt-1.5 text-xs text-slate-500">{locationStatus}</p>}
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
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
                      <span key={c.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${c.ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        <Check className="h-3.5 w-3.5" />
                        {c.label}
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <label className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-5 text-slate-500">
                    <input {...register("agreeTerms")} id="signup-agree-terms" type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-rose-600 focus:ring-rose-400" />
                    <span className="min-w-0">I agree to the Terms of Service and Privacy Policy. I confirm I am 18+.</span>
                  </label>
                  {errors.agreeTerms && <p className="mt-1.5 text-xs text-rose-500">{errors.agreeTerms.message}</p>}
                </div>

                <button id="signup-submit-btn" type="submit" disabled={isSubmitting} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-xs font-black text-white shadow-lg shadow-rose-500/25 transition hover:scale-[1.01] hover:from-rose-400 hover:to-pink-500 active:scale-[0.99] disabled:opacity-70">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Sending OTP..." : "Create My Account"}
                </button>
              </form>
              </div>
              )}

              <p className="mt-2 text-center text-xs text-slate-500">
                Already have an account? <Link href="/login" className="font-black text-rose-500 hover:text-rose-600">Sign In</Link>
              </p>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .field-input {
          height: 2.5rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0 1rem;
          font-size: 0.8125rem;
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
      <label className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
