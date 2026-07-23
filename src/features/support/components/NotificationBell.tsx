"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/support/components/ui/dropdown-menu";

export function NotificationBell() {
  const [tickets, setTickets] = useState<Array<{
    id: number;
    subject?: string;
    name?: string;
    status?: string;
    createdAt?: string;
  }>>([]);

  useEffect(() => {
    api.supportTickets()
      .then((rows) => setTickets((rows || []).slice(0, 5)))
      .catch(() => setTickets([]));
  }, []);

  const actionable = useMemo(
    () => tickets.filter((ticket) => !["resolved", "closed"].includes(String(ticket.status).toLowerCase())),
    [tickets],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-accent cursor-pointer outline-none">
          <Bell className="h-4 w-4" />
          {actionable.length > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actionable.length === 0 ? (
          <DropdownMenuItem disabled>No open tickets.</DropdownMenuItem>
        ) : actionable.map((ticket, index) => (
          <div key={ticket.id}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/support/tickets">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{ticket.subject || "Support ticket"}</span>
                  <span className="text-xs text-muted-foreground">
                    {ticket.name || "User"} · {String(ticket.status || "open").replace(/\b\w/g, (value) => value.toUpperCase())}
                  </span>
                </div>
              </Link>
            </DropdownMenuItem>
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer text-center text-xs text-primary justify-center">
          <Link href="/support/tickets">View live ticket queue</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
