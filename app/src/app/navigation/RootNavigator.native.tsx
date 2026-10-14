import { Stack } from "expo-router";

export type MobileRootStackParamList = {
  MobileHome: undefined;
  HazardType: undefined;
  IncidentDetails: undefined;
  Evidence: undefined;
  Location: undefined;
  ReviewReport: undefined;
  Submitted: undefined;
  MyReports: undefined;
  Alerts: undefined;
  Profile: undefined;
};

export default function RootNavigator() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
