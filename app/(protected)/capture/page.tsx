"use client";

import { useCallback, useRef, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCaptureDetection } from "@/hooks/use-detections";
import { parseAnalysisSections } from "@/lib/analysis-sections";
import { isNonPlantAnalysisResult } from "@/lib/crop-result";
import {
  UploadCloud,
  Leaf,
  Info,
  ChevronDown,
  Upload as UploadIcon,
  CheckCircle2,
  Sprout,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";

const PLANT_OPTIONS = [
  { value: "Tomato", emoji: "🍅" },
  { value: "Rice", emoji: "🌾" },
  { value: "Maize", emoji: "🌽" },
  { value: "Cassava", emoji: "🌿" },
];

const GROWTH_STAGE_OPTIONS = ["Seedling", "Vegetative", "Flowering", "Maturity"];

export default function Capture() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [plantType, setPlantType] = useState("Tomato");
  const [growthStage, setGrowthStage] = useState("Vegetative");
  /** Data URL of the chosen image — preview and analysis source */
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const captureMutation = useCaptureDetection();

  const canAnalyse = !captureMutation.isPending && Boolean(previewSrc);

  const handleAnalyze = useCallback(() => {
    if (!previewSrc) return;
    captureMutation.mutate({ image: previewSrc, plantType, growthStage });
  }, [previewSrc, plantType, growthStage, captureMutation]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (e.target) e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreviewSrc(dataUrl);
      captureMutation.mutate({
        image: dataUrl,
        plantType,
        growthStage,
      });
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const clearPreview = () => {
    setPreviewSrc(null);
  };

  const resultSections =
    captureMutation.data?.suggestedAction != null
      ? parseAnalysisSections(captureMutation.data.suggestedAction)
      : [];

  const latestInvalid =
    captureMutation.data && isNonPlantAnalysisResult(captureMutation.data.diseaseName);

  return (
    <div className="min-h-full pb-6 sm:pb-8">
      <Header title="Analyze Plant" subtitle="Welcome back to the monitoring dashboard." />

      <div className="grid grid-cols-1 gap-6 px-4 pt-2 sm:px-6 lg:grid-cols-5 lg:gap-6 lg:px-8">
        <div className="space-y-4 sm:space-y-5 lg:col-span-3">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video shadow-sm border border-gray-200">
            {previewSrc ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center rounded-md bg-black/55 text-white text-xs font-semibold px-2.5 py-1 backdrop-blur-sm">
                    Uploaded image
                  </span>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-3 bg-gray-800 px-6 py-8 text-center transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <ImageIcon className="h-12 w-12 text-gray-500" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-white">No image selected</p>
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                    Upload a photo of crop tissue for disease analysis.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white">
                  <UploadCloud className="h-4 w-4" />
                  Choose image
                </span>
              </button>
            )}
            <CornerBrackets />
          </div>

          <div className="flex justify-center gap-2 flex-wrap sm:gap-3">
            <Button
              size="lg"
              className="rounded-full px-5 gap-2 shadow-md sm:px-7"
              onClick={() => fileInputRef.current?.click()}
              disabled={captureMutation.isPending}
            >
              <UploadCloud className="w-4 h-4" /> {previewSrc ? "Replace image" : "Upload image"}
            </Button>
            {previewSrc && (
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-5 gap-2 shadow-sm bg-white sm:px-7"
                type="button"
                onClick={clearPreview}
                disabled={captureMutation.isPending}
              >
                Clear
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>

        <div className="min-w-0 lg:col-span-2">
          <Card className="border-gray-200">
            <CardContent className="p-4 space-y-5 sm:p-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Detection Parameters</h3>
                <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p>
                    Analysis uses your crop species and growth stage for context. Pick values that match the plant in
                    the image. Non-crop photos (e.g. people) are flagged as invalid—not analyzed as disease.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-gray-800">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    Crop species <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-9 py-2.5 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={plantType}
                      onChange={(e) => setPlantType(e.target.value)}
                    >
                      {PLANT_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.emoji} {p.value}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-gray-800">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    Growth stage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-9 py-2.5 bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      value={growthStage}
                      onChange={(e) => setGrowthStage(e.target.value)}
                    >
                      {GROWTH_STAGE_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Describes plant age or reproductive phase—not field position.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full rounded-lg gap-2 shadow-sm"
                onClick={handleAnalyze}
                disabled={!canAnalyse}
              >
                <UploadIcon className="w-4 h-4" />
                {captureMutation.isPending ? "Analysing..." : `Analyse ${plantType}`}
              </Button>

              {captureMutation.data && (
                <div className="space-y-4 pt-1">
                  <div
                    className={`p-4 rounded-xl border ${
                      latestInvalid
                        ? "bg-amber-50 border-amber-200"
                        : "bg-emerald-50 border-emerald-200"
                    }`}
                  >
                    <h4
                      className={`font-semibold text-sm flex items-center gap-1.5 mb-2 ${
                        latestInvalid ? "text-amber-950" : "text-emerald-900"
                      }`}
                    >
                      {latestInvalid ? (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      )}
                      Analysis summary
                    </h4>
                    <p className="text-lg font-bold text-gray-900">{captureMutation.data.diseaseName}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {captureMutation.data.plantType}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-semibold">
                        {captureMutation.data.growthStage}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-semibold tabular-nums">
                        {Math.round((captureMutation.data.confidence || 0) * 100)}% confidence
                      </Badge>
                      <SeverityBadge severity={captureMutation.data.severity} />
                    </div>
                    {latestInvalid && (
                      <p className="text-xs text-amber-900/90 mt-2 leading-snug">
                        Confidence is kept low when the image does not show crop tissue—this is not a disease
                        diagnosis.
                      </p>
                    )}
                  </div>

                  {resultSections.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Detailed findings
                      </p>
                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {resultSections.map((section, idx) => (
                          <div
                            key={`${idx}-${section.heading}`}
                            className="rounded-lg border border-gray-100 bg-gray-50/90 p-3 text-sm"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-1">
                              {section.heading}
                            </p>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{section.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const s = severity || "None";
  const cls =
    s === "High"
      ? "bg-red-100 text-red-800 border-red-200"
      : s === "Medium"
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : s === "Low"
      ? "bg-orange-100 text-orange-900 border-orange-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      Severity: {s}
    </span>
  );
}

function CornerBrackets() {
  const corner = "absolute w-6 h-6 sm:w-8 sm:h-8 border-white/70";
  return (
    <div className="absolute inset-3 pointer-events-none sm:inset-6">
      <span className={`${corner} top-0 left-0 border-l-2 border-t-2 rounded-tl-md`} />
      <span className={`${corner} top-0 right-0 border-r-2 border-t-2 rounded-tr-md`} />
      <span className={`${corner} bottom-0 left-0 border-l-2 border-b-2 rounded-bl-md`} />
      <span className={`${corner} bottom-0 right-0 border-r-2 border-b-2 rounded-br-md`} />
    </div>
  );
}
