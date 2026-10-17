import { supabase } from "@/lib/supabase";
import { getAnalyticsData } from "@/src/features/hazard-assessment/api/analytics";

jest.mock("@/lib/supabase", () => ({ supabase: { from: jest.fn() } }));

function resolvedQuery(result: unknown) {
  const query: Record<string, unknown> = {};
  for (const method of ["select", "order", "eq", "gte", "in"]) query[method] = jest.fn(() => query);
  query.then = (resolve: (value: unknown) => unknown, reject?: (error: unknown) => unknown) => Promise.resolve(result).then(resolve, reject);
  return query;
}

describe("analytics API", () => {
  it("loads operational tables and returns empty typed collections", async () => {
    const tables = ["emergency_events", "emergency_shelters", "hazard_warnings", "hazards", "relief_resources", "relief_allocations", "rescue_teams", "rescue_dispatches"];
    (supabase.from as jest.Mock).mockImplementation(() => resolvedQuery({ data: [], error: null }));
    await expect(getAnalyticsData("7 days")).resolves.toEqual({
      events: [], locations: [], priorityNeeds: [], updates: [], shelters: [], warnings: [], hazards: [], resources: [], allocations: [], rescueTeams: [], rescueDispatches: [],
    });
    expect(supabase.from).toHaveBeenCalledTimes(tables.length);
    for (const table of tables) expect(supabase.from).toHaveBeenCalledWith(table);
  });

  it("propagates Supabase query errors", async () => {
    (supabase.from as jest.Mock).mockImplementation(() => resolvedQuery({ data: null, error: new Error("Permission denied") }));
    await expect(getAnalyticsData("Today")).rejects.toThrow("Permission denied");
  });
});
