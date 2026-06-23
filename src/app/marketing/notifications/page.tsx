"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Send, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

export default function NotificationsPage() {
 const [notifications, setNotifications] = useState<any[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.notifications()
 .then((data) => setNotifications(data.notifications))
 .catch(() => setError("Failed to load campaign notifications from backend."));
 }, []);

 const handleDelete = async (item: any) => {
 if (item.id) {
 try { await api.deleteNotification(item.id); } catch {}
 }
 setNotifications(notifications.filter((n) => n.id !== item.id));
 };

 const active = notifications.filter((n) => String(n.status).toLowerCase() === "active").length;

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
 <p className="text-sm text-muted-foreground">Push and in-app campaign records from the database.</p>
 </div>
 {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

 <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
 <Card><CardContent className="pt-6 flex items-center gap-4"><div className="h-[48px] w-[48px] rounded-xl bg-primary/10 flex items-center justify-center"><Send className="h-[24px] w-[24px] text-primary" /></div><div><div className="text-xs text-muted-foreground">Campaign Records</div><div className="text-2xl font-bold">{notifications.length}</div></div></CardContent></Card>
 <Card><CardContent className="pt-6 flex items-center gap-4"><div className="h-[48px] w-[48px] rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-[24px] w-[24px] text-primary" /></div><div><div className="text-xs text-muted-foreground">Active</div><div className="text-2xl font-bold">{active}</div></div></CardContent></Card>
 <Card><CardContent className="pt-6 flex items-center gap-4"><div className="h-[48px] w-[48px] rounded-xl bg-primary/10 flex items-center justify-center"><Bell className="h-[24px] w-[24px] text-primary" /></div><div><div className="text-xs text-muted-foreground">Inactive / Draft</div><div className="text-2xl font-bold">{notifications.length - active}</div></div></CardContent></Card>
 </div>

 <Card>
 <CardHeader><CardTitle className="text-base">Recent Campaign Notifications</CardTitle></CardHeader>
 <CardContent>
 {notifications.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">No campaign notifications found.</div>
 ) : (
 <div className="divide-y divide-border">
 {notifications.map((r) => (
 <div key={r.id || r.campaign} className="flex items-center justify-between py-4 gap-4 group">
 <div className="flex items-center gap-3 min-w-[0px]">
 <div className="h-[40px] w-[40px] rounded-full bg-accent flex items-center justify-center shrink-0">
 <Bell className="h-[16px] w-[16px] text-accent-foreground" />
 </div>
 <div className="min-w-[0px]">
 <div className="font-medium truncate">{r.campaign}</div>
 <div className="text-xs text-muted-foreground truncate">{r.type} - {r.audience}</div>
 </div>
 </div>
 <div className="flex items-center gap-4 text-sm">
 <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mr-2">{r.status}</Badge>
 <button onClick={() => handleDelete(r)} className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10 opacity-0 group-hover:opacity-100" title="Delete Notification">
 <Trash2 className="h-[16px] w-[16px]" />
 </button>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
