"use client";

import { usePathname } from "next/navigation";
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

  return <QueryProvider>{children}</QueryProvider>;
}
