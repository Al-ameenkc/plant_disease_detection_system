"use client";

import type { ComponentType } from "react";
import Header from "@/components/Header";
import { useDetections, useStatistics } from "@/hooks/use-detections";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, Bug, Activity } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const HEALTH_COLORS: Record<string, string> = {
  Healthy: "#22c55e",
  Infected: "#ef4444",
  "Not a crop image": "#6b7280",
};

const SEVERITY_COLORS = ["#ef4444", "#f59e0b", "#84cc16", "#6b7280"];

export default function AnalyticsPage() {
  const { data: stats } = useStatistics();
  const { data: detections = [] } = useDetections();

  const total = stats?.totalScans ?? 0;
  const healthy = stats?.healthyPlants ?? 0;
  const infected = stats?.infectedPlants ?? 0;
  const topName = stats?.mostCommonDisease ?? "None";
  const healthData = stats?.healthDistribution ?? [];
  const diseaseData = stats?.diseaseBreakdown ?? [];
  const plantBars = buildPlantBars(detections);

  const farmHealthScore = total > 0 ? Math.round((healthy / total) * 100) : 0;
  const scoreTone =
    farmHealthScore >= 70 ? "Healthy" : farmHealthScore >= 40 ? "Moderate Risk" : "At Risk";
  const scoreColor =
    farmHealthScore >= 70 ? "#22c55e" : farmHealthScore >= 40 ? "#f59e0b" : "#ef4444";

  const scoreRingData = [
    { name: "Score", value: farmHealthScore },
    { name: "Remaining", value: Math.max(0, 100 - farmHealthScore) },
  ];

  const severityBreakdown = [
    { name: "High", value: diseaseData.filter((d) => d.count >= 8).reduce((s, d) => s + d.count, 0) },
    {
      name: "Medium",
      value: diseaseData.filter((d) => d.count >= 3 && d.count < 8).reduce((s, d) => s + d.count, 0),
    },
    { name: "Low", value: diseaseData.filter((d) => d.count > 0 && d.count < 3).reduce((s, d) => s + d.count, 0) },
    { name: "None", value: healthy },
  ];

  return (
    <div className="min-h-full pb-6 sm:pb-8">
      <Header title="Analytics" subtitle="Welcome back to the monitoring dashboard." />

      <div className="space-y-6 px-4 pt-2 sm:px-6 lg:px-8">
        <Card className="border-gray-200">
          <CardContent className="p-4 sm:p-6">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-subtle-green">Farm Health Score</p>
            <p className="mt-1 text-center text-xs font-semibold text-subtle-green">Based on infection rate & severity</p>
            <div className="relative mx-auto mt-4 h-[180px] w-full max-w-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={scoreRingData} dataKey="value" innerRadius={52} outerRadius={72} startAngle={90} endAngle={-270} strokeWidth={0}>
                    <Cell fill={scoreColor} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-extrabold tabular-nums" style={{ color: scoreColor }}>
                  {farmHealthScore}
                </p>
                <p className="text-xs font-semibold text-subtle-green">/ 100</p>
                <p className="mt-2 text-sm font-semibold" style={{ color: scoreColor }}>
                  {scoreTone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MiniStat title="Total Scans" value={total} icon={Scan} iconClass="text-blue-500" iconBg="bg-blue-50" />
          <MiniStat title="Infected Plants" value={infected} icon={Bug} iconClass="text-red-500" iconBg="bg-red-50" />
          <MiniStat title="Common Disease" value={topName} icon={Activity} iconClass="text-amber-500" iconBg="bg-amber-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-gray-200">
            <CardContent className="p-4 sm:p-6">
                <h3 className="text-base font-bold text-green-900">Plant Health Mix</h3>
                <p className="mt-0.5 text-xs text-subtle-green">Distribution of healthy, infected and invalid scans</p>
              <div className="mt-3 h-[240px]">
                {healthData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={healthData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={3}>
                        {healthData.map((entry) => (
                          <Cell key={entry.name} fill={HEALTH_COLORS[entry.name] ?? "#6b7280"} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, "Scans"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="No scan data yet." />
                )}
              </div>
              <div className="mt-2 space-y-2">
                {severityBreakdown.map((row, idx) => (
                    <div key={row.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-subtle-green">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[idx] }} />
                      <span className="font-semibold">{row.name}</span>
                    </div>
                    <span className="font-semibold text-value-green">{row.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base font-bold text-green-900">Scans by Plant Type</h3>
              <p className="mt-0.5 text-xs text-subtle-green">Infected vs healthy count per plant category</p>
              <div className="mt-3 h-[280px]">
                {plantBars.some((row) => row.infected > 0 || row.healthy > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plantBars} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis dataKey="plantType" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="infected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="healthy" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="No disease records yet." />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function buildPlantBars(detections: { plantType: string; diseaseName: string }[]) {
  const plantOrder = ["Other", "Tomato", "Maize", "Cassava", "Rice"];
  const map = new Map<string, { plantType: string; infected: number; healthy: number }>();

  for (const name of plantOrder) {
    map.set(name, { plantType: name, infected: 0, healthy: 0 });
  }

  for (const item of detections) {
    const label = plantOrder.includes(item.plantType) ? item.plantType : "Other";
    const row = map.get(label)!;
    if (item.diseaseName === "Healthy") {
      row.healthy += 1;
    } else {
      row.infected += 1;
    }
  }

  return Array.from(map.values());
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
      <p className="px-4 text-center text-sm text-subtle-green">{label}</p>
    </div>
  );
}

function MiniStat({
  title,
  value,
  icon: Icon,
  iconClass,
  iconBg,
}: {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  iconBg: string;
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <p className="text-sm font-medium text-subtle-green">{title}</p>
          <div className={`rounded-lg p-2 ${iconBg} ${iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-2xl font-bold leading-none text-value-green">{value}</p>
      </CardContent>
    </Card>
  );
}
