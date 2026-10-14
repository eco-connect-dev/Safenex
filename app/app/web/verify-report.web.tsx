import { router, useLocalSearchParams } from "expo-router";

import { VerifyReportScreen } from "@/src/features/ground-verification/screens/GroundVerificationScreens";

export default function VerifyReportWebRoute() {
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();

  return (
    <VerifyReportScreen
      navigation={{
        navigate: (route, params) => {
          if (route === "GroundReports") {
            router.replace("/web/ground-reports");
          } else if (
            route === "VerifyReport" &&
            params &&
            "reportId" in params
          ) {
            router.replace({
              pathname: "/web/verify-report",
              params: { reportId: params.reportId },
            });
          }
        },
      }}
      route={{
        key: "verify-report",
        name: "VerifyReport",
        params: { reportId: reportId ?? "" },
      }}
    />
  );
}
