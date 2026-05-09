import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await storage.getDetections();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Detections error:", error);
    return NextResponse.json({ message: "Failed to fetch detections" }, { status: 500 });
  }
}
