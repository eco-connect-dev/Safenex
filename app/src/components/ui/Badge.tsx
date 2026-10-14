import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/src/theme";

export type BadgeTone = "info" | "success" | "warning" | "danger" | "neutral";

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const palette = tonePalette[tone];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.dot, { backgroundColor: palette.foreground }]} />
      <Text style={[styles.label, { color: palette.foreground }]}>{label}</Text>
    </View>
  );
}

const tonePalette: Record<
  BadgeTone,
  { background: string; foreground: string }
> = {
  info: { background: colors.blueSoft, foreground: colors.blue },
  success: { background: colors.greenSoft, foreground: colors.green },
  warning: { background: colors.amberSoft, foreground: colors.amber },
  danger: { background: colors.redSoft, foreground: colors.red },
  neutral: { background: colors.border, foreground: colors.textSecondary },
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: { borderRadius: radii.pill, height: 6, width: 6 },
  label: { fontSize: typography.sizes.xs, fontWeight: "700" },
});
