import { sampleActiveEmergency, sampleShelters } from "../sampleData";
import type {
    ActiveEmergency,
    ActiveEmergencyResult,
    EmergencySeverity,
    EmergencyShelter,
    SheltersResult,
} from "../types";
import { coordinatesForPlace } from "../components/operationsMapTypes";

const ALLOW_SAMPLE_FALLBACK = __DEV__;

// In-memory store for dev / fallback mutations
let inMemoryShelters: EmergencyShelter[] = JSON.parse(JSON.stringify(sampleShelters));

export type RescueTeam = { id: string; organisation: string; status: "Available" | "On mission" | "Dispatched"; location: string };
export type RescueDispatch = { teamId: string; targetLocation: string; missionDetails: string; dispatchedAt: string };
const initialRescueTeams: RescueTeam[] = [
    { id: "RT-01", organisation: "Army", status: "Available", location: "Rambukkana" },
    { id: "RT-02", organisation: "Police", status: "Available", location: "Kegalle" },
    { id: "RT-03", organisation: "Fire Service", status: "On mission", location: "Mawanella" },
];
let inMemoryRescueTeams: RescueTeam[] = JSON.parse(JSON.stringify(initialRescueTeams));
let inMemoryRescueDispatches: RescueDispatch[] = [];

export function resetInMemoryRescueTeams(): void {
    inMemoryRescueTeams = JSON.parse(JSON.stringify(initialRescueTeams));
    inMemoryRescueDispatches = [];
}

export function getRescueTeams(): RescueTeam[] {
    return inMemoryRescueTeams.map((team) => ({ ...team }));
}

export function getRescueDispatches(): RescueDispatch[] {
    return inMemoryRescueDispatches.map((dispatch) => ({ ...dispatch }));
}

export function dispatchRescueTeam(input: Omit<RescueDispatch, "dispatchedAt">): RescueDispatch {
    const team = inMemoryRescueTeams.find((item) => item.id === input.teamId);
    if (!team) throw new Error("Select a valid rescue team.");
    if (team.status !== "Available") throw new Error(`${team.id} is not available for dispatch.`);
    if (!input.targetLocation.trim()) throw new Error("Select a target location.");
    if (!input.missionDetails.trim()) throw new Error("Enter mission details before dispatching.");
    const dispatch = { ...input, targetLocation: input.targetLocation.trim(), missionDetails: input.missionDetails.trim(), dispatchedAt: new Date().toISOString() };
    inMemoryRescueTeams = inMemoryRescueTeams.map((item) => item.id === team.id ? { ...item, status: "Dispatched" } : item);
    inMemoryRescueDispatches = [dispatch, ...inMemoryRescueDispatches];
    return dispatch;
}

export type ReliefResource = { id: string; name: string; organisation: string; unit: string; available: number };
export type ReliefAllocation = { id: string; resourceId: string; resource: string; organisation: string; quantity: number; location: string; allocatedAt: string };
const initialReliefResources: ReliefResource[] = [
    { id: "water", name: "Drinking Water", organisation: "DMC", unit: "L", available: 15000 },
    { id: "food-packs", name: "Food Packs", organisation: "WFP", unit: "", available: 4500 },
    { id: "medicine", name: "Medicine Kits", organisation: "Ministry of Health", unit: "", available: 1250 },
    { id: "blankets", name: "Blankets", organisation: "Sri Lanka Red Cross", unit: "", available: 3200 },
];
let inMemoryReliefResources: ReliefResource[] = JSON.parse(JSON.stringify(initialReliefResources));
let inMemoryReliefAllocations: ReliefAllocation[] = [];

export function resetInMemoryReliefResources(): void {
    inMemoryReliefResources = JSON.parse(JSON.stringify(initialReliefResources));
    inMemoryReliefAllocations = [];
}

export function getReliefResources(): ReliefResource[] {
    return inMemoryReliefResources.map((resource) => ({ ...resource }));
}

export function getReliefAllocations(): ReliefAllocation[] {
    return inMemoryReliefAllocations.map((allocation) => ({ ...allocation }));
}

export function allocateReliefResource(input: { resourceId: string; quantity: number; location: string }): ReliefAllocation {
    const resource = inMemoryReliefResources.find((item) => item.id === input.resourceId);
    if (!resource) throw new Error("Select a valid relief resource.");
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) throw new Error("Enter a whole quantity greater than zero.");
    if (input.quantity > resource.available) throw new Error(`Only ${resource.available.toLocaleString()} ${resource.name.toLowerCase()} are available.`);
    if (!input.location.trim()) throw new Error("Select a distribution location.");
    const allocation: ReliefAllocation = {
        id: `relief-${Date.now()}-${inMemoryReliefAllocations.length}`,
        resourceId: resource.id,
        resource: resource.name,
        organisation: resource.organisation,
        quantity: input.quantity,
        location: input.location.trim(),
        allocatedAt: new Date().toISOString(),
    };
    inMemoryReliefResources = inMemoryReliefResources.map((item) => item.id === resource.id ? { ...item, available: item.available - input.quantity } : item);
    inMemoryReliefAllocations = [allocation, ...inMemoryReliefAllocations];
    return allocation;
}

