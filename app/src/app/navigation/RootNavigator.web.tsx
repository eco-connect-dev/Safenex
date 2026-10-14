import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/src/theme";
import {
  GroundReportsScreen,
  VerifyReportScreen,
} from "@/src/features/ground-verification/screens/GroundVerificationScreens";

export type WebRootDrawerParamList = {
  OfficerDashboard: undefined;
  GroundReports: undefined;
  VerifyReport: { reportId: string };
};

const Drawer = createDrawerNavigator<WebRootDrawerParamList>();

function OfficerDashboardPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safenex DMC workspace</Text>
      <Text style={styles.message}>
        District officer dashboards and coordination tools will be added here.
      </Text>
    </View>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          drawerActiveTintColor: colors.primary,
          drawerStyle: { backgroundColor: colors.navy },
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.navy,
        }}
      >
        <Drawer.Screen
          component={OfficerDashboardPlaceholder}
          name="OfficerDashboard"
          options={{ title: "DMC dashboard" }}
        />
        <Drawer.Screen
          component={GroundReportsScreen}
          name="GroundReports"
          options={{ title: "Ground reports" }}
        />
        <Drawer.Screen
          component={VerifyReportScreen}
          name="VerifyReport"
          options={{
            drawerItemStyle: { display: "none" },
            title: "Verify ground report",
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: {
    color: colors.navy,
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
