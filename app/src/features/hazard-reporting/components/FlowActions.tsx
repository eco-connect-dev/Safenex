import { StyleSheet, View } from "react-native";

import { Button } from "@/src/components/ui";
import { spacing } from "@/src/theme";

export function FlowActions({
  onBack,
  onContinue,
  continueLabel = "CONTINUE",
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Button label="BACK" onPress={onBack} size="md" variant="outline" />
      ) : null}
      <View style={styles.primary}>
        <Button label={continueLabel} onPress={onContinue} size="md" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg },
  primary: { flex: 1 },
});
