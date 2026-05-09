import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSessionSecret,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const secret = getSessionSecret();
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = Boolean(secret) && (await verifySessionToken(cookie, secret));

  if (pathname === "/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  if (!secret) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "APP_PASSWORD is not configured on the server." },
        { status: 503 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
