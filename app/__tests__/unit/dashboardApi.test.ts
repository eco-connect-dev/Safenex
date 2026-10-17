import { supabase } from "@/lib/supabase";
import { getDashboardSummary } from "@/src/features/hazard-assessment/api/dashboard";
import type { AnalyticsData } from "@/src/features/hazard-assessment/api/analytics";

jest.mock("@/lib/supabase", () => ({ supabase: { from: jest.fn() } }));
jest.mock("@/src/features/hazard-assessment/api/analytics", () => ({ getAnalyticsData: jest.fn() }));

function resolvedQuery(result: unknown) {
  const query: Record<string, unknown> = {};
  for (const method of ["select", "eq", "order"]) query[method] = jest.fn(() => query);
  query.then = (resolve: (value: unknown) => unknown, reject?: (error: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return query;
}

const analytics: AnalyticsData = {
  events: [], locations: [], priorityNeeds: [], updates: [], shelters: [], warnings: [], hazards: [], resources: [], allocations: [], rescueTeams: [], rescueDispatches: [],
};

describe("dashboard API", () => {
  it("combines accepted hazard counts with operational dashboard records", async () => {
    const { getAnalyticsData } = jest.requireMock("@/src/features/hazard-assessment/api/analytics") as { getAnalyticsData: jest.Mock };
    getAnalyticsData.mockResolvedValue(analytics);
    let hazardQuery = 0;
    (supabase.from as jest.Mock).mockImplementation((table: string) => table === "hazards"
      ? resolvedQuery(hazardQuery++ === 0
        ? { data: [{ id: "h1", title: "River rise", severity: "high", location: "Hanwella", district: "Colombo", affected_people: 24, observed_at: "2026-10-17T00:00:00Z" }], error: null }
        : { data: null, count: 3, error: null })
      : resolvedQuery({ data: null, count: 0, error: null }));

    const result = await getDashboardSummary();
    expect(result).toMatchObject({ pendingReports: 3, exposedPeople: 24, priorityHazards: 1, activeHazards: [{ id: "h1" }] });
    expect(getAnalyticsData).toHaveBeenCalledWith("30 days");
  });
});
