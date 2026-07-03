"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, Camera, Search, UserRoundSearch } from "lucide-react";
import { api } from "@/lib/api";

type UserRow = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
  role: string;
  plan: string;
  account: string;
  city: string;
  joined: string;
  lastActive: string;
  isVerified: boolean;
  status: string;
};

function initials(name?: string) {
  return String(name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function toDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toISOString().slice(0, 10);
}

function formatPlan(plan?: string) {
  const key = String(plan || "free").toLowerCase();
  if (key === "platinum") return "Elite / Platinum";
  if (key === "gold") return "Premium / Gold";
  return "Basic / Free";
}

function pillTone(value?: string) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("active")) return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (normalized.includes("banned")) return "bg-rose-50 text-rose-700 ring-rose-100";
  if (normalized.includes("review") || normalized.includes("pending")) return "bg-amber-50 text-amber-700 ring-amber-100";
  return "bg-slate-50 text-slate-700 ring-slate-100";
}

export function User360ReadOnly({ title = "User 360", subtitle = "Read-only user profile intelligence." }: { title?: string; subtitle?: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [details, setDetails] = useState<any | null>(null);
  const [query, setQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    const text = query.toLowerCase().trim();
    if (!text) return users;
    return users.filter((user) =>
      user.name.toLowerCase().includes(text) ||
      user.email.toLowerCase().includes(text) ||
      String(user.mobile || "").toLowerCase().includes(text) ||
      String(user.phone || "").toLowerCase().includes(text) ||
      user.id.toLowerCase().includes(text)
    );
  }, [query, users]);

  useEffect(() => {
    let alive = true;
    setLoadingUsers(true);
    api.users()
      .then((res) => {
        if (!alive) return;
        setUsers(res.users as UserRow[]);
        setSelectedId((current) => current || res.users[0]?.id || "");
      })
      .catch(() => setError("Users load nahi hue. Backend/session check karein."))
      .finally(() => {
        if (alive) setLoadingUsers(false);
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    setLoadingDetails(true);
    setError("");
    api.userDetails(selectedId)
      .then((res) => {
        if (alive) setDetails(res.user);
      })
      .catch(() => setError("User details load nahi hue."))
      .finally(() => {
        if (alive) setLoadingDetails(false);
      });
    return () => { alive = false; };
  }, [selectedId]);

  const photos = Array.isArray(details?.photos) ? details.photos : [];
  const contactNumber = details?.mobile || details?.phone || users.find((user) => user.id === selectedId)?.mobile || users.find((user) => user.id === selectedId)?.phone || "";

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-100">
          <UserRoundSearch className="h-3.5 w-3.5" /> Read Only
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, number..."
                className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-rose-400"
              />
            </div>
            <p className="mt-3 text-xs font-semibold text-muted-foreground">{filteredUsers.length} users</p>
          </div>
          <div className="max-h-[680px] overflow-y-auto p-2">
            {loadingUsers ? (
              Array.from({ length: 6 }).map((_, index) => <div key={index} className="mb-2 h-16 animate-pulse rounded-xl bg-muted" />)
            ) : filteredUsers.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No users found.</p>
            ) : filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selectedId === user.id ? "bg-rose-50 ring-1 ring-rose-100" : "hover:bg-muted/70"}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white">{initials(user.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  {(user.mobile || user.phone) && <p className="truncate text-[11px] text-muted-foreground">{user.mobile || user.phone}</p>}
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-500">{formatPlan(user.plan)}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          {!selectedId ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">Select a user to view details.</div>
          ) : loadingDetails ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">Loading user 360...</div>
          ) : details ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-center gap-5">
                  {details.avatarUrl ? (
                    <img src={details.avatarUrl} alt={details.name} className="h-24 w-24 rounded-2xl object-cover ring-1 ring-border" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-2xl font-black text-white">{initials(details.name)}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-2xl font-black text-foreground">{details.name}</h2>
                      {details.isVerified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700"><BadgeCheck className="h-3 w-3" /> Verified</span>}
                    </div>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{details.email}</p>
                    {contactNumber && <p className="mt-1 text-sm font-medium text-muted-foreground">{contactNumber}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Pill label="Plan" value={formatPlan(details.plan)} />
                      <Pill label="Role" value={details.role || "user"} />
                      <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${pillTone(details.status)}`}>{details.status || "active"}</span>
                      <Pill label="Joined" value={toDate(details.joined)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="mb-4 text-lg font-bold text-foreground">Profile Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Info label="City" value={details.city || "-"} />
                    <Info label="Profession" value={details.profession || "-"} />
                    <Info label="Height" value={details.height || "-"} />
                    <Info label="Gender" value={details.gender || "-"} />
                    <Info label="Age" value={details.age ? String(details.age) : "-"} />
                    <Info label="Birth Date" value={toDate(details.birthDate)} />
                    <Info label="Last Active" value={toDate(details.lastActive)} />
                    <Info label="Account Plan" value={formatPlan(details.plan)} />
                  </div>
                  {details.bio && (
                    <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
                      {details.bio}
                    </div>
                  )}
                  <TagGroup title="Interests" items={details.interests} />
                  <TagGroup title="Hobbies" items={details.hobbies} />
                  <TagGroup title="Personality" items={details.personality} />
                </div>

                <aside className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><Camera className="h-5 w-5 text-rose-500" /> Photos</h3>
                  {photos.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No photos added.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo: string, index: number) => (
                        <img key={`${photo}-${index}`} src={photo} alt={`${details.name} ${index + 1}`} className="aspect-square rounded-xl border border-border object-cover" />
                      ))}
                    </div>
                  )}
                </aside>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground"><span className="text-muted-foreground">{label}:</span> {value}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm font-bold text-foreground">{value}</p></div>;
}

function TagGroup({ title, items }: { title: string; items?: string[] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="mt-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => <span key={item} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-100">{item}</span>)}
      </div>
    </div>
  );
}
