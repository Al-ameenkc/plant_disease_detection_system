"use client";

import { useMemo, type ComponentType } from "react";
import Header from "@/components/Header";
import { useStatistics } from "@/hooks/use-detections";
import type { Detection } from "@/types/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, Sprout, Bug, Activity, BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const HEALTH_MIX_COLORS: Record<string, string> = {
  Healthy: "#10b981",
  Infected: "#ef4444",
  "Not a crop image": "#64748b",
};

export default function Dashboard() {
  const { data: stats } = useStatistics();

  const healthData = stats?.healthDistribution ?? [];
  const diseaseData = stats?.diseaseBreakdown ?? [];
  const trendData = stats?.scansOverTime ?? [];

  const total = stats?.totalScans ?? 0;
  const healthy = stats?.healthyPlants ?? 0;
  const infected = stats?.infectedPlants ?? 0;
  const topName = stats?.mostCommonDisease ?? "None";
  const topCount = stats?.mostCommonDiseaseCount ?? 0;

  const footnotes = useMemo(() => {
    const pct = (part: number) =>
      total > 0 ? `${Math.round((part / total) * 100)}% of all scans` : "No scans recorded yet";
    const common =
      topName !== "None" && topCount > 0
        ? `${topCount} detection${topCount === 1 ? "" : "s"} in your history`
        : "Appears when you have infected (non-healthy) scans";
    return {
      total: total > 0 ? "Totals from your saved analyses" : "Run Analyze to build history",
      healthy: pct(healthy),
      infected: pct(infected),
      common,
    };
  }, [total, healthy, infected, topName, topCount]);

  const recentAlerts = useMemo(() => (stats?.recentDetections ?? []).slice(0, 5), [stats?.recentDetections]);

  return (
    <div className="min-h-full pb-6 sm:pb-8">
      <Header title="Farm Overview" subtitle="Live metrics from your detection history." />

      <div className="px-4 pt-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 mb-6">
          <StatCard
            title="Total Scans"
            value={total}
            icon={Scan}
            iconColor="text-blue-500"
            iconBg="bg-blue-50"
            footnote={footnotes.total}
          />
          <StatCard
            title="Healthy Plants"
            value={healthy}
            icon={Sprout}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-50"
            footnote={footnotes.healthy}
          />
          <StatCard
            title="Infected Plants"
            value={infected}
            icon={Bug}
            iconColor="text-red-500"
            iconBg="bg-red-50"
            footnote={footnotes.infected}
          />
          <StatCard
            title="Most Common Disease"
            value={topName}
            icon={Activity}
            iconColor="text-amber-500"
            iconBg="bg-amber-50"
            footnote={footnotes.common}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card className="border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Charts update from the same Supabase detection records as the summary cards.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Plant health mix</h3>
                    <div className="h-[220px] w-full sm:h-[260px]">
                      {healthData.some((d) => d.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={healthData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={52}
                              outerRadius={88}
                              paddingAngle={2}
                            >
                              {healthData.map((entry) => (
                                <Cell
                                  key={entry.name}
                                  fill={HEALTH_MIX_COLORS[entry.name] ?? "#94a3b8"}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [value, "Scans"]}
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyChart label="No scan data yet." />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Infections by disease
                    </h3>
                    <div className="h-[220px] w-full sm:h-[260px]">
                      {diseaseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={diseaseData}
                            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 11 }}
                              interval={0}
                              angle={-28}
                              textAnchor="end"
                              height={72}
                            />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip
                              formatter={(value: number) => [value, "Detections"]}
                              contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                              }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <EmptyChart label="No infected plant records yet." />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Scans over time</h3>
                  <div className="h-[240px] w-full min-w-0 sm:h-[280px]">
                    {trendData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(d) =>
                              new Date(d + "T12:00:00").toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            }
                          />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip
                            labelFormatter={(d) =>
                              new Date(String(d) + "T12:00:00").toLocaleDateString()
                            }
                            formatter={(value: number) => [value, "Scans"]}
                            contentStyle={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#2563eb" }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart label="No timeline data yet." />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0 xl:max-w-none">
            <Card className="border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Recent alerts</h2>
                <p className="text-xs text-gray-500 mb-4">Latest five detections from history.</p>
                <div className="space-y-3">
                  {recentAlerts.length > 0 ? (
                    recentAlerts.map((d) => <AlertRow key={d.id} d={d} />)
                  ) : (
                    <p className="text-gray-500 text-sm py-4 text-center">No alerts yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  footnote,
}: {
  title: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  footnote?: string;
}) {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 leading-tight tabular-nums sm:text-3xl">{value}</h3>
        {footnote && <p className="mt-2 text-xs text-gray-500 leading-snug">{footnote}</p>}
      </CardContent>
    </Card>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-full min-h-[200px] flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
      <p className="text-sm text-gray-500 px-4 text-center">{label}</p>
    </div>
  );
}

function AlertRow({ d }: { d: Detection }) {
  const sev: string = d.severity || "None";
  const isHealthy = d.diseaseName === "Healthy";
  const palette = isHealthy
    ? { bg: "bg-emerald-100", fg: "text-emerald-600" }
    : sev === "High"
    ? { bg: "bg-red-100", fg: "text-red-600" }
    : sev === "Medium"
    ? { bg: "bg-amber-100", fg: "text-amber-600" }
    : sev === "Low"
    ? { bg: "bg-orange-100", fg: "text-orange-600" }
    : { bg: "bg-gray-100", fg: "text-gray-600" };
  const Icon = isHealthy ? Sprout : Bug;
  const time = d.createdAt
    ? new Date(d.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${palette.bg} ${palette.fg} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{d.diseaseName}</p>
        <p className="text-xs text-gray-500">
          {d.plantType} • {d.growthStage} • {Math.round((d.confidence || 0) * 100)}% confidence
        </p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{time}</span>
    </div>
  );
}
