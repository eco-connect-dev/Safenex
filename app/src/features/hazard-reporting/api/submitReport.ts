import { supabase } from "@/lib/supabase";
import type { ReportImage, ReportHazardType } from "../store/reportDraft";

export const HAZARD_REPORT_IMAGE_BUCKET = "hazard-report-images";

export type SubmitGroundReportInput = {
  hazardType: ReportHazardType;
  description: string;
  location: string;
  district: string;
  image: ReportImage | null;
};

function decodeBase64(value: string) {
  const binary = globalThis.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function makeId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (part) => {
    const random = Math.floor(Math.random() * 16);
    return (part === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export async function submitGroundReport(input: SubmitGroundReportInput) {
  const id = makeId();
  let imageUrl: string | null = null;
  let uploadedPath: string | null = null;

  if (input.image) {
    const extension =
      input.image.fileName.split(".").pop()?.toLowerCase() || "jpg";
    const imagePath = `${id}/${makeId()}.${extension}`;
    uploadedPath = imagePath;
    const { error: uploadError } = await supabase.storage
      .from(HAZARD_REPORT_IMAGE_BUCKET)
      .upload(imagePath, decodeBase64(input.image.base64), {
        contentType: input.image.mimeType,
        upsert: false,
      });
    if (uploadError) throw uploadError;
    imageUrl = supabase.storage
      .from(HAZARD_REPORT_IMAGE_BUCKET)
      .getPublicUrl(imagePath).data.publicUrl;
  }

  const title = `${input.hazardType[0].toUpperCase()}${input.hazardType.slice(1)} reported at ${input.location}`;
  const { data, error } = await supabase
    .from("hazards")
    .insert({
      id,
      hazard_type: input.hazardType,
      title,
      description: input.description.trim(),
      severity: "moderate",
      location: input.location.trim(),
      district: input.district.trim(),
      affected_people: 0,
      status: "active",
      source: "citizen",
      review_status: "pending_review",
      image_url: imageUrl,
    })
    .select("id")
    .single();

  if (error) {
    if (uploadedPath)
      await supabase.storage
        .from(HAZARD_REPORT_IMAGE_BUCKET)
        .remove([uploadedPath]);
    throw error;
  }
  return data.id as string;
}
