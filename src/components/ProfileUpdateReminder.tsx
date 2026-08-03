"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { clearProfileReminder, getProfileReminderAt } from "@/lib/auth";

export function ProfileUpdateReminder() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const reminderAt = getProfileReminderAt();
    if (!reminderAt) return;
    const timer = window.setTimeout(() => setOpen(true), Math.max(0, reminderAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    clearProfileReminder();
    setOpen(false);
  };

  const updateProfile = () => {
    close();
    if (pathname !== "/user/onboarding") router.push("/user/profile");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="profile-reminder-title">
      <div className="relative w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-2xl sm:p-8">
        <button type="button" onClick={close} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Close reminder">
          <X className="h-4 w-4" />
        </button>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-500">
          <Sparkles className="h-7 w-7" />
        </span>
        <h2 id="profile-reminder-title" className="mt-5 text-2xl font-bold text-slate-900">Update your profile</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Complete your profile details to get better and more relevant matches.</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Later</button>
          <button type="button" onClick={updateProfile} className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20">
            {pathname === "/user/onboarding" ? "Continue setup" : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
