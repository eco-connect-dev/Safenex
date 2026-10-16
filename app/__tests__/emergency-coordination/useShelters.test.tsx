import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";

import { useShelters } from "@/src/features/emergency-coordination/hooks/useShelters";
import { resetInMemoryShelters } from "@/src/features/emergency-coordination/services/emergencyCoordinationService";
import { SAMPLE_EVENT_ID } from "@/src/features/emergency-coordination/sampleData";

function HookTestHarness({ eventId }: { eventId?: string }) {
    const {
        loading,
        filteredShelters,
        totalActiveShelters,
        event,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        selectedShelter,
        setSelectedShelterId,
        allocate,
    } = useShelters(eventId);

    return (
        <View testID="hook-harness">
            <Text testID="loading-state">{String(loading)}</Text>
            <Text testID="shelters-count">{filteredShelters.length}</Text>
            <Text testID="total-active">{totalActiveShelters}</Text>
            <Text testID="district-name">{event?.district ?? ""}</Text>
            <Text testID="selected-shelter">{selectedShelter?.name ?? "none"}</Text>
            <Text testID="current-search">{searchQuery}</Text>
            <Text testID="current-status">{statusFilter}</Text>

            {filteredShelters.map((s) => (
                <View key={s.id} testID={`item-${s.id}`}>
                    <Text testID={`name-${s.id}`}>{s.name}</Text>
                    <Text testID={`occupancy-${s.id}`}>{s.currentOccupancy}</Text>
                </View>
            ))}

            <Pressable
                onPress={() => setSearchQuery("Ruwanwella")}
                testID="btn-test-search"
            >
                <Text>Search</Text>
            </Pressable>

            <Pressable
                onPress={() => setStatusFilter("full")}
                testID="btn-test-full"
            >
                <Text>Filter Full</Text>
            </Pressable>

            <Pressable
                onPress={() => setStatusFilter("available")}
                testID="btn-test-available"
            >
                <Text>Filter Available</Text>
            </Pressable>

            <Pressable
                onPress={() => setSelectedShelterId("s4")}
                testID="btn-test-select-s4"
            >
                <Text>Select S4</Text>
            </Pressable>

            <Pressable
                onPress={() => void allocate("s1", 50)}
                testID="btn-test-allocate-s1"
            >
                <Text>Allocate S1</Text>
            </Pressable>
        </View>
    );
}

describe("useShelters hook", () => {
    beforeEach(() => {
        resetInMemoryShelters();
    });

    it("loads shelters and initializes state", async () => {
        await render(<HookTestHarness eventId={SAMPLE_EVENT_ID} />);

        await waitFor(() => {
            expect(screen.getByTestId("loading-state").props.children).toBe("false");
        });

        expect(screen.getByTestId("shelters-count").props.children).toBe(4);
        expect(screen.getByTestId("total-active").props.children).toBe(6);
        expect(screen.getByTestId("district-name").props.children).toBe("Kegalle");
    });

    it("filters shelters by search query", async () => {
        await render(<HookTestHarness eventId={SAMPLE_EVENT_ID} />);

        await waitFor(() => {
            expect(screen.getByTestId("loading-state").props.children).toBe("false");
        });

        fireEvent.press(screen.getByTestId("btn-test-search"));

        await waitFor(() => {
            expect(screen.getByTestId("shelters-count").props.children).toBe(1);
        });
        expect(screen.getByTestId("name-s2").props.children).toBe(
            "Ruwanwella Vidyalaya",
        );
    });

    it("filters shelters by status", async () => {
        await render(<HookTestHarness eventId={SAMPLE_EVENT_ID} />);

        await waitFor(() => {
            expect(screen.getByTestId("loading-state").props.children).toBe("false");
        });

        fireEvent.press(screen.getByTestId("btn-test-full"));
        await waitFor(() => {
            expect(screen.getByTestId("shelters-count").props.children).toBe(1);
        });
        expect(screen.getByTestId("name-s3").props.children).toBe(
            "Aranayake Community Hall",
        );

        fireEvent.press(screen.getByTestId("btn-test-available"));
        await waitFor(() => {
            expect(screen.getByTestId("shelters-count").props.children).toBe(3);
        });
    });

    it("selects a shelter and resolves selectedShelter", async () => {
        await render(<HookTestHarness eventId={SAMPLE_EVENT_ID} />);

        await waitFor(() => {
            expect(screen.getByTestId("loading-state").props.children).toBe("false");
        });

        fireEvent.press(screen.getByTestId("btn-test-select-s4"));

        await waitFor(() => {
            expect(screen.getByTestId("selected-shelter").props.children).toBe(
                "Mawanella Sports Complex",
            );
        });
    });

    it("allocates evacuees and updates occupancy in hook state", async () => {
        await render(<HookTestHarness eventId={SAMPLE_EVENT_ID} />);

        await waitFor(() => {
            expect(screen.getByTestId("loading-state").props.children).toBe("false");
        });

        fireEvent.press(screen.getByTestId("btn-test-allocate-s1"));

        await waitFor(() => {
            expect(screen.getByTestId("occupancy-s1").props.children).toBe(700);
        });
    });
});
