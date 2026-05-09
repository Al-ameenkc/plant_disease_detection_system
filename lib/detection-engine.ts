import "server-only";
import OpenAI from "openai";
import { isNonPlantAnalysisResult } from "@/lib/crop-result";

const openai = new OpenAI(); // Automatically uses process.env.OPENAI_API_KEY

export interface DiseaseAnalysisResult {
  diseaseName: string;
  severity: string;
  confidence: number;
  /** False when the image is not usable crop/plant material (e.g. person, object). */
  imageShowsPlant?: boolean;
  treatmentRecommendation: string;
  symptomsObserved: string;
  affectedPlantParts: string;
  spreadRisk: string;
  preventionMonitoring: string;
}

export function formatDetailedSuggestedAction(a: DiseaseAnalysisResult): string {
  const parts = [
    a.treatmentRecommendation &&
      `Treatment recommendation:\n${a.treatmentRecommendation.trim()}`,
    a.symptomsObserved && `Visible symptoms:\n${a.symptomsObserved.trim()}`,
    a.affectedPlantParts && `Affected plant parts:\n${a.affectedPlantParts.trim()}`,
    a.spreadRisk && `Spread risk:\n${a.spreadRisk.trim()}`,
    a.preventionMonitoring &&
      `Prevention & monitoring:\n${a.preventionMonitoring.trim()}`,
  ].filter(Boolean) as string[];
  return parts.join("\n\n");
}

function normalizeParsed(raw: Record<string, unknown>): DiseaseAnalysisResult {
  const str = (v: unknown, fallback = "") => String(v ?? fallback).trim();
  const diseaseNameRaw = str(raw.diseaseName, "Unknown");

  let imageShowsPlant: boolean;
  if (typeof raw.imageShowsPlant === "boolean") {
    imageShowsPlant = raw.imageShowsPlant;
  } else {
    imageShowsPlant = !isNonPlantAnalysisResult(diseaseNameRaw);
  }
  if (isNonPlantAnalysisResult(diseaseNameRaw)) imageShowsPlant = false;

  let c = 0.85;
  if (raw.confidence !== undefined && raw.confidence !== null) {
    const rawC = Number(raw.confidence);
    if (Number.isFinite(rawC)) {
      c = rawC > 1 ? rawC / 100 : rawC;
      c = Math.min(1, Math.max(0, c));
    }
  }

  const MAX_INVALID_CONFIDENCE = 0.35;
  const MAX_ANY_CONFIDENCE = 0.95;

  if (!imageShowsPlant) {
    c = Math.min(c, MAX_INVALID_CONFIDENCE);
  } else {
    c = Math.min(c, MAX_ANY_CONFIDENCE);
  }

  const treatment =
    str(raw.treatmentRecommendation) ||
    str(raw.suggestedAction) ||
    "Review with an agronomist before applying chemicals.";
  return {
    diseaseName: diseaseNameRaw,
    severity: !imageShowsPlant ? "None" : str(raw.severity, "Medium"),
    confidence: c,
    imageShowsPlant,
    treatmentRecommendation: treatment,
    symptomsObserved: str(raw.symptomsObserved),
    affectedPlantParts: str(raw.affectedPlantParts),
    spreadRisk: str(raw.spreadRisk),
    preventionMonitoring: str(raw.preventionMonitoring),
  };
}

export async function detectDisease(
  plantType: string,
  growthStage: string,
  imageBase64: string
): Promise<DiseaseAnalysisResult> {
  try {
    const prompt = `You are an expert agronomist AI helping with crop disease scouting.

Expected crop type (user selection): ${plantType}
Growth stage (user selection): ${growthStage}

=== STEP 1 — IMAGE RELEVANCE (do this first) ===
Decide whether the photo clearly shows living PLANT / CROP tissue that could be assessed for disease (leaves, stems, fruit, grains in the field, etc.).

Set imageShowsPlant to FALSE if the image is mainly or entirely:
- A person, face, selfie, hands without plants, animals, pets
- Vehicles, buildings, roads, sky-only, indoor rooms with no plants
- Objects, food on a plate (unless clearly crop tissue), screens, memes, documents, text
- Too blurry, dark, or distant to see any plant detail
- Anything where you cannot reasonably evaluate plant health

When imageShowsPlant is FALSE:
- diseaseName MUST start with "Not a plant — " followed by a brief honest description (e.g. "Not a plant — human face visible", "Not a plant — indoor scene with no crops").
- severity MUST be "None"
- confidence MUST be a LOW decimal between 0.05 and 0.35 ONLY. Never use high confidence for non-crop images. Never invent a disease.
- In symptomsObserved and other fields, explain briefly why disease analysis does not apply (do NOT fabricate agronomic advice).

=== STEP 2 — ONLY IF imageShowsPlant is TRUE ===
Assess disease or health on visible plant parts. Be calibrated: do not claim high confidence unless symptoms are clear.
- confidence must stay between 0.35 and 0.95 for real assessments; use lower values when uncertain.
- diseaseName is a specific disease name OR "Healthy".
- severity: None for Healthy; otherwise Low, Medium, or High.

Respond ONLY with valid JSON:
{
  "imageShowsPlant": true or false,
  "diseaseName": "string",
  "severity": "None | Low | Medium | High",
  "confidence": 0.0,
  "treatmentRecommendation": "string",
  "symptomsObserved": "string",
  "affectedPlantParts": "string",
  "spreadRisk": "string",
  "preventionMonitoring": "string"
}`;

    const base64Data = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;
    const mimeType = imageBase64.startsWith("data:video")
      ? "image/jpeg"
      : (imageBase64.match(/data:(.*?);/) || [])[1] || "image/jpeg";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No payload from OpenAI");

    const parsed = JSON.parse(content) as Record<string, unknown>;
    return normalizeParsed(parsed);
  } catch (error) {
    const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim());
    console.error("OpenAI detection failed:", error);
    if (hasKey) {
      throw error;
    }
    console.warn("OPENAI_API_KEY not set — returning placeholder analysis for local dev.");
    return {
      diseaseName: "Leaf Spot",
      severity: "Medium",
      confidence: 0.82,
      treatmentRecommendation:
        "Configure OPENAI_API_KEY for live analysis. Placeholder: apply a labeled product per local extension guidance.",
      symptomsObserved:
        "Placeholder — add OPENAI_API_KEY to analyze real images.",
      affectedPlantParts: "—",
      spreadRisk: "—",
      preventionMonitoring: "—",
    };
  }
}

export async function generateOverlay(
  imageSrc: string,
  _diseaseName: string
): Promise<string> {
  return imageSrc;
}
