import { router, useLocalSearchParams, type Href } from "expo-router";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    Info,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";

import { Card, Icon } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";
import { useShelters } from "../hooks/useShelters";
import { emergencyCoordinationRoutes } from "../routes";
import type { EmergencyShelter } from "../types";

export function AllocateEvacueesScreen() {
    const { width } = useWindowDimensions();
    const isWide = width >= 840;

    const { shelterId, count } = useLocalSearchParams<{
        shelterId?: string;
        count?: string;
    }>();

    const { shelters, loading, allocate } = useShelters();

    // Available shelters for selection (prioritize shelters in affected area)
    const availableShelters = useMemo(() => {
        return shelters.filter((s) => s.inAffectedArea !== false);
    }, [shelters]);

    // Active selected shelter
    const [selectedId, setSelectedId] = useState<string | null>(() => {
        if (shelterId) return shelterId;
        // Default to Mawanella Sports Complex if available, else first shelter
        const mawanella = shelters.find((s) => s.name.includes("Mawanella"));
        return mawanella?.id ?? shelters[0]?.id ?? "s4";
    });

    // Ensure selectedId aligns when shelters finish loading
    const activeShelter: EmergencyShelter | undefined = useMemo(() => {
        if (selectedId) {
            const found = shelters.find((s) => s.id === selectedId);
            if (found) return found;
        }
        const mawanella = shelters.find((s) => s.name.includes("Mawanella"));
        return mawanella ?? shelters[0];
    }, [selectedId, shelters]);

    // Evacuee count input
    const initialCount = count && !isNaN(parseInt(count, 10)) ? count : "150";
    const [evacueeCount, setEvacueeCount] = useState<string>(initialCount);
    const [notes, setNotes] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [allocating, setAllocating] = useState(false);
    const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);

    // Calculations
    const currentOccupancy = activeShelter?.currentOccupancy ?? 300;
    const capacity = activeShelter?.capacity ?? 1200;
    const availableSpaces = Math.max(0, capacity - currentOccupancy);

    const parsedCount = parseInt(evacueeCount, 10);
    const isCountNumber = !isNaN(parsedCount) && parsedCount > 0;
    const isWithinCapacity = isCountNumber && parsedCount <= availableSpaces;
    const isExceedingCapacity = isCountNumber && parsedCount > availableSpaces;

    const projectedOccupancy = isCountNumber
        ? currentOccupancy + parsedCount
        : currentOccupancy;

    const occupancyPercent = capacity > 0
        ? Math.min(100, Math.round((currentOccupancy / capacity) * 100))
        : 0;

    const handleSelectShelter = (s: EmergencyShelter) => {
        setSelectedId(s.id);
        setIsDropdownOpen(false);
        setAllocationSuccess(null);
    };

    const handleCancel = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push(emergencyCoordinationRoutes.shelters() as Href);
        }
    };

    const handleAllocate = async () => {
        if (!activeShelter || !isWithinCapacity) return;
        setAllocating(true);
        setAllocationSuccess(null);
        try {
            await allocate(activeShelter.id, parsedCount);
            setAllocationSuccess(
                `Successfully allocated ${parsedCount} evacuees to ${activeShelter.name}.`,
            );
        } catch (err) {
            Alert.alert(
                "Allocation Failed",
                err instanceof Error ? err.message : "Unable to allocate evacuees.",
            );
        } finally {
            setAllocating(false);
        }
    };

    const handleNavigateToAlternative = () => {
        if (!activeShelter) return;
        router.push(
            emergencyCoordinationRoutes.alternativeShelter(
                activeShelter.id,
                parsedCount || 200,
            ) as Href,
        );
    };

    if (loading && shelters.length === 0) {
        return (
            <View style={styles.center} testID="allocate-loading">
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.mutedText}>Loading shelter data…</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.container}
            testID="allocate-evacuees-screen"
        >
            <View style={styles.contentWrapper}>
                {/* Page Header */}
                <View style={styles.header}>
                    <Text style={styles.title} testID="allocate-title">
                        Allocate Evacuees
                    </Text>
                    <Text style={styles.subtitle}>
                        Confirm the selected shelter and record the number of evacuees to be accommodated.
                    </Text>
                </View>

                {/* Success Banner if allocated */}
                {allocationSuccess ? (
                    <View style={styles.successBanner} testID="allocation-success-banner">
                        <Icon color={colors.green} icon={CheckCircle2} size={20} />
                        <Text style={styles.successBannerText}>{allocationSuccess}</Text>
                        <Pressable
                            onPress={() => router.push(emergencyCoordinationRoutes.shelters() as Href)}
                            style={styles.successBannerLink}
                        >
                            <Text style={styles.successBannerLinkText}>Return to shelters →</Text>
                        </Pressable>
                    </View>
                ) : null}

                {/* 2-Column Main Section */}
                <View style={[styles.mainGrid, isWide ? styles.gridRow : styles.gridColumn]}>
                    {/* Left Column: Shelter Allocation Card */}
                    <Card style={[styles.card, isWide && styles.leftColumn]}>
                        <Text style={styles.cardTitle}>Shelter allocation</Text>

                        {/* Dropdown: Select Shelter */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Select shelter</Text>
                            <Pressable
                                accessibilityLabel="Select shelter dropdown"
                                accessibilityRole="button"
                                onPress={() => setIsDropdownOpen((prev) => !prev)}
                                style={styles.dropdownTrigger}
                                testID="shelter-select-trigger"
                            >
                                <Text style={styles.dropdownTriggerText}>
                                    {activeShelter?.name ?? "Select shelter"}
                                </Text>
                                <Icon color={colors.textSecondary} icon={ChevronDown} size={18} />
                            </Pressable>

                            {/* Dropdown Options */}
                            {isDropdownOpen ? (
                                <View style={styles.dropdownMenu} testID="shelter-dropdown-menu">
                                    {availableShelters.map((s) => {
                                        const remaining = Math.max(0, s.capacity - s.currentOccupancy);
                                        const isSelected = s.id === activeShelter?.id;
                                        return (
                                            <Pressable
                                                key={s.id}
                                                onPress={() => handleSelectShelter(s)}
                                                style={[
                                                    styles.dropdownItem,
                                                    isSelected && styles.dropdownItemSelected,
                                                ]}
                                                testID={`shelter-option-${s.id}`}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dropdownItemText,
                                                        isSelected && styles.dropdownItemTextSelected,
                                                    ]}
                                                >
                                                    {s.name}
                                                </Text>
                                                <Text style={styles.dropdownItemSubtext}>
                                                    {remaining} spaces available
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            ) : null}
                        </View>

                        {/* Current Occupancy Metric & Progress */}
                        <View style={styles.occupancySection}>
                            <Text style={styles.sectionHeaderLabel}>CURRENT OCCUPANCY</Text>
                            <View style={styles.occupancyValueRow}>
                                <Text style={styles.occupancyLargeNumber} testID="occupancy-display">
                                    {`${currentOccupancy.toLocaleString()} / ${capacity.toLocaleString()}`}
                                </Text>
                                <View style={styles.availableBadge} testID="available-spaces-badge">
                                    <Text style={styles.availableBadgeText}>
                                        {`${availableSpaces.toLocaleString()} spaces available`}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressBarTrack}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${occupancyPercent}%` },
                                    ]}
                                    testID="occupancy-progress-fill"
                                />
                            </View>
                        </View>

                        {/* Number of Evacuees Input */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Number of evacuees to allocate</Text>
                            <TextInput
                                accessibilityLabel="Number of evacuees to allocate"
                                keyboardType="number-pad"
                                onChangeText={(text) => {
                                    setEvacueeCount(text);
                                    setAllocationSuccess(null);
                                }}
                                placeholder="Enter number of evacuees"
                                placeholderTextColor={colors.textMuted}
                                style={[
                                    styles.input,
                                    isExceedingCapacity && styles.inputError,
                                ]}
                                testID="evacuee-count-input"
                                value={evacueeCount}
                            />
                            {isExceedingCapacity ? (
                                <View style={styles.errorHelperRow}>
                                    <Text style={styles.errorHelperText} testID="capacity-exceeded-helper">
                                        {`Requested allocation exceeds remaining capacity (${availableSpaces} spaces).`}
                                    </Text>
                                    <Pressable
                                        onPress={handleNavigateToAlternative}
                                        style={styles.inlineAlternativeLink}
                                        testID="btn-redirect-alternative"
                                    >
                                        <Text style={styles.inlineAlternativeLinkText}>
                                            Select alternative shelter →
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Text style={styles.helperText} testID="capacity-valid-helper">
                                    The requested allocation is within the available capacity.
                                </Text>
                            )}
                        </View>

                        {/* Notes Input */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Notes (optional)</Text>
                            <TextInput
                                accessibilityLabel="Coordination notes"
                                multiline
                                numberOfLines={3}
                                onChangeText={setNotes}
                                placeholder="Add essential shelter coordination notes..."
                                placeholderTextColor={colors.textMuted}
                                style={styles.textarea}
                                testID="allocation-notes-input"
                                value={notes}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsRow}>
                            <Pressable
                                accessibilityRole="button"
                                onPress={handleCancel}
                                style={({ pressed }) => [
                                    styles.btnCancel,
                                    pressed && styles.btnPressed,
                                ]}
                                testID="btn-cancel"
                            >
                                <Text style={styles.btnCancelText}>Cancel</Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                disabled={!isWithinCapacity || allocating}
                                onPress={handleAllocate}
                                style={({ pressed }) => [
                                    styles.btnAllocate,
                                    (!isWithinCapacity || allocating) && styles.btnDisabled,
                                    pressed && styles.btnPressed,
                                ]}
                                testID="btn-allocate"
                            >
                                {allocating ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.btnAllocateText}>Allocate</Text>
                                        <Icon color={colors.white} icon={ArrowRight} size={16} />
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </Card>

                    {/* Right Column: Allocation Check Card */}
                    <Card style={[styles.card, isWide && styles.rightColumn]}>
                        <Text style={styles.cardTitle}>Allocation check</Text>

                        {/* Shelter Notice Callout */}
                        <View style={styles.shelterNoticeBox} testID="selected-shelter-notice">
                            <Icon color={colors.primary} icon={Info} size={18} />
                            <Text style={styles.shelterNoticeText}>
                                {`${activeShelter?.name ?? "Selected shelter"} · Selected from the available shelters in the affected area.`}
                            </Text>
                        </View>

                        {/* Key-Value Summary List */}
                        <View style={styles.summaryList}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Requested evacuees</Text>
                                <Text style={styles.summaryValue} testID="summary-requested-evacuees">
                                    {isCountNumber ? parsedCount.toLocaleString() : "0"}
                                </Text>
                            </View>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Available spaces before allocation</Text>
                                <Text style={styles.summaryValue} testID="summary-available-spaces">
                                    {availableSpaces.toLocaleString()}
                                </Text>
                            </View>

                            <View style={[styles.summaryRow, styles.summaryRowLast]}>
                                <Text style={styles.summaryLabel}>Projected occupancy</Text>
                                <Text style={styles.summaryValue} testID="summary-projected-occupancy">
                                    {`${projectedOccupancy.toLocaleString()} / ${capacity.toLocaleString()}`}
                                </Text>
                            </View>
                        </View>

                        {/* Validation Alert Box */}
                        {isWithinCapacity ? (
                            <View style={styles.validationSuccessBox} testID="validation-success-box">
                                <Icon color={colors.green} icon={CheckCircle2} size={18} />
                                <Text style={styles.validationSuccessText}>Capacity validated</Text>
                            </View>
                        ) : (
                            <View style={styles.validationWarningBox} testID="validation-warning-box">
                                <Icon color={colors.red} icon={AlertCircle} size={18} />
                                <Text style={styles.validationWarningText}>
                                    {isExceedingCapacity ? "Capacity exceeded" : "Invalid evacuee count"}
                                </Text>
                            </View>
                        )}

                        <Text style={styles.summaryFooterNote}>
                            Confirm allocation to update the shelter occupancy and record the evacuee count.
                        </Text>
                    </Card>
                </View>

                {/* Bottom Offline Notice Banner */}
                <View style={styles.offlineNoticeBanner} testID="offline-capture-notice">
                    <Icon color={colors.primary} icon={Info} size={18} />
                    <Text style={styles.offlineNoticeText}>
                        Offline capture is supported. Entries captured without connectivity will synchronize when the connection is restored.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,
    },
    contentWrapper: {
        alignSelf: "center",
        maxWidth: 1140,
        width: "100%",
    },
    center: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: spacing.xl,
    },
    mutedText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.md,
        marginTop: spacing.md,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        color: colors.navy,
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        marginTop: spacing.xs,
    },
    mainGrid: {
        gap: spacing.xl,
    },
    gridRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    gridColumn: {
        flexDirection: "column",
    },
    leftColumn: {
        flex: 1.35,
    },
    rightColumn: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.lg,
        borderWidth: 1,
        padding: spacing.xl,
        ...Platform.select({
            web: {
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            },
            default: {
                shadowColor: "#0F172A",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
            },
        }),
    },
    cardTitle: {
        color: colors.navy,
        fontSize: typography.sizes.lg,
        fontWeight: "700",
        marginBottom: spacing.lg,
    },
    fieldGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        fontWeight: "600",
        marginBottom: spacing.xs,
    },
    dropdownTrigger: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        height: 44,
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
    },
    dropdownTriggerText: {
        color: colors.navy,
        fontSize: typography.sizes.md,
        fontWeight: "500",
    },
    dropdownMenu: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        marginTop: spacing.xs,
        overflow: "hidden",
        ...Platform.select({
            web: {
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
            },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
        }),
    },
    dropdownItem: {
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    dropdownItemSelected: {
        backgroundColor: colors.primarySoft,
    },
    dropdownItemText: {
        color: colors.navy,
        fontSize: typography.sizes.sm,
        fontWeight: "600",
    },
    dropdownItemTextSelected: {
        color: colors.primary,
    },
    dropdownItemSubtext: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        marginTop: 2,
    },
    occupancySection: {
        marginBottom: spacing.lg,
    },
    sectionHeaderLabel: {
        color: colors.textMuted,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
        letterSpacing: 0.5,
        marginBottom: spacing.xs,
    },
    occupancyValueRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    occupancyLargeNumber: {
        color: colors.navy,
        fontSize: 30,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    availableBadge: {
        backgroundColor: "#DCFCE7",
        borderRadius: radii.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: 5,
    },
    availableBadgeText: {
        color: "#15803D",
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    progressBarTrack: {
        backgroundColor: "#E2E8F0",
        borderRadius: radii.pill,
        height: 8,
        overflow: "hidden",
        width: "100%",
    },
    progressBarFill: {
        backgroundColor: colors.primary,
        borderRadius: radii.pill,
        height: 8,
    },
    input: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        color: colors.navy,
        fontSize: typography.sizes.md,
        height: 44,
        paddingHorizontal: spacing.md,
    },
    inputError: {
        borderColor: colors.red,
    },
    helperText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        marginTop: 6,
    },
    errorHelperRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
        marginTop: 6,
    },
    errorHelperText: {
        color: colors.red,
        fontSize: typography.sizes.xs,
        fontWeight: "600",
    },
    inlineAlternativeLink: {
        marginLeft: 4,
    },
    inlineAlternativeLinkText: {
        color: colors.primary,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
        textDecorationLine: "underline",
    },
    textarea: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        color: colors.navy,
        fontSize: typography.sizes.sm,
        minHeight: 88,
        padding: spacing.md,
        textAlignVertical: "top",
    },
    actionButtonsRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: spacing.md,
        marginTop: spacing.md,
    },
    btnCancel: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        height: 42,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
    },
    btnCancelText: {
        color: colors.navy,
        fontSize: typography.sizes.sm,
        fontWeight: "600",
    },
    btnAllocate: {
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: radii.md,
        flexDirection: "row",
        gap: spacing.xs,
        height: 42,
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
    },
    btnAllocateText: {
        color: colors.white,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    btnDisabled: {
        opacity: 0.5,
    },
    btnPressed: {
        opacity: 0.8,
    },
    shelterNoticeBox: {
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        borderColor: "#DBEAFE",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    shelterNoticeText: {
        color: "#1E40AF",
        flex: 1,
        fontSize: typography.sizes.xs,
        lineHeight: 18,
    },
    summaryList: {
        borderBottomColor: "#F1F5F9",
        borderBottomWidth: 1,
        marginBottom: spacing.lg,
        paddingBottom: spacing.sm,
    },
    summaryRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.md,
    },
    summaryRowLast: {
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
    },
    summaryValue: {
        color: colors.navy,
        fontSize: typography.sizes.md,
        fontWeight: "700",
    },
    validationSuccessBox: {
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    validationSuccessText: {
        color: "#15803D",
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    validationWarningBox: {
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    validationWarningText: {
        color: colors.red,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    summaryFooterNote: {
        color: colors.textMuted,
        fontSize: typography.sizes.xs,
        lineHeight: 18,
    },
    offlineNoticeBanner: {
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        borderColor: "#DBEAFE",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginTop: spacing.xl,
        padding: spacing.md,
    },
    offlineNoticeText: {
        color: "#1D4ED8",
        flex: 1,
        fontSize: typography.sizes.xs,
        lineHeight: 18,
    },
    successBanner: {
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    successBannerText: {
        color: "#15803D",
        flex: 1,
        fontSize: typography.sizes.sm,
        fontWeight: "600",
    },
    successBannerLink: {
        paddingHorizontal: spacing.sm,
    },
    successBannerLinkText: {
        color: colors.primary,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
});
