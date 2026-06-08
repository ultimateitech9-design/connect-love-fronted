"use server";

import { cookies } from "next/headers";

type Role = "admin" | "super-admin" | "marketing" | "finance" | "sales" | "support";

export async function loginManagement(email: string, password: string, role: Role) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const res = await fetch(`${apiBase}/auth/management/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  (await cookies()).set("management_token", token, {
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

  return { success: true };
}

export async function logoutManagement() {
  (await cookies()).delete("management_token");
  (await cookies()).delete("management_client_token");
  return { success: true };
}
