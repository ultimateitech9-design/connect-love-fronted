"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { clearOnboardingRequired, getToken, clearToken } from "@/lib/auth";
import { StepHeight } from "@/features/onboarding/StepHeight";
import { StepProfession } from "@/features/onboarding/StepProfession";
import { StepCity } from "@/features/onboarding/StepCity";
import { StepBio } from "@/features/onboarding/StepBio";
import { StepTags } from "@/features/onboarding/StepTags";
import { StepProfilePhotos, StepVideoKyc } from "@/features/onboarding/StepPhotosKyc";
import { StepAge } from "@/features/onboarding/StepAge";
import { StepReligion } from "@/features/onboarding/StepReligion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const STEPS = [
  { id: "age", title: "How old are you?" },
  { id: "religion", title: "What's your religion?" },
  { id: "height", title: "How tall are you?" },
  { id: "profession", title: "What do you do?" },
  { id: "city", title: "Where do you live?" },
  { id: "bio", title: "Write your bio" },
  { id: "personality", title: "Your personality" },
  { id: "interests", title: "Your interests" },
  { id: "hobbies", title: "Your hobbies" },
  { id: "photos", title: "Add profile photos" },
  { id: "video-kyc", title: "Video KYC verification" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch initial profile
  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearToken();
      router.push("/");
      return;
    }
    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        clearToken();
        router.push("/");
      });
  }, [router]);

  const handleNext = async (fieldValues: Record<string, any>, isFinal = false) => {
    if (saving) return;
    setSaving(true);
    const token = getToken();

    const payload = {
      ...fieldValues,
      ...(isFinal ? { onboardingCompleted: true } : {}),
    };

    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save step");

      // Update local profile state
      setProfile((prev: any) => ({ ...prev, ...payload }));

      if (isFinal) {
        clearOnboardingRequired();
        router.push("/user/profile");
      } else {
        setCurrentStepIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-[32px] w-[32px] animate-spin text-rose-500" />
      </div>
    );
  }

  const step = STEPS[currentStepIndex];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Creative Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[21.528vw] w-[21.528vw] rounded-full bg-rose-500 opacity-20 blur-[100px]" />
      </div>

      <div className="z-10 w-full ">
        {/* Header */}
        <div className="mb-8 text-center">
          <BrandLogo className="mx-auto mb-6 h-14 w-14 shadow-xl shadow-rose-500/20" />
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {step.title}
          </h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  i === currentStepIndex
                    ? "w-[32px] bg-rose-500"
                    : i < currentStepIndex
                    ? "w-[16px] bg-rose-500/50"
                    : "w-[16px] bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl ${currentStepIndex > 0 ? "pt-16" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-[13.889vw]"
            >
              {currentStepIndex === 0 && (
                <StepAge profile={profile} onNext={(val) => handleNext({ birthDate: val })} />
              )}
              {currentStepIndex === 1 && (
                <StepReligion profile={profile} onNext={(val) => handleNext({ religion: val })} />
              )}
              {currentStepIndex === 2 && (
                <StepHeight profile={profile} onNext={(val) => handleNext({ height: val })} />
              )}
              {currentStepIndex === 3 && (
                <StepProfession profile={profile} onNext={(val) => handleNext({ profession: val })} />
              )}
              {currentStepIndex === 4 && (
                <StepCity profile={profile} onNext={(val) => handleNext({ city: val })} />
              )}
              {currentStepIndex === 5 && (
                <StepBio profile={profile} onNext={(val) => handleNext({ bio: val })} />
              )}
              {currentStepIndex === 6 && (
                <StepTags
                  type="personalityWords"
                  profile={profile}
                  onNext={(val) => handleNext({ personalityWords: val })}
                />
              )}
              {currentStepIndex === 7 && (
                <StepTags
                  type="interests"
                  profile={profile}
                  onNext={(val) => handleNext({ interests: val })}
                />
              )}
              {currentStepIndex === 8 && (
                <StepTags
                  type="hobbies"
                  profile={profile}
                  onNext={(val) => handleNext({ hobbies: val })}
                />
              )}
              {currentStepIndex === 9 && (
                <StepProfilePhotos
                  profile={profile}
                  onNext={(val) => handleNext(val)}
                />
              )}
              {currentStepIndex === 10 && (
                <StepVideoKyc
                  profile={profile}
                  onNext={(val) => handleNext(val, true)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Back Button (if not first step) */}
          {currentStepIndex > 0 && (
            <button
              onClick={handleBack}
              disabled={saving}
              className="absolute left-6 top-6 text-sm font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}

          {saving && (
            <div className="absolute bottom-6 left-6 flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-[16px] w-[16px] animate-spin text-rose-500" />
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
