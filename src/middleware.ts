import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Phase 10: Early Request Gate
  // Only protect specific API routes and dashboard pages from unauthenticated access at the edge.
  // Actual role and tenant verification must still happen in the Route Handlers and Server Actions!
  if (pathname.startsWith("/api/transactions") || pathname.startsWith("/dashboard")) {
      const sessionCookie = request.cookies.get("better-auth.session_token") || request.cookies.get("__Secure-better-auth.session_token");
      
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
