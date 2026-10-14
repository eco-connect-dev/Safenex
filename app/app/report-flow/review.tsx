import { ReviewScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { createHazardNavigation } from "@/src/features/hazard-reporting/navigation";

export default function ReviewRoute() {
  return (
    <ReviewScreen
      navigation={createHazardNavigation()}
      route={{ key: "review", name: "ReviewReport" }}
    />
  );
}
