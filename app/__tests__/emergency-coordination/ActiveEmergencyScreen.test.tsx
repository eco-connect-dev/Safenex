import React from "react";
import {
    fireEvent,
    render,
    screen,
} from "@testing-library/react-native";
import { router } from "expo-router";

import { ActiveEmergencyScreen } from "@/src/features/emergency-coordination/screens/ActiveEmergencyScreen";
import { useActiveEmergency } from "@/src/features/emergency-coordination/hooks/useActiveEmergency";
import {
    SAMPLE_EVENT_ID,
    sampleActiveEmergency,
} from "@/src/features/emergency-coordination/sampleData";
import { emergencyCoordinationRoutes } from "@/src/features/emergency-coordination/routes";

jest.mock("expo-router", () => ({
    router: {
        push: jest.fn(),
    },
}));

jest.mock(
    "@/src/features/emergency-coordination/hooks/useActiveEmergency",
    () => ({
        useActiveEmergency: jest.fn(),
    }),
);

const mockedUseActiveEmergency =
    useActiveEmergency as jest.MockedFunction<typeof useActiveEmergency>;

const mockedPush = router.push as jest.Mock;

const mockRefresh = jest.fn(async () => {});
const mockRetry = jest.fn(async () => {});

type HookState = ReturnType<typeof useActiveEmergency>;

function mockHookState(overrides: Partial<HookState> = {}) {
    mockedUseActiveEmergency.mockReturnValue({
        data: sampleActiveEmergency,
        source: "supabase",
        loading: false,
        refreshing: false,
        error: null,
        refresh: mockRefresh,
        retry: mockRetry,
        ...overrides,
    });
}

