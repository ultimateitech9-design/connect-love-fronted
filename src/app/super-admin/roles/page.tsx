'use client';

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
 KeyRound, Users, Shield, UserCog, Inbox, Plus,
 Check, X, ShieldCheck,
 DollarSign, BarChart3, Bell, Lock, Settings, ScrollText, LayoutDashboard, AlertCircle
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";

type RoleStatus = "All" | "Active" | "Inactive";

type RoleKey = "superAdmin" | "admin" | "sales" | "support" | "moderator" | "finance";

interface AccessPermission {
 label: string;
 icon: React.ElementType;
 superAdmin: boolean;
 admin: boolean;
 sales: boolean;
 support: boolean;
 moderator: boolean;
 finance: boolean;
}

const accessMatrix: AccessPermission[] = [
 { label: "Dashboard", icon: LayoutDashboard, superAdmin: true, admin: true, sales: true, support: true, moderator: true, finance: true },
 { label: "User Management", icon: Users, superAdmin: true, admin: true, sales: false, support: true, moderator: true, finance: false },
 { label: "Verification", icon: ShieldCheck, superAdmin: true, admin: true, sales: false, support: true, moderator: true, finance: false },
 { label: "Payments", icon: DollarSign, superAdmin: true, admin: true, sales: true, support: false, moderator: false, finance: true },
 { label: "Reports", icon: BarChart3, superAdmin: true, admin: true, sales: true, support: false, moderator: true, finance: true },
 { label: "Notifications", icon: Bell, superAdmin: true, admin: true, sales: true, support: true, moderator: false, finance: false },
 { label: "Security", icon: Lock, superAdmin: true, admin: true, sales: false, support: false, moderator: false, finance: false },
 { label: "Settings", icon: Settings, superAdmin: true, admin: true, sales: false, support: false, moderator: false, finance: false },
 { label: "Roles & Permissions", icon: KeyRound, superAdmin: true, admin: false, sales: false, support: false, moderator: false, finance: false },
 { label: "System Logs", icon: ScrollText, superAdmin: true, admin: true, sales: false, support: false, moderator: false, finance: false },
];

const roleColumns: { key: RoleKey; label: string; color: string }[] = [
 { key: "superAdmin", label: "Super Admin", color: "text-rose-600" },
 { key: "admin", label: "Admin", color: "text-violet-600" },
 { key: "sales", label: "Sales", color: "text-blue-600" },
 { key: "support", label: "Support", color: "text-emerald-600" },
 { key: "moderator", label: "Moderator", color: "text-amber-600" },
 { key: "finance", label: "Finance", color: "text-indigo-600" },
];

const MODULE_LIST = ["Dashboard", "User Management", "Verification", "Payments", "Reports", "Notifications", "Security", "Settings", "System Logs"];

