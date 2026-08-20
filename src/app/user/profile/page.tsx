"use client";
import { apiFetch } from "@/config/runtime";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhotoGrid } from "@/features/user/PhotoGrid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera, Eye, Heart as HeartIcon, LogOut, Sparkles, Loader2, CheckCircle2, AlertCircle, X,
  Lock, Unlock, BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import { logout, getToken, clearToken } from "@/lib/auth";
import { cacheAvatarUrl } from "@/lib/avatarCache";

const RELATIONSHIP_GOALS = ["Long-term", "Casual", "Friendships", "Not sure yet"] as const;
const PERSONALITY_SUGGESTIONS = ["Adventurous", "Ambitious", "Calm", "Caring", "Confident", "Creative", "Funny", "Honest", "Introverted", "Kind", "Loyal", "Romantic", "Witty"];
const INTEREST_SUGGESTIONS = ["Travel", "Music", "Movies", "Fitness", "Photography", "Cooking", "Reading", "Gaming", "Dancing", "Cricket", "Coffee", "Nature", "Technology", "Self Care"];
const BIO_SUGGESTIONS = [
 "I enjoy meaningful conversations, good food, and exploring new places.",
 "Family-oriented, ambitious, and always ready for a new adventure.",
 "Looking for a genuine connection built on trust, laughter, and respect.",
];
const PROFESSION_SUGGESTIONS = ["Software Engineer", "Business Owner", "Government Employee", "Doctor", "Teacher", "Lawyer", "Accountant", "Banker", "Designer", "Photographer", "Student", "Self Employed", "Freelancer", "Homemaker"];
const HEIGHT_SUGGESTIONS = ["4'10\"", "5'0\"", "5'2\"", "5'4\"", "5'6\"", "5'8\"", "5'10\"", "6'0\"", "6'2\""];
const ZODIAC_SIGNS = [
 { sign: "Capricorn", emoji: "♑", from: 1222 }, { sign: "Aquarius", emoji: "♒", from: 120 },
 { sign: "Pisces", emoji: "♓", from: 219 }, { sign: "Aries", emoji: "♈", from: 321 },
 { sign: "Taurus", emoji: "♉", from: 420 }, { sign: "Gemini", emoji: "♊", from: 521 },
 { sign: "Cancer", emoji: "♋", from: 621 }, { sign: "Leo", emoji: "♌", from: 723 },
 { sign: "Virgo", emoji: "♍", from: 823 }, { sign: "Libra", emoji: "♎", from: 923 },
 { sign: "Scorpio", emoji: "♏", from: 1023 }, { sign: "Sagittarius", emoji: "♐", from: 1122 },
] as const;
const ZODIAC_DROPDOWN_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'] as const;

function zodiacFromDate(value?: string) {
 if (!value) return null;
 const date = new Date(`${value.slice(0, 10)}T00:00:00`);
 if (Number.isNaN(date.getTime())) return null;
 const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
 const zodiac = [...ZODIAC_SIGNS].reverse().find((item) => monthDay >= item.from) ?? ZODIAC_SIGNS[0];
 return zodiac;
}

// Fields that count toward profile completion (in order of weight)
const COMPLETION_FIELDS = [
 "name", "dob", "gender", "religion", "profession", "height", "city", "relationshipGoal", "bio", "interests", "personality", "photos",
] as const;

type ProfileField = typeof COMPLETION_FIELDS[number];

interface UserProfile {
 id: number;
 name: string;
 email: string;
 phone: string;
 dob: string;
 gender: string;
 religion: string;
 profession: string;
 height: string;
 city: string;
 relationshipGoal: string;
 zodiac: string;
 bio: string;
 interests: string; // comma-separated
 personality: string; // comma-separated
 hobbies: string; // comma-separated
 photos: string[];
 kycMatched: boolean;
 plan: string;
 isVerified: boolean;
 planBadge?: boolean;
 onboardingCompleted: boolean;
}

interface ProfileInsights {
 profileViews7d: number;
 likesReceived: number;
 compatibilityAverage: number | null;
}

function calcCompletion(p: Partial<UserProfile>): number {
 const filled = COMPLETION_FIELDS.filter((f) => {
 const v = Reflect.get(p, f);
 return v && String(v).trim().length > 0;
 }).length;
 return Math.round((filled / COMPLETION_FIELDS.length) * 100);
}

