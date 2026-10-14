export type ReportStatus =
  "submitted" | "under_review" | "verified" | "resolved";

export type Report = {
  id: string;
  hazardId?: string;
  reporterId: string;
  status: ReportStatus;
  createdAt: string;
};
