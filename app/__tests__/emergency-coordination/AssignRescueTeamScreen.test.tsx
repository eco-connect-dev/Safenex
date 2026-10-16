import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";

import { AssignRescueTeamScreen } from "@/src/features/emergency-coordination/screens/AssignRescueTeamScreen";
import { useActiveEmergency } from "@/src/features/emergency-coordination/hooks/useActiveEmergency";
import { emergencyCoordinationRoutes } from "@/src/features/emergency-coordination/routes";
import { createRescueDispatch, dispatchRescueTeam, getRescueDispatches, getRescueTeams, resetInMemoryRescueTeams } from "@/src/features/emergency-coordination/services/emergencyCoordinationService";
import { sampleActiveEmergency } from "@/src/features/emergency-coordination/sampleData";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/src/features/emergency-coordination/hooks/useActiveEmergency", () => ({ useActiveEmergency: jest.fn() }));
jest.mock("@/src/features/emergency-coordination/services/emergencyCoordinationService", () => {
    const actual = jest.requireActual("@/src/features/emergency-coordination/services/emergencyCoordinationService");
    return {
        ...actual,
        fetchRescueTeams: jest.fn(async () => actual.getRescueTeams()),
        createRescueDispatch: jest.fn(async (input: Parameters<typeof actual.dispatchRescueTeam>[0]) => actual.dispatchRescueTeam(input)),
    };
});

const mockedPush = router.push as jest.Mock;
const mockedUseActiveEmergency = useActiveEmergency as jest.MockedFunction<typeof useActiveEmergency>;

describe("AssignRescueTeamScreen", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetInMemoryRescueTeams();
        mockedUseActiveEmergency.mockReturnValue({ data: sampleActiveEmergency, source: "sample", loading: false, refreshing: false, error: null, refresh: jest.fn(), retry: jest.fn() });
    });

    it("renders availability, supports dispatch details and returns to the dashboard", async () => {
        await render(<AssignRescueTeamScreen />);
        expect(screen.getByTestId("assign-rescue-team-screen")).toBeTruthy();
        expect(screen.getByTestId("team-row-RT-01")).toHaveTextContent(/Available/);
        expect(screen.getByTestId("team-row-RT-03")).toHaveTextContent(/On mission/);
        expect(screen.queryByTestId("select-RT-03")).toBeNull();

        await fireEvent.press(screen.getByTestId("select-RT-02"));
        await fireEvent.press(screen.getByTestId("target-location-trigger"));
        await waitFor(() => expect(screen.getByTestId("target-location-menu")).toBeTruthy());
        await fireEvent.press(screen.getByTestId("location-Mawanella"));
        await fireEvent.changeText(screen.getByTestId("mission-details"), "Assist local evacuation.");
        await fireEvent.press(screen.getByTestId("dispatch-team"));
        await waitFor(() => expect(getRescueDispatches()).toHaveLength(1));
        expect(createRescueDispatch).toHaveBeenCalledWith({ teamId: "RT-02", targetLocation: "Mawanella", missionDetails: "Assist local evacuation." }, undefined);
        expect(getRescueDispatches()[0]).toMatchObject({ teamId: "RT-02", targetLocation: "Mawanella", missionDetails: "Assist local evacuation." });
        expect(getRescueTeams().find((team) => team.id === "RT-02")?.status).toBe("Dispatched");

        await fireEvent.press(screen.getByTestId("cancel-dispatch"));
        expect(mockedPush).toHaveBeenCalledWith(emergencyCoordinationRoutes.activeEmergency);
    });

    it("rejects dispatching an unavailable team", () => {
        expect(() => dispatchRescueTeam({ teamId: "RT-03", targetLocation: "Kegalle", missionDetails: "Check access." })).toThrow("RT-03 is not available for dispatch.");
        expect(getRescueDispatches()).toHaveLength(0);
    });
});
