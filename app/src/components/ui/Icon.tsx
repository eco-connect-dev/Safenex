import type { LucideIcon } from "lucide-react-native";
import { StyleSheet } from "react-native";

import { colors } from "@/src/theme";

export type IconProps = {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({
  icon: IconComponent,
  size = 20,
  color = colors.text,
  strokeWidth = 2,
}: IconProps) {
  return (
    <IconComponent
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      style={styles.icon}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
  },
});
