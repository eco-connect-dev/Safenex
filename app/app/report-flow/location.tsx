import { LocationScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { createHazardNavigation } from "@/src/features/hazard-reporting/navigation";

export default function LocationRoute() {
  return (
    <LocationScreen
      navigation={createHazardNavigation()}
      route={{ key: "location", name: "Location" }}
    />
  );
}
