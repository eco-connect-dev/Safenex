import { supabase } from "@/lib/supabase";
import type { GroundReport, GroundReportStatus } from "./types";

type HazardRow = {
  id: string;
  hazard_type: string;
  title: string;
  description: string;
  severity: string;
  location: string;
  district: string;
  affected_people: number;
  review_status: "pending_review" | "accepted" | "rejected";
  image_url: string | null;
  source: string;
  created_at: string;
};

function toGroundReport(row: HazardRow): GroundReport {
  const submittedAt = new Date(row.created_at);
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - submittedAt.getTime()) / 60_000));
  const relativeTime = elapsedMinutes < 60
    ? `${elapsedMinutes} min ago`
    : `${Math.floor(elapsedMinutes / 60)} hr ago`;

  return {
    id: row.id,
    title: row.title,
    hazardType: row.hazard_type.charAt(0).toUpperCase() + row.hazard_type.slice(1),
    location: `${row.location}, ${row.district}`,
    description: row.description,
    submitted: submittedAt.toLocaleString(),
    relativeTime,
    reporter: row.source === "citizen" ? "Citizen reporter" : row.source,
    role: "Community report",
    contact: "Not provided",
    status: row.review_status,
    evidenceLabel: row.image_url ? "Hazard site photo" : "No image attached",
    imageUrl: row.image_url,
    severity: row.severity,
    affectedPeople: row.affected_people,
  };
}

export async function getGroundReports() {
  const { data, error } = await supabase
    .from("hazards")
    .select("id,hazard_type,title,description,severity,location,district,affected_people,review_status,image_url,source,created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as HazardRow[]).map(toGroundReport);
}

export async function getGroundReport(id: string) {
  const { data, error } = await supabase
    .from("hazards")
    .select("id,hazard_type,title,description,severity,location,district,affected_people,review_status,image_url,source,created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toGroundReport(data as HazardRow) : null;
}

export async function updateGroundReport(
  id: string,
  changes: { reviewStatus?: GroundReportStatus; imageUrl?: string | null },
) {
  const update: { review_status?: string; image_url?: string | null } = {};
  if (changes.reviewStatus) update.review_status = changes.reviewStatus;
  if (changes.imageUrl !== undefined) update.image_url = changes.imageUrl;

  const { data, error } = await supabase
    .from("hazards")
    .update(update)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Sign in as a community volunteer to update this report.");
}
