import { supabase } from "@/lib/supabase";

export type AnalyticsPeriod = "Today" | "7 days" | "30 days";
export type EmergencyEventRow = {
  id: string; hazard_type: string; district: string; severity: string; status: string;
  people_affected: number; started_at: string; shelters_active: number;
  rescue_teams_deployed: number; relief_items_allocated: number;
};
export type EventLocationRow = { id: string; event_id: string; name: string; map_x: number; map_y: number; is_epicenter: boolean };
export type PriorityNeedRow = { id: string; event_id: string; need: string; context: string; priority_label: string; focus: string; sort_order: number };
export type EmergencyUpdateRow = { id: string; event_id: string; update_text: string; status: string; occurred_at: string };
export type EmergencyShelterRow = { id: string; event_id: string | null; name: string; category: string; location: string; current_occupancy: number; capacity: number; status: string; in_affected_area: boolean; updated_at: string };
export type WarningRow = { id: string; hazard_id: string; tier: number; title: string; status: string; target_location: string; affected_people: number; channels: string[]; issued_at: string | null; created_at: string };
export type HazardRow = { id: string; title: string; hazard_type: string; severity: string; location: string; district: string; affected_people: number; review_status: string; status: string; created_at: string };
export type ReliefResourceRow = { id: string; name: string; organisation: string; unit: string; available_quantity: number; updated_at: string };
export type ReliefAllocationRow = { id: string; event_id: string | null; resource_id: string; resource: string; organisation: string; quantity: number; location: string; allocated_at: string };
export type RescueTeamRow = { id: string; organisation: string; status: string; location: string };
export type RescueDispatchRow = { id: string; event_id: string | null; team_id: string; organisation: string; target_location: string; mission_details: string; status: string; dispatched_at: string };

export type AnalyticsData = {
  events: EmergencyEventRow[];
  locations: EventLocationRow[];
  priorityNeeds: PriorityNeedRow[];
  updates: EmergencyUpdateRow[];
  shelters: EmergencyShelterRow[];
  warnings: WarningRow[];
  hazards: HazardRow[];
  resources: ReliefResourceRow[];
  allocations: ReliefAllocationRow[];
  rescueTeams: RescueTeamRow[];
  rescueDispatches: RescueDispatchRow[];
};

function periodStart(period: AnalyticsPeriod) {
  const from = new Date();
  if (period === "Today") from.setHours(0, 0, 0, 0);
  else from.setDate(from.getDate() - (period === "7 days" ? 7 : 30));
  return from.toISOString();
}

export async function getAnalyticsData(period: AnalyticsPeriod): Promise<AnalyticsData> {
  const from = periodStart(period);
  const [eventsResult, sheltersResult, warningsResult, hazardsResult, resourcesResult, allocationsResult, teamsResult, dispatchesResult] = await Promise.all([
    supabase.from("emergency_events").select("*").order("started_at", { ascending: false }),
    supabase.from("emergency_shelters").select("*").order("name"),
    supabase.from("hazard_warnings").select("*").eq("status", "issued").gte("issued_at", from).order("issued_at", { ascending: false }),
    supabase.from("hazards").select("id,title,hazard_type,severity,location,district,affected_people,review_status,status,created_at").gte("created_at", from).order("created_at", { ascending: false }),
    supabase.from("relief_resources").select("*").order("name"),
    supabase.from("relief_allocations").select("*").gte("allocated_at", from).order("allocated_at", { ascending: false }),
    supabase.from("rescue_teams").select("*").order("id"),
    supabase.from("rescue_dispatches").select("*").gte("dispatched_at", from).order("dispatched_at", { ascending: false }),
  ]);

  const failure = eventsResult.error ?? sheltersResult.error ?? warningsResult.error ?? hazardsResult.error ?? resourcesResult.error ?? allocationsResult.error ?? teamsResult.error ?? dispatchesResult.error;
  if (failure) throw failure;

  const events = (eventsResult.data ?? []) as EmergencyEventRow[];
  const eventIds = events.map((event) => event.id);
  let locations: EventLocationRow[] = [];
  let priorityNeeds: PriorityNeedRow[] = [];
  let updates: EmergencyUpdateRow[] = [];

  if (eventIds.length) {
    const [locationsResult, needsResult, updatesResult] = await Promise.all([
      supabase.from("emergency_event_locations").select("*").in("event_id", eventIds),
      supabase.from("emergency_priority_needs").select("*").in("event_id", eventIds).order("sort_order"),
      supabase.from("emergency_updates").select("*").in("event_id", eventIds).gte("occurred_at", from).order("occurred_at", { ascending: false }),
    ]);
    const childFailure = locationsResult.error ?? needsResult.error ?? updatesResult.error;
    if (childFailure) throw childFailure;
    locations = (locationsResult.data ?? []) as EventLocationRow[];
    priorityNeeds = (needsResult.data ?? []) as PriorityNeedRow[];
    updates = (updatesResult.data ?? []) as EmergencyUpdateRow[];
  }

  return {
    events,
    locations,
    priorityNeeds,
    updates,
    shelters: (sheltersResult.data ?? []) as EmergencyShelterRow[],
    warnings: ((warningsResult.data ?? []) as WarningRow[]).filter((warning) => warning.status === "issued" && Boolean(warning.issued_at)),
    hazards: (hazardsResult.data ?? []) as HazardRow[],
    resources: (resourcesResult.data ?? []) as ReliefResourceRow[],
    allocations: (allocationsResult.data ?? []) as ReliefAllocationRow[],
    rescueTeams: (teamsResult.data ?? []) as RescueTeamRow[],
    rescueDispatches: (dispatchesResult.data ?? []) as RescueDispatchRow[],
  };
}
