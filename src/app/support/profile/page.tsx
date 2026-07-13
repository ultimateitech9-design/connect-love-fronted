"use client";
import { API_ORIGIN } from "@/config/runtime";

import { FormEvent, useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { getManagementToken } from "@/lib/auth";

const API = API_ORIGIN;

export default function SupportProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getManagementToken();
    if (!token) return;
    fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : null)
      .then((user) => { if (user) { setName(user.name || ""); setEmail(user.email || ""); setRole(user.role || "support"); } });
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch(`${API}/users/me`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getManagementToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setMessage(response.ok ? "Profile saved." : "Could not save profile.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="text-3xl font-bold">My Profile</h1><p className="mt-1 text-sm text-muted-foreground">Manage your support account details.</p></div>
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/15"><UserRound className="h-8 w-8 text-primary" /></div>
        <label className="block text-sm font-semibold">Name<input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 font-normal" /></label>
        <label className="block text-sm font-semibold">Email<input value={email} readOnly className="mt-2 h-11 w-full rounded-xl border border-border bg-muted px-4 font-normal" /></label>
        <label className="block text-sm font-semibold">Role<input value={role} readOnly className="mt-2 h-11 w-full rounded-xl border border-border bg-muted px-4 font-normal" /></label>
        {message && <p className="text-sm text-primary">{message}</p>}
        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"><Save className="h-4 w-4" />Save profile</button>
      </form>
    </div>
  );
}
