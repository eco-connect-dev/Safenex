import { ChevronDown } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { colors, radii, spacing, typography } from "@/src/theme";

export type SelectOption<T extends string> = { label: string; value: T };

export type SelectProps<T extends string> = {
  label?: string;
  value?: T;
  options: SelectOption<T>[];
  placeholder?: string;
  onChange: (value: T) => void;
};

export function Select<T extends string>({
  label,
  value,
  options,
  placeholder = "Select an option",
  onChange,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((current) => !current)}
        style={styles.trigger}
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown color={colors.textSecondary} size={18} />
      </Pressable>
      {open ? (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  trigger: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  value: { color: colors.text, fontSize: typography.sizes.md },
  placeholder: { color: colors.textMuted },
  options: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  option: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  optionPressed: { backgroundColor: colors.background },
  optionLabel: { color: colors.text, fontSize: typography.sizes.sm },
});
