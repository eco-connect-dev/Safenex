import { sampleActiveEmergency } from "../sampleData";
import type {
    ActiveEmergency,
    ActiveEmergencyResult,
    EmergencySeverity,
} from "../types";

const ALLOW_SAMPLE_FALLBACK = __DEV__;

const sampleResult: ActiveEmergencyResult = {
    data: sampleActiveEmergency,
    source: "sample",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetchActiveEmergency(
    eventId?: string,
): Promise<ActiveEmergencyResult> {
    try {
        const { supabase } = await import("@/lib/supabase");

        const base = supabase.from("emergency_events").select("*");
        const { data: row, error } = eventId
            ? await base.eq("id", eventId).maybeSingle()
            : await base
                .eq("status", "active")
                .order("started_at", { ascending: false })
                .limit(1)
                .maybeSingle();

        if (error) throw new Error(error.message);
        if (!row) {
            return ALLOW_SAMPLE_FALLBACK ? sampleResult : { data: null, source: "supabase" };
        }

        const [locations, needs, updates] = await Promise.all([
            supabase.from("emergency_event_locations").select("*").eq("event_id", row.id),
            supabase.from("emergency_priority_needs").select("*").eq("event_id", row.id).order("sort_order"),
            supabase.from("emergency_updates").select("*").eq("event_id", row.id).order("occurred_at", { ascending: false }).limit(10),
        ]);

        const failed = locations.error ?? needs.error ?? updates.error;
        if (failed) throw new Error(failed.message);

        const data: ActiveEmergency = {
            event: {
                id: row.id,
                hazardType: row.hazard_type,
                district: row.district,
                severity: row.severity as EmergencySeverity,
                status: row.status,
                peopleAffected: Number(row.people_affected),
                startedAt: row.started_at,
                sheltersActive: Number(row.shelters_active),
                rescueTeamsDeployed: Number(row.rescue_teams_deployed),
                reliefItemsAllocated: Number(row.relief_items_allocated),
            },
            locations: (locations.data ?? []).map((l: any) => ({
                id: l.id,
                name: l.name,
                mapX: Number(l.map_x),
                mapY: Number(l.map_y),
                isEpicenter: Boolean(l.is_epicenter),
            })),
            priorityNeeds: (needs.data ?? []).map((n: any) => ({
                id: n.id,
                need: n.need,
                context: n.context,
                priorityLabel: n.priority_label,
                focus: n.focus,
            })),
            updates: (updates.data ?? []).map((u: any) => ({
                id: u.id,
                text: u.update_text,
                status: u.status,
                occurredAt: u.occurred_at,
            })),
        };

        return { data, source: "supabase" };
    } catch (error) {
        if (ALLOW_SAMPLE_FALLBACK) return sampleResult;
        throw error;
    }
}
