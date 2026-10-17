import { router, type Href } from "expo-router";
import { ArrowRight, CheckCircle2, ChevronDown, Info } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";

import { Card, Icon } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";
import { useActiveEmergency } from "../hooks/useActiveEmergency";
import { createReliefAllocation, fetchReliefResources, getReliefResources, type ReliefResource } from "../services/emergencyCoordinationService";
import { emergencyCoordinationRoutes } from "../routes";

const distributionLocations = ["Mawanella Sports Complex", "Kegalle Central College", "Rambukkana Youth Centre", "Ruwanwella Vidyalaya"];

export function AllocateReliefResourcesScreen() {
    const { width } = useWindowDimensions();
    const { data, source } = useActiveEmergency();
    const [resources, setResources] = useState<ReliefResource[]>(getReliefResources());
    const [submitting, setSubmitting] = useState(false);
    const [resourceId, setResourceId] = useState("food-packs");
    const [quantityText, setQuantityText] = useState("200");
    const [location, setLocation] = useState(distributionLocations[0]);
    const [resourceOpen, setResourceOpen] = useState(false);
    const [locationOpen, setLocationOpen] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const selected = resources.find((resource) => resource.id === resourceId);
    const quantity = Number(quantityText);
    const validQuantity = Number.isInteger(quantity) && quantity > 0;
    const withinStock = Boolean(selected && validQuantity && quantity <= selected.available);
    const remaining = selected ? Math.max(0, selected.available - (validQuantity ? quantity : 0)) : 0;
    const isWide = width >= 900;
    const stockText = useMemo(() => selected ? `Stock check: ${selected.available.toLocaleString()} ${selected.name.toLowerCase()} available from ${selected.organisation}, ${remaining.toLocaleString()} will remain after this allocation.` : "Select a resource to view its available stock.", [selected, remaining]);

    useEffect(() => {
        let current = true;
        fetchReliefResources().then((rows) => { if (current) setResources(rows); })
            .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load relief stock."));
        return () => { current = false; };
    }, []);

    const confirm = async () => {
        if (!withinStock) return;
        if (submitting) return;
        setSubmitting(true);
        try {
            const allocation = await createReliefAllocation({ resourceId, quantity, location }, source === "supabase" ? data?.event.id : undefined);
            setResources(await fetchReliefResources());
            setSuccess(`${allocation.quantity.toLocaleString()} ${allocation.resource.toLowerCase()} allocated to ${allocation.location}.`);
            setError("");
        } catch (allocationError) {
            setError(allocationError instanceof Error ? allocationError.message : "Unable to record this allocation.");
        } finally {
            setSubmitting(false);
        }
    };

    return <ScrollView contentContainerStyle={styles.page} testID="allocate-relief-screen">
        <View style={styles.header}><Text style={styles.title}>Allocate Relief Resources</Text><Text style={styles.subtitle}>Review relief stock by owning organisation and allocate the required quantity to a distribution location.</Text></View>
        {success ? <View accessibilityRole="alert" style={styles.success} testID="relief-allocation-success"><Icon color={colors.green} icon={CheckCircle2} size={18} /><Text style={styles.successText}>{success}</Text></View> : null}
        <View style={[styles.columns, isWide ? styles.row : styles.column]}>
            <Card style={[styles.card, isWide && styles.resourceCard]}>
                <Text style={styles.cardTitle}>Available resources</Text><Text style={styles.muted}>Resource ownership and current available quantity</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}><Text style={[styles.colResource, styles.headerText]}>Resource</Text><Text style={[styles.colOrganisation, styles.headerText]}>Organisation</Text><Text style={[styles.colQuantity, styles.headerText]}>Available quantity</Text><Text style={[styles.colAction, styles.headerText]}>Action</Text></View>
                    {resources.map((resource) => <View key={resource.id} style={styles.tableRow} testID={`resource-row-${resource.id}`}>
                        <Text style={[styles.cell, styles.colResource, styles.bold]}>{resource.name}</Text><Text style={[styles.cell, styles.colOrganisation]}>{resource.organisation}</Text><Text style={[styles.cell, styles.colQuantity]}>{resource.available.toLocaleString()}{resource.unit ? ` ${resource.unit}` : ""}</Text>
                        <Pressable accessibilityRole="button" accessibilityLabel={`Select ${resource.name}`} onPress={() => { setResourceId(resource.id); setSuccess(""); setError(""); }} style={styles.colAction} testID={`select-resource-${resource.id}`}><Text style={styles.link}>{resource.id === resourceId ? "Selected" : "Select"}</Text></Pressable>
                    </View>)}
                </View>
                <Text style={styles.muted}>Responsible organisations remain attached to each allocation record.</Text>
            </Card>
            <Card style={[styles.card, isWide && styles.detailsCard]}>
                <Text style={styles.cardTitle}>Allocation details</Text>
                <Text style={styles.label}>Resource</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Choose relief resource" onPress={() => setResourceOpen((open) => !open)} style={styles.select} testID="resource-select-trigger"><Text style={styles.value}>{selected?.name ?? "Select resource"}</Text><Icon color={colors.textSecondary} icon={ChevronDown} size={16} /></Pressable>
                {resourceOpen ? <View style={styles.menu} testID="resource-menu">{resources.map((resource) => <Pressable key={resource.id} accessibilityRole="button" onPress={() => { setResourceId(resource.id); setResourceOpen(false); setSuccess(""); }} style={styles.option} testID={`resource-option-${resource.id}`}><Text style={styles.value}>{resource.name} · {resource.organisation}</Text></Pressable>)}</View> : null}
                <Text style={styles.label}>Quantity</Text><TextInput accessibilityLabel="Allocation quantity" keyboardType="number-pad" onChangeText={(value) => { setQuantityText(value); setSuccess(""); setError(""); }} style={styles.input} testID="allocation-quantity" value={quantityText} />
                <Text style={styles.label}>Distribution location</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Choose distribution location" onPress={() => setLocationOpen((open) => !open)} style={styles.select} testID="distribution-location-trigger"><Text style={styles.value}>{location}</Text><Icon color={colors.textSecondary} icon={ChevronDown} size={16} /></Pressable>
                {locationOpen ? <View style={styles.menu} testID="distribution-location-menu">{distributionLocations.map((item) => <Pressable key={item} accessibilityRole="button" onPress={() => { setLocation(item); setLocationOpen(false); }} style={styles.option} testID={`distribution-location-${item}`}><Text style={styles.value}>{item}</Text></Pressable>)}</View> : null}
                <View style={[styles.notice, !withinStock && styles.warning]}><Icon color={withinStock ? colors.primary : colors.amber} icon={Info} size={17} /><Text style={[styles.noticeText, !withinStock && styles.warningText]} testID="stock-check">{stockText}</Text></View>
                {error ? <Text accessibilityRole="alert" style={styles.error} testID="allocation-error">{error}</Text> : null}
                <View style={styles.actions}><Pressable accessibilityRole="button" onPress={() => router.push(emergencyCoordinationRoutes.activeEmergency as Href)} style={styles.cancel} testID="cancel-allocation"><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable accessibilityRole="button" disabled={!withinStock || submitting} onPress={confirm} style={[styles.confirm, (!withinStock || submitting) && styles.disabled]} testID="confirm-allocation"><Text style={styles.confirmText}>{submitting ? "Recording…" : "Confirm allocation"}</Text><Icon color={colors.white} icon={ArrowRight} size={16} /></Pressable></View>
            </Card>
        </View>
        <View style={styles.valid}><Icon color={colors.green} icon={CheckCircle2} size={17} /><Text style={styles.validText}>{withinStock ? "Requested quantity is within the available inventory. Confirm to record the allocation and update remaining stock." : "Enter a whole quantity within the available inventory to continue."}</Text></View>
        <Text style={styles.footer}>Flood · {data?.event.district ?? "Kegalle"} · Allocation records retain the responsible organisation, quantity and distribution location.</Text>
    </ScrollView>;
}

