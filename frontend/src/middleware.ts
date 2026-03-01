import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  const isDashboard = pathname === "/";
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";

  // Not logged in → force to /login
  if (!token && isDashboard) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    // optionally remember where they came from:
    // url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Already logged in → block /login and /signup
  if (token && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/login", "/auth/signup"],
};