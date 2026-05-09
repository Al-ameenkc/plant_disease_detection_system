import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionSecret,
  SESSION_COOKIE_NAME,
} from "@/lib/auth-token";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const configured = process.env.APP_PASSWORD?.trim();
  if (!configured) {
    return NextResponse.json(
      { message: "Login is not configured. Set APP_PASSWORD in .env.local." },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const password = body.password ?? "";
  if (password !== configured) {
    return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
  }

  const secret = getSessionSecret();
  if (!secret) {
    return NextResponse.json({ message: "AUTH configuration error" }, { status: 503 });
  }

  const token = await createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