const styles = StyleSheet.create({
    page: { backgroundColor: colors.background, flexGrow: 1, gap: spacing.xl, padding: spacing.xl }, header: { gap: spacing.xs }, title: { color: colors.navy, fontSize: 30, fontWeight: "800" }, subtitle: { color: colors.textSecondary, fontSize: typography.sizes.sm }, columns: { alignItems: "flex-start", gap: spacing.xl }, row: { flexDirection: "row" }, column: { flexDirection: "column" }, card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, gap: spacing.md, padding: spacing.xl, width: "100%" }, resourceCard: { flex: 1.65 }, detailsCard: { flex: 1 }, cardTitle: { color: colors.navy, fontSize: typography.sizes.lg, fontWeight: "700" }, muted: { color: colors.textSecondary, fontSize: typography.sizes.xs }, table: { marginVertical: spacing.xs }, tableHeader: { alignItems: "center", flexDirection: "row", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }, headerText: { color: colors.textSecondary, fontSize: 11, fontWeight: "600" }, tableRow: { alignItems: "center", flexDirection: "row", minHeight: 64, paddingHorizontal: spacing.sm }, cell: { color: colors.navy, fontSize: typography.sizes.xs }, colResource: { flex: 1.1 }, colOrganisation: { flex: 1.15 }, colQuantity: { flex: 1.15 }, colAction: { flex: 0.65 }, bold: { fontWeight: "700" }, link: { color: colors.primary, fontSize: typography.sizes.xs }, label: { color: colors.textSecondary, fontSize: typography.sizes.xs, marginTop: spacing.xs }, select: { alignItems: "center", borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, flexDirection: "row", height: 44, justifyContent: "space-between", paddingHorizontal: spacing.md }, value: { color: colors.navy, fontSize: typography.sizes.sm }, menu: { borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, overflow: "hidden" }, option: { borderBottomColor: colors.border, borderBottomWidth: 1, padding: spacing.md }, input: { borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, color: colors.navy, fontSize: typography.sizes.sm, height: 44, paddingHorizontal: spacing.md }, notice: { alignItems: "flex-start", backgroundColor: colors.primarySoft, borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, noticeText: { color: colors.primary, flex: 1, fontSize: typography.sizes.xs, lineHeight: 18 }, warning: { backgroundColor: colors.amberSoft }, warningText: { color: colors.amber }, error: { color: colors.red, fontSize: typography.sizes.xs }, actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "flex-end", marginTop: spacing.xs }, cancel: { alignItems: "center", borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, justifyContent: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md }, cancelText: { color: colors.navy, fontSize: typography.sizes.xs, fontWeight: "600" }, confirm: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radii.md, flexDirection: "row", gap: spacing.xs, justifyContent: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md }, confirmText: { color: colors.white, fontSize: typography.sizes.xs, fontWeight: "700" }, disabled: { opacity: 0.5 }, valid: { alignItems: "center", backgroundColor: "#E7F5EF", borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, validText: { color: colors.green, flex: 1, fontSize: typography.sizes.xs }, success: { alignItems: "center", backgroundColor: colors.greenSoft, borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md }, successText: { color: colors.green, flex: 1, fontSize: typography.sizes.sm, fontWeight: "600" }, footer: { color: colors.textSecondary, fontSize: typography.sizes.xs },
});
