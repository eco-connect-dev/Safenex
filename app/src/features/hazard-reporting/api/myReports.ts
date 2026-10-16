import { supabase } from "@/lib/supabase";
import type { GroundReportStatus } from "../../ground-verification/types";

export type MyGroundReport = {
  id: string;
  title: string;
  hazardType: string;
  location: string;
  district: string;
  submittedAt: string;
  status: GroundReportStatus;
};

export async function getMyGroundReports(): Promise<MyGroundReport[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("Sign in to view your submitted reports.");

  const { data, error } = await supabase
    .from("hazards")
    .select("id,title,hazard_type,location,district,created_at,review_status")
    .eq("reporter_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    hazardType: row.hazard_type,
    location: row.location,
    district: row.district,
    submittedAt: row.created_at,
    status: row.review_status as GroundReportStatus,
  }));
}
