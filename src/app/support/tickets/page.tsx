"use client";

import { Ticket, Inbox, CheckCircle2, Clock, AlertTriangle, Flame } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "@/lib/api";

type TicketRow = { id: number; user: string; email: string; phone?: string; photoDataUrl?: string; message: string; subject: string; priority: string; status: string; age: string };

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.supportTickets()
      .then((rows) => setTickets(rows.map((ticket: any) => ({
        id: ticket.id,
        user: ticket.name,
        email: ticket.email,
        phone: ticket.phone,
        photoDataUrl: ticket.photoDataUrl,
        message: ticket.message,
        subject: ticket.subject,
        priority: ticket.status === "escalated" ? "High" : ticket.status === "open" ? "Medium" : "Low",
        status: ticket.status.replace(/\b\w/g, (c: string) => c.toUpperCase()),
        age: new Date(ticket.createdAt).toLocaleDateString(),
      }))))
      .catch(() => setError("Failed to load tickets from backend."));
  }, []);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    resolved: tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length,
    pending: tickets.filter((t) => t.status === "Pending" || t.status === "Reviewing").length,
    escalated: tickets.filter((t) => t.status === "Escalated").length,
    high: tickets.filter((t) => t.priority === "High").length,
  }), [tickets]);

  const priorityData = [
    { name: "High", value: tickets.filter((t) => t.priority === "High").length },
    { name: "Medium", value: tickets.filter((t) => t.priority === "Medium").length },
    { name: "Low", value: tickets.filter((t) => t.priority === "Low").length },
  ];

  const updateStatus = async (id: number, status: string) => {
    await api.updateTicketStatus(id, status.toLowerCase());
    setTickets((rows) => rows.map((row) => row.id === id ? { ...row, status: status.replace(/\b\w/g, (c) => c.toUpperCase()) } : row));
  };

  return (
    <div>
      <PageHeader title="Ticket Management" description="All support tickets and their current state." />
      {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Tickets" value={String(stats.total)} icon={Ticket} tone="primary" />
        <StatCard label="Open" value={String(stats.open)} icon={Inbox} tone="info" />
        <StatCard label="Resolved" value={String(stats.resolved)} icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value={String(stats.pending)} icon={Clock} tone="warning" />
        <StatCard label="Escalated" value={String(stats.escalated)} icon={AlertTriangle} tone="destructive" />
        <StatCard label="High Priority" value={String(stats.high)} icon={Flame} tone="destructive" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ticket Priority Split</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {tickets.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No tickets yet.</div> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">ID</th>
                    <th className="py-2 pr-4 font-medium">Subject</th>
                    <th className="py-2 pr-4 font-medium">Contact</th>
                    <th className="py-2 pr-4 font-medium">Priority</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No support tickets found.</td></tr> : tickets.map((q) => (
                    <tr key={q.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">#{q.id}</td>
                      <td className="py-3 pr-4"><div className="font-medium">{q.subject}</div><div className="max-w-xs text-xs text-muted-foreground">{q.message}</div>{q.photoDataUrl && <img src={q.photoDataUrl} alt="Support ticket attachment" className="mt-2 h-20 w-20 rounded-lg object-cover" />}</td>
                      <td className="py-3 pr-4"><div className="font-medium">{q.user}</div><div className="text-xs text-muted-foreground">{q.email}</div><div className="text-xs text-muted-foreground">{q.phone || "No phone"}</div></td>
                      <td className="py-3 pr-4">{q.priority}</td>
                      <td className="py-3 pr-4">{q.status}</td>
                      <td className="py-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{q.age}</span>
                          <button onClick={() => updateStatus(q.id, "resolved")} className="text-[color:var(--success)] hover:underline">Resolve</button>
                          <button onClick={() => updateStatus(q.id, "escalated")} className="text-destructive hover:underline">Escalate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
