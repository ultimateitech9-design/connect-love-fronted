"use client";

import { usePathname } from "next/navigation";
import { LiveDataSync } from "@/components/LiveDataSync";
import { QueryProvider } from "@/components/QueryProvider";

const dataRoutes = [
  "/user",
  "/admin",
  "/super-admin",
  "/management",
  "/sales",
  "/support",
];

export function RouteQueryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needsQueryClient = dataRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const enableLiveSync = needsQueryClient
    && !pathname.startsWith("/management/")
    && !pathname.startsWith("/user/messages")
    && pathname !== "/super-admin/user-360";
  return <QueryProvider>{enableLiveSync ? <LiveDataSync /> : null}{children}</QueryProvider>;
}
