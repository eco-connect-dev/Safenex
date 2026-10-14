import { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { colors, radii, spacing, typography } from "@/src/theme";

export type TextFieldProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  function TextField({ label, hint, error, style, ...props }, ref) {
    return (
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, error && styles.inputError, style]}
          {...props}
        />
        {error || hint ? (
          <Text style={[styles.helper, error && styles.error]}>
            {error ?? hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  inputError: { borderColor: colors.red },
  helper: { color: colors.textSecondary, fontSize: typography.sizes.xs },
  error: { color: colors.red },
});
