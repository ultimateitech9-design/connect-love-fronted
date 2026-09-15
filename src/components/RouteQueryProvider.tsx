"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LiveDataSync } from "@/components/LiveDataSync";

const QueryProvider = dynamic(
  () => import("@/components/QueryProvider").then((module) => module.QueryProvider),
  { ssr: false },
);

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
    && !pathname.startsWith("/user/messages");
  return enableLiveSync ? <QueryProvider><LiveDataSync />{children}</QueryProvider> : <>{children}</>;
}
