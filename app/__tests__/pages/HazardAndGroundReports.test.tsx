import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { AffectedAreaScreen } from "@/src/features/hazard-assessment/screens/WebHazardWorkflowScreens";
import { GroundReportsScreen } from "@/src/features/ground-verification/screens/GroundVerificationScreens";
import { getActiveHazards } from "@/src/features/hazard-assessment/api/hazards";
import { getGroundReports } from "@/src/features/ground-verification/api";
import { HomeScreen, HazardTypeScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { useReportDraft } from "@/src/features/hazard-reporting/store/reportDraft";

jest.mock("expo-router", () => ({ router: { push: jest.fn() }, useLocalSearchParams: () => ({}) }));
jest.mock("@/lib/supabase", () => ({ supabase: { from: jest.fn() } }));
jest.mock("@/src/features/hazard-assessment/api/hazards", () => ({ getActiveHazards: jest.fn(), saveWarning: jest.fn() }));
jest.mock("@/src/features/ground-verification/api", () => ({ getGroundReports: jest.fn(), getGroundReport: jest.fn(), updateGroundReport: jest.fn() }));
jest.mock("expo-image-picker", () => ({}));
jest.mock("@/src/features/hazard-reporting/components/SriLankaLocationMap", () => ({ SriLankaLocationMap: () => null }));

describe("hazard assessment and ground reports pages", () => {
  beforeEach(() => jest.clearAllMocks());

  it("navigates from the citizen home into hazard reporting and stores the selected type", async () => {
    const navigation = { navigate: jest.fn(), goBack: jest.fn() };
    const home = await render(<HomeScreen navigation={navigation} route={{ key: "home", name: "MobileHome" }} />);
    await fireEvent.press(home.getByText("REPORT A HAZARD"));
    expect(navigation.navigate).toHaveBeenCalledWith("HazardType");

    useReportDraft.getState().reset();
    const picker = await render(<HazardTypeScreen navigation={navigation} route={{ key: "hazard-type", name: "HazardType" }} />);
    await fireEvent.press(picker.getByText("Flood"));
    expect(useReportDraft.getState().hazardType).toBe("flood");
    await fireEvent.press(picker.getByText("CONTINUE"));
    expect(navigation.navigate).toHaveBeenCalledWith("IncidentDetails");
  });

  it("loads hazard evidence from the active hazard API for area selection", async () => {
    (getActiveHazards as jest.Mock).mockResolvedValue([{
      id: "h1", hazard_type: "flood", title: "Kelani River flood watch", description: "River rising",
      severity: "high", review_status: "accepted", location: "Hanwella", district: "Colombo",
      affected_people: 1240, water_level_m: 4.8, rainfall_mm_hr: 90, slope_displacement_mm: null,
      observed_at: "2026-10-17T08:00:00Z",
    }]);
    const view = await render(<AffectedAreaScreen />);
    await waitFor(() => expect(view.getAllByText("Kelani River flood watch").length).toBeGreaterThan(0));
    expect(view.getByText("DATABASE HAZARD SUMMARY")).toBeTruthy();
    expect(getActiveHazards).toHaveBeenCalled();
  });

  it("shows citizen reports and pending review count in the verification queue", async () => {
    (getGroundReports as jest.Mock).mockResolvedValue([{
      id: "r1", title: "Slope movement near Kandy Road", hazardType: "Landslide",
      location: "Kandy Road, Kandy", description: "Cracks appeared", submitted: "17/10/2026",
      relativeTime: "5 min ago", reporter: "Citizen reporter", role: "Community report",
      contact: "Not provided", status: "pending_review", evidenceLabel: "Hazard site photo",
      imageUrl: "https://example.test/hazard.jpg", severity: "high", affectedPeople: 20,
    }]);
    const view = await render(<GroundReportsScreen navigation={{ navigate: jest.fn() }} route={{ key: "reports", name: "GroundReports", params: undefined }} />);
    await waitFor(() => expect(view.getByText("Pending review")).toBeTruthy());
    expect(view.getByText(/1 reports pending verification/)).toBeTruthy();
  });
});
