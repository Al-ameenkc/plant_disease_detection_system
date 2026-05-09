export interface Detection {
  id: number;
  imageUrl: string;
  overlayUrl?: string | null;
  /** Growth stage at capture (persisted in DB column `grid_location`). */
  growthStage: string;
  plantType: string;
  diseaseName: string;
  severity: string;
  confidence: number;
  suggestedAction?: string | null;
  createdAt?: Date;
}

export type InsertDetection = Omit<Detection, "id" | "createdAt">;

export interface DashboardStatistics {
  totalScans: number;
  healthyPlants: number;
  infectedPlants: number;
  mostCommonDisease: string;
  /** Detections recorded for mostCommonDisease (0 if none). */
  mostCommonDiseaseCount: number;
  recentDetections: Detection[];
  /** Pie chart: Healthy vs Infected counts */
  healthDistribution: { name: string; value: number }[];
  /** Bar chart: infected detections grouped by disease name */
  diseaseBreakdown: { name: string; count: number }[];
  /** Line chart: total scans per calendar day (ISO date) */
  scansOverTime: { date: string; count: number }[];
}
