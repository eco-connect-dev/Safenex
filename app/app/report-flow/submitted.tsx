import { SubmittedScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { createHazardNavigation } from "@/src/features/hazard-reporting/navigation";

export default function SubmittedRoute() {
  return (
    <SubmittedScreen
      navigation={createHazardNavigation()}
      route={{ key: "submitted", name: "Submitted" }}
    />
  );
}
