import { ArrowLeft, ArrowRight, Image, Search } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Image as RNImage,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Badge, Button, Card, Icon, Notice } from "@/src/components/ui";
import type { WebRootDrawerParamList } from "@/src/app/navigation/RootNavigator.web";
import { colors, radii, spacing, typography } from "@/src/theme";
import { getGroundReport, getGroundReports, updateGroundReport } from "../api";
import type { GroundReport } from "../types";

type WebNavigation = {
  navigate<Route extends keyof WebRootDrawerParamList>(
    route: Route,
    params?: WebRootDrawerParamList[Route],
  ): void;
};

type Props<Route extends keyof WebRootDrawerParamList> = {
  navigation: WebNavigation;
  route: {
    key: string;
    name: Route;
    params: WebRootDrawerParamList[Route];
  };
};

export function GroundReportsScreen({ navigation }: Props<"GroundReports">) {
  const [query, setQuery] = useState("");
  const [hazardFilter, setHazardFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [reports, setReports] = useState<GroundReport[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    getGroundReports()
      .then((items) => { if (mounted) { setReports(items); setLoadError(""); } })
      .catch((error: Error) => { if (mounted) setLoadError(error.message); });
    return () => { mounted = false; };
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesQuery =
        !normalizedQuery ||
        [report.hazardType, report.location, report.reporter].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
      const matchesHazard =
        hazardFilter === "All" || report.hazardType === hazardFilter;
      const matchesLocation =
        locationFilter === "All" || report.location.includes(locationFilter);
      return (
        matchesQuery && matchesHazard && matchesLocation && dateFilter === "All"
      );
    });
  }, [dateFilter, hazardFilter, locationFilter, query, reports]);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.pageContent}>
        <View>
          <Text style={styles.title}>Citizen Hazard Reports</Text>
          <Text style={styles.subtitle}>
            Review citizen evidence before making a verification decision.
          </Text>
        </View>

        <Notice
          message={`${reports.filter((report) => report.status === "pending_review").length} reports pending verification · Accepted reports become available to hazard assessment.`}
          title="Ground verification queue"
          tone="warning"
        />

        <Card style={styles.listCard}>
          <Text style={styles.sectionTitle}>Ground reports</Text>
          <View style={styles.filters}>
            <View style={styles.searchWrap}>
              <Icon color={colors.textMuted} icon={Search} size={18} />
              <TextInput
                onChangeText={setQuery}
                placeholder="Search reports, location, reporter..."
                placeholderTextColor={colors.textMuted}
                style={styles.search}
                value={query}
              />
            </View>
            <FilterButton
              label={hazardFilter === "All" ? "Hazard type" : hazardFilter}
              onPress={() =>
                setHazardFilter(hazardFilter === "All" ? "Landslide" : "All")
              }
            />
            <FilterButton
              label={locationFilter === "All" ? "Location" : locationFilter}
              onPress={() =>
                setLocationFilter(locationFilter === "All" ? "Kandy" : "All")
              }
            />
            <FilterButton
              label={dateFilter === "All" ? "Date" : dateFilter}
              onPress={() =>
                setDateFilter(dateFilter === "All" ? "Recent" : "All")
              }
            />
            <Button label="List" size="sm" />
            <Button label="Map" size="sm" variant="outline" />
          </View>

          <View style={styles.reportList}>
            {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
            {filteredReports.map((report) => (
              <ReportListCard
                key={report.id}
                onReview={() =>
                  navigation.navigate("VerifyReport", { reportId: report.id })
                }
                report={report}
              />
            ))}
            {filteredReports.length === 0 ? (
                <Text style={styles.empty}>
                No reports match the current filters.
              </Text>
            ) : null}
          </View>
        </Card>
        <Text style={styles.footer}>
          Showing {filteredReports.length} citizen hazard reports · DMC duty
          officer verification queue
        </Text>
      </ScrollView>
    </View>
  );
}

function FilterButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.filterButton}>
      <Text style={styles.filterLabel}>{label}</Text>
      <Text style={styles.chevron}>⌄</Text>
    </Pressable>
  );
}

function ReportListCard({
  report,
  onReview,
}: {
  report: GroundReport;
  onReview: () => void;
}) {
  return (
    <View style={styles.reportRow}>
      <View style={styles.reportThumbnail}>
        {report.imageUrl ? <RNImage resizeMode="cover" source={{ uri: report.imageUrl }} style={styles.reportImage} /> : <>
          <View style={styles.thumbnailSky} />
          <View style={styles.thumbnailLand} />
          <Text style={styles.thumbnailTag}>NO PHOTO</Text>
        </>}
      </View>
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle}>
          {report.hazardType} — {report.location}
        </Text>
        <Text style={styles.reportMeta}>
          {report.title} · {report.severity.toUpperCase()} · {report.affectedPeople.toLocaleString()} people
        </Text>
        <Text style={styles.reportMeta}>Submitted {report.submitted} · {report.relativeTime} · {report.reporter}</Text>
      </View>
      <View style={styles.reportActions}>
        <Badge label={report.status === "accepted" ? "Accepted" : report.status === "rejected" ? "Rejected" : "Pending review"} tone={report.status === "accepted" ? "success" : report.status === "rejected" ? "danger" : "warning"} />
        <Button
          label="Review report"
          icon={ArrowRight}
          onPress={onReview}
          size="md"
        />
      </View>
    </View>
  );
}

