import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import type { CoordinationFocus } from "../routes";
import type { PriorityNeed } from "../types";

type Props = {
    needs: PriorityNeed[];
    onSelect: (focus: CoordinationFocus) => void;
};

export function PriorityNeedsCard({ needs, onSelect }: Props) {
    return (
        <Card style={styles.card} testID="priority-needs-card">
            <Text style={styles.title}>Priority coordination needs</Text>
            <View style={styles.headerRow}>
                <Text style={[styles.head, styles.c1]}>Need</Text>
                <Text style={[styles.head, styles.c2]}>Context</Text>
                <Text style={[styles.head, styles.c3]}>Priority</Text>
            </View>
            {needs.length === 0 ? (
                <Text style={styles.empty}>No priority needs recorded.</Text>
            ) : (
                needs.map((n) => (
                    <Pressable
                        accessibilityRole="button"
                        key={n.id}
                        onPress={() => onSelect(n.focus)}
                        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                        testID={`need-row-${n.focus}`}
                    >
                        <Text style={[styles.need, styles.c1]}>{n.need}</Text>
                        <Text style={[styles.cell, styles.c2]}>{n.context}</Text>
                        <Text style={[styles.cell, styles.c3]}>{n.priorityLabel}</Text>
                    </Pressable>
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
    pressed: { backgroundColor: colors.background },
    c1: { flex: 1.2 },
    c2: { flex: 1.2 },
    c3: { flex: 0.9 },
    need: { color: colors.text, fontSize: typography.sizes.sm, fontWeight: "700" },
    cell: { color: colors.text, fontSize: typography.sizes.sm },
    empty: { color: colors.textSecondary, fontSize: typography.sizes.sm },
});
