"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";
import { applyTheme, getStoredTheme, type AppTheme } from "./theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<AppTheme>("light");

  useEffect(() => {
    setTheme(getStoredTheme());
    const sync = (event: Event) => setTheme((event as CustomEvent<AppTheme>).detail || getStoredTheme());
    window.addEventListener("connect-love-theme-change", sync);
    return () => window.removeEventListener("connect-love-theme-change", sync);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    const token = getToken();
    if (token) {
      fetch(`${API_ORIGIN}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ darkMode: next === "dark" }),
      }).catch(() => {});
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border/70 bg-card/80 text-foreground shadow-sm backdrop-blur transition hover:scale-105 hover:border-rose-300 hover:text-rose-500", className)}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
