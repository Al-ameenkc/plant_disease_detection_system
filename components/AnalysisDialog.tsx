"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Eye, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Detection } from "@/types/schema";
import { parseAnalysisSections } from "@/lib/analysis-sections";

interface AnalysisDialogProps {
  detection: Detection | null;
  onClose: () => void;
}

export default function AnalysisDialog({ detection, onClose }: AnalysisDialogProps) {
  useEffect(() => {
    if (!detection) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [detection, onClose]);

  if (!detection) return null;

  const sev = detection.severity || "None";
  const sevVariant =
    sev === "High" ? "high" : sev === "Medium" ? "medium" : sev === "Low" ? "low" : "none";

  const time = detection.createdAt
    ? format(new Date(detection.createdAt), "h:mm a")
    : "—";

  const sections = parseAnalysisSections(detection.suggestedAction);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95dvh] w-full max-w-5xl overflow-y-auto rounded-t-2xl border border-gray-200 bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-8 sm:py-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold text-gray-900 sm:text-2xl">
                Analysis: {detection.diseaseName}
              </h2>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Original capture with AI overlay and structured agronomic notes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="font-semibold">
                  {detection.plantType}
                </Badge>
                <Badge variant="outline" className="font-semibold">
                  {detection.growthStage}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="w-full shrink-0 gap-1.5 rounded-lg sm:w-auto">
            <ArrowLeft className="w-4 h-4" />
            Return
          </Button>
        </div>

        <div className="bg-gray-50/50 px-4 py-4 sm:px-8 sm:py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ImagePanel
              label="Original Capture"
              tag="RAW INPUT"
              tagVariant="outline"
              src={detection.imageUrl}
              alt="Original"
              labelColor="text-gray-700"
            />
            <ImagePanel
              label="AI Overlay Visualization"
              tag="DETECTION ACTIVE"
              tagVariant="success"
              src={detection.overlayUrl || detection.imageUrl}
              alt="AI Overlay"
              labelColor="text-emerald-700"
              ringed
            />
          </div>
        </div>

        {sections.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-4 sm:px-8 sm:py-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
              Detailed detection notes
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {sections.map((section, idx) => (
                <div
                  key={`${idx}-${section.heading}`}
                  className="rounded-xl border border-gray-100 bg-gray-50/90 p-4 text-sm"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">
                    {section.heading}
                  </p>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <StatBlock label="Growth stage">
              <span className="text-lg font-bold tabular-nums text-gray-900 sm:text-xl">{detection.growthStage}</span>
            </StatBlock>
            <StatBlock label="Severity">
              <Badge variant={sevVariant} className="text-xs px-2 py-1 sm:text-sm sm:px-3">
                {sev}
              </Badge>
            </StatBlock>
            <StatBlock label="Confidence">
              <span className="text-lg font-bold tabular-nums text-gray-900 sm:text-xl">
                {((detection.confidence || 0) * 100).toFixed(1)}%
              </span>
            </StatBlock>
            <StatBlock label="Captured At">
              <span className="text-lg font-bold tabular-nums text-gray-900 sm:text-xl">{time}</span>
            </StatBlock>
          </div>
          <Button variant="outline" onClick={onClose} className="w-full gap-1.5 rounded-lg sm:w-auto">
            <ArrowLeft className="w-4 h-4" />
            Return to History
          </Button>
        </div>
      </div>
    </div>
  );
}

function ImagePanel({
  label,
  tag,
  tagVariant,
  src,
  alt,
  labelColor,
  ringed,
}: {
  label: string;
  tag: string;
  tagVariant: "outline" | "success";
  src: string;
  alt: string;
  labelColor: string;
  ringed?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-xs font-bold uppercase tracking-widest ${labelColor}`}>{label}</h3>
        <Badge variant={tagVariant} className="font-bold tracking-wider">
          {tag}
        </Badge>
      </div>
      <div
        className={`rounded-xl overflow-hidden border ${
          ringed ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-200"
        } bg-white`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full aspect-video object-cover" />
      </div>
    </div>
  );
}

function StatBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 sm:min-w-[110px] sm:flex-none sm:px-4 sm:py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <div>{children}</div>
    </div>
  );
}
