import { router, type Href } from "expo-router";
import { ArrowRight, CheckCircle2, Info } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { Button, Card, Icon } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";
import { useActiveEmergency } from "../hooks/useActiveEmergency";
import { useShelters } from "../hooks/useShelters";
import { emergencyCoordinationRoutes } from "../routes";
import { getReliefAllocations, getRescueDispatches } from "../services/emergencyCoordinationService";

type Activity = { id: string; time: string; activity: string; status: string; sort: number };

export function OperationalOverviewScreen() {
    const { width } = useWindowDimensions();
    const { data } = useActiveEmergency();
    const { shelters, totalActiveShelters } = useShelters();
    const rescueDispatches = getRescueDispatches();
    const reliefAllocations = getReliefAllocations();
    const event = data?.event;
    const isWide = width >= 900;
    const latestDispatch = rescueDispatches[0];
    const latestAllocation = reliefAllocations[0];
    const coordinationShelter = shelters.find((shelter) => shelter.name.includes("Mawanella"));
    const peopleAssisted = 1850 + shelters.reduce((total, shelter) => total + (shelter.currentOccupancy - (shelter.id === "s1" ? 650 : shelter.id === "s2" ? 420 : shelter.id === "s3" ? 500 : shelter.id === "s4" ? 300 : shelter.id === "s5" ? 180 : 350)), 0);
    const reliefAllocated = (event?.reliefItemsAllocated ?? 1200) + reliefAllocations.reduce((total, item) => total + item.quantity, 0);

    const activities = useMemo<Activity[]>(() => {
        const operational: Activity[] = [
            ...reliefAllocations.map((allocation) => ({ id: allocation.id, time: new Date(allocation.allocatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), activity: `${allocation.quantity.toLocaleString()} ${allocation.resource.toLowerCase()} allocated · ${allocation.organisation} → ${allocation.location}`, status: "Recorded", sort: Date.parse(allocation.allocatedAt) })),
            ...rescueDispatches.map((dispatch) => ({ id: `${dispatch.teamId}-${dispatch.dispatchedAt}`, time: new Date(dispatch.dispatchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), activity: `${dispatch.teamId} dispatched → ${dispatch.targetLocation}`, status: "Dispatched", sort: Date.parse(dispatch.dispatchedAt) })),
            ...(data?.updates ?? []).slice(0, 4).map((update) => ({ id: update.id, time: new Date(update.occurredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), activity: update.text, status: update.status, sort: Date.parse(update.occurredAt) })),
            { id: "shelter-occupancy", time: "12:30", activity: "Shelter occupancy updated · District data refreshed", status: "Updated", sort: 0 },
        ];
        return operational.sort((a, b) => b.sort - a.sort).slice(0, 6);
    }, [data?.updates, reliefAllocations, rescueDispatches]);

    const metrics = [
        { label: "Shelters active", value: totalActiveShelters || event?.sheltersActive || 6 },
        { label: "Rescue teams deployed", value: (event?.rescueTeamsDeployed ?? 3) + rescueDispatches.length },
        { label: "Relief items allocated", value: reliefAllocated.toLocaleString() },
        { label: "Evacuees assisted", value: peopleAssisted.toLocaleString() },
    ];
    const statusRows = [
        { label: "Shelter allocation", value: `Confirmed · ${coordinationShelter?.currentOccupancy.toLocaleString() ?? "450"} / ${coordinationShelter?.capacity.toLocaleString() ?? "1,200"}` },
        { label: `Rescue team ${latestDispatch?.teamId ?? "RT-01"}`, value: latestDispatch ? "Dispatched" : "Ready" },
        { label: `${latestAllocation?.resource ?? "Food pack"} allocation`, value: latestAllocation ? `Recorded · ${latestAllocation.quantity.toLocaleString()} allocated` : "Ready · 4,500 remaining" },
    ];

    return <ScrollView contentContainerStyle={styles.page} testID="operational-overview-screen">
        <View style={styles.header}><Text style={styles.title}>Operational Overview – {event?.hazardType ? `${event.hazardType[0].toUpperCase()}${event.hazardType.slice(1)}` : "Flood"} ({event?.district ?? "Kegalle"})</Text><Text style={styles.subtitle}>Review the updated combined operational picture after shelter, rescue-team and relief-resource coordination.</Text></View>
        <View style={styles.metrics}>{metrics.map((metric) => <Card key={metric.label} style={styles.metricCard}><Text style={styles.metricLabel}>{metric.label}</Text><Text style={styles.metricValue}>{metric.value}</Text></Card>)}</View>
        <View style={[styles.contentRow, isWide ? styles.row : styles.column]}>
            <Card style={[styles.mapCard, isWide && styles.mapWide]}>
                <Text style={styles.cardTitle}>Updated operational map</Text>
                <View style={styles.map} testID="operational-map">
                    <View style={styles.mapBoundary} /><View style={styles.river} />
                    {(data?.locations ?? []).map((location, index) => <View key={location.id} style={[styles.mapMarker, { left: `${Math.min(87, Math.max(8, location.mapX))}%`, top: `${Math.min(78, Math.max(18, location.mapY))}%` }]} testID={`overview-location-${location.id}`}><View style={[styles.dot, { backgroundColor: location.isEpicenter ? "#CB4455" : index % 3 === 0 ? colors.primary : index % 3 === 1 ? colors.green : colors.amber }]} /><Text style={styles.mapLabel}>{location.name}</Text></View>)}
                    {!data?.locations.length ? <Text style={styles.mapFallback}>District response locations</Text> : null}
                    <Text style={styles.mapCaption}>{event?.district ?? "Kegalle"} District · Flood affected area</Text>
                </View>
                <Text style={styles.legend}>Red: hazard · Green: shelter · Blue: rescue team · Amber: resource point</Text>
                <View style={styles.info}><Icon color={colors.primary} icon={Info} size={17} /><Text style={styles.infoText}>Latest allocations and dispatches are shown for the {event?.district ?? "Kegalle"} flood response.</Text></View>
            </Card>
            <Card style={[styles.activityCard, isWide && styles.activityWide]}>
                <Text style={styles.cardTitle}>Recent coordination activities</Text>
                <View style={styles.activityHeader}><Text style={styles.timeColumn}>Time</Text><Text style={styles.activityColumn}>Activity</Text><Text style={styles.statusColumn}>Status</Text></View>
                {activities.map((activity) => <View key={activity.id} style={styles.activityRow}><Text style={[styles.timeColumn, styles.activityText, styles.bold]}>{activity.time}</Text><Text style={[styles.activityColumn, styles.activityText]}>{activity.activity}</Text><Text style={[styles.statusColumn, styles.statusText]}>{activity.status}</Text></View>)}
                <Text style={styles.sectionHeading}>Current coordination status</Text>
                {statusRows.map((row) => <View key={row.label} style={styles.statusRow}><Text style={styles.statusLabel}>{row.label}</Text><Text style={styles.statusValue}>{row.value}</Text></View>)}
                <View style={styles.current}><Icon color={colors.green} icon={CheckCircle2} size={17} /><Text style={styles.currentText}>Combined operational picture is current.</Text></View>
            </Card>
        </View>
        <View style={styles.actions}><Button label="Allocate relief resources" onPress={() => router.push(emergencyCoordinationRoutes.allocateReliefResources as Href)} testID="overview-allocate-relief" variant="outline" /><Button label="Back to emergency dashboard" onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as Href)} testID="overview-dashboard" /><Button label="Assign rescue team" icon={ArrowRight} onPress={() => router.push(emergencyCoordinationRoutes.assignRescueTeam as Href)} testID="overview-assign-rescue" variant="outline" /></View>
        <Text style={styles.footer}>Offline entries synchronize after connectivity is restored. Synchronization status is tracked separately from coordination confirmations.</Text>
    </ScrollView>;
}

