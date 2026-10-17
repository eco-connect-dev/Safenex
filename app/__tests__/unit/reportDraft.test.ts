import { useReportDraft } from "@/src/features/hazard-reporting/store/reportDraft";

describe("citizen report draft store", () => {
  beforeEach(() => useReportDraft.getState().reset());

  it("updates hazard details and attached evidence together", () => {
    useReportDraft.getState().setDraft({ hazardType: "flood", description: "Water rising", location: "Hanwella", district: "Colombo" });
    expect(useReportDraft.getState()).toMatchObject({ hazardType: "flood", description: "Water rising", location: "Hanwella", district: "Colombo" });
    useReportDraft.getState().setDraft({ image: { uri: "file://image.jpg", base64: "YQ==", mimeType: "image/jpeg", fileName: "evidence.jpg" } });
    expect(useReportDraft.getState().image?.fileName).toBe("evidence.jpg");
  });

  it("resets the draft after submission", () => {
    useReportDraft.getState().setDraft({ hazardType: "other", description: "Storm damage", submittedId: "report-9" });
    useReportDraft.getState().reset();
    expect(useReportDraft.getState()).toMatchObject({ hazardType: "landslide", description: "", location: "", district: "", image: null, submittedId: null });
  });
});
