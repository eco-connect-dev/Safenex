import { StyleSheet, View } from "react-native";

import { colors, spacing } from "@/src/theme";

export function ProgressSteps({
  current,
  total = 4,
}: {
  current: number;
  total?: number;
}) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            index < current ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  step: { flex: 1, height: 3 },
  active: { backgroundColor: colors.primary },
  inactive: { backgroundColor: colors.border },
});
