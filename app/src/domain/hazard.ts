export type HazardType = "flood" | "fire" | "landslide" | "storm" | "other";

export type HazardSeverity = "low" | "moderate" | "high" | "critical";

export type Hazard = {
  id: string;
  type: HazardType;
  severity: HazardSeverity;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
};