export function resetInMemoryShelters(): void {
    inMemoryShelters = JSON.parse(JSON.stringify(sampleShelters));
}

const sampleResult: ActiveEmergencyResult = {
    data: sampleActiveEmergency,
    source: "sample",
};

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
            locations: (locations.data ?? []).map((l: any) => {
                const fallback = coordinatesForPlace(l.name ?? "Kegalle");
                const latitude = Number(l.latitude);
                const longitude = Number(l.longitude);
                return {
                    id: l.id,
                    name: l.name,
                    mapX: Number(l.map_x),
                    mapY: Number(l.map_y),
                    latitude: Number.isFinite(latitude) && latitude !== 0 ? latitude : fallback.latitude,
                    longitude: Number.isFinite(longitude) && longitude !== 0 ? longitude : fallback.longitude,
                    isEpicenter: Boolean(l.is_epicenter),
                };
            }),
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

export async function fetchEmergencyShelters(
    eventId?: string,
): Promise<SheltersResult> {
    try {
        const emergencyResult = await fetchActiveEmergency(eventId);
        const event = emergencyResult.data?.event ?? null;
        const targetEventId = event?.id ?? eventId;

        const { supabase } = await import("@/lib/supabase");
        let query = supabase.from("emergency_shelters").select("*");
        if (targetEventId) {
            query = query.eq("event_id", targetEventId);
        }
        const { data: rows, error } = await query;

        if (error || !rows || rows.length === 0) {
            if (ALLOW_SAMPLE_FALLBACK) {
                return {
                    shelters: inMemoryShelters,
                    event: event ?? sampleActiveEmergency.event,
                    source: "sample",
                };
            }
            if (error) throw new Error(error.message);
            return { shelters: [], event, source: "supabase" };
        }

        const shelters: EmergencyShelter[] = rows.map((r: any) => ({
            id: r.id,
            eventId: r.event_id,
            name: r.name,
            category: r.category ?? "Registered emergency shelter",
            location: r.location,
            currentOccupancy: Number(r.current_occupancy),
            capacity: Number(r.capacity),
            status: r.status,
            inAffectedArea: r.in_affected_area ?? true,
            contactPerson: r.contact_person,
            contactPhone: r.contact_phone,
        }));

        return {
            shelters,
            event,
            source: "supabase",
        };
    } catch (error) {
        if (ALLOW_SAMPLE_FALLBACK) {
            return {
                shelters: inMemoryShelters,
                event: sampleActiveEmergency.event,
                source: "sample",
            };
        }
        throw error;
    }
}

export async function allocateShelterEvacuees(
    shelterId: string,
    evacueeCount: number,
): Promise<EmergencyShelter> {
    if (evacueeCount <= 0) {
        throw new Error("Evacuee count must be greater than zero.");
    }

    try {
        const { supabase } = await import("@/lib/supabase");
        const { data: current, error: fetchErr } = await supabase
            .from("emergency_shelters")
            .select("*")
            .eq("id", shelterId)
            .single();

        if (fetchErr || !current) {
            throw new Error(fetchErr?.message ?? "Shelter not found.");
        }

        const newOccupancy = Number(current.current_occupancy) + evacueeCount;
        const capacity = Number(current.capacity);
        if (newOccupancy > capacity) {
            throw new Error(`Allocation exceeds capacity (${capacity - Number(current.current_occupancy)} spaces remaining).`);
        }

        const newStatus = newOccupancy >= capacity ? "full" : "available";

        const { data: updated, error: updateErr } = await supabase
            .from("emergency_shelters")
            .update({
                current_occupancy: newOccupancy,
                status: newStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", shelterId)
            .select()
            .single();

        if (updateErr || !updated) {
            throw new Error(updateErr?.message ?? "Failed to update shelter occupancy.");
        }

        return {
            id: updated.id,
            eventId: updated.event_id,
            name: updated.name,
            category: updated.category ?? "Registered emergency shelter",
            location: updated.location,
            currentOccupancy: Number(updated.current_occupancy),
            capacity: Number(updated.capacity),
            status: updated.status,
            inAffectedArea: updated.in_affected_area ?? true,
            contactPerson: updated.contact_person,
            contactPhone: updated.contact_phone,
        };
    } catch (error) {
        if (ALLOW_SAMPLE_FALLBACK) {
            const index = inMemoryShelters.findIndex((s) => s.id === shelterId);
            if (index === -1) {
                throw new Error("Shelter not found in sample data.");
            }
            const shelter = inMemoryShelters[index];
            const newOccupancy = shelter.currentOccupancy + evacueeCount;
            if (newOccupancy > shelter.capacity) {
                throw new Error(`Allocation exceeds capacity (${shelter.capacity - shelter.currentOccupancy} spaces remaining).`);
            }
            const updatedShelter: EmergencyShelter = {
                ...shelter,
                currentOccupancy: newOccupancy,
                status: newOccupancy >= shelter.capacity ? "full" : "available",
            };
            inMemoryShelters[index] = updatedShelter;
            return updatedShelter;
        }
        throw error;
    }
}

