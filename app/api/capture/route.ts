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
    const { image, growthStage, plantType } = await req.json();
    if (!image || !growthStage || !plantType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const analysis = await detectDisease(plantType, growthStage, image);
    const overlayUrl = await generateOverlay(image, analysis.diseaseName);
    const suggestedAction = formatDetailedSuggestedAction(analysis);

    const detection = await storage.createDetection({
      imageUrl: image,
      overlayUrl,
      growthStage,
      plantType,
      diseaseName: analysis.diseaseName,
      severity: analysis.severity,
      confidence: analysis.confidence,
      suggestedAction,
    });

    return NextResponse.json(detection, { status: 201 });
  } catch (error) {
    console.error("Capture Error:", error);
    return NextResponse.json({ message: "Analysis failed" }, { status: 500 });
  }
}
