"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Send, Trash2 } from "lucide-react";

const initialNotifications = [
 { title: "Valentine's Week Offer", sent: 48200, delivered: 46900, campaign: "Valentine's Week Offer" },
 { title: "Premium 30% off — 24h flash", sent: 22100, delivered: 21540, campaign: "Premium Membership Promotion" },
 { title: "Someone liked your profile 💖", sent: 91500, delivered: 89000, campaign: "Engagement Boost" },
 { title: "Weekend Reels — new matches near you", sent: 31200, delivered: 30100, campaign: "Weekend Boost Reels" },
];

export default function NotificationsPage() {
 const [notifications, setNotifications] = useState(initialNotifications);

 const handleDelete = (titleToDelete: string) => {
 setNotifications(notifications.filter(n => n.title !== titleToDelete));
 };

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
 <p className="text-sm text-muted-foreground">Push & in-app message performance.</p>
 </div>

 <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
 <Card>
 <CardContent className="pt-6 flex items-center gap-4">
 <div className="h-[3.333vw] w-[3.333vw] rounded-xl bg-primary/10 flex items-center justify-center">
 <Send className="h-[1.667vw] w-[1.667vw] text-primary" />
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Notifications Sent</div>
 <div className="text-2xl font-bold">193,000</div>
 </div>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="pt-6 flex items-center gap-4">
 <div className="h-[3.333vw] w-[3.333vw] rounded-xl bg-primary/10 flex items-center justify-center">
 <CheckCircle2 className="h-[1.667vw] w-[1.667vw] text-primary" />
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Delivery Rate</div>
 <div className="text-2xl font-bold">97.4%</div>
 </div>
 </CardContent>
 </Card>
 <Card>
 <CardContent className="pt-6 flex items-center gap-4">
 <div className="h-[3.333vw] w-[3.333vw] rounded-xl bg-primary/10 flex items-center justify-center">
 <Bell className="h-[1.667vw] w-[1.667vw] text-primary" />
 </div>
 <div>
 <div className="text-xs text-muted-foreground">Active Campaign Notifications</div>
 <div className="text-2xl font-bold">{notifications.length}</div>
 </div>
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader><CardTitle className="text-base">Recent Campaign Notifications</CardTitle></CardHeader>
 <CardContent>
 {notifications.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">No notifications remaining.</div>
 ) : (
 <div className="divide-y divide-border">
 {notifications.map((r) => {
 const rate = ((r.delivered / r.sent) * 100).toFixed(1);
 return (
 <div key={r.title} className="flex items-center justify-between py-4 gap-4 group">
 <div className="flex items-center gap-3 min-w-[0vw]">
 <div className="h-[2.778vw] w-[2.778vw] rounded-full bg-accent flex items-center justify-center shrink-0">
 <Bell className="h-[1.111vw] w-[1.111vw] text-accent-foreground" />
 </div>
 <div className="min-w-[0vw]">
 <div className="font-medium truncate">{r.title}</div>
 <div className="text-xs text-muted-foreground truncate">{r.campaign}</div>
 </div>
 </div>
 <div className="flex items-center gap-4 text-sm">
 <div className="text-right hidden sm:block">
 <div className="font-semibold">{r.sent.toLocaleString()}</div>
 <div className="text-xs text-muted-foreground">sent</div>
 </div>
 <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 mr-2">{rate}%</Badge>
 <button 
 onClick={() => handleDelete(r.title)}
 className="text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
 title="Delete Notification"
 >
 <Trash2 className="h-[1.111vw] w-[1.111vw]" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
