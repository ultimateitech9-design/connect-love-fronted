"use server";

import { cookies, headers } from "next/headers";

type Role = "admin" | "super-admin" | "marketing" | "finance" | "sales" | "support";

export async function loginManagement(email: string, password: string, role: Role) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
  const requestHeaders = await headers();

  const res = await fetch(`${apiBase}/auth/management/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-User-Agent": requestHeaders.get("user-agent") || "Unknown device",
      "X-Forwarded-For": requestHeaders.get("x-forwarded-for") || "Unknown",
    },
    body: JSON.stringify({ email, password, role }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: body.message || "Invalid email or password." };
  }
  const token = body.access_token as string | undefined;
  if (!token) {
    return { success: false, error: "Backend did not return a management token." };
  }
  const userRole = body.user?.role as string | undefined;
  if (!userRole) {
    return { success: false, error: "Backend did not return a management role." };
  }

  (await cookies()).set("management_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  (await cookies()).set("management_role", userRole, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  (await cookies()).set("management_client_token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  (await cookies()).set("management_client_role", userRole, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return { success: true };
}

export async function logoutManagement() {
  const cookieStore = await cookies();
  const token = cookieStore.get("management_token")?.value;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
  if (token) {
    await fetch(`${apiBase}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }
  cookieStore.delete("management_token");
  cookieStore.delete("management_role");
  cookieStore.delete("management_client_token");
  cookieStore.delete("management_client_role");
  return { success: true };
}
