"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

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
 const [settings, setSettings] = useState<UserSettings>(defaultSettings);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
   if (settings.darkMode) {
     document.documentElement.classList.add("dark");
   } else {
     document.documentElement.classList.remove("dark");
   }
 }, [settings.darkMode]);

 useEffect(() => {
 const fetchSettings = async () => {
 const token = getToken();
 if (!token) {
 setLoading(false);
 return;
 }
 try {
 const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
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
 darkMode: data.darkMode ?? false,
 language: data.language ?? "en",
 });
 }
 } catch {
 // silently use defaults
 } finally {
 setLoading(false);
 }
 };
 fetchSettings();
 }, []);

 const updateSetting = async (key: keyof UserSettings, value: boolean | string) => {
 setSettings((prev) => ({ ...prev, [key]: value }));
 const token = getToken();
 if (!token) return;
 try {
 const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
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
