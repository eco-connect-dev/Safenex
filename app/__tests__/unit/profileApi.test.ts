import { supabase } from "@/lib/supabase";
import { getMyProfile, saveMyProfile } from "@/src/features/profile/api";

jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  },
}));

const authUser = { id: "user-1", email: "asha@example.com", user_metadata: { full_name: "Metadata Name" } };
const profileRow = { id: "user-1", full_name: "Asha Perera", phone: "0771", district: "Colombo", role: "volunteer" };

describe("profile API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns profile information joined with the authenticated email", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: authUser }, error: null });
    const maybeSingle = jest.fn().mockResolvedValue({ data: profileRow, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    (supabase.from as jest.Mock).mockReturnValue({ select });

    await expect(getMyProfile()).resolves.toEqual({ ...profileRow, email: "asha@example.com" });
  });

  it("requires an authenticated user", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null }, error: null });
    await expect(getMyProfile()).rejects.toThrow("Sign in to view and edit your profile.");
  });

  it("rejects an empty name before writing", async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: authUser }, error: null });
    await expect(saveMyProfile({ full_name: "   ", phone: "", district: "" })).rejects.toThrow("Enter your full name");
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
