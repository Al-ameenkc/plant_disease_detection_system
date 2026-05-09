import { useQuery, useMutation } from "@tanstack/react-query";
import { type Detection, type DashboardStatistics } from "@/types/schema";
import { apiRequest, queryClient } from "@/lib/query-client";

export function useDetections() {
  return useQuery<Detection[]>({
    queryKey: ["/api/detections"],
    queryFn: async () => {
      const res = await fetch("/api/detections");
      if (!res.ok) throw new Error("Failed to fetch detections");
      return res.json();
    },
  });
}

export function useStatistics() {
  return useQuery<DashboardStatistics>({
    queryKey: ["/api/statistics"],
    queryFn: async () => {
      const res = await fetch("/api/statistics");
      if (!res.ok) throw new Error("Failed to fetch statistics");
      return res.json();
    },
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: ["/api/heatmap"],
    queryFn: async () => {
      const res = await fetch("/api/heatmap");
      if (!res.ok) throw new Error("Failed to fetch heatmap");
      return res.json();
    },
  });
}

export interface TimelineFrame {
  time: string;
  cells: { grid: string; risk: "red" | "yellow" | "green" }[];
}

export function useTimeline() {
  return useQuery<TimelineFrame[]>({
    queryKey: ["/api/timeline"],
    queryFn: async () => {
      const res = await fetch("/api/timeline");
      if (!res.ok) throw new Error("Failed to fetch timeline");
      return res.json();
    },
  });
}

export function useCaptureDetection() {
  return useMutation({
    mutationFn: async (data: { image: string; growthStage: string; plantType: string }) => {
      const res = await apiRequest("POST", "/api/capture", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/detections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/heatmap"] });
    },
  });
}
