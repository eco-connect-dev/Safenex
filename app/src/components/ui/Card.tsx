import type { PropsWithChildren } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

import { colors, radii, spacing } from "@/src/theme";

export type CardProps = PropsWithChildren<ViewProps> & {
  padded?: boolean;
};

export function Card({ children, padded = true, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  padded: { padding: spacing.lg },
});
