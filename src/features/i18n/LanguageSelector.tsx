"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Globe2, Search, X } from "lucide-react";
import { useSettings } from "@/features/user/SettingsContext";
import { APP_LANGUAGES, findLanguage } from "./languages";
import { LANGUAGE_STORAGE_KEY, setPreferredLanguage } from "./TranslationProvider";

export function LanguageSelector() {
  const { settings, updateSetting } = useSettings();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const storedCode = typeof window === "undefined" ? null : localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const selected = findLanguage(storedCode || settings.language);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return APP_LANGUAGES;
    return APP_LANGUAGES.filter((language) =>
      `${language.name} ${language.nativeName}`.toLocaleLowerCase().includes(term),
    );
  }, [query]);

  const chooseLanguage = async (code: string) => {
    if (code === selected.code) {
      setOpen(false);
      return;
    }
    await updateSetting("language", code);
    setPreferredLanguage(code);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20">
            <Globe2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">Language: {selected.nativeName}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">Change the language across ConnectLove.</span>
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Select language">
          <button className="absolute inset-0" onClick={() => setOpen(false)} aria-label="Close language selector" />
          <div className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:max-w-2xl sm:rounded-3xl">
            <div className="border-b border-border bg-gradient-to-r from-rose-50 to-pink-50 px-5 py-5 dark:from-rose-950/30 dark:to-pink-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Choose your language</h2>
                  <p className="mt-1 text-sm text-muted-foreground">The full ConnectLove interface will use your selection.</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-slate-600 shadow-sm transition hover:bg-white dark:bg-slate-900 dark:text-slate-300" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <label className="relative mt-4 block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search language..."
                  className="h-11 w-full rounded-xl border border-rose-100 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  autoFocus
                />
              </label>
            </div>

            <div className="grid flex-1 gap-2 overflow-y-auto p-4 sm:grid-cols-2">
              {filtered.map((language) => {
                const active = language.code === selected.code;
                return (
                  <button
                    type="button"
                    key={language.code}
                    onClick={() => chooseLanguage(language.code)}
                    className={`flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 text-left transition ${active ? "border-rose-400 bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/30" : "border-border bg-card text-foreground hover:border-rose-200 hover:bg-rose-50/50 dark:hover:bg-rose-950/20"}`}
                  >
                    <span>
                      <span className="block text-sm font-semibold">{language.nativeName}</span>
                      {language.nativeName !== language.name && <span className="mt-0.5 block text-xs text-muted-foreground">{language.name}</span>}
                    </span>
                    {active && <Check className="h-5 w-5 shrink-0 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
