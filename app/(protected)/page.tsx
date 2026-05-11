"use client";

import { useMemo, type ComponentType } from "react";
import Header from "@/components/Header";
import { useDetections, useStatistics } from "@/hooks/use-detections";
import type { Detection } from "@/types/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, Sprout, Bug, Activity, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const { data: stats } = useStatistics();
  const { data: detections = [] } = useDetections();

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
  const dailyTrend = useMemo(() => {
    const byDay = new Map<string, { healthy: number; infected: number }>();
    for (const detection of detections) {
      if (!detection.createdAt) continue;
      const key = new Date(detection.createdAt).toISOString().slice(0, 10);
      const row = byDay.get(key) ?? { healthy: 0, infected: 0 };
      if (detection.diseaseName === "Healthy") {
        row.healthy += 1;
      } else {
        row.infected += 1;
      }
      byDay.set(key, row);
    }
    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([date, values]) => ({
        date,
        healthy: values.healthy,
        infected: values.infected,
      }));
  }, [detections]);

  return (
    <div className="min-h-full pb-6 sm:pb-8">
      <Header title="Farm Overview" subtitle="Welcome back to the monitoring dashboard." />

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
                <div className="mb-5 flex items-start gap-3">
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Daily Detection Trend</h2>
                    <p className="mt-0.5 text-sm text-gray-500">Infected vs healthy detections per day</p>
                  </div>
                </div>
                <div className="h-[240px] w-full min-w-0 sm:h-[280px]">
                  {dailyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyTrend} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickFormatter={(d) =>
                            new Date(`${String(d)}T12:00:00`).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip
                          labelFormatter={(d) =>
                            new Date(`${String(d)}T12:00:00`).toLocaleDateString()
                          }
                          contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb" }}
                        />
                        <Legend
                          iconType="circle"
                          formatter={(value) => (
                            <span className="text-xs font-medium text-gray-600">{value}</span>
                          )}
                        />
                        <Line
                          type="monotone"
                          dataKey="infected"
                          name="Infected"
                          stroke="#ef4444"
                          strokeWidth={2.5}
                          dot={{ r: 3.5, fill: "#ef4444" }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="healthy"
                          name="Healthy"
                          stroke="#22c55e"
                          strokeWidth={2.5}
                          dot={{ r: 3.5, fill: "#22c55e" }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart label="No trend data yet. Run analyses to build your daily chart." />
                  )}
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
        <h3 className="text-2xl font-bold text-value-green leading-tight tabular-nums sm:text-3xl">{value}</h3>
        {footnote && <p className="mt-2 text-xs text-subtle-green leading-snug">{footnote}</p>}
      </CardContent>
    </Card>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-full min-h-[200px] flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
      <p className="text-sm text-subtle-green px-4 text-center">{label}</p>
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
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{d.diseaseName}</p>
        <p className="text-xs text-subtle-green">
          {d.plantType} • {d.growthStage} • {Math.round((d.confidence || 0) * 100)}% confidence
        </p>
      </div>
      <span className="text-xs text-subtle-green shrink-0">{time}</span>
    </div>
  );
}
