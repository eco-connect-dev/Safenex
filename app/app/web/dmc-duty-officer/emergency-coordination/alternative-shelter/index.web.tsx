import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { SelectAlternativeShelterScreen } from "@/src/features/emergency-coordination/screens/SelectAlternativeShelterScreen";

export default function SelectAlternativeShelterWebRoute() {
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
            <SelectAlternativeShelterScreen />
        </DmcWebShell>
    );
}
