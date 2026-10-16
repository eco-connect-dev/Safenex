import { router, useLocalSearchParams } from "expo-router";

import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { VerifyReportScreen } from "@/src/features/ground-verification/screens/GroundVerificationScreens";

export default function VerifyReportRoute() {
  const { reportId } = useLocalSearchParams<{ reportId?: string }>();

  return (
    <DmcWebShell activeNav="ground-reports">
      <VerifyReportScreen
        navigation={{
          navigate: (route, params) => {
            if (route === "GroundReports") {
              router.replace("/ground-reports");
            } else if (
              route === "VerifyReport" &&
              params &&
              "reportId" in params
            ) {
              router.replace({
                pathname: "/verify-report",
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
    </DmcWebShell>
  );
}
