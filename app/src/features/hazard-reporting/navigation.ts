import { router } from "expo-router";

import type { MobileRootStackParamList } from "@/src/app/navigation/RootNavigator.native";

const routePaths: Record<keyof MobileRootStackParamList, string> = {
  MobileHome: "/home",
  HazardType: "/report-flow/hazard-type",
  IncidentDetails: "/report-flow/incident-details",
  Evidence: "/report-flow/evidence",
  Location: "/report-flow/location",
  ReviewReport: "/report-flow/review",
  Submitted: "/report-flow/submitted",
  MyReports: "/report-flow/my-reports",
  Alerts: "/alerts",
  Profile: "/profile",
};

export function createHazardNavigation() {
  return {
    navigate<Route extends keyof MobileRootStackParamList>(route: Route) {
      router.push(routePaths[route] as never);
    },
    goBack() {
      router.back();
    },
  };
}
