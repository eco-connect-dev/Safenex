import { Drawer } from "expo-router/drawer";

import { colors } from "@/src/theme";

export type WebRootDrawerParamList = {
  OfficerDashboard: undefined;
  GroundReports: undefined;
  VerifyReport: { reportId: string };
};

export default function RootNavigator() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerStyle: { backgroundColor: colors.navy },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.navy,
      }}
    />
  );
}
