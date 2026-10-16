import { supabase } from "@/lib/supabase";

export type DashboardHazard = {
  id: string;
  title: string;
  severity: "low" | "moderate" | "high" | "critical";
  location: string;
  district: string;
  affected_people: number;
  observed_at: string;
};

export type DashboardSummary = {
  activeHazards: DashboardHazard[];
  pendingReports: number;
  issuedWarnings: number;
  exposedPeople: number;
  priorityHazards: number;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [hazardsResult, pendingResult, warningsResult] = await Promise.all([
    supabase
      .from("hazards")
      .select("id,title,severity,location,district,affected_people,observed_at")
      .eq("status", "active")
      .eq("review_status", "accepted")
      .order("observed_at", { ascending: false }),
    supabase
      .from("hazards")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .eq("review_status", "pending_review"),
    supabase
      .from("hazard_warnings")
      .select("id", { count: "exact", head: true })
      .eq("status", "issued"),
  ]);

  if (hazardsResult.error) throw hazardsResult.error;
  if (pendingResult.error) throw pendingResult.error;
  if (warningsResult.error) throw warningsResult.error;

  const activeHazards = (hazardsResult.data ?? []) as DashboardHazard[];
  return {
    activeHazards,
    pendingReports: pendingResult.count ?? 0,
    issuedWarnings: warningsResult.count ?? 0,
    exposedPeople: activeHazards.reduce((total, hazard) => total + hazard.affected_people, 0),
    priorityHazards: activeHazards.filter((hazard) => hazard.severity === "high" || hazard.severity === "critical").length,
  };
}
