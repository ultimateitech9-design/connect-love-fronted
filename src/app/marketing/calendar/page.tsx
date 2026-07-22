"use client";

import { CalendarDays, CheckCircle2, Clock, Megaphone, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const calendar = [
  { day: "Mon", title: "Verified Profiles Push", channel: "Push", owner: "Marketing", status: "Ready", note: "Highlight verified-only discovery and trust benefits." },
  { day: "Tue", title: "Premium Upgrade Email", channel: "Email", owner: "Growth", status: "Draft", note: "Target free users with Gold/Diamond comparison." },
  { day: "Wed", title: "City Dating Tips Reel", channel: "Social", owner: "Content", status: "Ready", note: "Localised creative for top user cities." },
  { day: "Thu", title: "Referral Reminder", channel: "Push", owner: "Growth", status: "Scheduled", note: "Ask active users to invite friends." },
  { day: "Fri", title: "Weekend Match Boost", channel: "In-app", owner: "Marketing", status: "Scheduled", note: "Promote profile boost before weekend activity spike." },
];

const ideas = [
  "Trust campaign: verified profile badge explainers.",
  "Premium campaign: unlimited likes + who liked you.",
  "Safety campaign: report/block education.",
  "Retention campaign: inactive user comeback offer.",
];

export default function ContentCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Plan marketing messages across push, email, social, and in-app campaigns.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="h-5 w-5 text-rose-500" /> This Week</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {calendar.map((item) => (
              <div key={item.title} className="grid gap-3 rounded-2xl border border-border bg-background p-4 md:grid-cols-[64px_1fr_120px] md:items-center">
                <div className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm font-black text-rose-600">{item.day}</div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.note}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.channel} • {item.owner}</p>
                </div>
                <span className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${item.status === "Ready" ? "bg-emerald-50 text-emerald-700" : item.status === "Scheduled" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                  {item.status === "Ready" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {item.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="border-border/70 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-5 w-5 text-rose-500" /> Campaign Ideas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {ideas.map((idea) => <div key={idea} className="rounded-xl border border-border bg-background p-3 text-sm font-semibold">{idea}</div>)}
            </CardContent>
          </Card>
          <Card className="border-border/70 shadow-sm">
            <CardContent className="pt-6">
              <div className="rounded-2xl bg-rose-50 p-4 text-rose-700 ring-1 ring-rose-100">
                <Send className="mb-3 h-5 w-5" />
                <p className="font-bold">Planning rule</p>
                <p className="mt-1 text-sm">Keep one trust message, one upgrade message, and one retention message live every week.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
