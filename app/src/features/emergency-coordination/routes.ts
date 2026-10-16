export const DMC_DUTY_OFFICER_ROLE = "dmc-duty-officer";

const base = `/web/${DMC_DUTY_OFFICER_ROLE}/emergency-coordination`;

export type CoordinationFocus = "shelters" | "rescue" | "relief";

export const emergencyCoordinationRoutes = {
    activeEmergency: base,
    assignRescueTeam: `${base}/rescue/assign`,
    allocateReliefResources: `${base}/relief/allocate`,
    operationalOverview: `${base}/overview`,
    shelters: (eventId?: string) =>
        eventId ? `${base}/shelters/${encodeURIComponent(eventId)}` : `${base}/shelters`,
    allocateEvacuees: (shelterId?: string, count?: number) => {
        const params = new URLSearchParams();
        if (shelterId) params.set("shelterId", shelterId);
        if (count !== undefined) params.set("count", String(count));
        const query = params.toString();
        return query ? `${base}/allocate?${query}` : `${base}/allocate`;
    },
    alternativeShelter: (originShelterId?: string, count?: number) => {
        const params = new URLSearchParams();
        if (originShelterId) params.set("originShelterId", originShelterId);
        if (count !== undefined) params.set("count", String(count));
        const query = params.toString();
        return query ? `${base}/alternative-shelter?${query}` : `${base}/alternative-shelter`;
    },
    eventDetails: (eventId: string) =>
        `${base}/event/${encodeURIComponent(eventId)}`,
    responseCoordination: (eventId: string, focus?: CoordinationFocus) =>
        `${base}/response/${encodeURIComponent(eventId)}${focus ? `?focus=${focus}` : ""}`,
};

