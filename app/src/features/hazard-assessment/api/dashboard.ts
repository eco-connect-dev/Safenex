import { supabase } from "@/lib/supabase";
import { getAnalyticsData, type AnalyticsData, type EmergencyEventRow } from "./analytics";

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
  activeEvents: EmergencyEventRow[];
  eventPeopleAffected: number;
  shelterCount: number;
  shelterOccupancy: number;
  shelterCapacity: number;
  rescueTeamCount: number;
  availableRescueTeams: number;
  rescueDispatchCount: number;
  reliefResourceCount: number;
  reliefAllocationCount: number;
  allocatedReliefQuantity: number;
  priorityNeedCount: number;
  operationalUpdateCount: number;
  mappedLocationCount: number;
  recentWarnings: AnalyticsData["warnings"];
  recentUpdates: AnalyticsData["updates"];
  recentAllocations: AnalyticsData["allocations"];
  recentDispatches: AnalyticsData["rescueDispatches"];
  shelters: AnalyticsData["shelters"];
  rescueTeams: AnalyticsData["rescueTeams"];
  reliefResources: AnalyticsData["resources"];
  priorityNeeds: AnalyticsData["priorityNeeds"];
  epicenters: AnalyticsData["locations"];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [analytics, hazardsResult, pendingResult] = await Promise.all([
    getAnalyticsData("30 days"),
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
  ]);

  if (hazardsResult.error) throw hazardsResult.error;
  if (pendingResult.error) throw pendingResult.error;

  const activeHazards = (hazardsResult.data ?? []) as DashboardHazard[];
  const activeEvents = analytics.events.filter((event) => event.status === "active" || event.status === "monitoring");
  const activeEventIds = new Set(activeEvents.map((event) => event.id));
  const liveShelters = analytics.shelters.filter((shelter) => !shelter.event_id || activeEventIds.has(shelter.event_id));

  return {
    activeHazards,
    pendingReports: pendingResult.count ?? 0,
    issuedWarnings: analytics.warnings.length,
    exposedPeople: activeHazards.reduce((total, hazard) => total + Number(hazard.affected_people || 0), 0),
    priorityHazards: activeHazards.filter((hazard) => hazard.severity === "high" || hazard.severity === "critical").length,
    activeEvents,
    eventPeopleAffected: activeEvents.reduce((total, event) => total + Number(event.people_affected || 0), 0),
    shelterCount: liveShelters.length,
    shelterOccupancy: liveShelters.reduce((total, shelter) => total + Number(shelter.current_occupancy || 0), 0),
    shelterCapacity: liveShelters.reduce((total, shelter) => total + Number(shelter.capacity || 0), 0),
    rescueTeamCount: analytics.rescueTeams.length,
    availableRescueTeams: analytics.rescueTeams.filter((team) => team.status.toLowerCase() === "available").length,
    rescueDispatchCount: analytics.rescueDispatches.length,
    reliefResourceCount: analytics.resources.length,
    reliefAllocationCount: analytics.allocations.length,
    allocatedReliefQuantity: analytics.allocations.reduce((total, allocation) => total + Number(allocation.quantity || 0), 0),
    priorityNeedCount: analytics.priorityNeeds.length,
    operationalUpdateCount: analytics.updates.length,
    mappedLocationCount: analytics.locations.length,
    recentWarnings: analytics.warnings.slice(0, 5),
    recentUpdates: analytics.updates.slice(0, 5),
    recentAllocations: analytics.allocations.slice(0, 5),
    recentDispatches: analytics.rescueDispatches.slice(0, 5),
    shelters: analytics.shelters.slice(0, 5),
    rescueTeams: analytics.rescueTeams.slice(0, 5),
    reliefResources: analytics.resources.slice(0, 5),
    priorityNeeds: analytics.priorityNeeds.slice(0, 5),
    epicenters: analytics.locations.filter((location) => location.is_epicenter).slice(0, 5),
  };
}
