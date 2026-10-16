import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import { SelectAlternativeShelterScreen } from "@/src/features/emergency-coordination/screens/SelectAlternativeShelterScreen";
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
        originShelterId: "s3",
        count: "200",
    })),
}));

jest.mock(
    "@/src/features/emergency-coordination/hooks/useShelters",
    () => ({
        useShelters: jest.fn(),
    }),
);

const mockedUseShelters = useShelters as jest.MockedFunction<typeof useShelters>;
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

describe("SelectAlternativeShelterScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHookState();
    });

    it("renders loading state when shelters are empty and loading", async () => {
        mockHookState({ shelters: [], loading: true });
        await render(<SelectAlternativeShelterScreen />);
        expect(screen.getByTestId("alternative-loading")).toBeTruthy();
    });

    it("renders page title and capacity exceeded warning banner", async () => {
        await render(<SelectAlternativeShelterScreen />);
        expect(screen.getByTestId("alternative-title")).toBeTruthy();
        expect(screen.getByText("Select Alternative Shelter")).toBeTruthy();

        const warningBanner = screen.getByTestId("capacity-exceeded-banner");
        expect(warningBanner).toBeTruthy();
        expect(warningBanner).toHaveTextContent(
            /Capacity limit reached at Aranayake Community Hall: Attempted allocation of 200 evacuees exceeds remaining capacity/,
        );
    });

    it("renders offline synchronization notice at the bottom", async () => {
        await render(<SelectAlternativeShelterScreen />);
        expect(screen.getByTestId("offline-sync-notice")).toBeTruthy();
        expect(screen.getByText(/Offline capture is supported/)).toBeTruthy();
    });

    it("renders alternative shelters table with candidate rows and default selected shelter", async () => {
        await render(<SelectAlternativeShelterScreen />);
        expect(screen.getByText("Available Alternative Shelters")).toBeTruthy();
        expect(screen.getByText("Kegalle District")).toBeTruthy();

        // Mawanella Sports Complex should be rendered with selected status
        expect(screen.getByTestId("alternative-row-s4")).toBeTruthy();
        expect(screen.getByTestId("btn-selected-s4")).toBeTruthy();

        // Kegalle Central College (s1) and Ruwanwella Vidyalaya (s2) available for selection
        expect(screen.getByTestId("btn-select-s1")).toBeTruthy();
        expect(screen.getByTestId("btn-select-s2")).toBeTruthy();
    });

    it("displays allocation details and validated capacity card on the right", async () => {
        await render(<SelectAlternativeShelterScreen />);
        expect(screen.getByText("Alternative Allocation Details")).toBeTruthy();
        expect(screen.getByText("Aranayake Community Hall (Over capacity)")).toBeTruthy();
        expect(screen.getByTestId("details-selected-name")).toHaveTextContent("Mawanella Sports Complex");
        expect(screen.getByTestId("details-redirect-count")).toHaveTextContent("200 persons");

        const validBox = screen.getByTestId("alternative-capacity-valid-box");
        expect(validBox).toBeTruthy();
        expect(validBox).toHaveTextContent(/Capacity validated: 900 spaces available/);
    });

    it("filters alternative shelters by search input", async () => {
        await render(<SelectAlternativeShelterScreen />);
        const searchInput = screen.getByTestId("alternative-search-input");
        fireEvent.changeText(searchInput, "Kegalle");

        await waitFor(() => {
            expect(screen.getByTestId("alternative-row-s1")).toBeTruthy();
            expect(screen.queryByTestId("alternative-row-s2")).toBeNull();
        });
    });

    it("updates selected alternative shelter when clicking Select on another row", async () => {
        await render(<SelectAlternativeShelterScreen />);
        const selectS1Btn = screen.getByTestId("btn-select-s1");
        fireEvent.press(selectS1Btn);

        await waitFor(() => {
            expect(screen.getByTestId("details-selected-name")).toHaveTextContent("Kegalle Central College");
            const validBox = screen.getByTestId("alternative-capacity-valid-box");
            expect(validBox).toHaveTextContent(/Capacity validated: 350 spaces available/);
        });
    });

    it("handles cancel/return button press", async () => {
        await render(<SelectAlternativeShelterScreen />);
        const cancelBtn = screen.getByTestId("btn-cancel-return");
        fireEvent.press(cancelBtn);
        expect(mockedBack).toHaveBeenCalled();
    });

    it("confirms alternative shelter allocation with transit notes and shows confirmation banner", async () => {
        await render(<SelectAlternativeShelterScreen />);
        const notesInput = screen.getByTestId("transit-notes-input");
        fireEvent.changeText(notesInput, "Coordinated with Police RT-02 for evacuation escort along A1 corridor.");

        const confirmBtn = screen.getByTestId("btn-confirm-alternative");
        fireEvent.press(confirmBtn);

        await waitFor(() => {
            expect(mockAllocate).toHaveBeenCalledWith("s4", 200);
            expect(screen.getByTestId("alternative-success-banner")).toBeTruthy();
            expect(screen.getByText(/Successfully redirected 200 evacuees to Mawanella Sports Complex/)).toBeTruthy();
        });
    });
});
