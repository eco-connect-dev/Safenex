import { StyleSheet, Text } from "react-native";

import { colors, radii, spacing, typography } from "@/src/theme";
import { Card } from "./Card";

export type MetricCardProps = {
  label: string;
  value: string;
  change?: string;
  changeTone?: "positive" | "negative" | "neutral";
};

export function MetricCard({
  label,
  value,
  change,
  changeTone = "neutral",
}: MetricCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {change ? (
        <Text style={[styles.change, styles[changeTone]]}>{change}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.md, minWidth: 150 },
  label: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  value: {
    color: colors.text,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  change: {
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  positive: { color: colors.green },
  negative: { color: colors.red },
  neutral: { color: colors.textSecondary },
});
