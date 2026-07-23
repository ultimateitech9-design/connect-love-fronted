"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, BadgeCheck, Camera, Save, Search, Trash2, UserRoundSearch, X } from "lucide-react";
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

type UserForm = {
 name: string;
 email: string;
 role: string;
 plan: string;
 status: string;
 isVerified: boolean;
 birthDate: string;
 gender: string;
 profession: string;
 height: string;
 city: string;
 bio: string;
 interests: string;
 hobbies: string;
 personality: string;
 photos: string;
};

const emptyForm: UserForm = {
 name: "",
 email: "",
 role: "user",
 plan: "free",
 status: "active",
 isVerified: false,
 birthDate: "",
 gender: "",
 profession: "",
 height: "",
 city: "",
 bio: "",
 interests: "",
 hobbies: "",
 personality: "",
 photos: "",
};

const mono = "text-[10px] font-bold uppercase tracking-wider text-muted-foreground";

function normalizeStatus(value?: string) {
 const text = String(value || "active").toLowerCase().replace(/\s+/g, "_");
 if (text === "active") return "active";
 if (text === "banned") return "banned";
 if (text === "suspended") return "suspended";
 return "pending_verification";
}

function toDateInput(value?: string) {
 if (!value) return "";
 const date = new Date(value);
 return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function listText(value?: string[]) {
 return Array.isArray(value) ? value.join(", ") : "";
}

function listValue(value: string) {
 return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function photosValue(value: string) {
 return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function initials(name?: string) {
 return String(name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatPlan(plan?: string) {
 const key = String(plan || "free").toLowerCase();
 if (key === "platinum") return "Elite / Diamond";
 if (key === "gold") return "Premium / Gold";
 return "Basic / Free";
}

export default function User360Page() {
 const [users, setUsers] = useState<UserRow[]>([]);
 const [selectedId, setSelectedId] = useState("");
 const [details, setDetails] = useState<any | null>(null);
 const [form, setForm] = useState<UserForm>(emptyForm);
 const [query, setQuery] = useState("");
 const [loadingUsers, setLoadingUsers] = useState(true);
 const [totalUsers, setTotalUsers] = useState(0);
 const usersRequestRef = useRef(0);
 const [loadingDetails, setLoadingDetails] = useState(false);
 const [saving, setSaving] = useState(false);
 const [deleting, setDeleting] = useState(false);
 const [error, setError] = useState("");
 const [message, setMessage] = useState("");
 const [confirmDelete, setConfirmDelete] = useState(false);

 const filteredUsers = useMemo(() => {
 const text = query.toLowerCase().trim();
 if (!text) return users;
 return users.filter((user) =>
 user.name.toLowerCase().includes(text) ||
 user.email.toLowerCase().includes(text) ||
 String(user.mobile || "").toLowerCase().includes(text) ||
 String(user.phone || "").toLowerCase().includes(text) ||
 user.id.toLowerCase().includes(text) ||
 user.role.toLowerCase().includes(text) ||
 user.plan.toLowerCase().includes(text)
 );
 }, [query, users]);

 const loadUsers = async (search = "") => {
 const requestId = ++usersRequestRef.current;
 setLoadingUsers(true);
 setError("");
 try {
 let page = 1;
 let hasMore = true;
 let allUsers: UserRow[] = [];
 while (hasMore) {
 const res = await api.users(search, page, 100);
 if (requestId !== usersRequestRef.current) return;
 allUsers = Array.from(new Map([...allUsers, ...(res.users as UserRow[])].map((user) => [user.id, user])).values());
 setUsers(allUsers);
 setTotalUsers(res.total);
 hasMore = res.hasMore;
 page += 1;
 }
 if (allUsers[0] && (!selectedId || !allUsers.some((user) => user.id === selectedId))) {
 setSelectedId(allUsers[0].id);
 }
 } catch {
 setError("Users load nahi hue. Backend/session check karein.");
 } finally {
 if (requestId === usersRequestRef.current) setLoadingUsers(false);
 }
 };

 const loadDetails = async (id: string) => {
 if (!id) return;
 setLoadingDetails(true);
 setError("");
 setMessage("");
 try {
 const res = await api.userDetails(id);
 const user = res.user;
 setDetails(user);
 setForm({
 name: user.name || "",
 email: user.email || "",
 role: user.role || "user",
 plan: user.plan || "free",
 status: normalizeStatus(user.status),
 isVerified: Boolean(user.isVerified),
 birthDate: toDateInput(user.birthDate),
 gender: user.gender || "",
 profession: user.profession || "",
 height: user.height || "",
 city: user.city || "",
 bio: user.bio || "",
 interests: listText(user.interests),
 hobbies: listText(user.hobbies),
 personality: listText(user.personality),
 photos: Array.isArray(user.photos) ? user.photos.join("\n") : "",
 });
 } catch {
 setError("User details load nahi hue.");
 } finally {
 setLoadingDetails(false);
 }
 };

 useEffect(() => {
 const timer = window.setTimeout(() => loadUsers(query), 250);
 return () => window.clearTimeout(timer);
 }, [query]);
 useEffect(() => { loadDetails(selectedId); }, [selectedId]);

 const updateField = (key: keyof UserForm, value: string | boolean) => {
 setForm((current) => ({ ...current, [key]: value }));
 };

 const handleSave = async () => {
 if (!selectedId) return;
 setSaving(true);
 setError("");
 setMessage("");
 try {
 const body = {
 name: form.name,
 email: form.email,
 role: form.role,
 plan: form.plan,
 status: form.status,
 isVerified: form.isVerified,
 birthDate: form.birthDate || "",
 gender: form.gender,
 profession: form.profession,
 height: form.height,
 city: form.city,
 bio: form.bio,
 interests: listValue(form.interests),
 hobbies: listValue(form.hobbies),
 personality: listValue(form.personality),
 photos: photosValue(form.photos),
 };
 const res = await api.updateUser(selectedId, body);
 if (res.message && !res.success) setError(res.message);
 else {
 setMessage("User profile update ho gaya.");
 await loadUsers(query);
 await loadDetails(selectedId);
 }
 } catch {
 setError("Profile save nahi hua.");
 } finally {
 setSaving(false);
 }
 };

 const handleDelete = async () => {
 if (!selectedId || !details) return;
 setDeleting(true);
 setError("");
 try {
 await api.deleteUser(selectedId);
 const remaining = users.filter((user) => user.id !== selectedId);
 setUsers(remaining);
 setSelectedId(remaining[0]?.id || "");
 setDetails(null);
 setConfirmDelete(false);
 setMessage("User permanently delete ho gaya.");
 } catch {
 setError("User delete nahi hua.");
 } finally {
 setDeleting(false);
 }
 };

 const selectedPhotos = photosValue(form.photos);

 return (
 <div className="space-y-6 pb-16">
 <header className="flex flex-wrap items-end justify-between gap-4">
 <div>
 <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-100">
 <UserRoundSearch className="h-3.5 w-3.5" /> User 360
 </div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground">User 360</h1>
 <p className="mt-2 text-sm text-muted-foreground">Full user profile, photos, plan, status, edit controls, and delete action in one place.</p>
 </div>
 <button onClick={handleSave} disabled={!details || saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-rose-500 px-5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 disabled:opacity-50">
 <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
 </button>
 </header>

 {error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"><AlertCircle className="h-4 w-4" />{error}</div>}
 {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div>}

 <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
 <aside className="rounded-2xl border border-border bg-card shadow-card">
 <div className="border-b border-border p-4">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, name or email..." className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-rose-400" />
 </div>
 <p className="mt-3 text-xs font-semibold text-muted-foreground">{totalUsers} users</p>
 </div>
 <div className="max-h-[680px] overflow-y-auto p-2">
 {loadingUsers ? (
 Array.from({ length: 6 }).map((_, index) => <div key={index} className="mb-2 h-16 animate-pulse rounded-xl bg-muted" />)
 ) : filteredUsers.length === 0 ? (
 <p className="py-10 text-center text-sm text-muted-foreground">No users found.</p>
 ) : filteredUsers.map((user) => (
 <button key={user.id} onClick={() => setSelectedId(user.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selectedId === user.id ? "bg-rose-50 ring-1 ring-rose-100" : "hover:bg-muted/70"}`}>
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-sm font-bold text-white">{initials(user.name)}</div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
 <p className="truncate font-mono text-[10px] font-semibold text-rose-600" title={user.id}>ID: {user.id}</p>
 <p className="truncate text-xs text-muted-foreground">{user.email}</p>
 {(user.mobile || user.phone) && <p className="truncate text-[11px] font-medium text-muted-foreground">{user.mobile || user.phone}</p>}
 <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-500">{formatPlan(user.plan)}</p>
 </div>
 </button>
 ))}
 </div>
 </aside>

 <section className="min-w-0 space-y-6">
 {!selectedId ? (
 <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">Select a user to open 360 details.</div>
 ) : loadingDetails ? (
 <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">Loading user 360...</div>
 ) : details ? (
 <>
 <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
 <div className="flex flex-wrap items-center gap-5">
 {details.avatarUrl ? <img src={details.avatarUrl} alt={details.name} className="h-24 w-24 rounded-2xl object-cover ring-1 ring-border" /> : <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-2xl font-black text-white">{initials(details.name)}</div>}
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="truncate text-2xl font-black text-foreground">{details.name}</h2>
 {form.isVerified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700"><BadgeCheck className="h-3 w-3" /> Verified</span>}
 </div>
 <p className="mt-1 text-sm font-medium text-muted-foreground">{details.email}</p>
 <div className="mt-3 flex flex-wrap gap-2">
 <Pill label="Plan" value={formatPlan(form.plan)} />
 <Pill label="Role" value={form.role} />
 <Pill label="Status" value={form.status.replace("_", " ")} />
 <Pill label="Joined" value={toDateInput(details.joined) || "-"} />
 </div>
 </div>
 <button onClick={() => setConfirmDelete(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 hover:bg-rose-100">
 <Trash2 className="h-4 w-4" /> Delete
 </button>
 </div>
 </div>

 <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
 <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
 <h3 className="mb-4 text-lg font-bold text-foreground">Edit Profile</h3>
 <div className="grid gap-4 md:grid-cols-2">
 <TextField label="Name" value={form.name} onChange={(value) => updateField("name", value)} />
 <TextField label="Email" value={form.email} onChange={(value) => updateField("email", value)} type="email" />
 <SelectField label="Role" value={form.role} onChange={(value) => updateField("role", value)} options={["user", "admin", "super_admin", "sales", "support"]} />
 <SelectField label="Plan" value={form.plan} onChange={(value) => updateField("plan", value)} options={["free", "gold", "platinum"]} />
 <SelectField label="Status" value={form.status} onChange={(value) => updateField("status", value)} options={["active", "suspended", "banned", "pending_verification"]} />
 <TextField label="Birth Date" value={form.birthDate} onChange={(value) => updateField("birthDate", value)} type="date" />
 <TextField label="Gender" value={form.gender} onChange={(value) => updateField("gender", value)} />
 <TextField label="Profession" value={form.profession} onChange={(value) => updateField("profession", value)} />
 <TextField label="Height" value={form.height} onChange={(value) => updateField("height", value)} />
 <TextField label="City" value={form.city} onChange={(value) => updateField("city", value)} />
 <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground md:col-span-2">
 <input type="checkbox" checked={form.isVerified} onChange={(event) => updateField("isVerified", event.target.checked)} className="h-4 w-4 accent-rose-500" />
 User verified
 </label>
 <TextArea label="Bio" value={form.bio} onChange={(value) => updateField("bio", value)} className="md:col-span-2" rows={4} />
 <TextArea label="Interests (comma separated)" value={form.interests} onChange={(value) => updateField("interests", value)} />
 <TextArea label="Hobbies (comma separated)" value={form.hobbies} onChange={(value) => updateField("hobbies", value)} />
 <TextArea label="Personality (comma separated)" value={form.personality} onChange={(value) => updateField("personality", value)} />
 <TextArea label="Photo URLs / base64, one per line" value={form.photos} onChange={(value) => updateField("photos", value)} rows={6} />
 </div>
 </div>

 <aside className="space-y-6">
 <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
 <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground"><Camera className="h-5 w-5 text-rose-500" /> Photos</h3>
 {selectedPhotos.length === 0 ? <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No photos added.</div> : (
 <div className="grid grid-cols-2 gap-3">
 {selectedPhotos.map((photo, index) => <img key={`${photo}-${index}`} src={photo} alt={`${form.name} ${index + 1}`} className="aspect-square rounded-xl border border-border object-cover" />)}
 </div>
 )}
 </div>
 <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
 <h3 className="mb-4 text-lg font-bold text-foreground">Profile Snapshot</h3>
 <Info label="Age" value={details.age ? `${details.age}` : "-"} />
 <Info label="Last Active" value={toDateInput(details.lastActive) || "-"} />
 <Info label="City" value={form.city || "-"} />
 <Info label="Plan" value={formatPlan(form.plan)} />
 </div>
 </aside>
 </div>
 </>
 ) : null}
 </section>
 </div>

 {confirmDelete && details && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) setConfirmDelete(false); }}>
 <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
 <div className="mb-4 flex items-start justify-between gap-4">
 <div>
 <h3 className="text-lg font-black text-foreground">Delete user permanently?</h3>
 <p className="mt-1 text-sm text-muted-foreground">{details.name} and their profile data will be deleted.</p>
 </div>
 <button onClick={() => setConfirmDelete(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
 </div>
 <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">This action cannot be undone.</div>
 <div className="mt-5 flex justify-end gap-3">
 <button onClick={() => setConfirmDelete(false)} className="h-10 rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-muted">Cancel</button>
 <button onClick={handleDelete} disabled={deleting} className="h-10 rounded-xl bg-rose-500 px-4 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-50">{deleting ? "Deleting..." : "Delete User"}</button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

function Pill({ label, value }: { label: string; value: string }) {
 return <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground"><span className="text-muted-foreground">{label}:</span> {value}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
 return <div className="border-b border-border py-3 last:border-b-0"><p className={mono}>{label}</p><p className="mt-1 text-sm font-bold text-foreground">{value}</p></div>;
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
 return <label className="space-y-1.5"><p className={mono}>{label}</p><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-rose-400" /></label>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
 return <label className="space-y-1.5"><p className={mono}>{label}</p><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-rose-400">{options.map((option) => <option key={option} value={option}>{option === "platinum" ? "diamond" : option.replace("_", " ")}</option>)}</select></label>;
}

function TextArea({ label, value, onChange, className = "", rows = 3 }: { label: string; value: string; onChange: (value: string) => void; className?: string; rows?: number }) {
 return <label className={`space-y-1.5 ${className}`}><p className={mono}>{label}</p><textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-rose-400" /></label>;
}
