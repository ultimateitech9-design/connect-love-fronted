"use client";
import { API_ORIGIN } from "@/config/runtime";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { getStoredTheme, THEME_STORAGE_KEY, type AppTheme } from "@/features/theme/theme";

export interface UserSettings {
 showOnlineStatus: boolean;
 showDistance: boolean;
 onlyShowVerifiedProfiles: boolean;
 notifyMessages: boolean;
 notifyMatches: boolean;
 notifyPush: boolean;
 darkMode: boolean;
 language: string;
}

const defaultSettings: UserSettings = {
 showOnlineStatus: true,
 showDistance: true,
 onlyShowVerifiedProfiles: false,
 notifyMessages: true,
 notifyMatches: true,
 notifyPush: true,
 darkMode: false,
 language: "en",
};

interface SettingsContextType {
 settings: UserSettings;
 loading: boolean;
 updateSetting: (key: keyof UserSettings, value: boolean | string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
 const [settings, setSettings] = useState<UserSettings>(() => ({
  ...defaultSettings,
  darkMode: typeof window !== "undefined" && getStoredTheme() === "dark",
 }));
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (settings.darkMode) {
     document.documentElement.classList.add("dark");
   } else {
     document.documentElement.classList.remove("dark");
   }
 }, [settings.darkMode]);

 useEffect(() => {
  const syncTheme = (event: Event) => {
   const theme = (event as CustomEvent<AppTheme>).detail;
   setSettings((current) => ({ ...current, darkMode: theme === "dark" }));
  };
  window.addEventListener("connect-love-theme-change", syncTheme);
  return () => window.removeEventListener("connect-love-theme-change", syncTheme);
 }, []);

 useEffect(() => {
 const fetchSettings = async () => {
 const token = getToken();
 if (!token) {
 setLoading(false);
 return;
 }
 try {
 const API = API_ORIGIN;
 const res = await fetch(`${API}/users/me`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 if (res.ok) {
 const data = await res.json();
 setSettings({
 showOnlineStatus: data.showOnlineStatus ?? true,
 showDistance: data.showDistance ?? true,
 onlyShowVerifiedProfiles: data.onlyShowVerifiedProfiles ?? false,
 notifyMessages: data.notifyMessages ?? true,
 notifyMatches: data.notifyMatches ?? true,
 notifyPush: data.notifyPush ?? true,
 darkMode: localStorage.getItem(THEME_STORAGE_KEY) ? getStoredTheme() === "dark" : data.darkMode ?? false,
 language: data.language ?? "en",
 });
 }
 } catch {
 // silently use defaults
 } finally {
 setLoading(false);
 }
 };
 const timer = window.setTimeout(fetchSettings, 5000);
 return () => window.clearTimeout(timer);
 }, []);

 const updateSetting = async (key: keyof UserSettings, value: boolean | string) => {
 setSettings((prev) => ({ ...prev, [key]: value }));
 const token = getToken();
 if (!token) return;
 try {
 const API = API_ORIGIN;
 await fetch(`${API}/users/me`, {
 method: "PATCH",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({ [key]: value }),
 });
 } catch {
 // silently fail
 }
 };

 return (
 <SettingsContext.Provider value={{ settings, loading, updateSetting }}>
 {children}
 </SettingsContext.Provider>
 );
}

export function useSettings() {
 const ctx = useContext(SettingsContext);
 if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
 return ctx;
}
