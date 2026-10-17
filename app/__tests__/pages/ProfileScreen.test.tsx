import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

import ProfileScreen from "@/src/features/profile/screens/ProfileScreen";
import { getMyProfile, saveMyProfile } from "@/src/features/profile/api";

jest.mock("@/src/components/web/DmcWebShell", () => ({ DmcWebShell: ({ children }: { children: React.ReactNode }) => children }));
jest.mock("@/src/features/profile/api", () => ({ getMyProfile: jest.fn(), saveMyProfile: jest.fn() }));

const profile = {
  id: "user-1", email: "citizen@example.com", full_name: "Asha Perera", phone: "0771234567",
  district: "Colombo", role: "citizen" as const,
};

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getMyProfile as jest.Mock).mockResolvedValue(profile);
    (saveMyProfile as jest.Mock).mockResolvedValue({ ...profile, full_name: "Asha Silva" });
  });

  it("loads profile details and displays the role as read-only", async () => {
    const view = await render(<ProfileScreen />);
    await waitFor(() => expect(view.getByDisplayValue("Asha Perera")).toBeTruthy());
    expect(view.getByDisplayValue("citizen@example.com").props.editable).toBe(false);
    expect(view.getByDisplayValue("Citizen").props.editable).toBe(false);
    expect(view.getByDisplayValue("Colombo")).toBeTruthy();
  });

  it("saves edited profile fields and shows confirmation", async () => {
    const view = await render(<ProfileScreen />);
    await waitFor(() => expect(view.getByDisplayValue("Asha Perera")).toBeTruthy());
    await fireEvent.changeText(view.getByDisplayValue("Asha Perera"), "Asha Silva");
    await fireEvent.press(view.getByText("Save changes"));
    await waitFor(() => expect(saveMyProfile).toHaveBeenCalledWith({ full_name: "Asha Silva", phone: "0771234567", district: "Colombo" }));
    expect(await view.findByText("Your profile details have been saved.")).toBeTruthy();
  });
});
