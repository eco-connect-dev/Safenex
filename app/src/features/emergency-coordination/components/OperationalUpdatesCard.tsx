import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import { formatClock } from "../format";
import type { OperationalUpdate } from "../types";

function statusColor(status: string) {
    const s = status.toLowerCase();
    if (s === "high" || s === "critical") return colors.red;
    if (s === "ready") return colors.green;
    return colors.text;
}

export function OperationalUpdatesCard({ updates }: { updates: OperationalUpdate[] }) {
    return (
        <Card style={styles.card} testID="updates-card">
            <Text style={styles.title}>Latest operational updates</Text>
            <View style={styles.headerRow}>
                <Text style={[styles.head, styles.time]}>Time</Text>
                <Text style={[styles.head, styles.text]}>Update</Text>
                <Text style={[styles.head, styles.status]}>Status</Text>
            </View>
            {updates.length === 0 ? (
                <Text style={styles.empty}>No updates yet.</Text>
            ) : (
                updates.map((u) => (
                    <View key={u.id} style={styles.row} testID={`update-row-${u.id}`}>
                        <Text style={[styles.cell, styles.time]}>{formatClock(u.occurredAt)}</Text>
                        <Text style={[styles.cell, styles.text]}>{u.text}</Text>
                        <Text style={[styles.cell, styles.status, { color: statusColor(u.status) }]}>
                            {u.status}
                        </Text>
                    </View>
                ))
            )}
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1, gap: spacing.sm, minWidth: 320 },
    title: { color: colors.text, fontSize: typography.sizes.lg, fontWeight: "700", marginBottom: spacing.sm },
    headerRow: { flexDirection: "row", gap: spacing.md },
    head: { color: colors.textSecondary, fontSize: typography.sizes.xs },
    row: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", gap: spacing.md, minHeight: 56, paddingVertical: spacing.sm },
    time: { width: 48 },
    text: { flex: 1 },
    status: { width: 70 },
    cell: { color: colors.text, fontSize: typography.sizes.sm },
    empty: { color: colors.textSecondary, fontSize: typography.sizes.sm },
});
