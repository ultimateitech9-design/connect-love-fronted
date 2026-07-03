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
 Trash2,
 X,
 AlertCircle,
} from "lucide-react";

type Status = "Active" | "Pending" | "Under Review" | "Banned";
type StatusFilter = "All" | Status;
type Verification = "Verified" | "Pending" | "Revoked";
type Account = string;
type Role = string;
type CreatableRole = "Admin" | "Marketing" | "Finance" | "Sales" | "Support";
type RoleFilter = "All" | Role;

interface Row {
 id: string;
 name: string;
 email: string;
 account: Account;
 role: Role;
 verification: Verification;
 city: string;
 joinDate: string;
 lastActive: string;
 status: Status;
 initials: string;
 color: string;
 muted?: boolean;
}

const avatarColors = ["bg-rose-400", "bg-slate-600", "bg-amber-500", "bg-indigo-500", "bg-slate-300", "bg-emerald-500", "bg-violet-500"];
const verificationMap: Record<string, Verification> = {};

function formatDate(value?: string) {
 if (!value) return "-";
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return "-";
 return date.toISOString().split("T")[0];
}

function labelize(value?: string) {
 return (value || "user")
 .replace(/[_-]/g, " ")
 .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeStatus(value?: string): Status {
 const normalized = (value || "active").toLowerCase();
 if (normalized === "active") return "Active";
 if (normalized === "banned") return "Banned";
 if (normalized === "pending" || normalized === "pending_verification") return "Pending";
 return "Under Review";
}

function buildRow(u: { id: string; name: string; email: string; role: string; account: string; city: string; joined: string; lastActive: string; isVerified: boolean; status: string }, i: number): Row {
 const parts = u.name.trim().split(" ");
 const initials = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
 const color = avatarColors[i % avatarColors.length];
 const verification = u.isVerified ? "Verified" : (verificationMap[u.account] ?? "Pending") as Verification;
 const account = labelize(u.account);
 const status = normalizeStatus(u.status);
 
 const role = labelize(u.role);
 return { id: u.id, name: u.name, email: u.email, account, role, verification, city: u.city || "-", joinDate: formatDate(u.joined), lastActive: formatDate(u.lastActive), status, initials: initials.toUpperCase(), color };

}

const monoLabel = "font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

export default function UsersPage() {
 const [perPage, setPerPage] = useState(10);
 const [page, setPage] = useState(1);
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newRole, setNewRole] = useState<CreatableRole>("Marketing");
  const [creatingId, setCreatingId] = useState(false);

  const [selectedUser, setSelectedUser] = useState<Row | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<Row | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleViewDetails = async (row: Row) => {
    setSelectedUser(row);
    setLoadingDetails(true);
    setError("");
    try {
      const res = await api.userDetails(row.id);
      setSelectedUserDetails(res.user);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleBan = async (row: Row) => {
    setActionLoading(row.id);
    setError("");
    try {
      const isBanned = row.status === "Banned";
      await api.banUser(row.id, !isBanned);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to update user status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setActionLoading(id);
    setError("");
    try {
      await api.deleteUser(id);
      setDeleteConfirmUser(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;
    if (newPassword !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }
    setError("");
    setCreatingId(true);
    try {
      await api.createManagementUser({ name: newName, email: newEmail, password: newPassword, role: newRole.toLowerCase() as "admin" | "marketing" | "finance" | "sales" | "support" });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user in backend.");
      return;
    } finally {
      setCreatingId(false);
    }
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setNewRole("Marketing");
    setShowModal(false);
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

 const pageCount = Math.max(1, Math.ceil(filteredRows.length / perPage));
 const pageRows = filteredRows.slice((page - 1) * perPage, page * perPage);
 useEffect(() => { setPage(1); }, [query, status, roleFilter, perPage]);
 useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);

 return (
 <div className="w-full relative pb-20">
 <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
 <p className="text-sm text-muted-foreground mt-2">
 Create and manage system access IDs for Admin, Finance, Sales, Support, and Marketing.
 </p>
 </div>
 <button onClick={() => setShowModal(true)} className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90" style={{ background: "var(--gradient-brand)" }}>
 <UserPlus className="h-4 w-4" /> Create ID
 </button>
 </div>

 <div className="hidden">
 <h2 className="text-lg font-bold mb-4">Create New ID</h2>
 <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Name</label>
 <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary" placeholder="Full Name" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Email</label>
 <input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary" placeholder="name@company.com" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Password</label>
 <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary" placeholder="••••••••" />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-semibold uppercase text-muted-foreground">Role</label>
 <select value={newRole} onChange={e => setNewRole(e.target.value as CreatableRole)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary">
 <option value="Marketing">Marketing</option>
 <option value="Finance">Finance</option>
 <option value="Sales">Sales</option>
 <option value="Support">Support</option>
 </select>
 </div>
 <div>
 <button type="submit" className="w-full h-10 rounded-lg text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md" style={{ background: "var(--gradient-brand)" }}>
 Create ID
 </button>
 </div>
 </form>
 </div>

 {showModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.68)", backdropFilter: "blur(7px)" }} onClick={(event) => { if (event.target === event.currentTarget && !creatingId) setShowModal(false); }}>
 <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200">
 <div className="flex items-center justify-between border-b border-border px-6 py-5">
 <div><h2 className="text-xl font-bold text-foreground">Create New Dashboard ID</h2><p className="mt-1 text-sm text-muted-foreground">Create secure login credentials for a management dashboard.</p></div>
 <button type="button" disabled={creatingId} onClick={() => setShowModal(false)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button>
 </div>
 <form onSubmit={handleCreateUser} className="p-6">
 {error && <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-500"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
 <div className="grid gap-5 sm:grid-cols-2">
 <div className="space-y-1.5"><label className={monoLabel}>Full Name</label><input required minLength={2} value={newName} onChange={(e) => setNewName(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground caret-pink-500 outline-none placeholder:text-muted-foreground focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20" placeholder="Full name" /></div>
 <div className="space-y-1.5"><label className={monoLabel}>Login Email</label><input required type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground caret-pink-500 outline-none placeholder:text-muted-foreground focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20" placeholder="name@company.com" /></div>
 <div className="space-y-1.5"><label className={monoLabel}>Password</label><input required minLength={8} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground caret-pink-500 outline-none placeholder:text-muted-foreground focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20" placeholder="Minimum 8 characters" /></div>
 <div className="space-y-1.5"><label className={monoLabel}>Confirm Password</label><input required minLength={8} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground caret-pink-500 outline-none placeholder:text-muted-foreground focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20" placeholder="Repeat password" /></div>
 <div className="space-y-1.5 sm:col-span-2"><label className={monoLabel}>Dashboard Role</label><select value={newRole} onChange={(e) => setNewRole(e.target.value as CreatableRole)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"><option value="Admin">Admin</option><option value="Marketing">Marketing</option><option value="Finance">Finance</option><option value="Sales">Sales</option><option value="Support">Support</option></select><p className="text-xs text-muted-foreground">Admin IDs can only be created from the Super Admin panel.</p></div>
 </div>
 <div className="mt-6 flex justify-end gap-3 border-t border-border pt-5"><button type="button" disabled={creatingId} onClick={() => setShowModal(false)} className="h-10 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50">Cancel</button><button type="submit" disabled={creatingId} className="h-10 min-w-32 rounded-lg px-5 text-sm font-semibold text-white shadow-md disabled:opacity-50" style={{ background: "var(--gradient-brand)" }}>{creatingId ? "Creating..." : "Create ID"}</button></div>
 </form>
 </div>
 </div>
 )}

 {error && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
 <AlertCircle className="h-4 w-4 shrink-0" /> {error}
 </div>
 )}

 <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      {/* Search Bar */}
      <div className="relative w-full sm:w-[250px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email"
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Status Dropdown */}
      <div className="relative w-full sm:w-[160px]">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="h-10 w-full rounded-full border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Banned">Banned</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <Filter className="h-4 w-4" />
        </div>
      </div>

      {/* Role Dropdown */}
      <div className="relative w-full sm:w-[180px]">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="h-10 w-full rounded-full border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
        >
          <option value="All">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="Finance">Finance</option>
          <option value="Sales">Sales</option>
          <option value="Support">Support</option>
          <option value="Marketing">Marketing</option>
          <option value="User">User</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
        </div>
      </div>

      {/* Clear All */}
      {(status !== "All" || roleFilter !== "All" || query !== "") && (
        <button
          onClick={() => { setStatus("All"); setRoleFilter("All"); setQuery(""); }}
          className="text-xs text-secondary font-medium hover:underline px-2 cursor-pointer"
        >
          Clear all
        </button>
      )}
    </div>
 <div className="flex items-center gap-3 text-xs text-muted-foreground">
 <span>Showing {filteredRows.length} of {rows.length}</span>
 <div className="flex items-center gap-1">
 <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-card disabled:opacity-40">
 <ChevronLeft className="h-4 w-4" />
 </button>
 <button onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount} className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-card disabled:opacity-40">
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 </div>
 </div>

 <div className="rounded-xl bg-card border border-border overflow-hidden">
 <table className="w-full table-fixed">
 <thead>
 <tr className={`border-b border-border ${monoLabel}`}>
 <th className="w-[29%] text-left py-2.5 pl-4 font-mono">Name / Avatar</th>
 <th className="w-[12%] text-left py-2.5 font-mono">Role</th>
 <th className="w-[12%] text-left py-2.5 font-mono">Verify</th>
 <th className="w-[13%] text-left py-2.5 font-mono">City</th>
 <th className="w-[10%] text-left py-2.5 font-mono">Joined</th>
 <th className="w-[10%] text-left py-2.5 font-mono">Active</th>
 <th className="w-[8%] text-left py-2.5 font-mono">Status</th>
 <th className="w-[6%] text-right py-2.5 pr-4 font-mono">Act</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 Array.from({ length: 5 }).map((_, i) => (
 <tr key={i} className="border-b border-border">
 {Array.from({ length: 8 }).map((__, j) => (
 <td key={j} className="py-4 pl-6"><div className="h-5 rounded bg-muted animate-pulse" /></td>
 ))}
 </tr>
 ))
 ) : pageRows.map((row) => (
 <tr key={row.id} className={"border-b border-border last:border-0 hover:bg-muted/30 transition-colors " + (row.muted ? "opacity-60" : "")}>
 <td className="py-2.5 pl-4 pr-2">
 <div className="flex min-w-0 items-center gap-2.5">
 <div className={`h-8 w-8 shrink-0 rounded-full ${row.color} text-white flex items-center justify-center text-xs font-semibold`}>
 {row.initials}
 </div>
 <div className="min-w-0">
 <p className={"truncate text-sm font-semibold text-foreground " + (row.muted ? "line-through" : "")}>{row.name}</p>
 <p className="truncate text-[11px] text-muted-foreground">{row.email}</p>
 </div>
 </div>
 </td>
 <td className="py-2.5 pr-2">
 <div className="flex flex-col">
 <span className="truncate text-xs font-semibold text-foreground">{row.role}</span>
 {row.account === "Free Tier" ? (
 <span className="text-[11px] text-muted-foreground">Free Tier</span>
 ) : (
 <span className="inline-flex items-center gap-1 truncate text-[11px] font-medium text-primary">
 <Star className="h-3 w-3 shrink-0 fill-primary" /> {row.account}
 </span>
 )}
 </div>
 </td>
 <td className="py-2.5 pr-2">
 <VerificationPill value={row.verification} />
 </td>
 <td className="py-2.5 pr-2 text-xs font-medium leading-4 text-foreground break-words">{row.city}</td>
 <td className="py-2.5 pr-2 text-xs leading-4 text-foreground break-words">{row.joinDate}</td>
 <td className="py-2.5 pr-2 text-xs leading-4">
 <span className={row.status === "Under Review" ? "text-amber-600 font-medium" : "text-foreground"}>
 {row.lastActive}
 </span>
 </td>
 <td className="py-2.5 pr-2">
 <StatusDot status={row.status} />
 </td>
  <td className="py-2.5 pr-4 text-right">
    <div className="inline-flex items-center justify-end gap-1.5 text-muted-foreground">
      <button 
        onClick={() => handleViewDetails(row)} 
        title="View Details"
        className="hover:text-secondary p-1 hover:bg-muted/80 rounded transition-colors cursor-pointer"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button 
        onClick={() => handleToggleBan(row)} 
        disabled={actionLoading === row.id}
        title={row.status === "Banned" ? "Unban User" : "Ban User"}
        className={`p-1 hover:bg-muted/80 rounded transition-colors cursor-pointer ${row.status === "Banned" ? "text-amber-500 hover:text-amber-600 animate-pulse" : "hover:text-primary"}`}
      >
        <Ban className="h-3.5 w-3.5" />
      </button>
      <button 
        onClick={() => setDeleteConfirmUser(row)}
        disabled={actionLoading === row.id}
        title="Delete User"
        className="hover:text-rose-500 p-1 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  </td>
 </tr>
 ))}
 {!loading && filteredRows.length === 0 && (
 <tr>
 <td colSpan={8} className="py-10 text-center text-muted-foreground text-sm">
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
 className="h-8 rounded-md border border-border bg-card px-2 text-xs"
 >
 <option>10</option>
 <option>25</option>
 <option>50</option>
 </select>
 </div>
 <div className="flex items-center gap-1">
 <button onClick={() => setPage(1)} disabled={page === 1} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40">
 <ChevronsLeft className="h-4 w-4" />
 </button>
 <button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40">
 <ChevronLeft className="h-4 w-4" />
 </button>
 {Array.from({ length: Math.min(pageCount, 5) }, (_, index) => index + 1).map((pageNumber) => (
 <button
 key={pageNumber}
 onClick={() => setPage(pageNumber)}
 className={
 "h-8 w-8 rounded-md text-sm font-medium flex items-center justify-center " +
 (pageNumber === page ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")
 }
 >
 {pageNumber}
 </button>
 ))}
 {pageCount > 5 && <span className="px-2 text-muted-foreground">...</span>}
 <button onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40">
 <ChevronRight className="h-4 w-4" />
 </button>
 <button onClick={() => setPage(pageCount)} disabled={page === pageCount} className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40">
 <ChevronsRight className="h-4 w-4" />
 </button>
 </div>
 </div>
 </div>

  {selectedUser && (
    <UserDetailsModal
      user={selectedUserDetails}
      loading={loadingDetails}
      onClose={() => {
        setSelectedUser(null);
        setSelectedUserDetails(null);
      }}
    />
  )}

  {deleteConfirmUser && (
    <DeleteConfirmModal
      user={deleteConfirmUser}
      loading={actionLoading === deleteConfirmUser.id}
      onClose={() => setDeleteConfirmUser(null)}
      onConfirm={() => handleDeleteUser(deleteConfirmUser.id)}
    />
  )}
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
 <span className={`inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-normal ${map[value]}`}>
 <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" /> <span className="truncate">{value}</span>
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
 <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
 <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} /> <span className="truncate">{status}</span>
 </span>
 );
}

function UserDetailsModal({ user, loading, onClose }: { user: any; loading: boolean; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-tr from-rose-500 to-amber-500 shadow-md">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">User Account Details</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Comprehensive profile info and system settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading || !user ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-sm text-muted-foreground">Loading account details...</p>
            </div>
          ) : (
            <>
              {/* Avatar and Header Card */}
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-xl border border-border bg-muted/20">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-16 w-16 rounded-full object-cover border border-border shadow-sm" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
                    {((user.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2)).toUpperCase()}
                  </div>
                )}
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-bold text-foreground truncate">{user.name}</h3>
                    {user.isVerified && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                        Verified
                      </span>
                    )}
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.status === "Active" || user.status === "active" ? "bg-emerald-500/10 text-emerald-500" :
                      user.status === "Banned" || user.status === "banned" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {user.status || "Active"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                      Role: {user.role ? user.role.toUpperCase() : "USER"}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground px-2 py-0.5 rounded-full bg-muted border border-border flex items-center gap-1">
                      <Star className="h-3 w-3 fill-primary text-primary" /> {user.plan ? user.plan.toUpperCase() : "FREE"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Metrics / Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">City</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{user.city || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Profession</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{user.profession || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Height</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{user.height || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Gender</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{user.gender || "-"}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Age / Birth Date</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {user.age ? `${user.age} yrs` : "-"} {user.birthDate ? `(${new Date(user.birthDate).toISOString().split('T')[0]})` : ""}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">Joined Date</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {user.joined ? new Date(user.joined).toISOString().split('T')[0] : "-"}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Bio / Introduction</span>
                  <div className="p-4 rounded-xl border border-border bg-card text-sm text-foreground italic leading-relaxed">
                    "{user.bio}"
                  </div>
                </div>
              )}

              {/* Interests, Hobbies, Personality */}
              <div className="space-y-4">
                {user.interests && user.interests.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Interests</span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.interests.map((tag: string) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.hobbies && user.hobbies.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Hobbies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.hobbies.map((tag: string) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-500 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.personality && user.personality.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Personality Words</span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.personality.map((tag: string) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Photos */}
              {user.photos && user.photos.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Profile Photos ({user.photos.length})</span>
                  <div className="grid grid-cols-3 gap-3">
                    {user.photos.map((photo: string, index: number) => (
                      <div key={index} className="aspect-square rounded-xl border border-border bg-muted overflow-hidden">
                        <img src={photo} alt={`${user.name} profile ${index}`} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            className="px-5 h-10 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onConfirm, loading }: { user: any; onClose: () => void; onConfirm: () => void; loading: boolean }) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Confirm Account Deletion</h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              Are you sure you want to permanently delete the account of <strong>{user.name}</strong> ({user.email})?
            </p>
            <p className="text-xs text-rose-500 mt-2 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg font-semibold">
              Warning: This action is permanent and cannot be undone. All chats, matches, and images will be permanently erased.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-10 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-10 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Deleting..." : "Permanently Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
