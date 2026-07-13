import { NextRequest, NextResponse } from "next/server";

const protectedManagementPaths = ["/admin", "/super-admin", "/marketing", "/sales", "/support"];

const managementRoleAccess: Record<string, string[]> = {
  "/admin": ["admin", "super_admin"],
  "/super-admin": ["super_admin"],
  "/marketing": ["marketing", "super_admin"],
  "/sales": ["sales", "super_admin"],
  "/support": ["support", "admin", "super_admin"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/super-admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/management/super-admin";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/user")) {
    const authHint = request.cookies.get("sm_auth")?.value;
    if (!authHint) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("reason", "unauthenticated");
      return NextResponse.redirect(url);
    }
  }

  const matchedPath = protectedManagementPaths.find((path) => pathname === path || pathname.startsWith(`${path}/`));
  if (matchedPath) {
    const token = request.cookies.get("management_token")?.value;
    const role = request.cookies.get("management_role")?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/management";
      return NextResponse.redirect(url);
    }
    const allowedRoles = managementRoleAccess[matchedPath];
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      const url = request.nextUrl.clone();
      url.pathname = "/management";
      url.searchParams.set("reason", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/super-admin/:path*", "/marketing/:path*", "/sales/:path*", "/support/:path*"],
};