function CreateRoleModal({ onClose, onSave }: { onClose: () => void; onSave: (role: (string | number)[]) => Promise<void> }) {
 const [roleName, setRoleName] = useState("");
 const [description, setDescription] = useState("");
 const [accessLevel, setAccessLevel] = useState("Restricted");
 const [selectedModules, setSelectedModules] = useState<string[]>(["Dashboard"]);

 const toggleModule = (mod: string) =>
 setSelectedModules((prev) => prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!roleName.trim()) return;
 await onSave([roleName.trim(), 0, selectedModules.length * 2, "Active", new Date().toISOString().slice(0, 10)]);
 onClose();
 };

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-4"
 style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
 onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
 >
 <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto">
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-5 border-b border-border">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
 <KeyRound className="h-4.5 w-4.5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-bold text-foreground">Create New Role</h2>
 <p className="text-xs text-muted-foreground mt-0.5">Define access level and module permissions</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
 >
 <X className="h-4 w-4" />
 </button>
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
 {/* Role Name */}
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Role Name *</label>
 <input
 value={roleName}
 onChange={(e) => setRoleName(e.target.value)}
 placeholder="e.g. Content Reviewer"
 required
 className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-all"
 />
 </div>

 {/* Description */}
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Description</label>
 <textarea
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Briefly describe what this role can do..."
 rows={2}
 className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-all resize-none"
 />
 </div>

 {/* Access Level */}
 <div>
 <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Access Level</label>
 <div className="grid grid-cols-3 gap-2">
 {["Restricted", "Standard", "Elevated"].map((level) => (
 <button
 key={level}
 type="button"
 onClick={() => setAccessLevel(level)}
 className={`h-10 rounded-lg border text-xs font-semibold transition-all ${
 accessLevel === level
 ? "border-primary bg-primary/10 text-primary"
 : "border-border bg-card text-muted-foreground hover:bg-muted"
 }`}
 >
 {level}
 </button>
 ))}
 </div>
 </div>

 {/* Module Permissions */}
 <div>
 <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
 Module Access
 <span className="ml-2 text-muted-foreground font-normal normal-case tracking-normal">({selectedModules.length} selected)</span>
 </label>
 <div className="grid grid-cols-2 gap-2">
 {MODULE_LIST.map((mod) => {
 const active = selectedModules.includes(mod);
 return (
 <button
 key={mod}
 type="button"
 onClick={() => toggleModule(mod)}
 className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
 active
 ? "border-primary bg-primary/5 text-primary"
 : "border-border bg-card text-muted-foreground hover:bg-muted"
 }`}
 >
 <span className={`h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors ${active ? "bg-primary" : "bg-muted border border-border"}`}>
 {active && <Check className="h-2.5 w-2.5 text-white" />}
 </span>
 {mod}
 </button>
 );
 })}
 </div>
 </div>

 {/* Footer Actions */}
 <div className="flex items-center gap-3 pt-1">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 h-10 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={!roleName.trim()}
 className="flex-1 h-10 rounded-lg text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
 style={{ background: "var(--gradient-brand)" }}
 >
 <Plus className="h-4 w-4" />
 Create Role
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}

export default function RolesPage() {
 const [status, setStatus] = useState<RoleStatus>("All");
 const [pendingList, setPendingList] = useState<any[]>([]);
 const [allRows, setAllRows] = useState<(string | number)[][]>([]);
 const [loadingRoles, setLoadingRoles] = useState(true);
 const [rolesError, setRolesError] = useState("");
 const [createRoleOpen, setCreateRoleOpen] = useState(false);

 const fetchRoles = async () => {
 setLoadingRoles(true);
 setRolesError("");
 try {
 const res = await api.roles();
 setAllRows(res.roles.map((r) => [r.role, r.assignedUsers, r.permissions, r.status, "—"]));
 } catch {
 setRolesError("Failed to load roles from backend. Is the backend server running?");
 } finally {
 setLoadingRoles(false);
 }
 };

 useEffect(() => { fetchRoles(); }, []);
 const [permissions, setPermissions] = useState<Record<string, Record<RoleKey, boolean>>>(() => {
 const init: Record<string, Record<RoleKey, boolean>> = {};
 accessMatrix.forEach((perm) => {
 init[perm.label] = {
 superAdmin: perm.superAdmin,
 admin: perm.admin,
 sales: perm.sales,
 support: perm.support,
 moderator: perm.moderator,
 finance: perm.finance,
 };
 });
 return init;
 });

 const rows = status === "All" ? allRows : allRows.filter((r) => r[3] === status);

 const handleApprove = (id: number) => {
 setPendingList((prev) => prev.filter((r) => r.id !== id));
 };

 const handleReject = (id: number) => {
 setPendingList((prev) => prev.filter((r) => r.id !== id));
 };

 const togglePermission = (label: string, role: RoleKey) => {
 if (role === "superAdmin") return; // Super admin always has all
 setPermissions((prev) => ({
 ...prev,
 [label]: { ...prev[label], [role]: !prev[label][role] },
 }));
 };

 return (
 <div>
 {createRoleOpen && (
 <CreateRoleModal
 onClose={() => setCreateRoleOpen(false)}
 onSave={async (newRole) => {
 const created: any = await api.createRole({ role: String(newRole[0]), permissions: Number(newRole[2]), status: "Active" });
 setAllRows((prev) => [...prev, [created.role, 0, created.permissions, created.status, new Date().toISOString().slice(0, 10)]]);
 }}
 />
 )}
 <PageHeader title="Roles & Permissions" description="Manage team access levels.">
 <div className="flex items-center gap-2">

 <button
 className="h-10 px-4 rounded-lg text-primary-foreground font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
 style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" }}
 onClick={() => setCreateRoleOpen(true)}
 >
 <Plus className="h-4 w-4" /> Create Role
 </button>
 </div>
 </PageHeader>

 {rolesError && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
 <AlertCircle className="h-4 w-4 shrink-0" /> {rolesError}
 </div>
 )}

 {/* Stat Cards — without Perm Changes */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <StatCard label="Total Roles" value={String(allRows.length)} icon={KeyRound} tone="pink" />
 <StatCard label="Active Roles" value={String(allRows.filter((row) => row[3] === "Active").length)} icon={Shield} tone="blue" />
 <StatCard label="Assigned Users" value={String(allRows.reduce((sum, row) => sum + Number(row[1] || 0), 0))} icon={UserCog} tone="violet" />
 <StatCard label="Pending Requests" value={String(pendingList.length)} icon={Users} tone="amber" />
 </div>

 {/* Roles Table with filter */}
 <div className="flex flex-wrap gap-2 mb-4 items-center">
 <span className="text-xs font-semibold text-muted-foreground self-center mr-1">Status:</span>
 {(["All", "Active", "Inactive"] as const).map((s) => (
 <button
 key={s}
 onClick={() => setStatus(s)}
 className={
 "px-3 py-1.5 rounded-full text-xs font-medium border transition-all " +
 (status === s
 ? "bg-primary text-primary-foreground border-primary shadow-sm"
 : "bg-card text-foreground border-border hover:bg-accent")
 }
 >
 {s}
 </button>
 ))}
 </div>

 <DataTable
 columns={["Role", "Assigned Users", "Permissions", "Status", "Last Updated"]}
 rows={rows}
 />

 {/* Access Control Matrix */}
 <div className="mt-8 mb-6">
 <div className="flex items-center gap-2 mb-4">
 <ShieldCheck className="h-5 w-5 text-primary" />
 <h2 className="text-lg font-semibold text-foreground">Access Control Matrix</h2>
 <span className="text-xs text-muted-foreground ml-2">Toggle module access for each role</span>
 </div>
 <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-muted/60">
 <tr>
 <th className="text-left font-semibold text-foreground px-4 py-3 min-w-[150px]">Module</th>
 {roleColumns.map((rc) => (
 <th key={rc.key} className="text-center font-semibold px-6 py-3 whitespace-nowrap text-black">
 {rc.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {accessMatrix.map((perm) => {
 const IconComp = perm.icon;
 return (
 <tr key={perm.label} className="border-t border-border hover:bg-muted/20 transition-colors">
 <td className="px-4 py-3">
 <div className="flex items-center gap-2 text-foreground font-medium">
 <IconComp className="h-4 w-4 text-muted-foreground" />
 {perm.label}
 </div>
 </td>
 {roleColumns.map((rc) => {
 const has = permissions[perm.label]?.[rc.key] ?? false;
 const isSuper = rc.key === "superAdmin";
 const allowed = has || isSuper;
 return (
 <td key={rc.key} className="px-4 py-3 text-center">
 <button
 onClick={() => togglePermission(perm.label, rc.key)}
 disabled={isSuper}
 title={isSuper ? "Super Admin always has full access" : (allowed ? "Click to restrict" : "Click to allow")}
 className={`inline-flex items-center text-xs font-semibold transition-colors duration-200 ${
 allowed
 ? "text-emerald-600 hover:text-emerald-800"
 : "text-rose-500 hover:text-rose-700"
 } ${isSuper ? "cursor-not-allowed" : "cursor-pointer"}`}
 >
 {allowed ? "Allowed" : "Restricted"}
 </button>
 </td>
 );
 })}
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* Pending Access Requests */}
 <div className="mt-6">
 <div className="flex items-center gap-2 mb-4">
 <Inbox className="h-5 w-5 text-primary" />
 <h2 className="text-lg font-semibold text-foreground">Pending Access Requests</h2>
 {pendingList.length > 0 && (
 <span className="ml-2 h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
 {pendingList.length}
 </span>
 )}
 </div>
 {pendingList.length === 0 ? (
 <div className="rounded-2xl bg-card border border-border p-8 text-center text-muted-foreground text-sm">
 No pending access requests.
 </div>
 ) : (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {pendingList.map((req) => (
 <div key={req.id} className="rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
 <div className="flex items-start gap-3 mb-3">
 <div className={`h-10 w-10 rounded-full ${req.color} text-white flex items-center justify-center text-sm font-semibold shrink-0`}>
 {req.initials}
 </div>
 <div className="min-w-[0px]">
 <p className="font-semibold text-foreground text-sm">{req.user}</p>
 <p className="text-xs text-muted-foreground">{req.role}</p>
 <p className="text-[10px] text-muted-foreground mt-0.5">{req.time}</p>
 </div>
 </div>
 <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5 mb-4">
 <p className="text-xs text-foreground leading-relaxed">{req.request}</p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => handleApprove(req.id)}
 className="flex-1 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
 >
 <Check className="h-3.5 w-3.5" /> Approve
 </button>
 <button
 onClick={() => handleReject(req.id)}
 className="flex-1 h-8 rounded-lg bg-muted hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
 >
 <X className="h-3.5 w-3.5" /> Reject
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
