import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Better Auth sessions can be validated here or natively in server components.
  // For standard multi-tenant apps, it is recommended to do tenant extraction and validation in DAL (Data Access Layer) inside server components / actions to ensure secure data fetching.
  // We allow the request to proceed, and authorization will happen securely in `src/lib/tenant.ts`.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
