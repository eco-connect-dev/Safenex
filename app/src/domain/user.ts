export type UserRole = "citizen" | "volunteer" | "district_officer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
};
