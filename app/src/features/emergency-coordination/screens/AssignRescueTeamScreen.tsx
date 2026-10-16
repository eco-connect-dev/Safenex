import { router, type Href } from "expo-router";
import { ArrowRight, ChevronDown, Info } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";

import { Card, Icon } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";
import { useActiveEmergency } from "../hooks/useActiveEmergency";
import { dispatchRescueTeam, getRescueTeams, type RescueTeam } from "../services/emergencyCoordinationService";
import { emergencyCoordinationRoutes } from "../routes";

export function AssignRescueTeamScreen() {
    const { width } = useWindowDimensions();
    const { data } = useActiveEmergency();
    const locations = useMemo(() => data?.locations.map((location) => location.name) ?? ["Rambukkana", "Kegalle", "Mawanella"], [data]);
    const [teams, setTeams] = useState<RescueTeam[]>(getRescueTeams());
    const [selectedId, setSelectedId] = useState("RT-01");
    const [target, setTarget] = useState(locations[0] ?? "Rambukkana");
    const [mission, setMission] = useState("Support evacuation of isolated households and report field status.");
    const [locationOpen, setLocationOpen] = useState(false);
    const [success, setSuccess] = useState("");
    const selectedTeam = teams.find((team) => team.id === selectedId);
    const isWide = width >= 900;

    const selectTeam = (team: RescueTeam) => {
        if (team.status === "Available") setSelectedId(team.id);
    };
    const handleDispatch = () => {
        try {
            const dispatch = dispatchRescueTeam({ teamId: selectedId, targetLocation: target, missionDetails: mission });
            setTeams(getRescueTeams());
            setSuccess(`${dispatch.teamId} (${selectedTeam?.organisation}) dispatched to ${dispatch.targetLocation}.`);
        } catch (error) {
            Alert.alert("Unable to dispatch team", error instanceof Error ? error.message : "Please check the dispatch details.");
        }
    };

    return <ScrollView contentContainerStyle={styles.page} testID="assign-rescue-team-screen">
        <View style={styles.header}>
            <Text style={styles.title}>Assign Rescue Team</Text>
            <Text style={styles.subtitle}>Review available rescue teams, select one and dispatch it to the affected location.</Text>
        </View>
        {success ? <View style={styles.success} accessibilityRole="alert" testID="dispatch-success"><Text style={styles.successText}>{success}</Text></View> : null}
        <View style={[styles.columns, isWide ? styles.row : styles.column]}>
            <Card style={[styles.card, isWide && styles.teamCard]}>
                <Text style={styles.cardTitle}>Available rescue teams</Text>
                <Text style={styles.muted}>Current operational availability</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}><Text style={styles.colId}>Team ID</Text><Text style={styles.colOrg}>Organisation</Text><Text style={styles.colStatus}>Status</Text><Text style={styles.colLocation}>Location</Text><Text style={styles.colAction}>Action</Text></View>
                    {teams.map((team) => <View key={team.id} style={styles.tableRow} testID={`team-row-${team.id}`}>
                        <Text style={[styles.cell, styles.colId, styles.teamId]}>{team.id}</Text><Text style={[styles.cell, styles.colOrg]}>{team.organisation}</Text>
                        <Text style={[styles.cell, styles.colStatus, team.status === "Available" ? styles.available : styles.busy]}>{team.status}</Text><Text style={[styles.cell, styles.colLocation]}>{team.location}</Text>
                        {team.status === "Available" ? <Pressable accessibilityRole="button" accessibilityLabel={`Select ${team.id}`} onPress={() => selectTeam(team)} style={styles.colAction} testID={`select-${team.id}`}><Text style={styles.selectLink}>{selectedId === team.id ? "Selected" : "Select"}</Text></Pressable> : <Text style={[styles.cell, styles.colAction, styles.muted]}>Busy</Text>}
                    </View>)}
                </View>
                <View style={styles.warning}><Icon color={colors.amber} icon={Info} size={17} /><Text style={styles.warningText}>Only an available team can be dispatched. RT-03 is already on mission.</Text></View>
            </Card>
            <Card style={[styles.card, isWide && styles.dispatchCard]}>
                <Text style={styles.cardTitle}>Dispatch details</Text>
                <Text style={styles.label}>Select team</Text>
                <View style={styles.selectBox}>
                    <Text style={styles.selectValue}>{selectedTeam ? `${selectedTeam.id} (${selectedTeam.organisation})` : "Select an available team"}</Text>
                    <Icon color={colors.textSecondary} icon={ChevronDown} size={16} />
                </View>
                <Text style={styles.label}>Target location</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Select target location" onPress={() => setLocationOpen((open) => !open)} style={styles.selectBox} testID="target-location-trigger">
                    <Text style={styles.selectValue}>{target}</Text><Icon color={colors.textSecondary} icon={ChevronDown} size={16} />
                </Pressable>
                {locationOpen ? <View style={styles.locationMenu} testID="target-location-menu">{locations.map((location) => <Pressable key={location} accessibilityRole="button" onPress={() => { setTarget(location); setLocationOpen(false); }} style={styles.locationOption} testID={`location-${location}`}><Text style={styles.selectValue}>{location}</Text></Pressable>)}</View> : null}
                <Text style={styles.label}>Mission details</Text>
                <TextInput accessibilityLabel="Mission details" multiline onChangeText={setMission} style={styles.textarea} testID="mission-details" value={mission} />
                <View style={styles.info}><Icon color={colors.primary} icon={Info} size={17} /><Text style={styles.infoText}>The team status will change to Dispatched after confirmation.</Text></View>
                <View style={styles.actions}>
                    <Pressable accessibilityRole="button" onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as Href)} style={styles.cancel} testID="cancel-dispatch"><Text style={styles.cancelText}>Cancel</Text></Pressable>
                    <Pressable accessibilityRole="button" disabled={!selectedTeam || selectedTeam.status !== "Available" || !target || !mission.trim()} onPress={handleDispatch} style={[styles.dispatch, (!selectedTeam || selectedTeam.status !== "Available" || !target || !mission.trim()) && styles.disabled]} testID="dispatch-team"><Text style={styles.dispatchText}>Dispatch team</Text><Icon color={colors.white} icon={ArrowRight} size={16} /></Pressable>
                </View>
            </Card>
        </View>
        <Text style={styles.footer}>Flood – {data?.event.district ?? "Kegalle"} · Rescue teams display their organisation, current location and operational status.</Text>
    </ScrollView>;
}

