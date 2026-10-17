import { Activity, AlertTriangle, ArrowRight, BellRing, ClipboardList, FileCheck2, House, MapPinned, Package, Truck, UsersRound, Waves } from "lucide-react-native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { colors } from "@/src/theme";
import { getDashboardSummary, type DashboardSummary } from "@/src/features/hazard-assessment/api/dashboard";
import { emergencyCoordinationRoutes } from "@/src/features/emergency-coordination/routes";

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
          <Text style={styles.subtitle}>Live overview of hazards, emergency events, shelters, warnings, relief, and rescue operations.</Text>
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
          <SummaryCard accent="#7C3AED" icon={Waves} label="Open emergency events" value={summary ? String(summary.activeEvents.length) : "—"} detail={`${summary?.eventPeopleAffected.toLocaleString() ?? "0"} people affected`} action="View emergency operations" onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as never)} />
          <SummaryCard accent="#0891B2" icon={House} label="Shelter occupancy" value={summary ? `${summary.shelterOccupancy.toLocaleString()} / ${summary.shelterCapacity.toLocaleString()}` : "—"} detail={`${summary?.shelterCount ?? 0} live shelter records`} action="View shelters" onPress={() => router.push(emergencyCoordinationRoutes.shelters() as never)} />
          <SummaryCard accent="#2563EB" icon={Truck} label="Rescue teams available" value={summary ? `${summary.availableRescueTeams} / ${summary.rescueTeamCount}` : "—"} detail={`${summary?.rescueDispatchCount ?? 0} dispatches in the last 30 days`} action="Coordinate rescue" onPress={() => router.push(emergencyCoordinationRoutes.assignRescueTeam as never)} />
          <SummaryCard accent="#059669" icon={Package} label="Relief inventory types" value={summary ? String(summary.reliefResourceCount) : "—"} detail={`${summary?.reliefAllocationCount ?? 0} allocations in the last 30 days`} action="Allocate resources" onPress={() => router.push(emergencyCoordinationRoutes.allocateReliefResources as never)} />
          <SummaryCard accent="#D97706" icon={ClipboardList} label="Priority response needs" value={summary ? String(summary.priorityNeedCount) : "—"} detail="Across emergency events" action="Review emergency operations" onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as never)} />
          <SummaryCard accent="#0F766E" icon={Activity} label="Operational updates" value={summary ? String(summary.operationalUpdateCount) : "—"} detail="Posted in the last 30 days" action="View operations" onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as never)} />
          <SummaryCard accent="#4F46E5" icon={MapPinned} label="Mapped event locations" value={summary ? String(summary.mappedLocationCount) : "—"} detail="Event locations and epicenters" action="View emergency map" onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as never)} />
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

        <View style={styles.listCard}>
          <View style={styles.listHeading}>
            <View>
              <Text style={styles.sectionTitle}>Current emergency events</Text>
              <Text style={styles.sectionSubtitle}>Active and monitoring events from the emergency register</Text>
            </View>
            <Pressable onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as never)} style={styles.linkButton}>
              <Text style={styles.linkText}>Open operations</Text>
              <Icon color={colors.primary} icon={ArrowRight} size={16} />
            </Pressable>
          </View>
          {summary?.activeEvents.length ? summary.activeEvents.slice(0, 6).map((event) => (
            <View key={event.id} style={styles.hazardRow}>
              <View style={[styles.severityDot, { backgroundColor: event.severity === "critical" || event.severity === "high" ? "#DC2626" : "#D97706" }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{event.hazard_type.toUpperCase()} · {event.district}</Text>
                <Text style={styles.hazardMeta}>{event.people_affected.toLocaleString()} people · {event.shelters_active} shelters · {event.rescue_teams_deployed} teams · Started {new Date(event.started_at).toLocaleString()}</Text>
              </View>
              <Text style={[styles.severity, { color: event.status === "active" ? "#047857" : "#B45309" }]}>{event.status.toUpperCase()}</Text>
            </View>
          )) : <Text style={styles.empty}>{summary ? "No active or monitoring emergency events." : "Loading live Supabase data…"}</Text>}
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeading}>
            <View>
              <Text style={styles.sectionTitle}>Response resources</Text>
              <Text style={styles.sectionSubtitle}>Live shelter occupancy, relief stock, and rescue team availability</Text>
            </View>
            <Pressable onPress={() => router.push(emergencyCoordinationRoutes.operationalOverview as never)} style={styles.linkButton}>
              <Text style={styles.linkText}>Open coordination</Text>
              <Icon color={colors.primary} icon={ArrowRight} size={16} />
            </Pressable>
          </View>
          {summary?.shelters.map((shelter) => (
            <View key={`shelter-${shelter.id}`} style={styles.hazardRow}>
              <View style={[styles.severityDot, { backgroundColor: shelter.status === "full" ? "#DC2626" : "#059669" }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{shelter.name}</Text>
                <Text style={styles.hazardMeta}>{shelter.location} · {shelter.category}</Text>
              </View>
              <Text style={styles.resourceValue}>{shelter.current_occupancy.toLocaleString()} / {shelter.capacity.toLocaleString()} · {shelter.status}</Text>
            </View>
          ))}
          {summary?.reliefResources.map((resource) => (
            <View key={`resource-${resource.id}`} style={styles.hazardRow}>
              <View style={[styles.severityDot, { backgroundColor: "#059669" }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{resource.name}</Text>
                <Text style={styles.hazardMeta}>{resource.organisation} · Relief inventory</Text>
              </View>
              <Text style={styles.resourceValue}>{resource.available_quantity.toLocaleString()} {resource.unit}</Text>
            </View>
          ))}
          {summary?.rescueTeams.map((team) => (
            <View key={`team-${team.id}`} style={styles.hazardRow}>
              <View style={[styles.severityDot, { backgroundColor: team.status.toLowerCase() === "available" ? "#059669" : "#D97706" }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{team.id} · {team.organisation}</Text>
                <Text style={styles.hazardMeta}>{team.location}</Text>
              </View>
              <Text style={styles.resourceValue}>{team.status}</Text>
            </View>
          ))}
          {summary && !summary.shelters.length && !summary.reliefResources.length && !summary.rescueTeams.length ? <Text style={styles.empty}>No shelter, relief, or rescue resource records.</Text> : null}
          {!summary ? <Text style={styles.empty}>Loading live Supabase data…</Text> : null}
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeading}>
            <View>
              <Text style={styles.sectionTitle}>Priority needs &amp; event locations</Text>
              <Text style={styles.sectionSubtitle}>Operational priorities and mapped epicenters from emergency events</Text>
            </View>
          </View>
          {summary?.priorityNeeds.map((need) => (
            <View key={`need-${need.id}`} style={styles.hazardRow}>
              <View style={[styles.severityDot, { backgroundColor: "#D97706" }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{need.need} · {need.priority_label}</Text>
                <Text style={styles.hazardMeta}>{need.focus.toUpperCase()} · {need.context}</Text>
              </View>
            </View>
          ))}
          {summary?.epicenters.map((location) => (
            <View key={`epicenter-${location.id}`} style={styles.hazardRow}>
              <View style={[styles.severityDot, { backgroundColor: "#DC2626" }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{location.name}</Text>
                <Text style={styles.hazardMeta}>Event map location · {location.map_x}, {location.map_y}</Text>
              </View>
              <Text style={styles.activityKind}>EPICENTER</Text>
            </View>
          ))}
          {summary && !summary.priorityNeeds.length && !summary.epicenters.length ? <Text style={styles.empty}>No priority needs or marked epicenters.</Text> : null}
          {!summary ? <Text style={styles.empty}>Loading live Supabase data…</Text> : null}
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeading}>
            <View>
              <Text style={styles.sectionTitle}>Recent response activity</Text>
              <Text style={styles.sectionSubtitle}>Warnings, operational updates, relief allocations, and rescue dispatches · last 30 days</Text>
            </View>
            <Pressable onPress={() => router.push("/analytics" as never)} style={styles.linkButton}>
              <Text style={styles.linkText}>Analytics &amp; reports</Text>
              <Icon color={colors.primary} icon={ArrowRight} size={16} />
            </Pressable>
          </View>
          {summary ? recentActivity(summary).map((activity) => (
            <View key={`${activity.kind}-${activity.id}`} style={styles.hazardRow}>
              <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
              <View style={styles.hazardCopy}>
                <Text style={styles.hazardTitle}>{activity.title}</Text>
                <Text style={styles.hazardMeta}>{activity.detail} · {new Date(activity.time).toLocaleString()}</Text>
              </View>
              <Text style={styles.activityKind}>{activity.kind}</Text>
            </View>
          )) : <Text style={styles.empty}>Loading live Supabase data…</Text>}
          {summary && !recentActivity(summary).length ? <Text style={styles.empty}>No response activity in the last 30 days.</Text> : null}
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

function recentActivity(summary: DashboardSummary) {
  return [
    ...summary.recentWarnings.map((warning) => ({ kind: "Warning", id: warning.id, title: warning.title, detail: `${warning.target_location} · ${warning.channels.join(", ")}`, time: warning.issued_at ?? warning.created_at, color: "#2563EB" })),
    ...summary.recentUpdates.map((update) => ({ kind: "Update", id: update.id, title: update.update_text, detail: update.status, time: update.occurred_at, color: "#0891B2" })),
    ...summary.recentAllocations.map((allocation) => ({ kind: "Relief", id: allocation.id, title: `${allocation.quantity.toLocaleString()} ${allocation.resource}`, detail: `${allocation.organisation} · ${allocation.location}`, time: allocation.allocated_at, color: "#059669" })),
    ...summary.recentDispatches.map((dispatch) => ({ kind: "Rescue", id: dispatch.id, title: `${dispatch.team_id} dispatched`, detail: `${dispatch.target_location} · ${dispatch.mission_details}`, time: dispatch.dispatched_at, color: "#D97706" })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
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
  activityDot: { borderRadius: 5, height: 9, width: 9 },
  activityKind: { color: "#6B829C", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  resourceValue: { color: "#29405F", fontSize: 11, fontWeight: "700", maxWidth: 180, textAlign: "right" },
  empty: { color: "#6B829C", fontSize: 13, paddingVertical: 15 },
});
