import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import DashboardWebScreen from "@/app/dashboard.web";
import { getDashboardSummary } from "@/src/features/hazard-assessment/api/dashboard";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@/src/components/web/DmcWebShell", () => ({ DmcWebShell: ({ children }: { children: React.ReactNode }) => children }));
jest.mock("@/src/features/hazard-assessment/api/dashboard", () => ({ getDashboardSummary: jest.fn() }));

const summary = {
  activeHazards: [], pendingReports: 4, issuedWarnings: 2, exposedPeople: 120, priorityHazards: 0,
  activeEvents: [], eventPeopleAffected: 0, shelterCount: 0, shelterOccupancy: 0, shelterCapacity: 0,
  rescueTeamCount: 0, availableRescueTeams: 0, rescueDispatchCount: 0, reliefResourceCount: 0,
  reliefAllocationCount: 0, allocatedReliefQuantity: 0, priorityNeedCount: 0, operationalUpdateCount: 0,
  mappedLocationCount: 0, recentWarnings: [], recentUpdates: [], recentAllocations: [], recentDispatches: [],
  shelters: [], rescueTeams: [], reliefResources: [], priorityNeeds: [], epicenters: [],
};

describe("Dashboard page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDashboardSummary as jest.Mock).mockResolvedValue(summary);
  });

  it("renders backend summary values across dashboard sections", async () => {
    const view = await render(<DashboardWebScreen />);
    await waitFor(() => expect(getDashboardSummary).toHaveBeenCalled());
    expect(await view.findByText("Operations Dashboard")).toBeTruthy();
    expect(view.getByText("Pending ground reports")).toBeTruthy();
    expect(view.getByText("Warnings issued")).toBeTruthy();
    expect(view.getByText("4", { exact: true })).toBeTruthy();
  });
});
