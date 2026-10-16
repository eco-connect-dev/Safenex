import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import { SheltersInAffectedAreaScreen } from "@/src/features/emergency-coordination/screens/SheltersInAffectedAreaScreen";
import { useShelters } from "@/src/features/emergency-coordination/hooks/useShelters";
import { emergencyCoordinationRoutes } from "@/src/features/emergency-coordination/routes";
import {
    sampleActiveEmergency,
    sampleShelters,
} from "@/src/features/emergency-coordination/sampleData";

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
    },
    useLocalSearchParams: jest.fn(() => ({
        eventId: "sample-kegalle-flood",
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

const mockRefresh = jest.fn(async () => {});
const mockRetry = jest.fn(async () => {});
const mockAllocate = jest.fn(async (shelterId: string, count: number) => {
    const found = sampleShelters.find((s) => s.id === shelterId);
    return {
        ...(found ?? sampleShelters[0]),
        currentOccupancy: (found?.currentOccupancy ?? 0) + count,
    };
});
const mockSetSearchQuery = jest.fn();
const mockSetStatusFilter = jest.fn();
const mockSetSelectedShelterId = jest.fn();

type HookState = ReturnType<typeof useShelters>;

function mockHookState(overrides: Partial<HookState> = {}) {
    const affected = sampleShelters.filter((s) => s.inAffectedArea !== false);
    mockedUseShelters.mockReturnValue({
        shelters: sampleShelters,
        filteredShelters: affected,
        selectedShelter: null,
        selectedShelterId: null,
        setSelectedShelterId: mockSetSelectedShelterId,
        searchQuery: "",
        setSearchQuery: mockSetSearchQuery,
        statusFilter: "all",
        setStatusFilter: mockSetStatusFilter,
        event: sampleActiveEmergency.event,
        source: "sample",
        loading: false,
        refreshing: false,
        error: null,
        refresh: mockRefresh,
        retry: mockRetry,
        allocate: mockAllocate,
        totalActiveShelters: 6,
        ...overrides,
    });
}

describe("SheltersInAffectedAreaScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHookState();
    });

    it("renders the heading and subtitle matching the design", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        expect(
            screen.getByText("Shelters in Affected Area (Kegalle)"),
        ).toBeTruthy();
        expect(
            screen.getByText(
                "Compare registered shelter capacity and current occupancy before selecting a suitable shelter.",
            ),
        ).toBeTruthy();
    });

    it("renders registered emergency shelters with occupancy, status badges, and actions", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        // Shelters from the user screenshot
        expect(screen.getByText("Kegalle Central College")).toBeTruthy();
        expect(screen.getByText("Kegalle Town")).toBeTruthy();
        expect(screen.getByText("650 / 1,000 · 65%")).toBeTruthy();

        expect(screen.getByText("Ruwanwella Vidyalaya")).toBeTruthy();
        expect(screen.getByText("Ruwanwella")).toBeTruthy();
        expect(screen.getByText("420 / 800 · 53%")).toBeTruthy();

        expect(screen.getByText("Aranayake Community Hall")).toBeTruthy();
        expect(screen.getByText("Aranayake")).toBeTruthy();
        expect(screen.getByText("500 / 500 · 100%")).toBeTruthy();

        expect(screen.getByText("Mawanella Sports Complex")).toBeTruthy();
        expect(screen.getByText("Mawanella")).toBeTruthy();
        expect(screen.getByText("300 / 1,200 · 25%")).toBeTruthy();
    });

    it("displays 'Full' badge and disabled 'Unavailable' button for fully occupied shelters", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        const fullBadge = screen.getByTestId("shelter-badge-s3");
        expect(fullBadge).toBeTruthy();
        expect(screen.getAllByText("Full").length).toBeGreaterThanOrEqual(1);

        const unavailableBtn = screen.getByTestId("btn-unavailable-s3");
        expect(unavailableBtn).toBeTruthy();
        expect(screen.getByText("Unavailable")).toBeTruthy();
    });

    it("displays 'Available' badge and 'Select' button for available shelters", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        const availableBadge = screen.getByTestId("shelter-badge-s1");
        expect(availableBadge).toBeTruthy();

        const selectBtn = screen.getByTestId("btn-select-s1");
        expect(selectBtn).toBeTruthy();
        expect(screen.getAllByText("Select").length).toBeGreaterThanOrEqual(1);
    });

    it("allows typing in the search input and calling setSearchQuery", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        const searchInput = screen.getByTestId("shelters-search-input");
        fireEvent.changeText(searchInput, "Ruwanwella");

        expect(mockSetSearchQuery).toHaveBeenCalledWith("Ruwanwella");
    });

    it("clears search input when clear button is pressed", async () => {
        mockHookState({ searchQuery: "Ruwanwella" });
        await render(<SheltersInAffectedAreaScreen />);

        const clearBtn = screen.getByTestId("clear-search-button");
        fireEvent.press(clearBtn);

        expect(mockSetSearchQuery).toHaveBeenCalledWith("");
    });

    it("calls setStatusFilter when status button is pressed", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("status-filter-available"));
        expect(mockSetStatusFilter).toHaveBeenCalledWith("available");
    });

    it("shows empty state and allows resetting filters", async () => {
        mockHookState({ filteredShelters: [] });
        await render(<SheltersInAffectedAreaScreen />);

        expect(screen.getByTestId("shelters-empty")).toBeTruthy();
        expect(screen.getByText("No matching shelters found")).toBeTruthy();

        fireEvent.press(screen.getByTestId("reset-filters-button"));

        expect(mockSetSearchQuery).toHaveBeenCalledWith("");
        expect(mockSetStatusFilter).toHaveBeenCalledWith("all");
    });

    it("renders the instruction notice callout box", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        expect(
            screen.getByText(
                "Select an available shelter to record evacuees. Capacity will be checked before confirming the allocation.",
            ),
        ).toBeTruthy();
    });

    it("renders the footer summary text with shelter and event counts", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        expect(
            screen.getByText(
                "4 shelters shown · Kegalle flood response · 6 shelters active across the event",
            ),
        ).toBeTruthy();
    });

    it("selects a shelter when Select is pressed", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("btn-select-s1"));
        expect(mockSetSelectedShelterId).toHaveBeenCalledWith("s1");
    });

    it("opens the evacuee allocation panel when a shelter is selected", async () => {
        const s4 = sampleShelters.find((s) => s.id === "s4")!;
        mockHookState({
            selectedShelterId: "s4",
            selectedShelter: s4,
        });

        await render(<SheltersInAffectedAreaScreen />);

        expect(
            screen.getByText("Record Evacuees · Mawanella Sports Complex"),
        ).toBeTruthy();
        expect(screen.getByText("Remaining Spaces")).toBeTruthy();
        expect(screen.getByText("900")).toBeTruthy(); // 1200 - 300 = 900
    });

    it("handles evacuee quick buttons and updates input value", async () => {
        const s1 = sampleShelters.find((s) => s.id === "s1")!;
        mockHookState({
            selectedShelterId: "s1",
            selectedShelter: s1,
        });

        await render(<SheltersInAffectedAreaScreen />);

        const quickAdd50 = screen.getByTestId("quick-add-50");
        fireEvent.press(quickAdd50);

        await waitFor(() => {
            const countInput = screen.getByTestId("evacuee-count-input");
            expect(countInput.props.value).toBe("50");
        });
        expect(
            screen.getByText("✓ Capacity verified: 50 spaces will be allocated."),
        ).toBeTruthy();
    });

    it("prevents allocation and shows error when count exceeds capacity", async () => {
        const s1 = sampleShelters.find((s) => s.id === "s1")!;
        mockHookState({
            selectedShelterId: "s1",
            selectedShelter: s1,
        });

        await render(<SheltersInAffectedAreaScreen />);

        const countInput = screen.getByTestId("evacuee-count-input");
        fireEvent.changeText(countInput, "400"); // 350 max

        await waitFor(() => {
            expect(
                screen.getByText(
                    "⚠ Exceeds available shelter capacity (maximum 350 spaces remaining).",
                ),
            ).toBeTruthy();
        });
    });

    it("confirms allocation and calls allocate hook", async () => {
        const s1 = sampleShelters.find((s) => s.id === "s1")!;
        mockHookState({
            selectedShelterId: "s1",
            selectedShelter: s1,
        });

        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("confirm-allocation-button"));

        await waitFor(() => {
            expect(mockAllocate).toHaveBeenCalledWith("s1", 25);
        });
    });

    it("closes allocation panel when Cancel is pressed", async () => {
        const s1 = sampleShelters.find((s) => s.id === "s1")!;
        mockHookState({
            selectedShelterId: "s1",
            selectedShelter: s1,
        });

        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("cancel-allocation-button"));
        expect(mockSetSelectedShelterId).toHaveBeenCalledWith(null);
    });

    it("navigates back to active emergency when back link is pressed", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("back-to-active-emergency"));

        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.activeEmergency,
        );
    });

    it("renders loading state when loading", async () => {
        mockHookState({ loading: true });
        await render(<SheltersInAffectedAreaScreen />);

        expect(screen.getByTestId("shelters-loading")).toBeTruthy();
    });

    it("renders error state and retries when retry is pressed", async () => {
        mockHookState({ error: "Failed to connect" });
        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("shelters-retry-button"));
        expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("navigates to allocate evacuees from header button", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("btn-header-allocate"));
        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.allocateEvacuees(),
        );
    });

    it("navigates to alternative shelter from header button", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("btn-header-alternative"));
        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.alternativeShelter(),
        );
    });

    it("navigates to alternative shelter when clicking alternative link on unavailable shelter row", async () => {
        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("btn-alternative-s3"));
        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.alternativeShelter("s3", 200),
        );
    });

    it("navigates to full allocation screen from the selected shelter panel", async () => {
        const s1 = sampleShelters.find((s) => s.id === "s1")!;
        mockHookState({
            selectedShelterId: "s1",
            selectedShelter: s1,
        });

        await render(<SheltersInAffectedAreaScreen />);

        fireEvent.press(screen.getByTestId("open-full-allocation-page-button"));
        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.allocateEvacuees("s1", 25),
        );
    });
});
