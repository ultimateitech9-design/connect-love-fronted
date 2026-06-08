import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const protectedManagementPaths = [
  "/admin",
  "/super-admin",
  "/marketing",
  "/finance",
  "/sales",
  "/support",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. User Dashboard Auth Protection
  if (pathname.startsWith("/user")) {
    const authHint = request.cookies.get("sm_auth")?.value;

    if (!authHint) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("reason", "unauthenticated");
      return NextResponse.redirect(url);
    }
  }

  // 2. Management Auth Protection
  const isProtectedManagementPath = protectedManagementPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtectedManagementPath) {
    const token = request.cookies.get("management_token")?.value;

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/management";
      return NextResponse.redirect(url);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "soulmatch_super_secret_key_change_in_production");
      const { payload } = await jose.jwtVerify(token, secret);

      const requestedPath = protectedManagementPaths.find(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      )?.replace("/", "");
      const requestedRole = requestedPath === "super-admin" ? "super_admin" : requestedPath;
      const tokenRole = String(payload.role || "");

      if (tokenRole !== requestedRole && tokenRole !== "super_admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/management";
        return NextResponse.redirect(url);
      }
      
      return NextResponse.next();
    } catch (error) {
      const url = request.nextUrl.clone();
      url.pathname = "/management";
      const response = NextResponse.redirect(url);
      response.cookies.delete("management_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/:path*", 
    "/admin/:path*", 
    "/super-admin/:path*", 
    "/marketing/:path*", 
    "/finance/:path*", 
    "/sales/:path*", 
    "/support/:path*"
  ],
};
