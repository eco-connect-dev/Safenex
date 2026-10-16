import { router, type Href } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Button, Card, MetricCard } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import { EmergencyOverviewCard } from "../components/EmergencyOverviewCard";
import { FloodAreaMap } from "../components/FloodAreaMap";
import { OperationalUpdatesCard } from "../components/OperationalUpdatesCard";
import { PriorityNeedsCard } from "../components/PriorityNeedsCard";
import { formatNumber } from "../format";
import { useActiveEmergency } from "../hooks/useActiveEmergency";
import { emergencyCoordinationRoutes, type CoordinationFocus } from "../routes";

export function ActiveEmergencyScreen() {
    const { data, source, loading, refreshing, error, refresh, retry } =
        useActiveEmergency();
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

    const go = (path: string) => router.push(path as Href);

    if (loading) {
        return (
            <View style={styles.center} testID="active-emergency-loading">
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.muted}>Loading active emergency…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center} testID="active-emergency-error">
                <Text style={styles.errorTitle}>Could not load the active emergency</Text>
                <Text style={styles.muted}>{error}</Text>
                <Button label="Try again" onPress={retry} testID="retry-button" />
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.center} testID="active-emergency-empty">
                <Text style={styles.errorTitle}>No active emergency</Text>
                <Text style={styles.muted}>
                    There is no active emergency event for your district right now.
                </Text>
                <Button label="Refresh" onPress={retry} variant="outline" testID="refresh-button" />
            </View>
        );
    }

    const { event, locations, priorityNeeds, updates } = data;
    const openResponse = (focus?: CoordinationFocus) =>
        go(emergencyCoordinationRoutes.responseCoordination(event.id, focus));

    const metrics: { key: string; label: string; value: number; focus: CoordinationFocus }[] = [
        { key: "people", label: "People affected", value: event.peopleAffected, focus: "shelters" },
        { key: "shelters", label: "Shelters active", value: event.sheltersActive, focus: "shelters" },
        { key: "rescue", label: "Rescue teams deployed", value: event.rescueTeamsDeployed, focus: "rescue" },
        { key: "relief", label: "Relief items allocated", value: event.reliefItemsAllocated, focus: "relief" },
    ];

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}
            style={styles.scroll}
            testID="active-emergency-screen"
        >
            <View style={styles.headerRow}>
                <View style={styles.headerText}>
                    <Text style={styles.heading}>Active Emergency</Text>
                    <Text style={styles.subtitle}>
                        Review the active flood event and key response information before
                        coordinating resources.
                    </Text>
                </View>
                <Button label="Refresh" onPress={refresh} variant="outline" size="sm" testID="refresh-button" />
            </View>

            {source === "sample" ? (
                <View style={styles.sampleBanner} testID="sample-data-banner">
                    <Text style={styles.sampleText}>
                        Showing sample data — Supabase has no active emergency yet (dev only).
                    </Text>
                </View>
            ) : null}

            <View style={styles.row}>
                <EmergencyOverviewCard event={event} />
                <FloodAreaMap
                    district={event.district}
                    locations={locations}
                    onSelect={setSelectedLocationId}
                    selectedId={selectedLocationId}
                />
            </View>

            <View style={styles.row}>
                {metrics.map((m) => (
                    <Pressable
                        accessibilityRole="button"
                        key={m.key}
                        onPress={() => openResponse(m.focus)}
                        style={styles.metric}
                        testID={`metric-${m.key}`}
                    >
                        <MetricCard label={m.label} value={formatNumber(m.value)} />
                    </Pressable>
                ))}
            </View>

            <View style={styles.row}>
                <PriorityNeedsCard needs={priorityNeeds} onSelect={openResponse} />
                <OperationalUpdatesCard updates={updates} />
            </View>

            <Card style={styles.footer} testID="action-bar">
                <View style={styles.footerLeft}>
                    <Button
                        label="View event details"
                        onPress={() => go(emergencyCoordinationRoutes.eventDetails(event.id))}
                        testID="view-event-details"
                        variant="outline"
                    />
                    <Text style={styles.footerHint}>
                        {event.district} {event.hazardType} response · District operational view
                    </Text>
                </View>
                <Button
                    label="View response coordination →"
                    onPress={() => openResponse()}
                    testID="view-response-coordination"
                />
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    content: { gap: spacing.xl, padding: spacing.xxl, paddingBottom: spacing.xxxl },
    center: { alignItems: "center", flex: 1, gap: spacing.md, justifyContent: "center", padding: spacing.xxl },
    muted: { color: colors.textSecondary, fontSize: typography.sizes.sm, textAlign: "center" },
    errorTitle: { color: colors.text, fontSize: typography.sizes.lg, fontWeight: "700" },
    headerRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.lg, justifyContent: "space-between" },
    headerText: { flex: 1, gap: spacing.sm },
    heading: { color: colors.text, fontSize: 30, fontWeight: "800" },
    subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm },
    sampleBanner: { backgroundColor: colors.amberSoft, borderRadius: 10, padding: spacing.md },
    sampleText: { color: colors.amber, fontSize: typography.sizes.sm, fontWeight: "600" },
    row: { alignItems: "stretch", flexDirection: "row", flexWrap: "wrap", gap: spacing.xl },
    metric: { flexGrow: 1, flexBasis: 200 },
    footer: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, justifyContent: "space-between" },
    footerLeft: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
    footerHint: { color: colors.textSecondary, fontSize: typography.sizes.xs },
});
