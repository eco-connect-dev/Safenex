import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { SheltersInAffectedAreaScreen } from "@/src/features/emergency-coordination/screens/SheltersInAffectedAreaScreen";

export default function SheltersInAffectedAreaByEventWebRoute() {
    return (
        <DmcWebShell
            activeNav="emergency-coordination"
            profileInitials=""
            profileName="District Officer · DMC"
            profileSubtitle=""
            protocol=""
            showTopbarSignOut={false}
            topbarTitle="District emergency operations"
        >
            <SheltersInAffectedAreaScreen />
        </DmcWebShell>
    );
}
