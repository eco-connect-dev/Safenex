import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { ResponseCoordinationScreen } from "@/src/features/emergency-coordination/screens/ResponseCoordinationScreen";

export default function ResponseCoordinationWebRoute() {
    return (
        <DmcWebShell
            activeNav="emergency-coordination"
            profileInitials="DO"
            profileName="DMC Duty Officer"
            profileSubtitle="Emergency coordination"
            protocol=""
            topbarTitle="RESPONSE COORDINATION"
        >
            <ResponseCoordinationScreen />
        </DmcWebShell>
    );
}
