export type EmergencyStatus = "draft" | "active" | "stood_down";

export type Emergency = {
  id: string;
  title: string;
  status: EmergencyStatus;
  issuedAt?: string;
  expiresAt?: string;
};
