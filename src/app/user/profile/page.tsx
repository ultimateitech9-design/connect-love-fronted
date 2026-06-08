"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PhotoGrid } from "@/features/user/PhotoGrid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BadgeCheck, Camera, Eye, Heart as HeartIcon, LogOut, Sparkles, Loader2, CheckCircle2, AlertCircle, X,
} from "lucide-react";
import { logout, getToken, clearToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fields that count toward profile completion (in order of weight)
const COMPLETION_FIELDS = [
 "name", "dob", "gender", "profession", "height", "city", "bio", "interests", "personality", "hobbies",
] as const;

type ProfileField = typeof COMPLETION_FIELDS[number];

interface UserProfile {
 id: number;
 name: string;
 email: string;
 dob: string;
 gender: string;
 profession: string;
 height: string;
 city: string;
 bio: string;
 interests: string; // comma-separated
 personality: string; // comma-separated
 hobbies: string; // comma-separated
 photos: string[];
 plan: string;
 isVerified: boolean;
 onboardingCompleted: boolean;
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
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [photoSaving, setPhotoSaving] = useState(false);
 const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
 const [savedCompletion, setSavedCompletion] = useState(0);
 const fileInputRef = useRef<HTMLInputElement>(null);

 // ── localStorage key for avatar cache ───────────────────────────────────
 const AVATAR_KEY = "cl_avatar_url";

 // ── Fetch profile on mount ───────────────────────────────────────────────
 useEffect(() => {
 const token = getToken();
 if (!token) {
 window.location.href = "/";
 return;
 }

 // Load cached avatar immediately so UI doesn't flash
 const cachedAvatar = localStorage.getItem(AVATAR_KEY);

 fetch(`${API}/users/me`, {
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
        setProfile(merged);
        setSavedCompletion(calcCompletion(merged));
        if (merged.photos?.[0]) localStorage.setItem(AVATAR_KEY, merged.photos[0]);
 }
 })
 .catch(console.error)
 .finally(() => setLoading(false));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);


 const set = (key: keyof UserProfile, val: string) => {
 setProfile((p) => ({ ...p, [key]: val }));
 setSaveMsg(null);
 };


  const handleSave = async () => {
    // Missing fields validation
    const requiredFields = [
      "name", "dob", "gender", "profession", "height", "city", "bio", "interests", "personality", "hobbies"
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
        birthDate: profile.dob,
        gender: profile.gender,
        profession: profile.profession,
        height: profile.height,
        city: profile.city,
        interests: parseTags(profile.interests),
        personalityWords: parseTags(profile.personality),
        hobbies: parseTags(profile.hobbies),
        bio: profile.bio,
      };

 const res = await fetch(`${API}/users/me`, {
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
      if (merged.photos?.[0]) localStorage.setItem(AVATAR_KEY, merged.photos[0]);

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
    // 1. Update UI immediately
    setProfile((p) => ({ ...p, photos: newPhotos }));

    // 2. Persist primary photo to localStorage
    if (newPhotos.length > 0) {
      localStorage.setItem(AVATAR_KEY, newPhotos[0]);
    } else {
      localStorage.removeItem(AVATAR_KEY);
    }

    // 3. Auto-upload to the new backend endpoint
    const token = getToken();
    if (token) {
      setPhotoSaving(true);
      try {
        const res = await fetch(`${API}/user/profile/photos`, {
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
            setProfile((p) => ({ ...p, photos: updated.photos }));
            if (updated.photos[0]) {
              localStorage.setItem(AVATAR_KEY, updated.photos[0]);
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
 <div className="flex h-[17.778vw] items-center justify-center">
 <Loader2 className="h-[2.222vw] w-[2.222vw] animate-spin text-rose-500" />
 </div>
 );
 }

 return (
 <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
 {/* ── Main profile card ───────────────────────────────────────────── */}
 <section className="space-y-6 rounded-2xl bg-white p-6 shadow-lg" style={{ border: "1px solid rgba(236,72,153,0.15)" }}>
  <header className="flex flex-col gap-6 mb-8">
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            {profile.name || "Your Name"}
            {profile.dob ? `, ${new Date().getFullYear() - new Date(profile.dob).getFullYear()}` : ""}
          </h1>
          {profile.isVerified && <BadgeCheck className="h-5 w-5 text-emerald-400" />}
        </div>
        <p className="text-sm text-slate-500 capitalize mt-1 font-medium">
          {profile.isVerified ? "Verified · " : ""}{profile.plan ?? "free"} member
        </p>
      </div>
    </div>
    
    {/* Photo Grid Section */}
    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
      <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
        Profile Photos
        {photoSaving && <Loader2 className="h-4 w-4 animate-spin text-rose-500" />}
      </h2>
      <PhotoGrid 
        photos={profile.photos || []} 
        onPhotosChange={handlePhotosChange}
        disabled={photoSaving}
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
 ? <CheckCircle2 className="h-[1.111vw] w-[1.111vw] shrink-0" />
 : <AlertCircle className="h-[1.111vw] w-[1.111vw] shrink-0" />}
 {saveMsg.text}
 </div>
 )}

 {/* Form fields */}
 <div className="grid gap-4 sm:grid-cols-2">
 <RequiredField
 label="Display name"
 value={profile.name ?? ""}
 required={isEmpty("name")}
 onChange={(v) => set("name", v)}
 />
 <RequiredField
 label="Date of birth"
 type="date"
 value={profile.dob ?? ""}
 required={isEmpty("dob")}
 onChange={(v) => set("dob", v)}
 />
 <div className="space-y-2">
 <Label className={isEmpty("gender") ? "text-rose-500" : "text-slate-600"}>
 Gender {isEmpty("gender") && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <select
 value={profile.gender ?? ""}
 onChange={(e) => set("gender", e.target.value)}
 className={`w-full rounded-xl border px-3 py-2.5 text-sm bg-white text-slate-800 outline-none transition-all focus:ring-2 ${
 isEmpty("gender")
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
 placeholder="e.g. Software Engineer"
 value={profile.profession ?? ""}
 required={isEmpty("profession")}
 onChange={(v) => set("profession", v)}
 />
 <RequiredField
 label="Height"
 placeholder={`e.g. 5'10"`}
 value={profile.height ?? ""}
 required={isEmpty("height")}
 onChange={(v) => set("height", v)}
 />
 <RequiredField
 label="Current city"
 placeholder="e.g. Brooklyn, NY"
 value={profile.city ?? ""}
 required={isEmpty("city")}
 onChange={(v) => set("city", v)}
 />
 </div>

 {/* Bio */}
 <div className="space-y-2">
 <Label className={isEmpty("bio") ? "text-rose-500" : "text-slate-600"}>
 Bio (max 250 chars) {isEmpty("bio") && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <Textarea
 value={profile.bio ?? ""}
 onChange={(e) => set("bio", e.target.value)}
 maxLength={250}
 placeholder="Tell potential matches about yourself…"
 className={`min-h-[6.944vw] bg-white text-slate-800 placeholder:text-slate-400 border transition-all ${
 isEmpty("bio") ? "border-rose-400 focus:ring-rose-300" : "border-slate-200 focus:ring-rose-200"
 }`}
 />
 <p className="text-right text-xs text-slate-500">{(profile.bio ?? "").length}/250</p>
 </div>

 {/* Personality tags */}
 <TagField
 label="Personality"
 hint="(single words, comma-separated)"
 value={profile.personality ?? ""}
 required={isEmpty("personality")}
 color="brand"
 onChange={(v) => set("personality", v)}
 />

 {/* Interests */}
 <TagField
 label="Interests & hobbies"
 hint="(comma-separated)"
 value={profile.interests ?? ""}
 required={isEmpty("interests")}
 color="blue"
 onChange={(v) => set("interests", v)}
 />

 {/* Actions */}
 <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 border-border">
 <div className="flex gap-2">
 <Button variant="outline" className="text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-600">
 Delete account
 </Button>
 <Button
 id="profile-logout-btn"
 variant="outline"
 className="gap-2 text-foreground border-border bg-card hover:bg-muted transition-colors"
 onClick={() => logout("/")}
 >
 <LogOut className="h-[1.111vw] w-[1.111vw]" />
 Log Out
 </Button>
 </div>
 <Button
 className="bg-gradient-to-r from-rose-500 to-pink-600 text-white gap-2 border-0"
 onClick={handleSave}
 disabled={saving}
 >
 {saving && <Loader2 className="h-[1.111vw] w-[1.111vw] animate-spin" />}
 {saving ? "Saving…" : "Save changes"}
 </Button>
 </div>
 </section>

 {/* ── Right sidebar ──────────────────────────────────────────────── */}
 <aside className="space-y-4">
 {/* Profile completion meter */}
 <div className="rounded-2xl bg-card p-5 shadow-lg border border-border">
 <div className="flex items-center gap-3">
 <Avatar className="h-[3.333vw] w-[3.333vw] border border-border">
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
 <div className="mt-4 h-[0.556vw] w-full overflow-hidden rounded-full bg-muted">
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
 {100 - savedCompletion}% to go — complete your profile to get more matches!
 </p>
 )}
 {/* Missing fields checklist — based on live (unsaved) data */}
 {liveCompletion < 100 && (
 <ul className="mt-4 space-y-2">
 {COMPLETION_FIELDS.filter((f) => isEmpty(f)).map((f) => (
 <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
 <span className="h-[0.417vw] w-[0.417vw] rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
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
 <Stat icon={Eye} label="Profile views (7d)" value="248" />
 <Stat icon={HeartIcon} label="Likes received" value="36" />
 <Stat icon={Sparkles} label="Compatibility avg." value="82%" />
 </div>
 </div>

 {/* Premium tip */}
 <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #fff0f3, #fce7f3)", border: "1px solid rgba(236,72,153,0.25)" }}>
 <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
 <Sparkles className="h-[1.111vw] w-[1.111vw] text-rose-400" /> Premium tip
 </p>
 <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
 Add a short video to your profile — premium users with video get 3.2× more matches.
 </p>
 <Link href="/user/premium">
 <Button className="mt-4 w-full text-white rounded-lg h-[2.5vw] text-xs" style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}>
 Upgrade to Premium
 </Button>
 </Link>
 </div>
 </aside>
 </div>
 );
}

// ── Helper components ────────────────────────────────────────────────────────

function RequiredField({
 label, value, required, onChange, type = "text", placeholder,
}: {
 label: string;
 value: string;
 required: boolean;
 onChange: (v: string) => void;
 type?: string;
 placeholder?: string;
}) {
 return (
 <div className="space-y-2">
 <Label className={required ? "text-rose-500" : "text-foreground"}>
 {label}{" "}
 {required && <span className="text-xs font-normal text-rose-400">(required)</span>}
 </Label>
 <Input
 type={type}
 value={value}
 placeholder={placeholder}
 onChange={(e) => onChange(e.target.value)}
 className={`bg-card text-foreground placeholder:text-muted-foreground transition-all ${
 required ? "border-rose-400 focus:ring-rose-300" : "border-border focus:ring-rose-200"
 }`}
 />
 </div>
 );
}

function TagField({
  label, hint, value, required, color, onChange,
}: {
  label: string;
  hint: string;
  value: string;
  required: boolean;
  color: "brand" | "blue";
  onChange: (v: string) => void;
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

  return (
    <div className="space-y-2">
      <Label className={required ? "text-rose-500" : "text-foreground"}>
        {label} <span className="text-xs font-normal text-muted-foreground">{hint}</span>
        {required && <span className="ml-1 text-xs font-normal text-rose-400">(required)</span>}
      </Label>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span key={t} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
              {t}
              <button 
                type="button" 
                onClick={() => removeTag(t)}
                className="hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={inputValue}
        placeholder={`e.g. ${label === "Personality" ? "Curious, Calm, Witty (Press Enter)" : "Coffee, Hiking, Design (Press Enter)"}`}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`bg-card text-foreground placeholder:text-muted-foreground transition-all ${
          required ? "border-rose-400 focus:ring-rose-300" : "border-border focus:ring-rose-200"
        }`}
      />
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
 <Icon className="h-[1.111vw] w-[1.111vw] text-muted-foreground" /> {label}
 </span>
 <span className="text-sm font-semibold text-foreground">{value}</span>
 </div>
 );
}
