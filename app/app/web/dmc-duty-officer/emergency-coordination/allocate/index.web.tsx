import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { AllocateEvacueesScreen } from "@/src/features/emergency-coordination/screens/AllocateEvacueesScreen";

export default function AllocateEvacueesWebRoute() {
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
            <AllocateEvacueesScreen />
        </DmcWebShell>
    );
}
