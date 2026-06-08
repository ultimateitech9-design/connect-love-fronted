'use client';

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import {
 Ban,
 ChevronLeft,
 ChevronRight,
 ChevronsLeft,
 ChevronsRight,
 Eye,
 Filter,
 Pencil,
 Search,
 ShieldCheck,
 Star,
 TrendingUp,
 UserPlus,
 
 AlertCircle,
} from "lucide-react";

type Status = "Active" | "Pending" | "Under Review" | "Banned";
type StatusFilter = "All" | Status;
type Verification = "Verified" | "Pending" | "Revoked";
type Account = "Premium Plus" | "Premium" | "Free Tier";
type Role = "Admin" | "Finance" | "Accounts" | "User" | "Marketing";
type RoleFilter = "All" | Role;

interface Row {
 name: string;
 email: string;
 account: Account;
 role: Role;
 verification: Verification;
 joinDate: string;
 lastActive: string;
 status: Status;
 initials: string;
 color: string;
 muted?: boolean;
}

const avatarColors = ["bg-rose-400", "bg-slate-600", "bg-amber-500", "bg-indigo-500", "bg-slate-300", "bg-emerald-500", "bg-violet-500"];
const verificationMap: Record<string, Verification> = {
 "Premium Plus": "Verified",
 "Premium": "Verified",
 "Free Tier": "Pending",
};

function buildRow(u: { id: number; name: string; email: string; account: string; status: string }, i: number): Row {
 const parts = u.name.trim().split(" ");
 const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
 const color = avatarColors[i % avatarColors.length];
 const verification = (verificationMap[u.account] ?? "Pending") as Verification;
 const account = (["Premium Plus", "Premium", "Free Tier"].includes(u.account) ? u.account : "Free Tier") as Account;
 const status = (["Active", "Pending", "Under Review", "Banned"].includes(u.status) ? u.status : "Pending") as Status;
 
 let role: Role = "User";
 if (i % 10 === 0) role = "Admin";
 else if (i % 7 === 0) role = "Finance";
 else if (i % 5 === 0) role = "Accounts";

 return { name: u.name, email: u.email, account, role, verification, joinDate: "—", lastActive: "—", status, initials: initials.toUpperCase(), color };
}

const monoLabel = "font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

