"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_LANGUAGES, findLanguage } from "./languages";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
      translate?: { TranslateElement: new (options: Record<string, unknown>, elementId: string) => void };
    };
    googleTranslateElementInit?: () => void;
  }
}

export const LANGUAGE_STORAGE_KEY = "connect-love-language";

function translationCookieDomains(): string[] {
  const hostname = window.location.hostname;
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") return [];
  const labels = hostname.split(".").filter(Boolean);
  const rootDomain = labels.length > 1 ? `.${labels.slice(-2).join(".")}` : hostname;
  return [...new Set([hostname, rootDomain])];
}

function clearTranslationCookies() {
  const expired = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `googtrans=;expires=${expired};path=/;SameSite=Lax`;
  translationCookieDomains().forEach((domain) => {
    document.cookie = `googtrans=;expires=${expired};path=/;domain=${domain};SameSite=Lax`;
  });
}

function writeTranslationCookies(translationCode: string) {
  clearTranslationCookies();
  if (translationCode === "en") return;
  const value = `/en/${translationCode}`;
  document.cookie = `googtrans=${value};path=/;SameSite=Lax`;
  translationCookieDomains().forEach((domain) => {
    document.cookie = `googtrans=${value};path=/;domain=${domain};SameSite=Lax`;
  });
}

function applyTranslator(code: string) {
  const language = findLanguage(code);
  document.documentElement.lang = language.code;
  document.documentElement.dir = language.direction || "ltr";
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!select || language.translationCode === "en") return;
  if (select.value !== language.translationCode) {
    select.value = language.translationCode;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function hideTranslationChrome() {
  document.documentElement.style.setProperty("margin-top", "0px", "important");
  document.body.style.setProperty("top", "0px", "important");
  document.body.style.setProperty("position", "static", "important");
  document.querySelectorAll<HTMLElement>(
    'iframe.goog-te-banner-frame, iframe.skiptranslate, iframe[src*="translate.google"], [class*="VIpgJd-ZVi9od-ORHb"]',
  ).forEach((element) => {
    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("height", "0", "important");
  });
}

export function setPreferredLanguage(code: string) {
  const language = findLanguage(code);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language.code);
  writeTranslationCookies(language.translationCode);
  document.documentElement.lang = language.code;
  document.documentElement.dir = language.direction || "ltr";
  // A full navigation restores the original English DOM before Google applies
  // the newly selected language. This also makes language-to-language changes
  // reliable after the page has already been translated once.
  window.location.assign(window.location.href);
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const storedCode = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const language = findLanguage(storedCode);
    if (storedCode && storedCode !== language.code) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language.code);
      writeTranslationCookies(language.translationCode);
    }
    document.documentElement.lang = language.code;
    document.documentElement.dir = language.direction || "ltr";
    const shouldTranslate = language.translationCode !== "en";
    setEnabled(shouldTranslate);
    if (!shouldTranslate) {
      window.googleTranslateElementInit = undefined;
      return;
    }

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const includedLanguages = [...new Set(APP_LANGUAGES.map((item) => item.translationCode))].join(",");
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages, autoDisplay: false },
        "google_translate_element",
      );
      window.setTimeout(() => applyTranslator(language.code), 0);
      window.setTimeout(hideTranslationChrome, 0);
    };

    hideTranslationChrome();
    const observer = new MutationObserver(hideTranslationChrome);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const cleanupTimers = [100, 500, 1500].map((delay) => window.setTimeout(hideTranslationChrome, delay));
    return () => {
      observer.disconnect();
      cleanupTimers.forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    const code = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
    const timer = window.setTimeout(() => applyTranslator(code), 100);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {children}
      <div id="google_translate_element" className="fixed -left-[9999px] top-0" aria-hidden="true" />
      {enabled && (
        <Script
          id="connect-love-translator"
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
