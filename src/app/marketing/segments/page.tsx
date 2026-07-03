"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Crown, MapPin, Target, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

type UserRow = { id: string; name: string; email: string; plan: string; city: string; isVerified: boolean; status: string };

export default function SegmentsPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.users().then((res) => setUsers(res.users as UserRow[])).catch(() => setError("Failed to load user segments."));
  }, []);

  const segments = useMemo(() => {
    const premium = users.filter((user) => user.plan !== "free");
    const verified = users.filter((user) => user.isVerified);
    const active = users.filter((user) => String(user.status).toLowerCase().includes("active"));
    const free = users.filter((user) => user.plan === "free");
    const cityCounts = users.reduce<Record<string, number>>((acc, user) => {
      const city = user.city || "Unknown";
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: "Free users ready for upgrade", size: free.length, icon: Target, note: "Send premium value offer and limited-time discount." },
      { name: "Premium members", size: premium.length, icon: Crown, note: "Promote retention, referrals, and elite plan upgrades." },
      { name: "Verified profiles", size: verified.length, icon: BadgeCheck, note: "Use for trust/safety messaging and verified-only campaigns." },
      { name: "Active users", size: active.length, icon: Users, note: "Best audience for push campaigns and event announcements." },
      ...Object.entries(cityCounts).slice(0, 4).map(([city, size]) => ({ name: `${city} audience`, size, icon: MapPin, note: "Useful for city-specific dating events and local offers." })),
    ];
  }, [users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audience Segments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Build campaign audiences from users, plan status, verification, and location.</p>
      </div>
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {segments.map((segment) => (
          <Card key={segment.name} className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{segment.name}</CardTitle>
              <div className="rounded-xl bg-rose-50 p-2 text-rose-500"><segment.icon className="h-5 w-5" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{segment.size}</div>
              <p className="mt-2 text-sm text-muted-foreground">{segment.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
