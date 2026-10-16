import { StyleSheet, Text, View } from "react-native";

import { colors, typography } from "@/src/theme";
import type { MapCoordinate } from "./SriLankaLocationMap.native";

type Props = {
  latitude: number | null;
  longitude: number | null;
  onSelect: (coordinate: MapCoordinate) => void;
};

export function SriLankaLocationMap({ latitude, longitude }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Sri Lanka map selection is available in the mobile app.
      </Text>
      {latitude !== null && longitude !== null ? (
        <Text style={styles.coords}>
          Selected point: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    gap: 8,
    height: 280,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: colors.primaryDark,
    fontSize: typography.sizes.sm,
    textAlign: "center",
  },
  coords: { color: colors.textMuted, fontSize: typography.sizes.xs },
});
