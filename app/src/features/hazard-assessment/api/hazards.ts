import { supabase } from "@/lib/supabase";

export type HazardRecord = {
  id: string;
  hazard_type: "flood" | "landslide" | "storm" | "fire" | "other";
  title: string;
  description: string;
  severity: "low" | "moderate" | "high" | "critical";
  review_status: "pending_review" | "accepted" | "rejected";
  location: string;
  district: string;
  affected_people: number;
  water_level_m: number | null;
  rainfall_mm_hr: number | null;
  slope_displacement_mm: number | null;
  observed_at: string;
};

export type WarningInput = {
  hazard_id: string;
  tier: number;
  title: string;
  message: string;
  language: string;
  status: "draft" | "issued";
  target_location: string;
  affected_people: number;
  channels: string[];
  issued_by?: string | null;
  issued_at?: string | null;
};

export async function getActiveHazards() {
  const { data, error } = await supabase
    .from("hazards")
    .select("id,hazard_type,title,description,severity,review_status,location,district,affected_people,water_level_m,rainfall_mm_hr,slope_displacement_mm,observed_at")
    .eq("status", "active")
    .eq("review_status", "accepted")
    .order("observed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as HazardRecord[];
}

export async function saveWarning(input: WarningInput) {
  const { data, error } = await supabase
    .from("hazard_warnings")
    .insert(input)
    .select("id,status,created_at,issued_at")
    .single();
  if (error) throw error;
  return data;
}
