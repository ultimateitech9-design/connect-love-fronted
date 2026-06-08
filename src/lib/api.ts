const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const BASE = `${API_BASE.replace(/\/$/, "")}/api`;

export async function apiFetch<T>(path: string): Promise<T> {
 const res = await fetch(`${BASE}${path}`);
 if (!res.ok) throw new Error(`API error ${res.status}`);
 return res.json();
}

export const api = {
 dashboard: () => apiFetch<{ stats: { label: string; value: string; delta: string }[]; growth?: { m: string; users: number; matches: number }[] }>("/dashboard"),
 users: () => apiFetch<{ users: { id: number; name: string; email: string; account: string; status: string }[] }>("/users"),
 verification: () => apiFetch<{ queue: { id: number; name: string; idType: string; priority: string; status: string }[] }>("/verification"),
 payments: () => apiFetch<{
 plans: { id?: string; key?: string; name: string; price: string; rawPrice?: number; period?: string; features?: string[]; subscribers?: number; status: string }[];
 transactions?: { id: string; user: string; plan: string; amount: number; status: string; date: string }[];
 }>("/payments"),
 reports: () => apiFetch<{ reports: { type: string; count: number }[] }>("/reports"),
 notifications: () => apiFetch<{ notifications: { campaign: string; type: string; audience: string; status: string }[] }>("/notifications"),
 security: () => apiFetch<{ loginActivity: { day: string; success: number; failed: number }[] }>("/security"),
 settings: () => apiFetch<{ settings: { maintenanceMode: boolean; userRegistrations: boolean; matchingSystem: boolean; premiumMemberships: boolean } }>("/settings"),
 roles: () => apiFetch<{ roles: { role: string; assignedUsers: number; permissions: number; status: string }[] }>("/roles"),
 logs: () => apiFetch<{ logs: { user: string; activity: string; ipAddress: string; action: string; module?: string; createdAt?: string }[] }>("/logs"),
 superAdmin: () => apiFetch<{
 superAdmin: {
 profile: {
 id: string; name: string; email: string; phone: string; role: string; status: string;
 initials: string; joinedAt: string; lastLogin: string; lastActive: string;
 twoFactorEnabled: boolean; ipWhitelist: string[]; timezone: string; sessionTimeout: string;
 };
 accessLevel: { level: string; totalPermissions: number; modulesAccessible: number; description: string };
 modules: { name: string; icon: string; route: string; access: boolean; actions: { label: string; allowed: boolean }[] }[];
 activityLog: { action: string; time: string; module: string }[];
 };
 }>("/super-admin"),
};