describe("ActiveEmergencyScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHookState();
    });

    it("renders the active emergency heading and event details", async () => {
        await render(<ActiveEmergencyScreen />);

        expect(screen.getByText("Active Emergency")).toBeTruthy();
        expect(screen.getByText("Flood – Kegalle")).toBeTruthy();
        expect(screen.getByText("Kegalle District")).toBeTruthy();
        expect(screen.getByText("High severity")).toBeTruthy();
        expect(screen.getByText("15 Nov 2026 · 08:30")).toBeTruthy();
    });

    it("renders the four metric values", async () => {
        await render(<ActiveEmergencyScreen />);

        // 24,500 appears in both the overview and the people metric.
        expect(screen.getAllByText("24,500")).toHaveLength(2);
        expect(screen.getByText("6")).toBeTruthy();
        expect(screen.getByText("3")).toBeTruthy();
        expect(screen.getByText("1,200")).toBeTruthy();

        expect(screen.getByTestId("metric-people")).toBeTruthy();
        expect(screen.getByTestId("metric-shelters")).toBeTruthy();
        expect(screen.getByTestId("metric-rescue")).toBeTruthy();
        expect(screen.getByTestId("metric-relief")).toBeTruthy();
    });

    it("renders priority needs and operational updates", async () => {
        await render(<ActiveEmergencyScreen />);

        expect(screen.getByText("Priority coordination needs")).toBeTruthy();
        expect(screen.getByText("Shelter capacity required")).toBeTruthy();
        expect(screen.getByText("340 spaces")).toBeTruthy();
        expect(screen.getByText("Rescue support required")).toBeTruthy();
        expect(screen.getByText("Relief resources")).toBeTruthy();

        expect(screen.getByText("Latest operational updates")).toBeTruthy();
        expect(screen.getByText("14:20")).toBeTruthy();
        expect(screen.getByText("14:12")).toBeTruthy();
        expect(screen.getByText("14:05")).toBeTruthy();
        expect(screen.getByText("Updated")).toBeTruthy();
        expect(screen.getByText("Ready")).toBeTruthy();
    });

    it("shows a loading state before the data is available", async () => {
        mockHookState({
            data: null,
            source: null,
            loading: true,
        });

        await render(<ActiveEmergencyScreen />);

        expect(screen.getByTestId("active-emergency-loading")).toBeTruthy();
        expect(screen.getByText("Loading active emergency…")).toBeTruthy();
        expect(screen.queryByTestId("active-emergency-screen")).toBeNull();
    });

    it("shows an error and lets the user retry", async () => {
        mockHookState({
            data: null,
            error: "Network request failed",
        });

        await render(<ActiveEmergencyScreen />);

        expect(screen.getByTestId("active-emergency-error")).toBeTruthy();
        expect(screen.getByText("Network request failed")).toBeTruthy();

        fireEvent.press(screen.getByTestId("retry-button"));

        expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("shows an empty state when no active emergency exists", async () => {
        mockHookState({
            data: null,
        });

        await render(<ActiveEmergencyScreen />);

        expect(screen.getByTestId("active-emergency-empty")).toBeTruthy();
        expect(screen.getByText("No active emergency")).toBeTruthy();

        fireEvent.press(screen.getByTestId("refresh-button"));

        expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("refreshes when the Refresh button is pressed", async () => {
        await render(<ActiveEmergencyScreen />);

        fireEvent.press(screen.getByTestId("refresh-button"));

        expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it("shows a banner when the data source is sample data", async () => {
        mockHookState({
            source: "sample",
        });

        await render(<ActiveEmergencyScreen />);

        expect(screen.getByTestId("sample-data-banner")).toBeTruthy();
    });

    it("does not show the sample banner for Supabase data", async () => {
        await render(<ActiveEmergencyScreen />);

        expect(screen.queryByTestId("sample-data-banner")).toBeNull();
    });

    it("navigates to event details", async () => {
        await render(<ActiveEmergencyScreen />);

        fireEvent.press(screen.getByTestId("view-event-details"));

        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.eventDetails(SAMPLE_EVENT_ID),
        );
    });

    it("navigates to response coordination without a focus", async () => {
        await render(<ActiveEmergencyScreen />);

        fireEvent.press(screen.getByTestId("view-response-coordination"));

        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.responseCoordination(SAMPLE_EVENT_ID),
        );
    });

    it.each([
        ["people", "shelters"],
        ["shelters", "shelters"],
        ["rescue", "rescue"],
        ["relief", "relief"],
    ] as const)(
        "opens the correct response focus for the %s metric",
        async (metric, focus) => {
            await render(<ActiveEmergencyScreen />);

            fireEvent.press(screen.getByTestId(`metric-${metric}`));

            expect(mockedPush).toHaveBeenCalledWith(
                emergencyCoordinationRoutes.responseCoordination(
                    SAMPLE_EVENT_ID,
                    focus,
                ),
            );
        },
    );

    it.each(["shelters", "rescue", "relief"] as const)(
        "opens the correct response focus for the %s priority row",
        async (focus) => {
            await render(<ActiveEmergencyScreen />);

            fireEvent.press(screen.getByTestId(`need-row-${focus}`));

            expect(mockedPush).toHaveBeenCalledWith(
                emergencyCoordinationRoutes.responseCoordination(
                    SAMPLE_EVENT_ID,
                    focus,
                ),
            );
        },
    );

    it("selects a map location and clears it when pressed again", async () => {
        await render(<ActiveEmergencyScreen />);

        fireEvent.press(screen.getByTestId("map-location-l2"));

        expect(
            await screen.findByText("Selected: Kegalle (epicentre)"),
        ).toBeTruthy();

        fireEvent.press(screen.getByTestId("map-location-l2"));

        expect(
            await screen.findByText("Tap a location to focus it."),
        ).toBeTruthy();
    });

    it("shows fallback text when there are no needs or updates", async () => {
        mockHookState({
            data: {
                ...sampleActiveEmergency,
                priorityNeeds: [],
                updates: [],
            },
        });

        await render(<ActiveEmergencyScreen />);

        expect(screen.getByText("No priority needs recorded.")).toBeTruthy();
        expect(screen.getByText("No updates yet.")).toBeTruthy();
    });

    it("navigates to shelters, allocate evacuees, and alternative shelter from operations card", async () => {
        await render(<ActiveEmergencyScreen />);

        expect(screen.getByTestId("shelter-operations-card")).toBeTruthy();
        expect(screen.getByText("Shelter & Evacuation Operations")).toBeTruthy();

        // 1. Navigate to shelters
        fireEvent.press(screen.getByTestId("btn-nav-shelters"));
        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.shelters(SAMPLE_EVENT_ID),
        );

        // 2. Navigate to allocate evacuees
        fireEvent.press(screen.getByTestId("btn-nav-allocate"));
        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.allocateEvacuees(),
        );

        // 3. Navigate to select alternative shelter
        fireEvent.press(screen.getByTestId("btn-nav-alternative"));
        expect(mockedPush).toHaveBeenCalledWith(
            emergencyCoordinationRoutes.alternativeShelter(),
        );
    });

});
