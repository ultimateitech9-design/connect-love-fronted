const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const BASE = `${API_BASE.replace(/\/$/, "")}/api`;

function getClientToken(): string | null {
 if (typeof window === "undefined") return null;
 const localToken = window.localStorage.getItem("sm_token");
 const cookieToken = document.cookie
 .split("; ")
 .find((row) => row.startsWith("management_client_token="))
 ?.split("=")[1];
 return (cookieToken ? decodeURIComponent(cookieToken) : null) || localToken;
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
 const token = getClientToken();
 const headers = new Headers(init.headers);
 if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
 if (token) headers.set("Authorization", `Bearer ${token}`);
 const res = await fetch(url, { ...init, headers });
 if (!res.ok) throw new Error(`API error ${res.status}`);
 return res.json();
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
 return request<T>(`${BASE}${path}`, init);
}

export async function directFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
 return request<T>(`${API_BASE.replace(/\/$/, "")}${path}`, init);
}

export const api = {
 dashboard: () => apiFetch<{ stats: { label: string; value: string; delta: string }[]; growth?: { m: string; users: number; matches: number }[] }>("/dashboard"),
 users: () => apiFetch<{ users: { id: string; name: string; email: string; mobile?: string; role: string; plan: string; account: string; city: string; joined: string; lastActive: string; isVerified: boolean; status: string }[] }>("/users"),
 verification: () => apiFetch<{ queue: { id: string; name: string; email?: string; idType: string; priority: string; status: string }[] }>("/verification"),
 payments: () => apiFetch<{
 plans: { id?: string; key?: string; name: string; price: string; rawPrice?: number; currency?: string; period?: string; features?: string[]; subscribers?: number; status: string }[];
 transactions?: { id: string; user: string; plan: string; amount: number; status: string; date: string }[];
 }>("/payments"),
 reports: () => apiFetch<{ reports: { type: string; count: number }[] }>("/reports"),
 notifications: () => apiFetch<{ notifications: { id?: string; campaign: string; type: string; audience: string; status: string }[] }>("/notifications"),
 security: () => apiFetch<{ loginActivity: { day: string; success: number; failed: number }[]; blockedAccounts: number }>("/security"),
 settings: () => apiFetch<{ settings: { maintenanceMode: boolean; userRegistrations: boolean; matchingSystem: boolean; premiumMemberships: boolean } }>("/settings"),
 roles: () => apiFetch<{ roles: { role: string; assignedUsers: number; permissions: number; status: string }[] }>("/roles"),
 logs: () => apiFetch<{ logs: { id: string; user: string; activity: string; ipAddress: string; action: string; module?: string; role?: string; device?: string; loginAt?: string; lastActivityAt?: string; logoutAt?: string; durationSeconds?: number | null; createdAt?: string }[] }>("/logs"),
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
 marketingOverview: () => apiFetch<{
 kpis: { label: string; value: string; delta: string }[];
 spendTrend: { day: string; spend: number; users: number }[];
 channelData: { channel: string; value: number }[];
 }>("/marketing/overview"),
 marketingCampaigns: () => apiFetch<{ campaigns: { id: string; name: string; channel: string; status: string; audience: string; spend: number; conversions: number; roi: number }[] }>("/marketing/campaigns"),
 marketingReports: () => apiFetch<{ reports: { title: string; desc: string; meta: string; type: string }[] }>("/marketing/reports"),
 salesOverview: () => apiFetch<{
 kpis: { label: string; value: string; delta: number }[];
 revenueData: { day: string; revenue: number; signups: number }[];
 planSplit: { name: string; value: number }[];
 recentUpgrades: { name: string; plan: string; amt: string; t: string }[];
 }>("/sales/overview"),
 salesTrends: () => apiFetch<{
 kpis: { todaySales: number; weekSales: number; monthSales: number; threeMonthGrowth: number };
 monthly: { m: string; sales: number; growth: number }[];
 weekly: { w: string; sales: number }[];
 }>("/sales/trends"),
 salesPlans: () => apiFetch<{ plans: { id: string; key?: string; name: string; price: number; currency?: string; subscribers: number; status: string; features: string[] }[]; topMarkets: { city: string; value: number }[] }>("/sales/plans"),
 supportOverview: () => directFetch<{
 stats: { totalTickets: number; resolvedToday: number; openTickets: number; escalated: number };
 ticketTrend: { day: string; received: number; resolved: number }[];
 complaintMix: { name: string; value: number }[];
 recent: { id: number; name: string; email: string; phone?: string; photoDataUrl?: string; subject: string; message: string; status: string; createdAt: string }[];
 }>("/support/overview"),
 supportTickets: (status = "all") => directFetch<any[]>(`/support/tickets?status=${encodeURIComponent(status)}`),
 updateTicketStatus: (id: number, status: string) => directFetch(`/support/tickets/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
 financeRefunds: () => apiFetch<{ refunds: { id: string; user: string; plan: string; amount: number; status: string; date: string }[] }>("/finance/refunds"),
 financeNotifications: () => apiFetch<{ notifications: { id: string; title: string; message: string; time: string; type: "success" | "error" | "info" }[] }>("/finance/notifications"),
 refundPayment: (id: string) => apiFetch(`/finance/payments/${id}/refund`, { method: "PATCH" }),
 rejectRefund: (id: string) => apiFetch(`/finance/payments/${id}/reject-refund`, { method: "PATCH" }),
 invoices: () => apiFetch<{ invoices: { id: string; customer: string; email: string; plan: string; amount: number; status: string; due: string; paymentId: string }[] }>("/finance/invoices"),
 createInvoice: (body: unknown) => apiFetch("/finance/invoices", { method: "POST", body: JSON.stringify(body) }),
 createPlan: (body: { displayName: string; price: number; features?: string[]; status?: string }) => apiFetch("/plans", { method: "POST", body: JSON.stringify(body) }),
 updatePlan: (id: string, body: { displayName: string; price: number; features?: string[]; status?: string }) => apiFetch(`/plans/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
 updateSettings: (settings: Record<string, boolean>) => apiFetch<{ settings: Record<string, boolean> }>("/settings", { method: "PATCH", body: JSON.stringify(settings) }),
 createRole: (body: { role: string; permissions?: number; status?: string }) => apiFetch("/roles", { method: "POST", body: JSON.stringify(body) }),
 createUser: (body: { name: string; email: string; password: string; role: string }) => apiFetch<{ user: unknown; message?: string }>("/users", { method: "POST", body: JSON.stringify(body) }),
 createManagementUser: (body: { name: string; email: string; password: string; role: "admin" | "marketing" | "finance" | "sales" | "support" }) => directFetch<{ user: unknown; message: string }>("/admin/management-users", { method: "POST", body: JSON.stringify(body) }),
 banUser: (id: string, banned: boolean) => apiFetch<{ success: boolean }>(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: banned ? "banned" : "active" }) }),
 deleteUser: (id: string) => apiFetch<{ success: boolean }>(`/users/${id}`, { method: "DELETE" }),
 userDetails: (id: string) => apiFetch<{ user: any }>(`/users/${id}`),
 updateVerification: (id: string, status: "approved" | "rejected" | "under_review" | "pending") => apiFetch(`/verification/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
 createNotification: (body: { campaign: string; type: string; audience: string; status?: string }) => apiFetch("/notifications", { method: "POST", body: JSON.stringify(body) }),
 updateNotificationStatus: (id: string, status: string) => apiFetch(`/notifications/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
 deleteNotification: (id: string) => apiFetch(`/notifications/${id}`, { method: "DELETE" }),
};
