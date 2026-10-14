import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/src/theme";

export default function ProfileTabScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Nadeesha P.</Text>
      <Text style={styles.subtitle}>Community Volunteer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, padding: spacing.xl },
  title: {
    color: colors.navy,
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    marginTop: spacing.sm,
  },
});
