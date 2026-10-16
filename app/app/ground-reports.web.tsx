import { router } from "expo-router";

import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { GroundReportsScreen } from "@/src/features/ground-verification/screens/GroundVerificationScreens";

export default function GroundReportsRoute() {
  return (
    <DmcWebShell activeNav="ground-reports">
      <GroundReportsScreen
        navigation={{
          navigate: (route, params) => {
            if (route === "VerifyReport" && params && "reportId" in params) {
              router.push({
                pathname: "/verify-report",
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
    </DmcWebShell>
  );
}
