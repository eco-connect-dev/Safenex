import {
    allocateShelterEvacuees,
    fetchEmergencyShelters,
    resetInMemoryShelters,
} from "@/src/features/emergency-coordination/services/emergencyCoordinationService";
import { SAMPLE_EVENT_ID } from "@/src/features/emergency-coordination/sampleData";

describe("shelters service", () => {
    beforeEach(() => {
        resetInMemoryShelters();
    });

    describe("fetchEmergencyShelters", () => {
        it("returns shelters and active event using fallback sample data", async () => {
            const result = await fetchEmergencyShelters(SAMPLE_EVENT_ID);
            expect(result.source).toBe("sample");
            expect(result.event).not.toBeNull();
            expect(result.event?.district).toBe("Kegalle");
            expect(result.shelters.length).toBeGreaterThanOrEqual(4);

            const kegalle = result.shelters.find((s) => s.id === "s1");
            expect(kegalle).toBeDefined();
            expect(kegalle?.name).toBe("Kegalle Central College");
            expect(kegalle?.location).toBe("Kegalle Town");
            expect(kegalle?.capacity).toBe(1000);
            expect(kegalle?.currentOccupancy).toBe(650);
            expect(kegalle?.status).toBe("available");
        });

        it("contains the Aranayake Community Hall marked as full", async () => {
            const result = await fetchEmergencyShelters(SAMPLE_EVENT_ID);
            const aranayake = result.shelters.find((s) => s.id === "s3");
            expect(aranayake).toBeDefined();
            expect(aranayake?.name).toBe("Aranayake Community Hall");
            expect(aranayake?.status).toBe("full");
            expect(aranayake?.currentOccupancy).toBe(aranayake?.capacity);
        });
    });

    describe("allocateShelterEvacuees", () => {
        it("throws an error when evacuee count is zero or negative", async () => {
            await expect(allocateShelterEvacuees("s1", 0)).rejects.toThrow(
                "Evacuee count must be greater than zero.",
            );
            await expect(allocateShelterEvacuees("s1", -5)).rejects.toThrow(
                "Evacuee count must be greater than zero.",
            );
        });

        it("throws an error when shelter is not found", async () => {
            await expect(
                allocateShelterEvacuees("non-existent-id", 10),
            ).rejects.toThrow("Shelter not found");
        });

        it("throws an error when allocation exceeds available capacity", async () => {
            // s1 has capacity 1000 and current 650 (350 available)
            await expect(allocateShelterEvacuees("s1", 400)).rejects.toThrow(
                /Allocation exceeds capacity/,
            );
        });

        it("successfully allocates evacuees within capacity", async () => {
            // s1 has 650/1000 -> allocate 50 -> 700/1000
            const updated = await allocateShelterEvacuees("s1", 50);
            expect(updated.currentOccupancy).toBe(700);
            expect(updated.status).toBe("available");

            // Verify persistence in subsequent fetch
            const result = await fetchEmergencyShelters(SAMPLE_EVENT_ID);
            const refetched = result.shelters.find((s) => s.id === "s1");
            expect(refetched?.currentOccupancy).toBe(700);
        });

        it("transitions status to full when capacity is reached", async () => {
            // s1 has 650/1000 -> allocate remaining 350 -> 1000/1000
            const updated = await allocateShelterEvacuees("s1", 350);
            expect(updated.currentOccupancy).toBe(1000);
            expect(updated.status).toBe("full");
        });
    });
});
