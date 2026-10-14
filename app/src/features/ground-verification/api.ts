import reportData from "@/src/api/ground-reports.json";
import type { GroundReport } from "./types";

export const groundReports = reportData as GroundReport[];

export function getGroundReport(id: string) {
  return groundReports.find((report) => report.id === id);
}
