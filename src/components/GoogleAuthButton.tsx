"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { API_ORIGIN } from "@/config/runtime";
import { clearOnboardingRequired, requireOnboarding, setToken } from "@/lib/auth";

type GoogleCredentialResponse = { credential?: string };

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
        };
      };
      translate?: {
        TranslateElement: new (options: Record<string, unknown>, elementId: string) => void;
      };
    };
  }
}

export function GoogleAuthButton({ mode }: { mode: "signin" | "signup" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!clientId) return;

    const handleCredential = async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError("Google did not return a sign-in credential.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const result = await fetch(`${API_ORIGIN}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const body = await result.json();
        if (!result.ok) throw new Error(Array.isArray(body.message) ? body.message[0] : body.message);

        setToken(body.access_token);
        if (body.isNewUser || !body.user?.onboardingCompleted) {
          requireOnboarding();
          window.location.href = "/user/onboarding";
        } else {
          clearOnboardingRequired();
          window.location.href = "/user/discover";
        }
      } catch (reason) {
        setError(reason instanceof Error && reason.message ? reason.message : "Google sign-in failed. Please try again.");
        setLoading(false);
      }
    };

    const render = () => {
      if (!window.google?.accounts || !containerRef.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: mode === "signup" ? "signup_with" : "signin_with",
        logo_alignment: "left",
        width: Math.min(containerRef.current.clientWidth || 400, 400),
      });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (window.google?.accounts) render();
    else if (existing) existing.addEventListener("load", render, { once: true });
    else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      script.addEventListener("error", () => setError("Google sign-in could not be loaded."), { once: true });
      document.head.appendChild(script);
    }

    return () => existing?.removeEventListener("load", render);
  }, [clientId, mode]);

  if (!clientId) {
    return (
      <div>
        <button type="button" disabled className="flex h-11 w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-400">
          <GoogleIcon />
          Continue with Google
        </button>
        <p className="mt-2 text-center text-[11px] text-amber-600">Google login needs NEXT_PUBLIC_GOOGLE_CLIENT_ID configuration.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex min-h-11 w-full items-center justify-center">
        <div ref={containerRef} className={loading ? "pointer-events-none opacity-40" : ""} />
        {loading && <Loader2 className="absolute h-5 w-5 animate-spin text-rose-500" />}
      </div>
      {error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
