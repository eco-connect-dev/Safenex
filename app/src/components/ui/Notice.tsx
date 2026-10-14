import {
  Info,
  ShieldAlert,
  TriangleAlert,
  CircleCheck,
} from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/src/theme";
import { Icon } from "./Icon";

export type NoticeTone = "info" | "success" | "warning" | "danger";

export type NoticeProps = {
  title?: string;
  message: string;
  tone?: NoticeTone;
};

export function Notice({ title, message, tone = "info" }: NoticeProps) {
  const palette = noticePalette[tone];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Icon color={palette.foreground} icon={palette.icon} size={20} />
      <View style={styles.content}>
        {title ? (
          <Text style={[styles.title, { color: palette.foreground }]}>
            {title}
          </Text>
        ) : null}
        <Text style={[styles.message, { color: palette.foreground }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const noticePalette: Record<
  NoticeTone,
  { background: string; foreground: string; icon: typeof Info }
> = {
  info: { background: colors.blueSoft, foreground: colors.blue, icon: Info },
  success: {
    background: colors.greenSoft,
    foreground: colors.green,
    icon: CircleCheck,
  },
  warning: {
    background: colors.amberSoft,
    foreground: colors.amber,
    icon: TriangleAlert,
  },
  danger: {
    background: colors.redSoft,
    foreground: colors.red,
    icon: ShieldAlert,
  },
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  content: { flex: 1, gap: spacing.xs },
  title: { fontSize: typography.sizes.sm, fontWeight: "700" },
  message: { fontSize: typography.sizes.sm, lineHeight: 20 },
});
