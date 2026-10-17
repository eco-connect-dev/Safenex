import { supabase } from "@/lib/supabase";
import { getActiveHazards, saveWarning } from "@/src/features/hazard-assessment/api/hazards";
import { getGroundReport, getGroundReports, updateGroundReport } from "@/src/features/ground-verification/api";
import { getMyGroundReports } from "@/src/features/hazard-reporting/api/myReports";
import { submitGroundReport } from "@/src/features/hazard-reporting/api/submitReport";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

function queryBuilder(result: unknown) {
  const builder: Record<string, jest.Mock> = {};
  for (const method of ["select", "eq", "order", "update", "insert"]) {
    builder[method] = jest.fn(() => builder);
  }
  builder.maybeSingle = jest.fn().mockResolvedValue(result);
  builder.single = jest.fn().mockResolvedValue(result);
  builder.then = jest.fn((resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve));
  return builder;
}

describe("feature API modules", () => {
  beforeEach(() => jest.clearAllMocks());

  it("fetches only accepted active hazards and saves warnings", async () => {
    const hazard = { id: "h1", title: "River rising", review_status: "accepted" };
    const builder = queryBuilder({ data: [hazard], error: null });
    (supabase.from as jest.Mock).mockReturnValue(builder);
    await expect(getActiveHazards()).resolves.toEqual([hazard]);
    expect(builder.eq).toHaveBeenNthCalledWith(1, "status", "active");
    expect(builder.eq).toHaveBeenNthCalledWith(2, "review_status", "accepted");

    const inserted = { id: "w1", status: "issued" };
    const insertBuilder = queryBuilder({ data: inserted, error: null });
    (supabase.from as jest.Mock).mockReturnValue(insertBuilder);
    const warning = { hazard_id: "h1", tier: 2, title: "Flood alert", message: "Move to safety", language: "en", status: "issued" as const, target_location: "Colombo", affected_people: 5, channels: ["sms"] };
    await expect(saveWarning(warning)).resolves.toEqual(inserted);
    expect(insertBuilder.insert).toHaveBeenCalledWith(warning);
  });

  it("maps ground reports and updates review status", async () => {
    const row = { id: "h2", hazard_type: "flood", title: "Flood report", description: "Water rising", severity: "high", location: "Hanwella", district: "Colombo", affected_people: 30, review_status: "pending_review", image_url: null, source: "citizen", created_at: new Date().toISOString() };
    const listBuilder = queryBuilder({ data: [row], error: null });
    (supabase.from as jest.Mock).mockReturnValue(listBuilder);
    const reports = await getGroundReports();
    expect(reports[0]).toMatchObject({ id: "h2", hazardType: "Flood", reporter: "Citizen reporter", evidenceLabel: "No image attached" });

    const singleBuilder = queryBuilder({ data: row, error: null });
    (supabase.from as jest.Mock).mockReturnValue(singleBuilder);
    await expect(getGroundReport("h2")).resolves.toMatchObject({ id: "h2", status: "pending_review" });

    const updateBuilder = queryBuilder({ data: { id: "h2" }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(updateBuilder);
    await expect(updateGroundReport("h2", { reviewStatus: "accepted" })).resolves.toBeUndefined();
    expect(updateBuilder.update).toHaveBeenCalledWith({ review_status: "accepted" });
  });

  it("loads a user's reports and prevents unauthenticated report access", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const builder = queryBuilder({ data: [{ id: "h3", title: "Slope movement", hazard_type: "landslide", location: "Kandy Road", district: "Kandy", created_at: "2026-10-17T00:00:00Z", review_status: "accepted" }], error: null });
    (supabase.from as jest.Mock).mockReturnValue(builder);
    await expect(getMyGroundReports()).resolves.toMatchObject([{ id: "h3", hazardType: "landslide", status: "accepted" }]);
    expect(builder.eq).toHaveBeenCalledWith("reporter_id", "u1");

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
    await expect(getMyGroundReports()).rejects.toThrow("Sign in to view your submitted reports.");
  });

  it("requires authentication before creating a citizen report", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
    await expect(submitGroundReport({ hazardType: "flood", description: "Flooding", location: "Hanwella", district: "Colombo", latitude: null, longitude: null, image: null })).rejects.toThrow("Sign in to submit and track your ground report.");
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("persists an authenticated report with pending review status", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: "citizen-1" } }, error: null });
    const builder = queryBuilder({ data: { id: "report-1" }, error: null });
    (supabase.from as jest.Mock).mockReturnValue(builder);
    await expect(submitGroundReport({
      hazardType: "flood", description: "  Water is rising  ", location: "  Hanwella  ", district: " Colombo ",
      latitude: null, longitude: null, image: null,
    })).resolves.toBe("report-1");
    expect(supabase.from).toHaveBeenCalledWith("hazards");
    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
      reporter_id: "citizen-1", title: "Flood reported at   Hanwella  ", description: "Water is rising",
      location: "Hanwella", district: "Colombo", review_status: "pending_review", source: "citizen", image_url: null,
    }));
  });
});
