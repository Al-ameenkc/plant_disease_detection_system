import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await storage.getStatistics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Statistics error:", error);
    return NextResponse.json({ message: "Failed to fetch statistics" }, { status: 500 });
  }
}
