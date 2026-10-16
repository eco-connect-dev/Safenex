import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import type { EmergencyLocation } from "../types";
import { OperationsMap } from "./OperationsMap";
import type { OperationsMapFeature } from "./operationsMapTypes";

type Props = { district: string; locations: EmergencyLocation[]; selectedId: string | null; onSelect: (id: string | null) => void };

export function FloodAreaMap({ district, locations, selectedId, onSelect }: Props) {
    const selected = locations.find((location) => location.id === selectedId);
    const features: OperationsMapFeature[] = locations.map((location) => ({
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        category: location.isEpicenter ? "hazard" : "location",
        detail: location.isEpicenter ? "Flood epicentre" : `${district} District response location`,
    }));

    return <Card style={styles.card} testID="flood-map-card">
        <Text style={styles.title}>Affected flood area</Text>
        <OperationsMap features={features} selectedId={selectedId} onSelect={(id) => onSelect(selectedId === id ? null : id)} testID="flood-area-map" />
        <View style={styles.locations}>
            {locations.map((location) => <Pressable
                key={location.id}
                accessibilityRole="button"
                accessibilityLabel={`Location ${location.name}`}
                onPress={() => onSelect(selectedId === location.id ? null : location.id)}
                style={[styles.locationChip, selectedId === location.id && styles.locationSelected]}
                testID={`map-location-${location.id}`}
            ><View style={[styles.dot, { backgroundColor: location.isEpicenter ? colors.red : colors.primary }]} /><Text style={[styles.locationLabel, selectedId === location.id && styles.locationLabelSelected]}>{location.name}</Text></Pressable>)}
        </View>
        <Text style={styles.hint} testID="map-selection">{selected ? `Selected: ${selected.name}${selected.isEpicenter ? " (epicentre)" : ""}` : locations.length ? `Interactive map · ${district} District` : "Tap a location to focus it."}</Text>
        <Text style={styles.attribution}>Map data © OpenStreetMap contributors</Text>
    </Card>;
}

const styles = StyleSheet.create({
    card: { flex: 1.5, gap: spacing.md, minWidth: 320 },
    title: { color: colors.text, fontSize: typography.sizes.lg, fontWeight: "700" },
    locations: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
    locationChip: { alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 5 },
    locationSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    dot: { borderRadius: 99, height: 8, width: 8 },
    locationLabel: { color: colors.textSecondary, fontSize: 10 },
    locationLabelSelected: { color: colors.primary, fontWeight: "700" },
    hint: { color: colors.textSecondary, fontSize: typography.sizes.xs },
    attribution: { color: colors.textMuted, fontSize: 9 },
});
