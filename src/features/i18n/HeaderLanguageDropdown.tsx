"use client";

import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";
import { APP_LANGUAGES, findLanguage } from "./languages";
import { LANGUAGE_STORAGE_KEY, setPreferredLanguage } from "./TranslationProvider";

export function HeaderLanguageDropdown({ mobile = false, compact = false }: { mobile?: boolean; compact?: boolean }) {
  const [code, setCode] = useState("en");

  useEffect(() => {
    setCode(findLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)).code);
  }, []);

  return (
    <label translate="no" className={`notranslate relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${compact ? "h-8 w-8 justify-center sm:h-9 sm:w-9" : mobile ? "w-full px-3" : "px-2"}`} title="Website language">
      <Globe2 className="h-4 w-4 shrink-0 text-rose-500" />
      <select
        value={code}
        onChange={(event) => {
          const nextCode = event.target.value;
          setCode(nextCode);
          setPreferredLanguage(nextCode);
        }}
        aria-label="Website language"
        translate="no"
        className={`${compact ? "absolute inset-0 h-full w-full cursor-pointer opacity-0" : mobile ? "h-11 w-full" : "h-9 w-[7.5rem]"} cursor-pointer bg-transparent text-xs font-semibold outline-none`}
      >
        {APP_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code} translate="no" className="notranslate">{language.name}</option>
        ))}
      </select>
    </label>
  );
}