const styles = StyleSheet.create({
    page: { backgroundColor: colors.background, flexGrow: 1, gap: spacing.xl, padding: spacing.xl }, header: { gap: spacing.xs }, title: { color: colors.navy, fontSize: 29, fontWeight: "800" }, subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm }, metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md }, metricCard: { borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, flexBasis: 180, flexGrow: 1, gap: spacing.xs, padding: spacing.lg }, metricLabel: { color: colors.textSecondary, fontSize: typography.sizes.xs }, metricValue: { color: colors.primary, fontSize: 28, fontWeight: "500" }, contentRow: { alignItems: "flex-start", gap: spacing.xl }, row: { flexDirection: "row" }, column: { flexDirection: "column" }, mapCard: { borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg, width: "100%" }, mapWide: { flex: 1.25 }, activityCard: { borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg, width: "100%" }, activityWide: { flex: 0.9 }, cardTitle: { color: colors.navy, fontSize: typography.sizes.lg, fontWeight: "700" }, map: { backgroundColor: "#E7F0F7", borderRadius: radii.md, height: 280, overflow: "hidden", position: "relative" }, mapBoundary: { borderColor: "#C9D8E6", borderRadius: 160, borderWidth: 2, height: "78%", left: "5%", position: "absolute", top: "6%", transform: [{ rotate: "-7deg" }], width: "88%" }, river: { backgroundColor: "#8BB9D0", height: 3, left: "-2%", position: "absolute", top: "72%", transform: [{ rotate: "-10deg" }], width: "110%" }, mapMarker: { alignItems: "center", flexDirection: "row", gap: 4, position: "absolute" }, dot: { borderColor: colors.white, borderRadius: 6, borderWidth: 1, height: 9, width: 9 }, mapLabel: { color: colors.navy, fontSize: 9, fontWeight: "600" }, mapCaption: { bottom: spacing.sm, color: colors.textSecondary, fontSize: 9, left: spacing.sm, position: "absolute" }, mapFallback: { color: colors.textSecondary, left: "30%", position: "absolute", top: "45%" }, legend: { color: colors.textSecondary, fontSize: 10 }, info: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, infoText: { color: colors.primary, flex: 1, fontSize: typography.sizes.xs }, activityHeader: { alignItems: "center", flexDirection: "row", paddingHorizontal: spacing.sm }, timeColumn: { flexBasis: 42 }, activityColumn: { flex: 1 }, statusColumn: { flexBasis: 76 }, activityRow: { alignItems: "center", flexDirection: "row", minHeight: 59, paddingHorizontal: spacing.sm }, activityText: { color: colors.navy, fontSize: 11, lineHeight: 17 }, bold: { fontWeight: "700" }, statusText: { color: colors.green, fontSize: 11 }, sectionHeading: { color: colors.navy, fontSize: typography.sizes.sm, marginTop: spacing.sm }, statusRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm, justifyContent: "space-between" }, statusLabel: { color: colors.textSecondary, flex: 1, fontSize: typography.sizes.xs }, statusValue: { color: colors.navy, fontSize: typography.sizes.xs, fontWeight: "700", textAlign: "right" }, current: { alignItems: "center", backgroundColor: "#E7F5EF", borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, currentText: { color: colors.green, fontSize: typography.sizes.xs }, actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, footer: { color: colors.textSecondary, fontSize: typography.sizes.xs },
});
