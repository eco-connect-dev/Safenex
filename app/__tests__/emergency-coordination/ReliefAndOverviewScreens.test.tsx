import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import { AllocateReliefResourcesScreen } from "@/src/features/emergency-coordination/screens/AllocateReliefResourcesScreen";
import { OperationalOverviewScreen } from "@/src/features/emergency-coordination/screens/OperationalOverviewScreen";
import { useActiveEmergency } from "@/src/features/emergency-coordination/hooks/useActiveEmergency";
import { useShelters } from "@/src/features/emergency-coordination/hooks/useShelters";
import { emergencyCoordinationRoutes } from "@/src/features/emergency-coordination/routes";
import { getReliefAllocations, getReliefResources, resetInMemoryReliefResources } from "@/src/features/emergency-coordination/services/emergencyCoordinationService";
import { sampleActiveEmergency, sampleShelters } from "@/src/features/emergency-coordination/sampleData";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/src/features/emergency-coordination/hooks/useActiveEmergency", () => ({ useActiveEmergency: jest.fn() }));
jest.mock("@/src/features/emergency-coordination/hooks/useShelters", () => ({ useShelters: jest.fn() }));

const mockedPush = router.push as jest.Mock;
const mockedUseActiveEmergency = useActiveEmergency as jest.MockedFunction<typeof useActiveEmergency>;
const mockedUseShelters = useShelters as jest.MockedFunction<typeof useShelters>;

describe("relief allocation and operational overview", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetInMemoryReliefResources();
        mockedUseActiveEmergency.mockReturnValue({ data: sampleActiveEmergency, source: "sample", loading: false, refreshing: false, error: null, refresh: jest.fn(), retry: jest.fn() });
        mockedUseShelters.mockReturnValue({ shelters: sampleShelters, totalActiveShelters: 6 } as ReturnType<typeof useShelters>);
    });

    it("confirms a stock-checked resource allocation and updates the remaining stock", async () => {
        await render(<AllocateReliefResourcesScreen />);
        expect(screen.getByTestId("resource-row-food-packs")).toHaveTextContent(/4,500/);
        expect(screen.getByTestId("stock-check")).toHaveTextContent(/4,300 will remain/);
        await fireEvent.press(screen.getByTestId("distribution-location-trigger"));
        await fireEvent.press(screen.getByTestId("distribution-location-Rambukkana Youth Centre"));
        await fireEvent.press(screen.getByTestId("confirm-allocation"));
        await waitFor(() => expect(screen.getByTestId("relief-allocation-success")).toHaveTextContent(/200 food packs allocated to Rambukkana Youth Centre/));
        expect(getReliefResources().find((resource) => resource.id === "food-packs")?.available).toBe(4300);
        expect(getReliefAllocations()[0]).toMatchObject({ organisation: "WFP", quantity: 200, location: "Rambukkana Youth Centre" });
    });

    it("disables a quantity that exceeds available inventory", async () => {
        const view = await render(<AllocateReliefResourcesScreen />);
        await fireEvent.changeText(view.getByTestId("allocation-quantity"), "5000");
        expect(view.getByTestId("stock-check")).toHaveTextContent(/0 will remain/);
        expect(view.getByTestId("confirm-allocation").props.accessibilityState).toMatchObject({ disabled: true });
    });

    it("shows the combined response and links to relief allocation and dashboard", async () => {
        const view = await render(<OperationalOverviewScreen />);
        expect(view.getByTestId("operational-map")).toBeTruthy();
        expect(view.getByText("Recent coordination activities")).toBeTruthy();
        await fireEvent.press(view.getByTestId("overview-allocate-relief"));
        expect(mockedPush).toHaveBeenCalledWith(emergencyCoordinationRoutes.allocateReliefResources);
        await fireEvent.press(view.getByTestId("overview-dashboard"));
        expect(mockedPush).toHaveBeenCalledWith(emergencyCoordinationRoutes.activeEmergency);
    });
});
