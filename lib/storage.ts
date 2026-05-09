import "server-only";
import { supabase } from "@/lib/supabase";
import { isNonPlantAnalysisResult } from "@/lib/crop-result";
import {
  type InsertDetection,
  type Detection,
  type DashboardStatistics,
} from "@/types/schema";

export interface IStorage {
  createDetection(detection: InsertDetection): Promise<Detection>;
  getDetections(): Promise<Detection[]>;
  getStatistics(): Promise<DashboardStatistics>;
  getHeatmapData(): Promise<any[]>;
  getTimeline(): Promise<any[]>;
}

export class SupabaseStorage implements IStorage {
  async createDetection(detection: InsertDetection): Promise<Detection> {
    const { data, error } = await supabase
      .from("detections")
      .insert([
        {
          image_url: detection.imageUrl,
          overlay_url: detection.overlayUrl,
          grid_location: detection.growthStage,
          plant_type: detection.plantType,
          disease_name: detection.diseaseName,
          severity: detection.severity,
          confidence: detection.confidence,
          suggested_action: detection.suggestedAction,
        }
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      imageUrl: data.image_url,
      overlayUrl: data.overlay_url,
      growthStage: data.grid_location,
      plantType: data.plant_type,
      diseaseName: data.disease_name,
      severity: data.severity,
      confidence: data.confidence,
      suggestedAction: data.suggested_action,
      createdAt: new Date(data.created_at)
    };
  }

  async getDetections(): Promise<Detection[]> {
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(d => ({
      id: d.id,
      imageUrl: d.image_url,
      overlayUrl: d.overlay_url,
      growthStage: d.grid_location,
      plantType: d.plant_type,
      diseaseName: d.disease_name,
      severity: d.severity,
      confidence: d.confidence,
      suggestedAction: d.suggested_action,
      createdAt: new Date(d.created_at)
    }));
  }

  async getStatistics(): Promise<DashboardStatistics> {
    const allDetections = await this.getDetections();

    const totalScans = allDetections.length;
    const healthyPlants = allDetections.filter((d) => d.diseaseName === "Healthy").length;
    const invalidScans = allDetections.filter((d) => isNonPlantAnalysisResult(d.diseaseName)).length;
    const infectedPlants = allDetections.filter(
      (d) => d.diseaseName !== "Healthy" && !isNonPlantAnalysisResult(d.diseaseName)
    ).length;

    const diseaseCounts: Record<string, number> = {};
    let mostCommonDisease = "None";
    let maxCount = 0;

    for (const d of allDetections) {
      if (d.diseaseName !== "Healthy" && !isNonPlantAnalysisResult(d.diseaseName)) {
        diseaseCounts[d.diseaseName] = (diseaseCounts[d.diseaseName] || 0) + 1;
        if (diseaseCounts[d.diseaseName] > maxCount) {
          maxCount = diseaseCounts[d.diseaseName];
          mostCommonDisease = d.diseaseName;
        }
      }
    }

    const healthDistribution = [
      { name: "Healthy", value: healthyPlants },
      { name: "Infected", value: infectedPlants },
      ...(invalidScans > 0 ? [{ name: "Not a crop image", value: invalidScans }] : []),
    ];

    const diseaseBreakdown = Object.entries(diseaseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const dayTotals: Record<string, number> = {};
    for (const d of allDetections) {
      if (!d.createdAt) continue;
      const day = new Date(d.createdAt).toISOString().split("T")[0];
      dayTotals[day] = (dayTotals[day] || 0) + 1;
    }
    const scansOverTime = Object.entries(dayTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return {
      totalScans,
      healthyPlants,
      infectedPlants,
      mostCommonDisease,
      mostCommonDiseaseCount: maxCount,
      recentDetections: allDetections.slice(0, 5),
      healthDistribution,
      diseaseBreakdown,
      scansOverTime,
    };
  }

  async getHeatmapData(): Promise<any[]> {
    const all = await this.getDetections();
    return this.calculateHeatmapFromDetections(all);
  }

  async getTimeline(): Promise<any[]> {
    const { data, error } = await supabase
      .from("detections")
      .select("*")
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const all = data.map(d => ({
      id: d.id,
      growthStage: d.grid_location,
      diseaseName: d.disease_name,
      createdAt: new Date(d.created_at)
    } as Detection));

    const frames: any[] = [];
    const groupedByDate: Record<string, Detection[]> = {};

    for (const d of all) {
      const dateStr = d.createdAt!.toISOString().split('T')[0];
      if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
      groupedByDate[dateStr].push(d);
    }

    let cumulative: Detection[] = [];
    for (const [date, dayDetections] of Object.entries(groupedByDate)) {
      cumulative = [...cumulative, ...dayDetections];
      frames.push({
        time: date,
        cells: this.calculateHeatmapFromDetections(cumulative).map(c => ({
          grid: c.growthStage,
          risk: c.riskLevel.toLowerCase()
        }))
      });
    }

    return frames;
  }

  private calculateHeatmapFromDetections(records: Detection[]) {
    const cells: Record<string, { infectionCount: number; diseases: string[] }> = {};
    const gridNames = ["A1","A2","A3","B1","B2","B3","C1","C2","C3"];

    for (const g of gridNames) {
      cells[g] = { infectionCount: 0, diseases: [] };
    }

    for (const r of records) {
      if (!cells[r.growthStage]) cells[r.growthStage] = { infectionCount: 0, diseases: [] };
      if (r.diseaseName !== "Healthy" && !isNonPlantAnalysisResult(r.diseaseName)) {
        cells[r.growthStage].infectionCount++;
        cells[r.growthStage].diseases.push(r.diseaseName);
      }
    }

    return Object.entries(cells).map(([growthStage, data]) => {
      let riskLevel = "GREEN";
      if (data.infectionCount >= 4) riskLevel = "RED";
      else if (data.infectionCount >= 2) riskLevel = "YELLOW";

      return {
        growthStage,
        infectionCount: data.infectionCount,
        riskLevel,
        mostCommonDisease: data.diseases.length > 0 ? data.diseases[0] : null
      };
    });
  }
}

export const storage = new SupabaseStorage();
