export const DMC_DUTY_OFFICER_ROLE = "dmc-duty-officer";

const base = `/web/${DMC_DUTY_OFFICER_ROLE}/emergency-coordination`;

export type CoordinationFocus = "shelters" | "rescue" | "relief";

export const emergencyCoordinationRoutes = {
    activeEmergency: base,
    eventDetails: (eventId: string) =>
        `${base}/event/${encodeURIComponent(eventId)}`,
    responseCoordination: (eventId: string, focus?: CoordinationFocus) =>
        `${base}/response/${encodeURIComponent(eventId)}${focus ? `?focus=${focus}` : ""}`,
};
