import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { colors, radii, spacing, typography } from "@/src/theme";
import { Icon } from "./Icon";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  testID,
}: ButtonProps) {
  const foreground = getForegroundColor(variant);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {icon ? (
            <Icon
              color={foreground}
              icon={icon}
              size={size === "sm" ? 16 : 18}
            />
          ) : null}
          <Text
            style={[
              styles.label,
              styles[`${size}Label`],
              { color: foreground },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function getForegroundColor(variant: ButtonVariant) {
  if (variant === "primary" || variant === "danger") {
    return colors.white;
  }

  return variant === "ghost" ? colors.primary : colors.text;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.red },
  sm: { minHeight: 36, paddingHorizontal: spacing.md },
  md: { minHeight: 44, paddingHorizontal: spacing.lg },
  lg: { minHeight: 52, paddingHorizontal: spacing.xl },
  smLabel: { fontSize: typography.sizes.sm },
  mdLabel: { fontSize: typography.sizes.md },
  lgLabel: { fontSize: typography.sizes.md },
  label: { fontWeight: "700" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
