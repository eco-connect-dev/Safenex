import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import { AllocateEvacueesScreen } from "@/src/features/emergency-coordination/screens/AllocateEvacueesScreen";
import { useShelters } from "@/src/features/emergency-coordination/hooks/useShelters";
import {
    sampleActiveEmergency,
    sampleShelters,
} from "@/src/features/emergency-coordination/sampleData";

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
        canGoBack: jest.fn(() => true),
    },
    useLocalSearchParams: jest.fn(() => ({
        shelterId: "s4",
        count: "150",
    })),
}));

jest.mock(
    "@/src/features/emergency-coordination/hooks/useShelters",
    () => ({
        useShelters: jest.fn(),
    }),
);

const mockedUseShelters = useShelters as jest.MockedFunction<typeof useShelters>;
const mockedPush = router.push as jest.Mock;
const mockedBack = router.back as jest.Mock;

const mockAllocate = jest.fn(async (shelterId: string, count: number) => {
    const found = sampleShelters.find((s) => s.id === shelterId);
    return {
        ...(found ?? sampleShelters[0]),
        currentOccupancy: (found?.currentOccupancy ?? 0) + count,
    };
});

type HookState = ReturnType<typeof useShelters>;

function mockHookState(overrides: Partial<HookState> = {}) {
    const affected = sampleShelters.filter((s) => s.inAffectedArea !== false);
    mockedUseShelters.mockReturnValue({
        shelters: sampleShelters,
        filteredShelters: affected,
        selectedShelter: null,
        selectedShelterId: null,
        setSelectedShelterId: jest.fn(),
        searchQuery: "",
        setSearchQuery: jest.fn(),
        statusFilter: "all",
        setStatusFilter: jest.fn(),
        event: sampleActiveEmergency.event,
        source: "sample",
        loading: false,
        refreshing: false,
        error: null,
        refresh: jest.fn(async () => {}),
        retry: jest.fn(async () => {}),
        allocate: mockAllocate,
        totalActiveShelters: 6,
        ...overrides,
    });
}

describe("AllocateEvacueesScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHookState();
    });

    it("renders loading state when loading with empty shelters", async () => {
        mockHookState({ shelters: [], loading: true });
        await render(<AllocateEvacueesScreen />);
        expect(screen.getByTestId("allocate-loading")).toBeTruthy();
    });

    it("renders page header and main cards", async () => {
        await render(<AllocateEvacueesScreen />);
        expect(screen.getByTestId("allocate-title")).toBeTruthy();
        expect(screen.getByText("Allocate Evacuees")).toBeTruthy();
        expect(screen.getByText("Shelter allocation")).toBeTruthy();
        expect(screen.getByText("Allocation check")).toBeTruthy();
    });

    it("displays current occupancy and available spaces for preselected shelter", async () => {
        await render(<AllocateEvacueesScreen />);
        expect(screen.getByTestId("occupancy-display")).toHaveTextContent("300 / 1,200");
        expect(screen.getByTestId("available-spaces-badge")).toHaveTextContent("900 spaces available");
    });

    it("displays allocation check summary details and validation status", async () => {
        await render(<AllocateEvacueesScreen />);
        expect(screen.getByTestId("summary-requested-evacuees")).toHaveTextContent("150");
        expect(screen.getByTestId("summary-available-spaces")).toHaveTextContent("900");
        expect(screen.getByTestId("summary-projected-occupancy")).toHaveTextContent("450 / 1,200");
        expect(screen.getByTestId("validation-success-box")).toBeTruthy();
        expect(screen.getByText("Capacity validated")).toBeTruthy();
    });

    it("renders offline capture notice", async () => {
        await render(<AllocateEvacueesScreen />);
        expect(screen.getByTestId("offline-capture-notice")).toBeTruthy();
    });

    it("updates projected occupancy dynamically when evacuee count changes", async () => {
        await render(<AllocateEvacueesScreen />);
        const input = screen.getByTestId("evacuee-count-input");
        fireEvent.changeText(input, "250");

        await waitFor(() => {
            expect(screen.getByTestId("summary-requested-evacuees")).toHaveTextContent("250");
            expect(screen.getByTestId("summary-projected-occupancy")).toHaveTextContent("550 / 1,200");
            expect(screen.getByTestId("capacity-valid-helper")).toBeTruthy();
        });
    });

    it("shows capacity exceeded error and alternative shelter link when count exceeds available spaces", async () => {
        await render(<AllocateEvacueesScreen />);
        const input = screen.getByTestId("evacuee-count-input");
        fireEvent.changeText(input, "950");

        await waitFor(() => {
            expect(screen.getByTestId("capacity-exceeded-helper")).toHaveTextContent(
                "Requested allocation exceeds remaining capacity (900 spaces).",
            );
            expect(screen.getByTestId("validation-warning-box")).toBeTruthy();
            expect(screen.getByText("Capacity exceeded")).toBeTruthy();
        });

        // Click redirect to alternative shelter
        const redirectLink = screen.getByTestId("btn-redirect-alternative");
        fireEvent.press(redirectLink);
        expect(mockedPush).toHaveBeenCalledWith(
            expect.stringContaining("/alternative-shelter?originShelterId=s4&count=950"),
        );
    });

    it("allows opening shelter dropdown and selecting a different shelter", async () => {
        await render(<AllocateEvacueesScreen />);
        const trigger = screen.getByTestId("shelter-select-trigger");
        fireEvent.press(trigger);

        await waitFor(() => {
            expect(screen.getByTestId("shelter-dropdown-menu")).toBeTruthy();
        });

        // Select Kegalle Central College (s1: 650 / 1000)
        const option = screen.getByTestId("shelter-option-s1");
        fireEvent.press(option);

        await waitFor(() => {
            expect(screen.getByTestId("occupancy-display")).toHaveTextContent("650 / 1,000");
            expect(screen.getByTestId("available-spaces-badge")).toHaveTextContent("350 spaces available");
        });
    });

    it("handles cancel button press", async () => {
        await render(<AllocateEvacueesScreen />);
        const cancelBtn = screen.getByTestId("btn-cancel");
        fireEvent.press(cancelBtn);
        expect(mockedBack).toHaveBeenCalled();
    });

    it("successfully confirms allocation and shows success banner", async () => {
        await render(<AllocateEvacueesScreen />);
        const notesInput = screen.getByTestId("allocation-notes-input");
        fireEvent.changeText(notesInput, "Priority coordination with district triage.");

        const allocateBtn = screen.getByTestId("btn-allocate");
        fireEvent.press(allocateBtn);

        await waitFor(() => {
            expect(mockAllocate).toHaveBeenCalledWith("s4", 150);
            expect(screen.getByTestId("allocation-success-banner")).toBeTruthy();
        });
    });
});
