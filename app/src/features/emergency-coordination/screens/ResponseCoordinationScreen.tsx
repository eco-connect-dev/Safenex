import { router, useLocalSearchParams, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, Card } from "@/src/components/ui";
import { colors, spacing, typography } from "@/src/theme";
import { useActiveEmergency } from "../hooks/useActiveEmergency";
import { emergencyCoordinationRoutes } from "../routes";

const FOCUS_LABEL: Record<string, string> = {
    shelters: "Shelters",
    rescue: "Rescue teams",
    relief: "Relief resources",
};

export function ResponseCoordinationScreen() {
    const { eventId, focus } = useLocalSearchParams<{ eventId: string; focus?: string }>();
    const { data } = useActiveEmergency(eventId);

    return (
        <ScrollView contentContainerStyle={styles.content} testID="response-coordination-screen">
            <Text style={styles.heading}>Response coordination</Text>
            <Text style={styles.muted}>
                {data ? `${data.event.district} ${data.event.hazardType} response` : "Loading event…"}
            </Text>
            <Card style={styles.card}>
                <Text style={styles.cardTitle} testID="focus-label">
                    Focus: {focus ? (FOCUS_LABEL[focus] ?? focus) : "All resources"}
                </Text>
                <Text style={styles.muted}>
                    The shelter, rescue-team and relief-resource coordination screens will be
                    built here next.
                </Text>
            </Card>
            <View style={styles.actions}>
                <Button
                    label="← Back to active emergency"
                    onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as Href)}
                    testID="back-button"
                    variant="outline"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { gap: spacing.lg, padding: spacing.xxl },
    heading: { color: colors.text, fontSize: 28, fontWeight: "800" },
    muted: { color: colors.textSecondary, fontSize: typography.sizes.sm },
    card: { gap: spacing.sm, maxWidth: 640 },
    cardTitle: { color: colors.text, fontSize: typography.sizes.lg, fontWeight: "700" },
    actions: { flexDirection: "row" },
});
