import {
    DMC_DUTY_OFFICER_ROLE,
    emergencyCoordinationRoutes,
} from "@/src/features/emergency-coordination/routes";

describe("emergencyCoordinationRoutes", () => {
    const base =
        "/web/dmc-duty-officer/emergency-coordination";

    it("uses the DMC duty officer role identifier", () => {
        expect(DMC_DUTY_OFFICER_ROLE).toBe("dmc-duty-officer");
    });

    it("builds the active emergency route", () => {
        expect(emergencyCoordinationRoutes.activeEmergency).toBe(base);
    });

    it("builds the event details route", () => {
        expect(
            emergencyCoordinationRoutes.eventDetails("event-123"),
        ).toBe(`${base}/event/event-123`);
    });

    it("encodes special characters in the event ID", () => {
        expect(
            emergencyCoordinationRoutes.eventDetails("event / 123"),
        ).toBe(`${base}/event/event%20%2F%20123`);
    });

    it("builds the response route without a focus", () => {
        expect(
            emergencyCoordinationRoutes.responseCoordination("event-123"),
        ).toBe(`${base}/response/event-123`);
    });

    it.each(["shelters", "rescue", "relief"] as const)(
        "builds the response route with %s focus",
        (focus) => {
            expect(
                emergencyCoordinationRoutes.responseCoordination(
                    "event-123",
                    focus,
                ),
            ).toBe(`${base}/response/event-123?focus=${focus}`);
        },
    );

    it("builds the shelters route without an event ID", () => {
        expect(emergencyCoordinationRoutes.shelters()).toBe(`${base}/shelters`);
    });

    it("builds the shelters route with an event ID", () => {
        expect(emergencyCoordinationRoutes.shelters("event-123")).toBe(
            `${base}/shelters/event-123`,
        );
    });

    it("encodes special characters in shelters event ID", () => {
        expect(emergencyCoordinationRoutes.shelters("event / 123")).toBe(
            `${base}/shelters/event%20%2F%20123`,
        );
    });

    it("builds the allocateEvacuees route with and without parameters", () => {
        expect(emergencyCoordinationRoutes.allocateEvacuees()).toBe(`${base}/allocate`);
        expect(emergencyCoordinationRoutes.allocateEvacuees("s4")).toBe(`${base}/allocate?shelterId=s4`);
        expect(emergencyCoordinationRoutes.allocateEvacuees("s4", 150)).toBe(
            `${base}/allocate?shelterId=s4&count=150`,
        );
    });

    it("builds the alternativeShelter route with and without parameters", () => {
        expect(emergencyCoordinationRoutes.alternativeShelter()).toBe(`${base}/alternative-shelter`);
        expect(emergencyCoordinationRoutes.alternativeShelter("s3")).toBe(
            `${base}/alternative-shelter?originShelterId=s3`,
        );
        expect(emergencyCoordinationRoutes.alternativeShelter("s3", 200)).toBe(
            `${base}/alternative-shelter?originShelterId=s3&count=200`,
        );
    });
});
