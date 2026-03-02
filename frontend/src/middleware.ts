import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// frontend/src/middleware.ts
export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;
  const isDashboard = pathname === "/";
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";

  // TEMP: don't hard-block when cookie missing; let client-side token work
  if (!token && isDashboard) {
    return NextResponse.next(); // allow; client will fetch and redirect if truly not authed
  }

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