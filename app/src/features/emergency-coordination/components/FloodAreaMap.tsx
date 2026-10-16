import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import type { EmergencyLocation } from "../types";

type Props = {
    district: string;
    locations: EmergencyLocation[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
};

export function FloodAreaMap({ district, locations, selectedId, onSelect }: Props) {
    const selected = locations.find((l) => l.id === selectedId);

    return (
        <Card style={styles.card} testID="flood-map-card">
            <Text style={styles.title}>Affected flood area</Text>
            <View style={styles.map}>
                <View style={styles.area} />
                <View style={styles.river} />
                {locations.map((l) => {
                    const active = l.id === selectedId;
                    return (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Location ${l.name}`}
                            key={l.id}
                            onPress={() => onSelect(active ? null : l.id)}
                            style={[styles.marker, { left: `${l.mapX}%`, top: `${l.mapY}%` }]}
                            testID={`map-location-${l.id}`}
                        >
                            <View
                                style={[
                                    styles.dot,
                                    { backgroundColor: l.isEpicenter ? colors.red : colors.primary },
                                    active && styles.dotActive,
                                ]}
                            />
                            <Text style={[styles.markerLabel, active && styles.markerLabelActive]}>
                                {l.name}
                            </Text>
                        </Pressable>
                    );
                })}
                <Text style={styles.caption}>{district} District · Flood affected area</Text>
            </View>
            <Text style={styles.hint} testID="map-selection">
                {selected
                    ? `Selected: ${selected.name}${selected.isEpicenter ? " (epicentre)" : ""}`
                    : "Tap a location to focus it."}
            </Text>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { flex: 1.5, gap: spacing.md, minWidth: 320 },
    title: { color: colors.text, fontSize: typography.sizes.lg, fontWeight: "700" },
    map: {
        backgroundColor: "#E8F0F8",
        borderRadius: 10,
        height: 254,
        overflow: "hidden",
        position: "relative",
    },
    area: {
        backgroundColor: "#F4F8FC",
        borderColor: "#C7D5E6",
        borderRadius: 120,
        borderWidth: 1.5,
        bottom: 22,
        left: 10,
        position: "absolute",
        right: 10,
        top: 10,
    },
    river: {
        backgroundColor: "#8DB8D8",
        height: 3,
        left: -20,
        position: "absolute",
        right: -20,
        top: "74%",
        transform: [{ rotate: "-6deg" }],
    },
    marker: { alignItems: "center", flexDirection: "row", gap: 6, position: "absolute" },
    dot: { borderRadius: 999, height: 8, width: 8 },
    dotActive: { borderColor: colors.navy, borderWidth: 2, height: 14, width: 14 },
    markerLabel: { color: colors.text, fontSize: 11, fontWeight: "600" },
    markerLabelActive: { color: colors.primary, fontWeight: "800" },
    caption: { bottom: 6, color: colors.textMuted, fontSize: 10, left: 10, position: "absolute" },
    hint: { color: colors.textSecondary, fontSize: typography.sizes.xs },
});
