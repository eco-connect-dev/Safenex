import { create } from "zustand";

export type ReportHazardType = "landslide" | "flood" | "other";
export type ReportImage = {
  uri: string;
  base64: string;
  mimeType: string;
  fileName: string;
};

type ReportDraft = {
  hazardType: ReportHazardType;
  description: string;
  location: string;
  district: string;
  image: ReportImage | null;
  submittedId: string | null;
  setDraft: (draft: Partial<ReportDraft>) => void;
  reset: () => void;
};

const initialDraft = {
  hazardType: "landslide" as ReportHazardType,
  description: "",
  location: "",
  district: "",
  image: null,
  submittedId: null,
};

export const useReportDraft = create<ReportDraft>((set) => ({
  ...initialDraft,
  setDraft: (draft) => set(draft),
  reset: () => set(initialDraft),
}));
