"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function Notifications() {
 const notifications = [
 {
 id: 1,
 title: "New Subscription",
 message: "Aanya Sharma subscribed to the Flame plan.",
 time: "2 mins ago",
 type: "success",
 icon: CheckCircle,
 },
 {
 id: 2,
 title: "Payment Failed",
 message: "Arjun Kapoor's payment for Annual Flame failed.",
 time: "1 hour ago",
 type: "error",
 icon: AlertTriangle,
 },
 {
 id: 3,
 title: "System Update",
 message: "ConnectLove Finance system will be under maintenance tonight at 2:00 AM.",
 time: "3 hours ago",
 type: "info",
 icon: Info,
 },
 ];

 return (
 <DashboardLayout title="Notifications" subtitle="View all your recent system alerts and updates.">
 <div className="space-y-4">
 {notifications.map((n) => {
 const Icon = n.icon;
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
 <span className="text-xs text-muted-foreground">{n.time}</span>
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
