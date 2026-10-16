import type { CoordinationFocus } from "./routes";

export type EmergencySeverity = "low" | "medium" | "high" | "critical";

export type EmergencyEvent = {
    id: string;
    hazardType: string;
    district: string;
    severity: EmergencySeverity;
    status: string;
    peopleAffected: number;
    startedAt: string;
    sheltersActive: number;
    rescueTeamsDeployed: number;
    reliefItemsAllocated: number;
};

export type EmergencyLocation = {
    id: string;
    name: string;
    mapX: number;
    mapY: number;
    latitude: number;
    longitude: number;
    isEpicenter: boolean;
};

export type PriorityNeed = {
    id: string;
    need: string;
    context: string;
    priorityLabel: string;
    focus: CoordinationFocus;
};

export type OperationalUpdate = {
    id: string;
    text: string;
    status: string;
    occurredAt: string;
};

export type ActiveEmergency = {
    event: EmergencyEvent;
    locations: EmergencyLocation[];
    priorityNeeds: PriorityNeed[];
    updates: OperationalUpdate[];
};

export type EmergencyDataSource = "supabase" | "sample";

export type ActiveEmergencyResult = {
    data: ActiveEmergency | null;
    source: EmergencyDataSource;
};

export type ShelterStatus = "available" | "full" | "standby";

export type EmergencyShelter = {
    id: string;
    eventId: string;
    name: string;
    category: string;
    location: string;
    currentOccupancy: number;
    capacity: number;
    status: ShelterStatus;
    inAffectedArea?: boolean;
    contactPerson?: string;
    contactPhone?: string;
    distanceKm?: number;
    transitRoute?: string;
};

export type SheltersResult = {
    shelters: EmergencyShelter[];
    event: EmergencyEvent | null;
    source: EmergencyDataSource;
};
