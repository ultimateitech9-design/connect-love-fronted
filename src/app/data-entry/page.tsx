"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Database, FileCheck2, Inbox, Loader2, LogOut, RefreshCw, Search, UsersRound } from "lucide-react";
import { logoutManagement } from "@/app/actions/managementAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  status: string;
  joined: string;
  isVerified: boolean;
};

type VerificationRow = {
  id: string;
  name: string;
  email?: string;
  idType: string;
  status: string;
  priority: string;
  date?: string;
};

type TicketRow = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  status: string;
  createdAt: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("active") || normalized.includes("approved") || normalized.includes("resolved")) return "bg-emerald-50 text-emerald-700";
  if (normalized.includes("pending") || normalized.includes("open")) return "bg-amber-50 text-amber-700";
  if (normalized.includes("banned") || normalized.includes("rejected")) return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function DataEntryDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [verification, setVerification] = useState<VerificationRow[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [userData, verificationData, ticketData] = await Promise.all([
        api.users(),
        api.verification(),
        api.supportTickets("all"),
      ]);
      setUsers(userData.users || []);
      setVerification(verificationData.queue || []);
      setTickets(ticketData || []);
    } catch (err) {
      console.error(err);
      setError("Data Entry dashboard data load nahi hua. Backend/session check karein.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const normalizedQuery = query.toLowerCase().trim();
  const filteredUsers = useMemo(() => users.filter((user) => {
    if (!normalizedQuery) return true;
    return [user.name, user.email, user.city, user.status, user.role].some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
  }).slice(0, 8), [normalizedQuery, users]);

  const filteredVerification = useMemo(() => verification.filter((row) => {
    if (!normalizedQuery) return true;
    return [row.name, row.email, row.idType, row.status, row.priority].some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
  }).slice(0, 8), [normalizedQuery, verification]);

  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    if (!normalizedQuery) return true;
    return [ticket.name, ticket.email, ticket.phone, ticket.subject, ticket.status].some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
  }).slice(0, 8), [normalizedQuery, tickets]);

  const kpis = [
    { label: "User Records", value: users.length, icon: UsersRound },
    { label: "Verification Queue", value: verification.length, icon: FileCheck2 },
    { label: "Support Entries", value: tickets.length, icon: Inbox },
    { label: "Verified Users", value: users.filter((user) => user.isVerified).length, icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
            <Database className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight">Data Entry Dashboard</h1>
            <p className="text-xs text-slate-500">Review records, verification queue, and support submissions.</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading} className="h-10 rounded-xl">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button
            onClick={async () => {
              await logoutManagement();
              router.push("/management");
            }}
            className="h-10 rounded-xl bg-slate-950 text-white hover:bg-slate-800"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Entry Workspace</h2>
            <p className="mt-1 text-sm text-slate-500">Search across users, KYC rows, and support records from one screen.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records..." className="h-11 rounded-xl border-slate-200 bg-white pl-9" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">Live</span>
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">{item.label}</div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <RecordPanel title="Recent User Records" empty="No users found.">
            {filteredUsers.map((user) => (
              <RecordRow key={user.id} title={user.name || "Unnamed user"} meta={`${user.email} • ${user.city || "No city"}`} date={formatDate(user.joined)} status={user.status} />
            ))}
          </RecordPanel>

          <RecordPanel title="Verification Queue" empty="No verification rows found.">
            {filteredVerification.map((row) => (
              <RecordRow key={row.id} title={row.name || "Unknown"} meta={`${row.email || "No email"} • ${row.idType}`} date={formatDate(row.date)} status={row.status || row.priority} />
            ))}
          </RecordPanel>

          <RecordPanel title="Support Data Entries" empty="No support entries found.">
            {filteredTickets.map((ticket) => (
              <RecordRow key={ticket.id} title={ticket.subject || ticket.name} meta={`${ticket.name} • ${ticket.email}`} date={formatDate(ticket.createdAt)} status={ticket.status} />
            ))}
          </RecordPanel>
        </section>
      </main>
    </div>
  );
}

function RecordPanel({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {hasChildren ? children : <div className="px-4 py-8 text-center text-sm text-slate-500">{empty}</div>}
      </div>
    </div>
  );
}

function RecordRow({ title, meta, date, status }: { title: string; meta: string; date: string; status: string }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{meta}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold capitalize ${statusClass(status)}`}>{status || "new"}</span>
      </div>
      <p className="mt-2 text-[11px] font-medium text-slate-400">{date}</p>
    </div>
  );
}
