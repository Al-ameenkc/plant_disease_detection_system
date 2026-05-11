import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getSessionSecret,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-token";

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

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
    return noStore(NextResponse.next());
  }
  if (pathname === "/welcome") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return noStore(NextResponse.next());
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
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/welcome", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  return noStore(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
