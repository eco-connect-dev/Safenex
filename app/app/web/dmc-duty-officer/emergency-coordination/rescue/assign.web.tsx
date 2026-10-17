import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { AssignRescueTeamScreen } from "@/src/features/emergency-coordination/screens/AssignRescueTeamScreen";

export default function AssignRescueTeamWebRoute() {
    return <DmcWebShell activeNav="emergency-coordination" profileInitials="DO" profileName="DMC Duty Officer" profileSubtitle="Emergency coordination" protocol="" topbarTitle="DISTRICT EMERGENCY OPERATIONS"><AssignRescueTeamScreen /></DmcWebShell>;
}
