import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { OperationalOverviewScreen } from "@/src/features/emergency-coordination/screens/OperationalOverviewScreen";

export default function OperationalOverviewWebRoute() {
    return <DmcWebShell activeNav="emergency-coordination" profileInitials="DO" profileName="DMC Duty Officer" profileSubtitle="Emergency coordination" protocol="" topbarTitle="DISTRICT EMERGENCY OPERATIONS"><OperationalOverviewScreen /></DmcWebShell>;
}
