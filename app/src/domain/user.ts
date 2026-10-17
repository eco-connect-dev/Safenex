export type UserRole = "citizen" | "volunteer" | "duty_officer" | "district_officer" | "dmc_officer" | "dmc_analyst";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
};
