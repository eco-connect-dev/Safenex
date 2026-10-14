export type GroundReportStatus = "pending" | "approved" | "rejected";

export type GroundReport = {
  id: string;
  hazardType: string;
  location: string;
  description: string;
  submitted: string;
  relativeTime: string;
  reporter: string;
  role: string;
  contact: string;
  status: GroundReportStatus;
  evidenceLabel: string;
};