export default function UsersPage() {
 const [perPage, setPerPage] = useState(10);
 const [status, setStatus] = useState<StatusFilter>("All");
 const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
 const [query, setQuery] = useState("");
 const [rows, setRows] = useState<Row[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const [showModal, setShowModal] = useState(false);
 const [newName, setNewName] = useState("");
 const [newEmail, setNewEmail] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [newRole, setNewRole] = useState<Role>("Admin");

 const handleCreateUser = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newName || !newEmail || !newPassword) return;

 const parts = newName.trim().split(" ");
 const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
 const color = avatarColors[rows.length % avatarColors.length];

 const newUser: Row = {
 name: newName,
 email: newEmail,
 account: "Free Tier",
 role: newRole,
 verification: "Pending",
 joinDate: new Date().toISOString().split("T")[0],
 lastActive: "Just now",
 status: "Active",
 initials: initials.toUpperCase(),
 color
 };

 setRows([newUser, ...rows]);
 setNewName("");
 setNewEmail("");
 setNewPassword("");
 setNewRole("Admin");
 };

 const fetchUsers = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.users();
 setRows(res.users.map((u, i) => buildRow(u, i)));
 } catch {
 setError("Failed to load users from backend. Is the backend server running?");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchUsers(); }, []);

 const filteredRows = useMemo(() => {
 return rows.filter((row) => {
 const matchesStatus = status === "All" || row.status === status;
 const matchesRole = roleFilter === "All" || row.role === roleFilter;
 const queryText = query.toLowerCase().trim();
 const matchesQuery =
 !queryText ||
 row.name.toLowerCase().includes(queryText) ||
 row.email.toLowerCase().includes(queryText);

 return matchesStatus && matchesRole && matchesQuery;
 });
 }, [query, status, roleFilter, rows]);

 return (
 <div className="max-w-[88.889vw] relative pb-20">
 <div className="mb-8">
 <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
 <p className="text-sm text-muted-foreground mt-2">
 Create and manage system access IDs for Admin, Finance, Accounts, and Marketing.
 </p>
 </div>

 <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8">
 <h2 className="text-lg font-bold mb-4">Create New ID</h2>
 <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Name</label>
 <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary" placeholder="Full Name" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Email</label>
 <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary" placeholder="name@company.com" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Password</label>
 <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary" placeholder="••••••••" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Role</label>
 <select value={newRole} onChange={e => setNewRole(e.target.value as Role)} className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary">
 <option value="Admin">Admin</option>
 <option value="Finance">Finance</option>
 <option value="Accounts">Accounts</option>
 <option value="Marketing">Marketing</option>
 </select>
 </div>
 <div>
 <button type="submit" className="w-full h-[2.778vw] rounded-lg text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md" style={{ background: "var(--gradient-brand)" }}>
 Create ID
 </button>
 </div>
 </form>
 </div>

 {error && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
 <AlertCircle className="h-[1.111vw] w-[1.111vw] shrink-0" /> {error}
 </div>
 )}

 <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
 <div className="flex flex-wrap items-center gap-2">
 <div className="relative w-full sm:w-[20vw]">
 <Search className="absolute left-3 top-1/2 h-[1.111vw] w-[1.111vw] -translate-y-1/2 text-muted-foreground" />
 <input
 value={query}
 onChange={(event) => setQuery(event.target.value)}
 placeholder="Search by name or email"
 className="h-[2.5vw] w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
 />
 </div>
 <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
 <span className="flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground">
 <Filter className="h-[0.972vw] w-[0.972vw]" /> Status
 </span>
 {(["All", "Active", "Pending", "Under Review", "Banned"] as const).map((item) => (
 <button
 key={item}
 onClick={() => setStatus(item)}
 className={
 "rounded-full px-3 py-1 text-xs font-medium transition " +
 (status === item ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")
 }
 >
 {item}
 </button>
 ))}
 </div>
 <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
 <span className="flex items-center gap-1 px-2 text-xs font-medium text-muted-foreground">
 <ShieldCheck className="h-[0.972vw] w-[0.972vw]" /> Role
 </span>
 {(["All", "Admin", "Finance", "Accounts", "Marketing"] as const).map((item) => (
 <button
 key={item}
 onClick={() => setRoleFilter(item as RoleFilter)}
 className={
 "rounded-full px-3 py-1 text-xs font-medium transition " +
 (roleFilter === item ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")
 }
 >
 {item}
 </button>
 ))}
 </div>
 <button onClick={() => { setStatus("All"); setRoleFilter("All"); setQuery(""); }} className="text-xs text-secondary font-medium hover:underline">
 Clear all
 </button>
 </div>
 <div className="flex items-center gap-3 text-xs text-muted-foreground">
 <span>Showing {filteredRows.length} of {rows.length}</span>
 <div className="flex items-center gap-1">
 <button className="h-[1.944vw] w-[1.944vw] rounded-md border border-border flex items-center justify-center hover:bg-card">
 <ChevronLeft className="h-[0.972vw] w-[0.972vw]" />
 </button>
 <button className="h-[1.944vw] w-[1.944vw] rounded-md border border-border flex items-center justify-center hover:bg-card">
 <ChevronRight className="h-[0.972vw] w-[0.972vw]" />
 </button>
 </div>
 </div>
 </div>

 <div className="rounded-xl bg-card border border-border overflow-hidden">
 <table className="w-full">
 <thead>
 <tr className={`border-b border-border ${monoLabel}`}>
 <th className="text-left py-3 pl-6 font-mono">Name / Avatar</th>
 <th className="text-left py-3 font-mono">Role & Account</th>
 <th className="text-left py-3 font-mono">Verification</th>
 <th className="text-left py-3 font-mono">Join Date</th>
 <th className="text-left py-3 font-mono">Last Active</th>
 <th className="text-left py-3 font-mono">Status</th>
 <th className="text-right py-3 pr-6 font-mono">Actions</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 Array.from({ length: 5 }).map((_, i) => (
 <tr key={i} className="border-b border-border">
 {Array.from({ length: 7 }).map((__, j) => (
 <td key={j} className="py-4 pl-6"><div className="h-[1.389vw] rounded bg-muted animate-pulse" /></td>
 ))}
 </tr>
 ))
 ) : filteredRows.map((row) => (
 <tr key={row.email} className={"border-b border-border last:border-0 hover:bg-muted/30 transition-colors " + (row.muted ? "opacity-60" : "")}>
 <td className="py-4 pl-6">
 <div className="flex items-center gap-3">
 <div className={`h-[2.778vw] w-[2.778vw] rounded-full ${row.color} text-white flex items-center justify-center text-sm font-semibold`}>
 {row.initials}
 </div>
 <div>
 <p className={"font-semibold text-foreground " + (row.muted ? "line-through" : "")}>{row.name}</p>
 <p className="text-xs text-muted-foreground">{row.email}</p>
 </div>
 </div>
 </td>
 <td className="py-4">
 <div className="flex flex-col">
 <span className="text-sm font-semibold text-foreground">{row.role}</span>
 {row.account === "Free Tier" ? (
 <span className="text-xs text-muted-foreground">Free Tier</span>
 ) : (
 <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
 <Star className="h-[0.833vw] w-[0.833vw] fill-primary" /> {row.account}
 </span>
 )}
 </div>
 </td>
 <td className="py-4">
 <VerificationPill value={row.verification} />
 </td>
 <td className="py-4 text-sm text-foreground">{row.joinDate}</td>
 <td className="py-4 text-sm">
 <span className={row.status === "Under Review" ? "text-amber-600 font-medium" : "text-foreground"}>
 {row.lastActive}
 </span>
 </td>
 <td className="py-4">
 <StatusDot status={row.status} />
 </td>
 <td className="py-4 pr-6 text-right">
 {row.status === "Banned" ? (
 <div className="inline-flex items-center gap-2 justify-end">
 <button className="hover:text-secondary"><Eye className="h-[1.111vw] w-[1.111vw] text-muted-foreground" /></button>
 <button className="px-3 py-1 rounded-md bg-muted text-foreground text-xs font-semibold hover:bg-accent">UNBAN</button>
 </div>
 ) : (
 <div className="inline-flex items-center gap-3 justify-end text-muted-foreground">
 <button className="hover:text-secondary"><Eye className="h-[1.111vw] w-[1.111vw]" /></button>
 <button className="hover:text-secondary"><Pencil className="h-[1.111vw] w-[1.111vw]" /></button>
 <button className="hover:text-primary"><Ban className="h-[1.111vw] w-[1.111vw]" /></button>
 </div>
 )}
 </td>
 </tr>
 ))}
 {!loading && filteredRows.length === 0 && (
 <tr>
 <td colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
 No users found.
 </td>
 </tr>
 )}
 </tbody>
 </table>

 <div className="flex items-center justify-between px-6 py-4 border-t border-border">
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <span>Rows per page:</span>
 <select
 value={perPage}
 onChange={(event) => setPerPage(Number(event.target.value))}
 className="h-[1.944vw] rounded-md border border-border bg-card px-2 text-xs"
 >
 <option>10</option>
 <option>25</option>
 <option>50</option>
 </select>
 </div>
 <div className="flex items-center gap-1">
 <button className="h-[2.222vw] w-[2.222vw] rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted">
 <ChevronsLeft className="h-[1.111vw] w-[1.111vw]" />
 </button>
 <button className="h-[2.222vw] w-[2.222vw] rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted">
 <ChevronLeft className="h-[1.111vw] w-[1.111vw]" />
 </button>
 {[1, 2, 3].map((page) => (
 <button
 key={page}
 className={
 "h-[2.222vw] w-[2.222vw] rounded-md text-sm font-medium flex items-center justify-center " +
 (page === 1 ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")
 }
 >
 {page}
 </button>
 ))}
 <span className="px-2 text-muted-foreground">...</span>
 <button className="h-[2.222vw] w-[2.222vw] rounded-md text-sm font-medium text-foreground hover:bg-muted">128</button>
 <button className="h-[2.222vw] w-[2.222vw] rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted">
 <ChevronRight className="h-[1.111vw] w-[1.111vw]" />
 </button>
 <button className="h-[2.222vw] w-[2.222vw] rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted">
 <ChevronsRight className="h-[1.111vw] w-[1.111vw]" />
 </button>
 </div>
 </div>
 </div>

 </div>
 );
}

function VerificationPill({ value }: { value: Verification }) {
 const map = {
 Verified: "bg-emerald-50 text-emerald-700",
 Pending: "bg-amber-50 text-amber-700",
 Revoked: "bg-rose-50 text-rose-700",
 } as const;

 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${map[value]}`}>
 <span className="h-[0.417vw] w-[0.417vw] rounded-full bg-current" /> {value}
 </span>
 );
}

function StatusDot({ status }: { status: Status }) {
 const map = {
 Active: { dot: "bg-emerald-500", text: "text-emerald-700" },
 Pending: { dot: "bg-blue-500", text: "text-blue-700" },
 "Under Review": { dot: "bg-amber-500", text: "text-amber-700" },
 Banned: { dot: "bg-slate-400", text: "text-slate-600" },
 } as const;
 const style = map[status];

 return (
 <span className={`inline-flex items-center gap-2 text-sm font-medium ${style.text}`}>
 <span className={`h-[0.556vw] w-[0.556vw] rounded-full ${style.dot}`} /> {status}
 </span>
 );
}