export function VerifyReportScreen({
  navigation,
  route,
}: Props<"VerifyReport">) {
  const [report, setReport] = useState<GroundReport | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<"accepted" | "rejected" | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getGroundReport(route.params.reportId)
      .then((item) => {
        if (mounted) {
          setReport(item);
          setImageUrl(item?.imageUrl ?? "");
          setDecision(item?.status === "accepted" || item?.status === "rejected" ? item.status : null);
          if (!item) setLoadError("This report could not be found.");
        }
      })
      .catch((error: Error) => { if (mounted) setLoadError(error.message); });
    return () => { mounted = false; };
  }, [route.params.reportId]);

  const saveImageUrl = async () => {
    if (!report) return;
    const trimmedUrl = imageUrl.trim();
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      setSaveMessage("Enter a valid http or https image URL.");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      await updateGroundReport(report.id, { imageUrl: trimmedUrl || null });
      setReport({ ...report, imageUrl: trimmedUrl || null, evidenceLabel: trimmedUrl ? "Hazard site photo" : "No image attached" });
      setSaveMessage("Image URL saved to Supabase.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Could not save the image URL.");
    } finally {
      setSaving(false);
    }
  };

  const saveDecision = async (nextDecision: "accepted" | "rejected") => {
    if (!report) return;
    setSaving(true);
    setSaveMessage("");
    try {
      await updateGroundReport(report.id, { reviewStatus: nextDecision });
      setDecision(nextDecision);
      setReport({ ...report, status: nextDecision });
      setSaveMessage(`Report ${nextDecision} and saved to Supabase.`);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Could not save the review decision.");
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async () => {
    if (!report) return;
    setSaving(true);
    setSaveMessage("");
    try {
      await updateGroundReport(report.id, { imageUrl: null });
      setImageUrl("");
      setReport({ ...report, imageUrl: null, evidenceLabel: "No image attached" });
      setSaveMessage("Image removed.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Could not remove the image.");
    } finally {
      setSaving(false);
    }
  };

  if (!report) {
    return (
      <View style={styles.page}>
        <Text style={styles.empty}>{loadError || "Loading report…"}</Text>
        <Button
          label="Back to pending reports"
          onPress={() => navigation.navigate("GroundReports")}
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.detailPage}>
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.title}>Verify Ground Report</Text>
          <Text style={styles.subtitle}>
            Review the description and evidence before recording your decision.
          </Text>
        </View>
        <Badge label={report.status === "accepted" ? "Accepted" : report.status === "rejected" ? "Rejected" : "Pending review"} tone={report.status === "accepted" ? "success" : report.status === "rejected" ? "danger" : "warning"} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Incident details</Text>
        <Text style={styles.incidentTitle}>{report.location}</Text>
        <Text style={styles.description}>{report.description}</Text>
        <DetailLine
          label="Submitted"
          value={`${report.submitted} · ${report.relativeTime}`}
        />
        <DetailLine
          label="Reporter"
          value={`${report.reporter} · ${report.role}`}
        />
        <DetailLine label="Contact" value={report.contact} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Evidence</Text>
        <View style={styles.largeEvidence}>
          {report.imageUrl ? <RNImage resizeMode="cover" source={{ uri: report.imageUrl }} style={styles.evidenceImage} /> : <>
            <View style={styles.thumbnailSky} />
            <View style={styles.thumbnailLand} />
            <Text style={styles.thumbnailTag}>{report.evidenceLabel.toUpperCase()}</Text>
            <View style={styles.imageIcon}><Icon color={colors.white} icon={Image} size={18} /></View>
          </>}
        </View>
        <Text style={styles.inputLabel}>Hazard place image URL</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} keyboardType="url" onChangeText={setImageUrl} placeholder="https://example.com/hazard-photo.jpg" placeholderTextColor={colors.textMuted} style={styles.imageUrlInput} value={imageUrl} />
        <View style={styles.imageActions}>
          <Button disabled={saving} label={saving ? "Saving…" : "Save image URL"} onPress={() => void saveImageUrl()} size="sm" />
          {imageUrl ? <Button disabled={saving} label="Remove image" onPress={() => void removeImage()} size="sm" variant="outline" /> : null}
        </View>
        {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Verification decision</Text>
        <Text style={styles.inputLabel}>Officer notes / rationale</Text>
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Add context for the verification record..."
          placeholderTextColor={colors.textMuted}
          style={styles.notes}
          value={notes}
        />
        <Notice
          message="If evidence is insufficient, reject the report with a clear reason so the reporter can provide better information."
          tone="warning"
        />
        {decision ? (
          <Notice
            message={`Report marked ${decision}.`}
            tone={decision === "accepted" ? "success" : "danger"}
          />
        ) : null}
        <View style={styles.decisionActions}>
          <Button
            label="Reject report"
            disabled={saving}
            onPress={() => void saveDecision("rejected")}
            variant="outline"
          />
          <Button
            label="Accept report"
            disabled={saving}
            onPress={() => void saveDecision("accepted")}
          />
        </View>
      </Card>

      <Pressable
        onPress={() => navigation.navigate("GroundReports")}
        style={styles.backLink}
      >
        <Icon color={colors.primary} icon={ArrowLeft} size={17} />
        <Text style={styles.backLinkText}>Back to pending reports</Text>
      </Pressable>
    </ScrollView>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  pageContent: {
    gap: spacing.xl,
    maxWidth: 1480,
    padding: spacing.xxl,
    width: "100%",
  },
  title: {
    color: colors.navy,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
  },
  subtitle: {
    color: "#6B829C",
    fontSize: typography.sizes.md,
    marginTop: spacing.sm,
  },
  listCard: { gap: spacing.xl, padding: spacing.xl },
  sectionTitle: {
    color: colors.navy,
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  filters: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  searchWrap: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minWidth: 260,
    paddingHorizontal: spacing.md,
  },
  search: {
    color: colors.text,
    flex: 1,
    fontSize: typography.sizes.md,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  filterButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.lg,
  },
  filterLabel: {
    color: colors.navy,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  chevron: { color: colors.textSecondary, fontSize: typography.sizes.md },
  reportList: { gap: spacing.md },
  reportRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xl,
    minHeight: 124,
    padding: spacing.xl,
  },
  reportThumbnail: {
    backgroundColor: "#BCD8E8",
    borderRadius: radii.lg,
    height: 84,
    overflow: "hidden",
    position: "relative",
    width: 110,
  },
  reportImage: { height: "100%", position: "absolute", width: "100%" },
  thumbnailSky: { backgroundColor: "#B8D9E9", flex: 1 },
  thumbnailLand: {
    backgroundColor: "#718052",
    bottom: 0,
    height: "55%",
    position: "absolute",
    width: "100%",
  },
  thumbnailTag: {
    backgroundColor: "#455860",
    borderRadius: 3,
    color: colors.white,
    fontSize: 7,
    left: spacing.xs,
    padding: 2,
    position: "absolute",
    top: spacing.xs,
  },
  reportInfo: { flex: 1, gap: spacing.sm, minWidth: 180 },
  reportTitle: { color: colors.navy, fontSize: typography.sizes.lg },
  reportMeta: { color: "#6B829C", fontSize: typography.sizes.sm },
  reportActions: {
    alignItems: "flex-end",
    gap: spacing.md,
    marginLeft: "auto",
    minWidth: 150,
    width: 150,
  },
  footer: { color: "#6B829C", fontSize: typography.sizes.sm },
  empty: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    padding: spacing.xl,
  },
  detailPage: {
    backgroundColor: colors.background,
    gap: spacing.xl,
    padding: spacing.xxl,
  },
  detailHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  incidentTitle: {
    color: colors.navy,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginTop: spacing.lg,
  },
  description: {
    color: colors.text,
    fontSize: typography.sizes.md,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  detailLine: { gap: spacing.xs, marginTop: spacing.lg },
  detailLabel: { color: colors.textMuted, fontSize: typography.sizes.sm },
  detailValue: { color: colors.text, fontSize: typography.sizes.md },
  largeEvidence: {
    backgroundColor: "#BCD8E8",
    borderRadius: radii.lg,
    height: 250,
    marginTop: spacing.lg,
    overflow: "hidden",
    position: "relative",
  },
  evidenceImage: { height: "100%", position: "absolute", width: "100%" },
  imageIcon: {
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: radii.pill,
    bottom: spacing.md,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: spacing.md,
    width: 36,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
  },
  imageUrlInput: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  imageActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  saveMessage: { color: colors.textSecondary, fontSize: typography.sizes.sm, marginTop: spacing.sm },
  error: { color: colors.red, fontSize: typography.sizes.sm },
  notes: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 120,
    padding: spacing.md,
    textAlignVertical: "top",
  },
  decisionActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "flex-end",
    marginTop: spacing.lg,
  },
  backLink: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  backLinkText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
});
