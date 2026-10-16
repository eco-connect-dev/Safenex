import { AlertTriangle, ArrowRight, BellRing, FileCheck2, UsersRound } from "lucide-react-native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { colors } from "@/src/theme";
import { getDashboardSummary, type DashboardSummary } from "@/src/features/hazard-assessment/api/dashboard";

export default function DashboardWebScreen() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    getDashboardSummary()
      .then((data) => { setSummary(data); setError(""); })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60_000);
    return () => clearInterval(timer);
  }, [refresh]);

  return (
    <DmcWebShell activeNav="dashboard" topbarTitle="DMC OPERATIONS DASHBOARD">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.title}>Operations Dashboard</Text>
          <Text style={styles.subtitle}>A live overview of hazards, community reports, and warning activity.</Text>
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <View style={styles.summaryGrid}>
          <SummaryCard
            accent="#DC2626"
            icon={AlertTriangle}
            label="Accepted active hazards"
            value={summary ? String(summary.activeHazards.length) : "—"}
            detail={`${summary?.priorityHazards ?? 0} high or critical`}
            action="Open hazard assessment"
            onPress={() => router.push("/home")}
          />
          <SummaryCard
            accent="#D97706"
            icon={FileCheck2}
            label="Pending ground reports"
            value={summary ? String(summary.pendingReports) : "—"}
            detail="Waiting for volunteer review"
            action="Review citizen reports"
            onPress={() => router.push("/ground-reports")}
          />
          <SummaryCard
            accent={colors.primary}
            icon={BellRing}
            label="Warnings issued"
            value={summary ? String(summary.issuedWarnings) : "—"}
            detail="Saved in the warning register"
            action="Prepare a warning"
            onPress={() => router.push("/web/prepare-warning")}
          />
          <SummaryCard
            accent="#059669"
            icon={UsersRound}
            label="Residents in active areas"
            value={summary ? summary.exposedPeople.toLocaleString() : "—"}
            detail="Across accepted active hazards"
            action="View affected areas"
            onPress={() => router.push("/home")}
          />
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeading}>
            <View>
              <Text style={styles.sectionTitle}>Current active hazards</Text>
              <Text style={styles.sectionSubtitle}>Accepted reports ordered by latest observation</Text>
            </View>
            <Pressable onPress={() => router.push("/home")} style={styles.linkButton}>
              <Text style={styles.linkText}>Open assessment</Text>
              <Icon color={colors.primary} icon={ArrowRight} size={16} />
            </Pressable>
          </View>
          {summary?.activeHazards.length ? summary.activeHazards.slice(0, 5).map((hazard) => (
            <View key={hazard.id} style={styles.hazardRow}>
              <View style={[styles.severityDot, { backgroundColor: hazard.severity === "critical" || hazard.severity === "high" ? "#DC2626" : "#D97706" }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{hazard.title}</Text>
                <Text style={styles.hazardMeta}>{hazard.location} · {hazard.district} · {hazard.affected_people.toLocaleString()} people</Text>
              </View>
              <Text style={[styles.severity, { color: hazard.severity === "critical" || hazard.severity === "high" ? "#B91C1C" : "#B45309" }]}>{hazard.severity.toUpperCase()}</Text>
            </View>
          )) : <Text style={styles.empty}>{summary ? "No accepted active hazards." : "Loading live Supabase data…"}</Text>}
        </View>
      </ScrollView>
    </DmcWebShell>
  );
}

function SummaryCard({
  accent,
  action,
  detail,
  icon,
  label,
  onPress,
  value,
}: {
  accent: string;
  action: string;
  detail: string;
  icon: typeof AlertTriangle;
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.summaryCard, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <Text style={styles.cardLabel}>{label}</Text>
        <View style={[styles.iconBox, { backgroundColor: `${accent}18` }]}><Icon color={accent} icon={icon} size={19} /></View>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardDetail}>{detail}</Text>
      <View style={styles.cardAction}><Text style={[styles.cardActionText, { color: accent }]}>{action}</Text><Icon color={accent} icon={ArrowRight} size={15} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 24, paddingBottom: 36 },
  heading: { gap: 4 },
  title: { color: "#0B1424", fontSize: 25, fontWeight: "800" },
  subtitle: { color: "#5E7595", fontSize: 14 },
  errorBox: { backgroundColor: "#FFF2F1", borderColor: "#FFB9B6", borderRadius: 8, borderWidth: 1, padding: 12 },
  errorText: { color: "#982929", fontSize: 13 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  summaryCard: { backgroundColor: colors.white, borderColor: "#D9E2EC", borderRadius: 12, borderTopColor: colors.primary, borderTopWidth: 3, flexBasis: 260, flexGrow: 1, gap: 8, minHeight: 178, padding: 17 },
  pressed: { opacity: 0.8 },
  cardTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  cardLabel: { color: "#5E7595", flex: 1, fontSize: 13, fontWeight: "700" },
  iconBox: { alignItems: "center", borderRadius: 9, height: 36, justifyContent: "center", width: 36 },
  cardValue: { color: "#0B1424", fontSize: 30, fontWeight: "800" },
  cardDetail: { color: "#6B829C", fontSize: 12 },
  cardAction: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: "auto" },
  cardActionText: { fontSize: 12, fontWeight: "700" },
  listCard: { backgroundColor: colors.white, borderColor: "#D9E2EC", borderRadius: 12, borderWidth: 1, padding: 18 },
  listHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  sectionTitle: { color: "#0B1424", fontSize: 17, fontWeight: "800" },
  sectionSubtitle: { color: "#6B829C", fontSize: 12, marginTop: 3 },
  linkButton: { alignItems: "center", flexDirection: "row", gap: 5 },
  linkText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  hazardRow: { alignItems: "center", borderTopColor: "#E8EDF3", borderTopWidth: 1, flexDirection: "row", gap: 10, minHeight: 54, paddingVertical: 8 },
  severityDot: { borderRadius: 5, height: 9, width: 9 },
  hazardCopy: { flex: 1 },
  hazardTitle: { color: "#0B1424", fontSize: 13, fontWeight: "700" },
  hazardMeta: { color: "#6B829C", fontSize: 11, marginTop: 3 },
  severity: { fontSize: 10, fontWeight: "800" },
  empty: { color: "#6B829C", fontSize: 13, paddingVertical: 15 },
});
