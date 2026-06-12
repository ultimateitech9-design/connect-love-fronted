"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { api } from "@/lib/api";

type Notification = {
 id: string;
 title: string;
 message: string;
 time: string;
 type: "success" | "error" | "info";
};

const iconMap = {
 success: CheckCircle,
 error: AlertTriangle,
 info: Info,
} as const;

export default function Notifications() {
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.financeNotifications()
 .then((res) => setNotifications(res.notifications))
 .catch(() => setError("Failed to load finance notifications from backend."));
 }, []);

 return (
 <DashboardLayout title="Notifications" subtitle="Live payment alerts from the database.">
 {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
 <div className="space-y-4">
 {notifications.length === 0 ? (
 <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
 <Bell className="mx-auto mb-3 size-6" />
 No finance notifications yet.
 </div>
 ) : notifications.map((n) => {
 const Icon = iconMap[n.type] || Info;
 return (
 <div key={n.id} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
 <div className={`mt-1 size-8 rounded-full grid place-items-center shrink-0 ${
 n.type === "success" ? "bg-success/15 text-success" :
 n.type === "error" ? "bg-destructive/15 text-destructive" :
 "bg-primary/15 text-primary"
 }`}>
 <Icon className="size-4" />
 </div>
 <div className="flex-1">
 <div className="flex justify-between items-start">
 <h4 className="font-medium text-sm">{n.title}</h4>
 <span className="text-xs text-muted-foreground">{new Date(n.time).toLocaleString()}</span>
 </div>
 <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
 </div>
 </div>
 );
 })}
 </div>
 </DashboardLayout>
 );
}
