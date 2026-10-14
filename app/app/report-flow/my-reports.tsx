import { ReportsScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { createHazardNavigation } from "@/src/features/hazard-reporting/navigation";

export default function MyReportsRoute() {
  return (
    <ReportsScreen
      navigation={createHazardNavigation()}
      route={{ key: "my-reports", name: "MyReports" }}
    />
  );
}
