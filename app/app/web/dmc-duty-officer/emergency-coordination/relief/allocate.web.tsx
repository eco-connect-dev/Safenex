import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { AllocateReliefResourcesScreen } from "@/src/features/emergency-coordination/screens/AllocateReliefResourcesScreen";

export default function AllocateReliefResourcesWebRoute() {
    return <DmcWebShell activeNav="emergency-coordination" profileInitials="DO" profileName="DMC Duty Officer" profileSubtitle="Emergency coordination" protocol="" topbarTitle="DISTRICT EMERGENCY OPERATIONS"><AllocateReliefResourcesScreen /></DmcWebShell>;
}
