import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "@/src/theme";
import type { CameraCaptureProps } from "./CameraCapture.native";

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  return (
    <View onTouchEnd={() => onCapture?.("")} style={styles.container}>
      <Text style={styles.label}>Web camera upload placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.navy,
    justifyContent: "center",
    minHeight: 220,
  },
  label: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
});
