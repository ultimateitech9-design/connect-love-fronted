"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const QueryProvider = dynamic(
  () => import("@/components/QueryProvider").then((module) => module.QueryProvider),
  { ssr: false },
);

const dataRoutes = [
  "/user",
  "/admin",
  "/super-admin",
  "/management",
  "/marketing",
  "/sales",
  "/support",
];

export function RouteQueryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needsQueryClient = dataRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return needsQueryClient ? <QueryProvider>{children}</QueryProvider> : <>{children}</>;
}
