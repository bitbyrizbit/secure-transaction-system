import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Phase 10: Early Request Gate — edge-level authentication check.
// This is a first line of defense only. Route Handlers and Server Actions
// must independently re-verify session and role — defense in depth.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/transactions") || pathname.startsWith("/dashboard")) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
