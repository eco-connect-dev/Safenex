import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { EventDetailsScreen } from "@/src/features/emergency-coordination/screens/EventDetailsScreen";

export default function EventDetailsWebRoute() {
    return (
        <DmcWebShell
            activeNav="emergency-coordination"
            profileInitials="DO"
            profileName="DMC Duty Officer"
            profileSubtitle="Emergency coordination"
            protocol=""
            topbarTitle="EVENT DETAILS"
        >
            <EventDetailsScreen />
        </DmcWebShell>
    );
}
