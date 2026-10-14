import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button, Card } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";

export default function ReportTabScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>COMMUNITY REPORTING</Text>
        <Text style={styles.title}>Help keep your area safe</Text>
        <Text style={styles.subtitle}>
          Report hazards with clear details, evidence, and location so DMC
          officers can verify what is happening on the ground.
        </Text>
        <Button
          label="Start a hazard report"
          onPress={() => router.push("/report-flow/hazard-type")}
          size="lg"
        />
        <Pressable onPress={() => router.push("/report-flow/my-reports")}>
          <Card style={styles.reportsCard}>
            <Text style={styles.cardTitle}>View my reports</Text>
            <Text style={styles.cardText}>
              Check verification status and feedback from DMC officers.
            </Text>
          </Card>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, padding: spacing.xl },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.navy,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: 23,
  },
  reportsCard: { borderRadius: radii.lg, gap: spacing.sm },
  cardTitle: {
    color: colors.navy,
    fontSize: typography.sizes.md,
    fontWeight: "800",
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});
