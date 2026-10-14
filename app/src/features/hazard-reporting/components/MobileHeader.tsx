import { ChevronLeft, UserRound } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/src/theme";
import { Icon } from "@/src/components/ui";

export type MobileHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showProfile?: boolean;
};

export function MobileHeader({
  title,
  subtitle,
  onBack,
  showProfile = false,
}: MobileHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.back}
        >
          <Icon color={colors.textSecondary} icon={ChevronLeft} size={17} />
        </Pressable>
      ) : (
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>△</Text>
        </View>
      )}
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showProfile ? (
        <View style={styles.profile}>
          <Icon color={colors.white} icon={UserRound} size={16} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  back: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  brandMarkText: { color: colors.white, fontSize: 20, fontWeight: "700" },
  titleWrap: { flex: 1 },
  title: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: "500",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  profile: {
    alignItems: "center",
    backgroundColor: "#7BA8E5",
    borderRadius: radii.pill,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
});
