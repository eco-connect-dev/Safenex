import { HazardTypeScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { createHazardNavigation } from "@/src/features/hazard-reporting/navigation";

export default function HazardTypeRoute() {
  return (
    <HazardTypeScreen
      navigation={createHazardNavigation()}
      route={{ key: "hazard-type", name: "HazardType" }}
    />
  );
}
