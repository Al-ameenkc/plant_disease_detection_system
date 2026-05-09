import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await storage.getTimeline();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Timeline error:", error);
    return NextResponse.json({ message: "Failed to fetch timeline" }, { status: 500 });
  }
}
