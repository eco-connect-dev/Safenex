import { router } from "expo-router";

import { GroundReportsScreen } from "@/src/features/ground-verification/screens/GroundVerificationScreens";

export default function GroundReportsWebRoute() {
  return (
    <GroundReportsScreen
      navigation={{
        navigate: (route, params) => {
          if (route === "VerifyReport" && params && "reportId" in params) {
            router.push({
              pathname: "/web/verify-report",
              params: { reportId: params.reportId },
            });
          }
        },
      }}
      route={{
        key: "ground-reports",
        name: "GroundReports",
        params: undefined,
      }}
    />
  );
}
