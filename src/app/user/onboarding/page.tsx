"use client";
import { API_ORIGIN } from "@/config/runtime";

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
import { StepRelationshipGoal } from "@/features/onboarding/StepRelationshipGoal";

const API = API_ORIGIN;

const STEPS = [
  { id: "age", title: "How old are you?" },
  { id: "religion", title: "What's your religion?" },
  { id: "height", title: "How tall are you? (Height)" },
  { id: "profession", title: "What do you do?" },
  { id: "city", title: "Where do you live?" },
  { id: "bio", title: "Write your bio" },
  { id: "personality", title: "Your personality" },
  { id: "interests", title: "Your interests" },
  { id: "relationship-goal", title: "Relationship Goal" },
  { id: "photos", title: "Add profile photos" },
  { id: "video-kyc", title: "Video KYC verification" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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
    setSaveError("");
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

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
        throw new Error(detail || "Failed to save step");
      }

      // Update local profile state
      setProfile((prev: any) => ({ ...prev, ...payload }));

      if (isFinal) {
        clearOnboardingRequired();
        router.replace("/user/profile");
      } else {
        setCurrentStepIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
      setSaveError(error instanceof Error ? error.message : "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex((prev) => prev - 1);
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-[32px] w-[32px] animate-spin text-rose-500" />
      </div>
    );
  }

  const step = STEPS[currentStepIndex];

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-x-hidden bg-slate-950 px-3 py-5 min-[380px]:px-4 sm:py-8">
      {/* Creative Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[21.528vw] w-[21.528vw] rounded-full bg-rose-500 opacity-20 blur-[100px]" />
      </div>

      <div className="z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="mb-5 text-center sm:mb-8">
          <BrandLogo className="mx-auto mb-4 h-12 w-12 shadow-xl shadow-rose-500/20 sm:mb-6 sm:h-14 sm:w-14" />
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
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
        <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-4 shadow-2xl backdrop-blur-xl min-[380px]:p-5 sm:p-8 ${currentStepIndex > 0 ? "pt-14 sm:pt-16" : ""}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-[12rem] sm:min-h-[13.889vw]"
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
                <StepRelationshipGoal
                  profile={profile}
                  onNext={(val) => handleNext({ relationshipGoal: val })}
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
              className="absolute left-4 top-4 text-sm font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-50 sm:left-6 sm:top-6"
            >
              Back
            </button>
          )}

          {saving && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm text-slate-400 sm:bottom-6 sm:left-6">
              <Loader2 className="h-[16px] w-[16px] animate-spin text-rose-500" />
              Saving...
            </div>
          )}
          {saveError && (
            <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {saveError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
