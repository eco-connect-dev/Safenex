import { ArrowLeft, ArrowRight, Image, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
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
import { getGroundReport, groundReports } from "../api";
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

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return groundReports.filter((report) => {
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
  }, [dateFilter, hazardFilter, locationFilter, query]);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.pageContent}>
        <View>
          <Text style={styles.title}>Pending Reports</Text>
          <Text style={styles.subtitle}>
            Review citizen evidence before making a verification decision.
          </Text>
        </View>

        <Notice
          message="4 reports pending verification · Approved reports become available to hazard assessment, not automatic warning escalation."
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
          Showing all {filteredReports.length} pending reports · DMC duty
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
        <View style={styles.thumbnailSky} />
        <View style={styles.thumbnailLand} />
        <Text style={styles.thumbnailTag}>EVIDENCE PHOTO</Text>
      </View>
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle}>
          {report.hazardType} — {report.location}
        </Text>
        <Text style={styles.reportMeta}>
          Submitted {report.submitted} · {report.relativeTime}
        </Text>
        <Text style={styles.reportMeta}>{report.role}</Text>
      </View>
      <Badge label="Pending" tone="warning" />
      <Button
        label="Review report"
        icon={ArrowRight}
        onPress={onReview}
        size="md"
      />
    </View>
  );
}

export function VerifyReportScreen({
  navigation,
  route,
}: Props<"VerifyReport">) {
  const report = getGroundReport(route.params.reportId);
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(
    null,
  );

  if (!report) {
    return (
      <View style={styles.page}>
        <Text style={styles.empty}>This report could not be found.</Text>
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
        <Badge label="Pending verification" tone="warning" />
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
          <View style={styles.thumbnailSky} />
          <View style={styles.thumbnailLand} />
          <Text style={styles.thumbnailTag}>
            {report.evidenceLabel.toUpperCase()}
          </Text>
          <View style={styles.imageIcon}>
            <Icon color={colors.white} icon={Image} size={18} />
          </View>
        </View>
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
            message={`Report marked ${decision}. This is ready to connect to the verification API.`}
            tone={decision === "approved" ? "success" : "danger"}
          />
        ) : null}
        <View style={styles.decisionActions}>
          <Button
            label="Reject report"
            onPress={() => setDecision("rejected")}
            variant="outline"
          />
          <Button
            label="Approve report"
            onPress={() => setDecision("approved")}
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
  pageContent: { gap: spacing.xl, padding: spacing.xxl },
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
  reportInfo: { flex: 1, gap: spacing.sm },
  reportTitle: { color: colors.navy, fontSize: typography.sizes.lg },
  reportMeta: { color: "#6B829C", fontSize: typography.sizes.sm },
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
