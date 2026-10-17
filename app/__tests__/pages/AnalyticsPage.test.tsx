import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import AnalyticsWebScreen from "@/app/analytics.web";
import { getAnalyticsData } from "@/src/features/hazard-assessment/api/analytics";

jest.mock("@/src/components/web/DmcWebShell", () => ({ DmcWebShell: ({ children }: { children: React.ReactNode }) => children }));
jest.mock("@/src/features/hazard-assessment/api/analytics", () => ({ getAnalyticsData: jest.fn() }));

const emptyData = {
  events: [], locations: [], priorityNeeds: [], updates: [], shelters: [], warnings: [], hazards: [],
  resources: [], allocations: [], rescueTeams: [], rescueDispatches: [],
};

describe("Analytics page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAnalyticsData as jest.Mock).mockResolvedValue(emptyData);
  });

  it("loads the live operational summary and report controls", async () => {
    const view = await render(<AnalyticsWebScreen />);
    await waitFor(() => expect(getAnalyticsData).toHaveBeenCalledWith("Today"));
    expect(await view.findByText("Analytics & Reports")).toBeTruthy();
    expect(view.getByText("Download PDF")).toBeTruthy();
    expect(view.getByText("Active emergency events")).toBeTruthy();
  });

  it("shows a readable error when the backend request fails", async () => {
    (getAnalyticsData as jest.Mock).mockRejectedValueOnce(new Error("Network unavailable"));
    const view = await render(<AnalyticsWebScreen />);
    expect(await view.findByText(/Unable to load analytics: Network unavailable/)).toBeTruthy();
  });
});
