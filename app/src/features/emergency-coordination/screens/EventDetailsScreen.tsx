import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import { capitalize, formatEventStart, formatNumber } from "../format";
import { useActiveEmergency } from "../hooks/useActiveEmergency";
import { emergencyCoordinationRoutes } from "../routes";

export function EventDetailsScreen() {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const { data, loading, error } = useActiveEmergency(eventId);
    const back = () => router.push(emergencyCoordinationRoutes.activeEmergency as Href);

    return (
        <ScrollView contentContainerStyle={styles.content} testID="event-details-screen">
            <Text style={styles.heading}>Event details</Text>
            {loading ? <Text style={styles.muted}>Loading…</Text> : null}
            {error ? <Text style={styles.muted}>{error}</Text> : null}
            {!loading && !error && !data ? <Text style={styles.muted}>Event not found.</Text> : null}
            {data ? (
                <Card style={styles.card}>
                    {(
                        [
                            ["Event ID", data.event.id],
                            ["Hazard", capitalize(data.event.hazardType)],
                            ["District", data.event.district],
                            ["Severity", capitalize(data.event.severity)],
                            ["Status", capitalize(data.event.status)],
                            ["Started", formatEventStart(data.event.startedAt)],
                            ["People affected", formatNumber(data.event.peopleAffected)],
                            ["Affected locations", data.locations.map((l) => l.name).join(", ") || "—"],
                        ] as [string, string][]
                    ).map(([label, value]) => (
                        <View key={label} style={styles.row}>
                            <Text style={styles.label}>{label}</Text>
                            <Text style={styles.value}>{value}</Text>
                        </View>
                    ))}
                </Card>
            ) : null}
            <View style={styles.actions}>
                <Button label="← Back to active emergency" onPress={back} variant="outline" testID="back-button" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { gap: spacing.lg, padding: spacing.xxl },
    heading: { color: colors.text, fontSize: 28, fontWeight: "800" },
    muted: { color: colors.textSecondary, fontSize: typography.sizes.sm },
    card: { gap: spacing.md, maxWidth: 640 },
    row: { flexDirection: "row", gap: spacing.lg, justifyContent: "space-between" },
    label: { color: colors.textSecondary, fontSize: typography.sizes.sm },
    value: { color: colors.text, flexShrink: 1, fontSize: typography.sizes.sm, fontWeight: "700", textAlign: "right" },
    actions: { flexDirection: "row" },
});
