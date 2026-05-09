"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useDetections } from "@/hooks/use-detections";
import { Search, ListFilter, Download, Eye } from "lucide-react";
import AnalysisDialog from "@/components/AnalysisDialog";
import type { Detection } from "@/types/schema";

const SEVERITIES = ["All", "None", "Low", "Medium", "High"] as const;
type SeverityFilter = (typeof SEVERITIES)[number];

export default function History() {
  const { data: detections } = useDetections();
  const [selected, setSelected] = useState<Detection | null>(null);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!detections) return [];
    const q = search.trim().toLowerCase();
    return detections.filter((d) => {
      if (severity !== "All" && d.severity !== severity) return false;
      if (
        q &&
        !`${d.diseaseName} ${d.plantType} ${d.growthStage}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [detections, search, severity]);

  const handleExportCsv = () => {
    if (!filtered.length) return;
    const headers = [
      "Timestamp",
      "Crop",
      "Growth Stage",
      "Disease Detected",
      "Severity",
      "Confidence",
      "Suggested Action",
    ];
    const rows = filtered.map((d) => [
      d.createdAt ? format(new Date(d.createdAt), "yyyy-MM-dd HH:mm") : "",
      d.plantType,
      d.growthStage,
      d.diseaseName,
      d.severity,
      `${Math.round((d.confidence || 0) * 100)}%`,
      (d.suggestedAction || "").replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell)}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `detections_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full pb-6 sm:pb-8">
      <Header title="Detection History" subtitle="Welcome back to the monitoring dashboard." />

      <div className="relative px-4 pt-2 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by disease, crop, or growth stage..."
              className="pl-9 rounded-full bg-white"
            />
          </div>
          <div className="relative flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg bg-white"
              onClick={() => setFilterOpen((o) => !o)}
            >
              <ListFilter className="w-4 h-4" />
              Filter
              {severity !== "All" && (
                <span className="ml-1 inline-flex items-center justify-center text-[10px] font-bold bg-primary text-white rounded-full w-4 h-4">
                  1
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg bg-white"
              onClick={handleExportCsv}
              disabled={!filtered.length}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>

            {filterOpen && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg sm:left-auto sm:right-0 sm:w-48"
                onMouseLeave={() => setFilterOpen(false)}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-2 py-1">
                  Severity
                </p>
                {SEVERITIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSeverity(s);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      severity === s
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Card className="border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto overscroll-x-contain -mx-px">
              <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-6">Timestamp</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-6">Crop</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-6">Growth stage</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-6">Disease Detected</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-6">Severity</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium sm:px-6">Confidence</th>
                  <th className="whitespace-nowrap px-3 py-3 text-right font-medium sm:px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-3 py-3.5 text-gray-500 sm:px-6">
                      {d.createdAt ? format(new Date(d.createdAt), "MMM dd, yyyy HH:mm") : "—"}
                    </td>
                    <td className="px-3 py-3.5 font-medium text-gray-800 sm:px-6">{d.plantType}</td>
                    <td className="px-3 py-3.5 sm:px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold">
                        {d.growthStage}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate px-3 py-3.5 font-semibold text-gray-900 sm:max-w-none sm:px-6">{d.diseaseName}</td>
                    <td className="px-3 py-3.5 sm:px-6">
                      <SeverityBadge severity={d.severity} />
                    </td>
                    <td className="px-3 py-3.5 text-gray-700 tabular-nums sm:px-6">
                      {((d.confidence || 0) * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-3.5 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={() => setSelected(d)}
                        className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:text-emerald-700 transition-colors sm:gap-1.5 sm:text-sm"
                      >
                        <Eye className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">View Analysis</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm">
                      No detections match your filters yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-xs text-gray-500">Showing {filtered.length} records</p>
      </div>

      <AnalysisDialog detection={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant =
    severity === "High"
      ? "high"
      : severity === "Medium"
      ? "medium"
      : severity === "Low"
      ? "low"
      : "none";
  return <Badge variant={variant}>{severity}</Badge>;
}
