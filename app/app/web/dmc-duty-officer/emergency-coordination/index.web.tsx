import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { ActiveEmergencyScreen } from "@/src/features/emergency-coordination/screens/ActiveEmergencyScreen";

export default function ActiveEmergencyWebRoute() {
    return (
        <DmcWebShell
            activeNav="emergency-coordination"
            profileInitials="DO"
            profileName="DMC Duty Officer"
            profileSubtitle="Emergency coordination"
            protocol=""
            topbarTitle="DISTRICT EMERGENCY OPERATIONS"
        >
            <ActiveEmergencyScreen />
        </DmcWebShell>
    );
}
