import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import {
  detectDisease,
  formatDetailedSuggestedAction,
  generateOverlay,
} from "@/lib/detection-engine";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const growthStage = formData.get("growthStage");
    const plantType = formData.get("plantType");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }
    if (!growthStage || !plantType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const b64 = buffer.toString("base64");
    const mime = file.type || "image/jpeg";
    const imageUrl = `data:${mime};base64,${b64}`;

    const analysis = await detectDisease(String(plantType), String(growthStage), imageUrl);
    const suggestedAction = formatDetailedSuggestedAction(analysis);
    const { diseaseName, severity, confidence } = analysis;
    const overlayUrl = await generateOverlay(imageUrl, diseaseName);

    const detection = await storage.createDetection({
      imageUrl,
      overlayUrl,
      growthStage: String(growthStage),
      plantType: String(plantType),
      diseaseName,
      severity,
      confidence,
      suggestedAction,
    });

    return NextResponse.json(detection, { status: 201 });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
