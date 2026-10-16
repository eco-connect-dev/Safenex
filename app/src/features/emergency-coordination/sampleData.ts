import type { ActiveEmergency } from "./types";

export const SAMPLE_EVENT_ID = "sample-kegalle-flood";

export const sampleActiveEmergency: ActiveEmergency = {
    event: {
        id: SAMPLE_EVENT_ID,
        hazardType: "flood",
        district: "Kegalle",
        severity: "high",
        status: "active",
        peopleAffected: 24500,
        startedAt: "2026-11-15T08:30:00+05:30",
        sheltersActive: 6,
        rescueTeamsDeployed: 3,
        reliefItemsAllocated: 1200,
    },
    locations: [
        { id: "l1", name: "Galigamuwa", mapX: 26, mapY: 24, isEpicenter: false },
        { id: "l2", name: "Kegalle", mapX: 34, mapY: 42, isEpicenter: true },
        { id: "l3", name: "Rambukkana", mapX: 10, mapY: 56, isEpicenter: false },
        { id: "l4", name: "Mawanella", mapX: 51, mapY: 57, isEpicenter: false },
        { id: "l5", name: "Ruwanwella", mapX: 13, mapY: 79, isEpicenter: false },
        { id: "l6", name: "Aranayake", mapX: 43, mapY: 82, isEpicenter: false },
    ],
    priorityNeeds: [
        { id: "n1", need: "Shelter capacity required", context: "Immediate evacuation demand", priorityLabel: "340 spaces", focus: "shelters" },
        { id: "n2", need: "Rescue support required", context: "Priority affected locations", priorityLabel: "3 teams", focus: "rescue" },
        { id: "n3", need: "Relief resources", context: "Food, water and medicine", priorityLabel: "High priority", focus: "relief" },
    ],
    updates: [
        { id: "u1", text: "Shelter data refreshed · district occupancy synchronized", status: "Updated", occurredAt: "2026-11-15T14:20:00+05:30" },
        { id: "u2", text: "Flood warning escalated · officer confirmed high severity", status: "High", occurredAt: "2026-11-15T14:12:00+05:30" },
        { id: "u3", text: "Resource inventory checked · stock availability updated", status: "Ready", occurredAt: "2026-11-15T14:05:00+05:30" },
    ],
};