const styles = StyleSheet.create({
    page: { backgroundColor: colors.background, flexGrow: 1, gap: spacing.xl, padding: spacing.xl },
    header: { gap: spacing.xs }, title: { color: colors.navy, fontSize: 30, fontWeight: "800" }, subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm },
    columns: { alignItems: "flex-start", gap: spacing.xl }, row: { flexDirection: "row" }, column: { flexDirection: "column" }, card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.md, padding: spacing.xl, width: "100%" }, teamCard: { flex: 1.65 }, dispatchCard: { flex: 1 },
    cardTitle: { color: colors.navy, fontSize: typography.sizes.lg, fontWeight: "700" }, muted: { color: colors.textSecondary, fontSize: typography.sizes.xs }, table: { marginTop: spacing.sm }, tableHeader: { alignItems: "center", flexDirection: "row", paddingHorizontal: spacing.sm, paddingVertical: spacing.md }, tableRow: { alignItems: "center", flexDirection: "row", minHeight: 60, paddingHorizontal: spacing.sm }, cell: { color: colors.navy, fontSize: typography.sizes.xs }, colId: { flex: 0.95 }, colOrg: { flex: 1 }, colStatus: { flex: 1 }, colLocation: { flex: 1 }, colAction: { flex: 0.65 }, teamId: { fontWeight: "700" }, available: { color: colors.green }, busy: { color: colors.amber }, selectLink: { color: colors.primary, fontSize: typography.sizes.xs },
    warning: { alignItems: "center", backgroundColor: colors.amberSoft, borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, padding: spacing.md }, warningText: { color: colors.amber, flex: 1, fontSize: typography.sizes.xs }, label: { color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: spacing.xs }, selectBox: { alignItems: "center", borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, flexDirection: "row", height: 44, justifyContent: "space-between", paddingHorizontal: spacing.md }, selectValue: { color: colors.navy, fontSize: typography.sizes.sm }, locationMenu: { borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, overflow: "hidden" }, locationOption: { borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.md }, textarea: { borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, color: colors.navy, fontSize: typography.sizes.sm, minHeight: 100, padding: spacing.md, textAlignVertical: "top" }, info: { alignItems: "flex-start", backgroundColor: colors.primarySoft, borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, infoText: { color: colors.primary, flex: 1, fontSize: typography.sizes.xs, lineHeight: 18 }, actions: { flexDirection: "row", gap: spacing.sm, justifyContent: "flex-end", marginTop: spacing.xs }, cancel: { alignItems: "center", borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, justifyContent: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md }, cancelText: { color: colors.navy, fontSize: typography.sizes.xs, fontWeight: "600" }, dispatch: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.md, flexDirection: "row", gap: spacing.xs, justifyContent: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md }, dispatchText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: "700" }, disabled: { opacity: 0.5 }, success: { backgroundColor: colors.greenSoft, borderRadius: radii.md, padding: spacing.md }, successText: { color: colors.green, fontSize: typography.sizes.sm, fontWeight: "600" }, footer: { color: colors.textSecondary, fontSize: typography.sizes.xs },
});