export default function ProfilePage() {
 const [profile, setProfile] = useState<Partial<UserProfile>>({});
 const [insights, setInsights] = useState<ProfileInsights | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
 const [photoSaving, setPhotoSaving] = useState(false);
 const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
 const [savedCompletion, setSavedCompletion] = useState(0);
 const fileInputRef = useRef<HTMLInputElement>(null);

 // â”€â”€ localStorage key for avatar cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 // â”€â”€ Fetch profile on mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 useEffect(() => {
 const token = getToken();
 if (!token) {
 window.location.href = "/";
 return;
 }

 // Load cached avatar immediately so UI doesn't flash
 apiFetch("/users/me", {
 headers: { Authorization: `Bearer ${token}` },
 })
 .then((r) => {
 if (r.status === 401) {
 clearToken();
 window.location.href = "/";
 return null;
 }
 if (!r.ok) throw new Error("Failed to load profile");
 return r.json();
 })
 .then((data) => {
 if (data) {
        const merged = {
          ...data,
          photos: data.photos || (data.avatarUrl ? [data.avatarUrl] : []),
          dob: data.birthDate || data.dob,
          personality: data.personalityWords ? data.personalityWords.join(", ") : (data.personality || ""),
          interests: data.interests ? (Array.isArray(data.interests) ? data.interests.join(", ") : data.interests) : "",
          hobbies: data.hobbies ? (Array.isArray(data.hobbies) ? data.hobbies.join(", ") : data.hobbies) : ""
        };
        merged.zodiac = data.zodiac || zodiacFromDate(merged.dob)?.sign || "";
        setProfile(merged);
        setSavedCompletion(calcCompletion(merged));
        cacheAvatarUrl(merged.photos?.[0]);
 }
 })
 .catch((error: unknown) => {
   const message = error instanceof Error ? error.message : "Unable to connect to the server";
   setSaveMsg({
     ok: false,
     text: `${message}. Please check that the API is running and refresh the page.`,
   });
 })
 .finally(() => setLoading(false));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 useEffect(() => {
 const token = getToken();
 if (!token) return;
 apiFetch("/users/me/insights", {
 headers: { Authorization: `Bearer ${token}` },
 })
 .then((response) => {
 if (!response.ok) throw new Error("Failed to load profile insights");
 return response.json();
 })
 .then(setInsights)
 .catch(() => {
 // Keep the profile usable if insights are temporarily unavailable.
 setInsights({ profileViews7d: 0, likesReceived: 0, compatibilityAverage: null });
 });
 }, []);


 const set = (key: keyof UserProfile, val: string) => {
 if (isLocked) return;
 setProfile((p) => ({ ...p, [key]: val }));
 setSaveMsg(null);
 };


  const handleSave = async () => {
    if (isLocked) {
      setSaveMsg({ ok: false, text: "Unlock profile before editing." });
      return;
    }

    // Missing fields validation
    const requiredFields = [
      "name", "dob", "gender", "religion", "profession", "height", "city", "relationshipGoal", "bio", "interests", "personality"
    ] as const;

    for (const field of requiredFields) {
      if (!profile[field] || String(profile[field]).trim().length === 0) {
        setSaveMsg({ ok: false, text: `'${field}' is missing` });
        setSaving(false);
        return;
      }
    }

    setSaving(true);
    setSaveMsg(null);
    const token = getToken();
    if (!token) { clearToken(); window.location.href = "/"; return; }
    try {
      const parseTags = (str: string | undefined) => (str || "").split(",").map(t => t.trim()).filter(Boolean);

      const updatePayload = {
        name: profile.name,
        phone: profile.phone?.trim() || "",
        birthDate: profile.dob,
        gender: profile.gender,
        religion: profile.religion,
        profession: profile.profession,
        height: profile.height,
        city: profile.city,
        relationshipGoal: profile.relationshipGoal,
        zodiac: profile.zodiac || zodiacFromDate(profile.dob)?.sign,
        interests: parseTags(profile.interests),
        personalityWords: parseTags(profile.personality),
        hobbies: parseTags(profile.hobbies),
        bio: profile.bio,
      };

 const res = await apiFetch("/users/me", {
 method: "PATCH",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify(updatePayload),
 });
 if (res.status === 401) { clearToken(); window.location.href = "/"; return; }
 if (!res.ok) throw new Error("Save failed");
 const updated = await res.json();

      // Preserve the current photos
      const merged = {
        ...updated,
        photos: profile.photos || [],
        dob: updated.birthDate || updated.dob,
        personality: updated.personalityWords ? updated.personalityWords.join(", ") : (updated.personality || ""),
        interests: updated.interests ? (Array.isArray(updated.interests) ? updated.interests.join(", ") : updated.interests) : "",
        hobbies: updated.hobbies ? (Array.isArray(updated.hobbies) ? updated.hobbies.join(", ") : updated.hobbies) : ""
      };
      setProfile(merged);
      cacheAvatarUrl(merged.photos?.[0]);

 setSavedCompletion(calcCompletion(merged));
 setSaveMsg({ ok: true, text: "Profile saved successfully!" });
 } catch {
 setSaveMsg({ ok: false, text: "Could not save. Please try again." });
 } finally {
 setSaving(false);
 setTimeout(() => setSaveMsg(null), 4000);
 }
 };

  const handlePhotosChange = async (newPhotos: string[]) => {
    if (isLocked) return;

    // 1. Update UI immediately
    setProfile((p) => ({ ...p, photos: newPhotos }));

    // 2. Persist primary photo to localStorage
    cacheAvatarUrl(newPhotos[0]);

    // 3. Auto-upload to the new backend endpoint
    const token = getToken();
    if (token) {
      setPhotoSaving(true);
      try {
        const res = await apiFetch("/user/profile/photos", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ photos: newPhotos }),
        });
        if (res.ok) {
          const updated = await res.json();
          if (updated.photos) {
            setProfile((p) => ({
              ...p,
              photos: updated.photos,
              isVerified: updated.isVerified ?? p.isVerified,
              kycMatched: updated.kycMatched ?? p.kycMatched,
            }));
            if (updated.photos[0]) {
              cacheAvatarUrl(updated.photos[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to sync photos", err);
      } finally {
        setPhotoSaving(false);
      }
    }
  };

 // Live completion (updates as user types) vs saved completion (updates after Save)
 const liveCompletion = calcCompletion(profile);
 const isEmpty = (key: ProfileField) => !Reflect.get(profile, key)?.toString().trim();

 if (loading) {
 return (
 <div className="flex min-h-[16rem] items-center justify-center">
 <Loader2 className="h-[32px] w-[32px] animate-spin text-rose-500" />
 </div>
 );
 }

 return (
 <div className="space-y-4 sm:space-y-5">
 {profile.kycMatched !== true && (
   <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5" role="status">
     <div className="flex min-w-0 items-start gap-3">
       <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">
         <ShieldAlert className="h-5 w-5" />
       </div>
       <div className="min-w-0">
         <p className="font-bold text-amber-900">KYC Pending</p>
         <p className="mt-0.5 text-sm leading-5 text-amber-800/80">Complete your video KYC to verify your identity and build trust on your profile.</p>
       </div>
     </div>
     <Link href="/user/onboarding?step=video-kyc" className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700">
       Complete KYC
     </Link>
   </div>
 )}
 <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
 {/* â”€â”€ Main profile card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
 <section className="min-w-0 space-y-5 overflow-hidden rounded-2xl bg-white p-3 shadow-lg min-[380px]:p-4 sm:space-y-6 sm:p-6" style={{ border: "1px solid rgba(236,72,153,0.15)" }}>
  <header className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 sm:gap-6">
    <div className="flex min-w-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 whitespace-normal break-normal text-xl font-semibold leading-tight text-slate-800 tracking-tight sm:text-2xl">
            {profile.name || "Your Name"}
            {profile.dob ? `, ${new Date().getFullYear() - new Date(profile.dob).getFullYear()}` : ""}
          </h1>
          {profile.planBadge && (
            <BadgeCheck className="h-5 w-5 shrink-0 fill-blue-500 text-white sm:h-6 sm:w-6" aria-label="Verified by administrator" />
          )}
        </div>
        <p className="text-sm text-slate-500 capitalize mt-1 font-medium">
          {profile.plan ?? "free"} member
        </p>
      </div>
      <div className="flex w-full shrink-0 flex-col items-center gap-2 sm:w-auto sm:items-end">
        {profile.kycMatched && (
          <p className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            KYC Verified
          </p>
        )}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 sm:w-auto sm:px-4 sm:text-sm ${
          isLocked
            ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            : "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100/70"
        }`}
        >
        {isLocked ? (
          <>
            <Lock className="h-4 w-4" />
            <span>Profile Locked</span>
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            <span>Editing Mode</span>
          </>
        )}
        </button>
      </div>
    </div>

    {/* Photo Grid Section */}
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-2.5 min-[380px]:p-3 sm:p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
        Profile Photos
        {photoSaving && <Loader2 className="h-4 w-4 animate-spin text-rose-500" />}
      </h2>
      <PhotoGrid
        photos={profile.photos || []}
        onPhotosChange={handlePhotosChange}
        disabled={photoSaving || isLocked}
        maxPhotos={["female", "woman", "women", "girl", "ladies", "f"].includes(String(profile.gender || "").toLowerCase()) ? 10 : profile.plan === "platinum" ? 10 : profile.plan === "gold" ? 5 : 2}
      />
    </div>
  </header>

 {/* Save feedback */}
 {saveMsg && (
 <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm border ${
 saveMsg.ok
 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
 : "bg-rose-500/10 border-rose-500/30 text-rose-400"
 }`}>
 {saveMsg.ok
 ? <CheckCircle2 className="h-[16px] w-[16px] shrink-0" />
 : <AlertCircle className="h-[16px] w-[16px] shrink-0" />}
 {saveMsg.text}
 </div>
 )}

 {/* Form fields */}
 <div className="grid gap-4 sm:grid-cols-2">
 <RequiredField
 label="Display name"
  disabled={isLocked}
 value={profile.name ?? ""}
 required={isEmpty("name")}
 onChange={(v) => set("name", v)}
 />
 <div className="space-y-2">
 <Label className="text-slate-600">Email address</Label>
 <Input
 type="email"
 value={profile.email ?? ""}
 disabled
 className="bg-slate-50 text-slate-600 disabled:cursor-not-allowed disabled:opacity-100"
 />
 <p className="text-[11px] text-slate-400">Verified during registration and linked to your account.</p>
 </div>
 <div className="space-y-2">
 <Label className="text-slate-600">Phone number</Label>
 <Input
 type="tel"
 inputMode="tel"
 autoComplete="tel"
 disabled={isLocked}
 value={profile.phone ?? ""}
 placeholder="000000"
 maxLength={30}
 onChange={(event) => set("phone", event.target.value)}
 className="bg-white text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-50"
 />
 <p className="text-[11px] text-slate-400">Visible only to you and authorized administrators.</p>
 </div>
 <RequiredField
 label="Date of birth"
  disabled={isLocked}
 type="date"
 value={profile.dob ?? ""}
 required={isEmpty("dob")}
 onChange={(v) => {
 if (isLocked) return;
 const automaticZodiac = zodiacFromDate(v)?.sign || "";
 setProfile((current) => ({ ...current, dob: v, zodiac: automaticZodiac }));
 setSaveMsg(null);
 }}
 />
 <div className="space-y-2">
 <Label className="text-slate-600">Zodiac</Label>
 <select
 disabled={isLocked}
 value={profile.zodiac || zodiacFromDate(profile.dob)?.sign || ""}
 onChange={(event) => set("zodiac", event.target.value)}
 className="h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-slate-50"
 >
 <option value="">Select date of birth first</option>
 {ZODIAC_DROPDOWN_ORDER.map((sign) => ZODIAC_SIGNS.find((item) => item.sign === sign)!).map((item) => (
 <option key={item.sign} value={item.sign}>{item.emoji} {item.sign}</option>
 ))}
 </select>
 <p className="text-[11px] text-slate-400">Selected automatically from DOB; you can change it while editing.</p>
 </div>
 <div className="space-y-2">
 <Label className={isEmpty("religion") && !isLocked ? "text-rose-500" : "text-slate-600"}>
 Religion {isEmpty("religion") && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <select
  disabled={isLocked}
 value={profile.religion ?? ""}
 onChange={(e) => set("religion", e.target.value)}
 className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white text-slate-800 outline-none transition-all focus:ring-2 ${
 isEmpty("religion") && !isLocked
 ? "border-rose-400 focus:ring-rose-300 focus:border-rose-500"
 : "border-slate-200 focus:ring-rose-200 focus:border-rose-300"
 }`}
 >
 <option value="" className="bg-white text-slate-800">Select religion</option>
 <option value="Hindu" className="bg-white text-slate-800">Hindu</option>
 <option value="Muslim" className="bg-white text-slate-800">Muslim</option>
 <option value="Christian" className="bg-white text-slate-800">Christian</option>
 <option value="Sikh" className="bg-white text-slate-800">Sikh</option>
 <option value="Buddhist" className="bg-white text-slate-800">Buddhist</option>
 <option value="Jain" className="bg-white text-slate-800">Jain</option>
 <option value="Jewish" className="bg-white text-slate-800">Jewish</option>
 <option value="Spiritual" className="bg-white text-slate-800">Spiritual</option>
 <option value="Atheist / Agnostic" className="bg-white text-slate-800">Atheist / Agnostic</option>
 <option value="Other" className="bg-white text-slate-800">Other</option>
 </select>
 </div>
 <div className="space-y-2">
 <Label className={isEmpty("gender") && !isLocked ? "text-rose-500" : "text-slate-600"}>
 Gender {isEmpty("gender") && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <select
  disabled={isLocked}
 value={profile.gender ?? ""}
 onChange={(e) => set("gender", e.target.value)}
 className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white text-slate-800 outline-none transition-all focus:ring-2 ${
 isEmpty("gender") && !isLocked
 ? "border-rose-400 focus:ring-rose-300 focus:border-rose-500"
 : "border-slate-200 focus:ring-rose-200 focus:border-rose-300"
 }`}
 >
 <option value="" className="bg-white text-slate-800">Select gender</option>
 <option value="male" className="bg-white text-slate-800">Male</option>
 <option value="female" className="bg-white text-slate-800">Female</option>
 <option value="non-binary" className="bg-white text-slate-800">Non-binary</option>
 <option value="prefer-not" className="bg-white text-slate-800">Prefer not to say</option>
 </select>
 </div>
 <RequiredField
 label="Profession"
  disabled={isLocked}
 placeholder="e.g. Software Engineer"
 suggestions={PROFESSION_SUGGESTIONS}
 value={profile.profession ?? ""}
 required={isEmpty("profession")}
 onChange={(v) => set("profession", v)}
 />
 <RequiredField
 label="Height"
  disabled={isLocked}
 placeholder={`e.g. 5'10"`}
 suggestions={HEIGHT_SUGGESTIONS}
 value={profile.height ?? ""}
 required={isEmpty("height")}
 onChange={(v) => set("height", v)}
 />
 <RequiredField
 label="Current city"
  disabled={isLocked}
 placeholder="e.g. Brooklyn, NY"
 value={profile.city ?? ""}
 required={isEmpty("city")}
 onChange={(v) => set("city", v)}
 />
 </div>

 <div className="space-y-2">
 <Label className={isEmpty("relationshipGoal") && !isLocked ? "text-rose-500" : "text-slate-600"}>
 Relationship Goal {isEmpty("relationshipGoal") && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
 {RELATIONSHIP_GOALS.map((goal) => {
 const selected = profile.relationshipGoal === goal;
 return (
 <button key={goal} type="button" disabled={isLocked} onClick={() => set("relationshipGoal", goal)} aria-pressed={selected} className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${selected ? "border-rose-500 bg-rose-100 text-rose-700 shadow-sm" : "border-rose-200 bg-white text-slate-600 hover:border-rose-400 hover:bg-rose-50"}`}>
 {goal}
 </button>
 );
 })}
 </div>
 </div>

 {/* Bio */}
 <div className="space-y-2">
 <Label className={isEmpty("bio") ? "text-rose-500" : "text-slate-600"}>
 Bio (max 250 chars) {isEmpty("bio") && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <Textarea
  disabled={isLocked}
 value={profile.bio ?? ""}
 onChange={(e) => set("bio", e.target.value)}
 maxLength={250}
 placeholder="Tell potential matches about yourselfâ€¦"
 className={`min-h-[100px] bg-white text-slate-800 placeholder:text-slate-400 border transition-all ${
 isEmpty("bio") && !isLocked ? "border-rose-400 focus:ring-rose-300" : "border-slate-200 focus:ring-rose-200"
 }`}
 />
 {!isLocked && (
 <div className="flex flex-wrap gap-2">
 {BIO_SUGGESTIONS.map((suggestion, index) => (
 <button key={suggestion} type="button" onClick={() => set("bio", suggestion)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition hover:border-rose-300 hover:bg-rose-50">
 Bio idea {index + 1}
 </button>
 ))}
 </div>
 )}
 <p className="text-right text-xs text-slate-500">{(profile.bio ?? "").length}/250</p>
 </div>

 {/* Personality tags */}
 <TagField
 label="Personality"
  disabled={isLocked}
 hint="(single words, comma-separated)"
 value={profile.personality ?? ""}
 required={isEmpty("personality")}
 color="brand"
 suggestions={PERSONALITY_SUGGESTIONS}
 onChange={(v) => set("personality", v)}
 />

 {/* Interests */}
  <TagField
    label="Interests"
    hint="(comma-separated)"
    value={profile.interests ?? ""}
    required={isEmpty("interests")}
    disabled={isLocked}
    color="blue"
    suggestions={INTEREST_SUGGESTIONS}
    onChange={(v) => set("interests", v)}
  />

 {/* Actions */}
 <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
 <div className="grid grid-cols-2 gap-2 sm:flex">
 <Button variant="outline" className="w-full px-2 text-xs text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 sm:w-auto sm:px-4 sm:text-sm">
 Delete account
 </Button>
 <Button
 id="profile-logout-btn"
 variant="outline"
 className="w-full gap-2 px-2 text-xs text-foreground border-border bg-card hover:bg-muted transition-colors sm:w-auto sm:px-4 sm:text-sm"
 onClick={() => logout("/")}
 >
 <LogOut className="h-[16px] w-[16px]" />
 Log Out
 </Button>
 </div>
 <Button
 className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white gap-2 border-0 sm:w-auto"
 onClick={handleSave}
 disabled={saving || isLocked}
 >
 {saving && <Loader2 className="h-[16px] w-[16px] animate-spin" />}
 {saving ? "Savingâ€¦" : "Save changes"}
 </Button>
 </div>
 </section>

 {/* â”€â”€ Right sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
 <aside className="space-y-4">
 {/* Profile completion meter */}
 <div className="rounded-2xl bg-card p-5 shadow-lg border border-border">
 <div className="flex items-center gap-3">
 <Avatar className="h-[48px] w-[48px] border border-border">
 <AvatarImage src={profile.photos?.[0] || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop"} />
 <AvatarFallback className="bg-muted text-foreground">{profile.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
 </Avatar>
 <div>
 <p className="text-sm font-semibold text-foreground">Your Profile</p>
 <p className={`text-sm font-bold ${savedCompletion >= 80 ? "text-emerald-400" : savedCompletion >= 50 ? "text-amber-400" : "text-rose-400"}`}>
 {savedCompletion}% Complete
 </p>
 </div>

 </div>
 <div className="mt-4 h-[8px] w-full overflow-hidden rounded-full bg-muted">
 <div
 className={`h-full rounded-full transition-all duration-700 ${
 savedCompletion >= 80
 ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
 : savedCompletion >= 50
 ? "bg-gradient-to-r from-amber-400 to-amber-500"
 : "bg-gradient-to-r from-rose-400 to-pink-500"
 }`}
 style={{ width: `${savedCompletion}%` }}
 />
 </div>
 {savedCompletion < 100 && (
 <p className="mt-3 text-xs text-muted-foreground">
 {100 - savedCompletion}% to go â€” complete your profile to get more matches!
 </p>
 )}
 {/* Missing fields checklist â€” based on live (unsaved) data */}
 {liveCompletion < 100 && (
 <ul className="mt-4 space-y-2">
 {COMPLETION_FIELDS.filter((f) => isEmpty(f)).map((f) => (
 <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
 <span className="h-[6px] w-[6px] rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
 <span className="capitalize">{f === "dob" ? "Date of birth" : f === "bio" ? "Bio" : f}</span>
 <span className="text-rose-500 font-medium ml-auto">missing</span>
 </li>
 ))}
 </ul>
 )}
 </div>

 {/* Insights */}
 <div className="rounded-2xl bg-card p-5 shadow-lg border border-border">
 <h3 className="text-base font-semibold text-foreground">Profile insights</h3>
 <div className="mt-4 space-y-3">
 <Stat icon={Eye} label="Profile views (7d)" value={insights ? String(insights.profileViews7d) : "â€”"} />
 <Stat icon={HeartIcon} label="Likes received" value={insights ? String(insights.likesReceived) : "â€”"} />
 <Stat
 icon={Sparkles}
 label="Compatibility avg."
 value={insights ? (insights.compatibilityAverage === null ? "N/A" : `${insights.compatibilityAverage}%`) : "â€”"}
 />
 </div>
 </div>

 {/* Premium tip */}
 <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #fff0f3, #fce7f3)", border: "1px solid rgba(236,72,153,0.25)" }}>
 <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
 <Sparkles className="h-[16px] w-[16px] text-rose-400" /> Premium tip
 </p>
 <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
 Add a short video to your profile â€” premium users with video get 3.2Ã— more matches.
 </p>
 <Link href="/user/premium">
 <Button className="mt-4 w-full text-white rounded-lg h-[36px] text-xs" style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}>
 Upgrade to Premium
 </Button>
 </Link>
 </div>
 </aside>
 </div>
 </div>
 );
}

// â”€â”€ Helper components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function RequiredField({
 label, value, required, onChange, type = "text", placeholder, disabled, suggestions,
}: {
 label: string;
 value: string;
 required: boolean;
 onChange: (v: string) => void;
 type?: string;
 placeholder?: string;
 disabled?: boolean;
 suggestions?: string[];
}) {
 const listId = suggestions?.length ? `suggestions-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined;
 return (
 <div className="space-y-2">
 <Label className={required && !disabled ? "text-rose-500" : "text-foreground"}>
 {label}{" "}
 {required && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <Input
 type={type}
 list={listId}
 value={value}
 placeholder={placeholder}
 disabled={disabled}
 onChange={(e) => onChange(e.target.value)}
 className={`bg-card text-foreground placeholder:text-muted-foreground transition-all ${
 required && !disabled ? "border-rose-400 focus:ring-rose-300" : "border-border focus:ring-rose-200"
 }`}
 />
 {listId && <datalist id={listId}>{suggestions?.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>}
 </div>
 );
}

function TagField({
  label, hint, value, required, color, onChange, disabled, suggestions,
}: {
  label: string;
  hint: string;
  value: string;
  required: boolean;
  color: "brand" | "blue";
  onChange: (v: string) => void;
  disabled?: boolean;
  suggestions: string[];
}) {
  const [inputValue, setInputValue] = useState("");
  const strValue = Array.isArray(value) ? value.join(", ") : (value ?? "");
  const tags = strValue.split(",").map((t) => t.trim()).filter(Boolean);
  const colorClass = color === "brand"
    ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-500 dark:text-rose-400"
    : "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-500 dark:text-blue-400";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        const newTags = [...tags, newTag];
        onChange(newTags.join(", "));
        setInputValue("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onChange(newTags.join(", "));
  };

  const addTag = (newTag: string) => {
    if (disabled || tags.includes(newTag)) return;
    onChange([...tags, newTag].join(", "));
  };

  return (
    <div className="space-y-2">
      <Label className={required && !disabled ? "text-rose-500" : "text-foreground"}>
        {label} <span className="text-xs font-normal text-muted-foreground">{hint}</span>
        {required && <span className="ml-1 text-xs font-normal text-rose-400">(required)</span>}
      </Label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span key={t} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
              {t}
              {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              )}
            </span>
          ))}
        </div>
      )}
      <Input
        value={inputValue}
        placeholder={disabled ? "Profile is locked" : `e.g. ${label === "Personality" ? "Curious, Calm, Witty (Press Enter)" : "Coffee, Hiking, Design (Press Enter)"}`}
        disabled={disabled}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`bg-card text-foreground placeholder:text-muted-foreground transition-all ${
          required && !disabled ? "border-rose-400 focus:ring-rose-300" : "border-border focus:ring-rose-200"
        }`}
      />
      {!disabled && (
        <div className="flex flex-wrap gap-2 pt-1">
          {suggestions.filter((suggestion) => !tags.includes(suggestion)).slice(0, 12).map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => addTag(suggestion)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600">
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
 icon: Icon, label, value,
}: {
 icon: React.ComponentType<{ className?: string }>;
 label: string;
 value: string;
}) {
 return (
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-2 text-sm text-muted-foreground">
 <Icon className="h-[16px] w-[16px] text-muted-foreground" /> {label}
 </span>
 <span className="text-sm font-semibold text-foreground">{value}</span>
 </div>
 );
}
