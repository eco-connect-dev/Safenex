import { EvidenceScreen } from "@/src/features/hazard-reporting/screens/MobileScreens";
import { createHazardNavigation } from "@/src/features/hazard-reporting/navigation";

export default function EvidenceRoute() {
  return (
    <EvidenceScreen
      navigation={createHazardNavigation()}
      route={{ key: "evidence", name: "Evidence" }}
    />
  );
}
