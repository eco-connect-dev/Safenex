import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "@/src/theme";

export type MapViewProps = {
  latitude?: number;
  longitude?: number;
  onPress?: (coordinate: { latitude: number; longitude: number }) => void;
};

export function MapView({ onPress }: MapViewProps) {
  return (
    <View
      onTouchEnd={() => onPress?.({ latitude: 0, longitude: 0 })}
      style={styles.container}
    >
      <Text style={styles.label}>Native map placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    flex: 1,
    justifyContent: "center",
    minHeight: 220,
  },
  label: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
});
