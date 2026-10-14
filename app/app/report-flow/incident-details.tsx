import { IncidentDetailsScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { createHazardNavigation } from "@/src/features/hazard-reporting/navigation";

export default function IncidentDetailsRoute() {
  return (
    <IncidentDetailsScreen
      navigation={createHazardNavigation()}
      route={{ key: "incident-details", name: "IncidentDetails" }}
    />
  );
}
