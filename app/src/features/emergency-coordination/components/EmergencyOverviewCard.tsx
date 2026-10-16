import { StyleSheet, Text, View } from "react-native";

import { Badge, Card } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import { capitalize, formatEventStart, formatNumber } from "../format";
import type { EmergencyEvent } from "../types";

export function EmergencyOverviewCard({ event }: { event: EmergencyEvent }) {
    const severityTone =
        event.severity === "high" || event.severity === "critical"
            ? "danger"
            : event.severity === "medium"
                ? "warning"
                : "info";

    const rows: [string, string][] = [
        ["Affected area", `${event.district} District`],
        ["People affected", formatNumber(event.peopleAffected)],
        ["Start time", formatEventStart(event.startedAt)],
        ["Type", capitalize(event.hazardType)],
        ["Severity", capitalize(event.severity)],
    ];

    return (
        <Card style={styles.card} testID="overview-card">
            <Text style={styles.title}>
                {capitalize(event.hazardType)} – {event.district}
            </Text>
            <View style={styles.badges}>
                <Badge label={capitalize(event.status)} tone="success" />
                <Badge label={`${capitalize(event.severity)} severity`} tone={severityTone} />
            </View>
            {rows.map(([label, value]) => (
                <View key={label} style={styles.row}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.value}>{value}</Text>
                </View>
            ))}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1, gap: spacing.md, minWidth: 280 },
    title: { color: colors.text, fontSize: typography.sizes.lg, fontWeight: "700" },
    badges: { flexDirection: "row", gap: spacing.sm },
    row: { flexDirection: "row", justifyContent: "space-between" },
    label: { color: colors.textSecondary, fontSize: typography.sizes.sm },
    value: { color: colors.text, fontSize: typography.sizes.sm, fontWeight: "700" },
});
