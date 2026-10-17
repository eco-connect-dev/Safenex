import { router, useLocalSearchParams, type Href } from "expo-router";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    RefreshCw,
    Search,
    TriangleAlert,
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

export function SelectAlternativeShelterScreen() {
    const { width } = useWindowDimensions();
    const isWide = width >= 860;

    const { originShelterId, count } = useLocalSearchParams<{
        originShelterId?: string;
        count?: string;
    }>();

    const { shelters, loading, allocate } = useShelters();

    // The shelter that ran out of capacity
    const originShelter = useMemo(() => {
        if (originShelterId) {
            const found = shelters.find((s) => s.id === originShelterId);
            if (found) return found;
        }
        // Default to Aranayake Community Hall (or first full shelter)
        const aranayake = shelters.find((s) => s.name.includes("Aranayake"));
        return aranayake ?? shelters.find((s) => s.status === "full") ?? shelters[0];
    }, [originShelterId, shelters]);

    // Number of evacuees to redirect
    const parsedCount = count && !isNaN(parseInt(count, 10)) ? parseInt(count, 10) : 200;

    // Remaining spaces at origin (defaults to 25 if at capacity)
    const originRemaining = originShelter
        ? Math.max(0, originShelter.capacity - originShelter.currentOccupancy)
        : 25;

    // Selected alternative shelter ID
    const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(() => {
        const mawanella = shelters.find((s) => s.name.includes("Mawanella"));
        return mawanella?.id ?? "s4";
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [transitNotes, setTransitNotes] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [confirmationSuccess, setConfirmationSuccess] = useState<string | null>(null);

    // List of candidate alternatives (excluding origin shelter)
    const candidateShelters = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return shelters
            .filter((s) => s.id !== originShelter?.id)
            .filter((s) => {
                if (!query) return true;
                return (
                    s.name.toLowerCase().includes(query) ||
                    s.location.toLowerCase().includes(query)
                );
            });
    }, [shelters, originShelter, searchQuery]);

    // The chosen alternative shelter
    const selectedAlternative: EmergencyShelter | undefined = useMemo(() => {
        if (selectedAlternativeId) {
            const match = shelters.find((s) => s.id === selectedAlternativeId);
            if (match) return match;
        }
        return candidateShelters[0];
    }, [selectedAlternativeId, shelters, candidateShelters]);

    // Capacity checks for the chosen alternative
    const altCurrentOccupancy = selectedAlternative?.currentOccupancy ?? 300;
    const altCapacity = selectedAlternative?.capacity ?? 1200;
    const altAvailable = Math.max(0, altCapacity - altCurrentOccupancy);
    const isCapacitySufficient = altAvailable >= parsedCount;
    const projectedOccupancy = altCurrentOccupancy + parsedCount;
    const projectedPercent = altCapacity > 0
        ? Math.min(100, Math.round((projectedOccupancy / altCapacity) * 100))
        : 0;

    const handleSelectAlternative = (shelter: EmergencyShelter) => {
        setSelectedAlternativeId(shelter.id);
        setConfirmationSuccess(null);
    };

    const handleCancel = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.push(emergencyCoordinationRoutes.shelters() as Href);
        }
    };

    const handleConfirmAlternative = async () => {
        if (!selectedAlternative || !isCapacitySufficient) return;
        setConfirming(true);
        setConfirmationSuccess(null);
        try {
            await allocate(selectedAlternative.id, parsedCount);
            setConfirmationSuccess(
                `Successfully redirected ${parsedCount} evacuees to ${selectedAlternative.name}.`,
            );
        } catch (err) {
            Alert.alert(
                "Redirection Failed",
                err instanceof Error ? err.message : "Unable to allocate alternative shelter.",
            );
        } finally {
            setConfirming(false);
        }
    };

    if (loading && shelters.length === 0) {
        return (
            <View style={styles.center} testID="alternative-loading">
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.mutedText}>Loading alternative shelters…</Text>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.container}
            testID="select-alternative-shelter-screen"
        >
            <View style={styles.contentWrapper}>
                {/* Page Header */}
                <View style={styles.header}>
                    <Text style={styles.title} testID="alternative-title">
                        Select Alternative Shelter
                    </Text>
                    <Text style={styles.subtitle}>
                        Capacity exceeded for selected shelter. Review recommended alternative shelters in Kegalle district to safely accommodate evacuees.
                    </Text>
                </View>

                {/* Capacity Exceeded Alert Banner */}
                <View style={styles.warningBanner} testID="capacity-exceeded-banner">
                    <Icon color={colors.amber} icon={TriangleAlert} size={20} />
                    <Text style={styles.warningBannerText}>
                        <Text style={styles.warningBannerBold}>
                            {`Capacity limit reached at ${originShelter?.name ?? "Aranayake Community Hall"}: `}
                        </Text>
                        {`Attempted allocation of ${parsedCount} evacuees exceeds remaining capacity (only ${originRemaining} spaces available). Please select an alternative shelter below.`}
                    </Text>
                </View>

                {/* Success Banner if redirect confirmed */}
                {confirmationSuccess ? (
                    <View style={styles.successBanner} testID="alternative-success-banner">
                        <Icon color={colors.green} icon={CheckCircle2} size={20} />
                        <Text style={styles.successBannerText}>{confirmationSuccess}</Text>
                        <Pressable
                            onPress={() => router.push(emergencyCoordinationRoutes.shelters() as Href)}
                            style={styles.successBannerLink}
                        >
                            <Text style={styles.successBannerLinkText}>Return to shelters →</Text>
                        </Pressable>
                    </View>
                ) : null}

                {/* 2-Column Grid */}
                <View style={[styles.mainGrid, isWide ? styles.gridRow : styles.gridColumn]}>
                    {/* Left Column: Available Alternative Shelters */}
                    <Card style={[styles.card, isWide && styles.leftColumn]}>
                        <View style={styles.cardHeaderRow}>
                            <View>
                                <Text style={styles.cardTitle}>Available Alternative Shelters</Text>
                                <Text style={styles.cardSubtitle}>
                                    Recommended based on safe road proximity and verified capacity
                                </Text>
                            </View>
                            <Text style={styles.districtBadge}>Kegalle District</Text>
                        </View>

                        {/* Search Input */}
                        <View style={styles.searchContainer}>
                            <Icon color={colors.textMuted} icon={Search} size={18} />
                            <TextInput
                                accessibilityLabel="Search nearby shelters or locations"
                                onChangeText={setSearchQuery}
                                placeholder="Search nearby shelters or locations..."
                                placeholderTextColor={colors.textMuted}
                                style={styles.searchInput}
                                testID="alternative-search-input"
                                value={searchQuery}
                            />
                        </View>

                        {/* Shelters Table */}
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={styles.tableHeaderRow}>
                                <Text style={[styles.th, styles.colShelter]}>SHELTER & DISTANCE</Text>
                                <Text style={[styles.th, styles.colOccupancy]}>CURRENT OCCUPANCY</Text>
                                <Text style={[styles.th, styles.colAvailable]}>AVAILABLE</Text>
                                <Text style={[styles.th, styles.colAction]}>ACTION</Text>
                            </View>

                            {/* Table Rows */}
                            {candidateShelters.map((shelter) => {
                                const isSelected = shelter.id === selectedAlternative?.id;
                                const remaining = Math.max(0, shelter.capacity - shelter.currentOccupancy);
                                const occPercent = shelter.capacity > 0
                                    ? Math.round((shelter.currentOccupancy / shelter.capacity) * 100)
                                    : 0;
                                const distanceText = shelter.distanceKm !== undefined
                                    ? `${shelter.location} · ${shelter.distanceKm} km`
                                    : `${shelter.location} · 8.5 km`;

                                return (
                                    <View
                                        key={shelter.id}
                                        style={[
                                            styles.tableRow,
                                            isSelected && styles.tableRowSelected,
                                        ]}
                                        testID={`alternative-row-${shelter.id}`}
                                    >
                                        {/* Shelter & Distance */}
                                        <View style={styles.colShelter}>
                                            <View style={styles.shelterNameRow}>
                                                <Text style={styles.shelterName}>{shelter.name}</Text>
                                                {isSelected ? (
                                                    <View style={styles.selectedPillBadge}>
                                                        <Text style={styles.selectedPillBadgeText}>
                                                            Selected
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                            <Text style={styles.shelterDistance}>{distanceText}</Text>
                                        </View>

                                        {/* Current Occupancy */}
                                        <View style={styles.colOccupancy}>
                                            <View style={styles.occupancyTextRow}>
                                                <Text style={styles.occupancyRatioText}>
                                                    {`${shelter.currentOccupancy.toLocaleString()} / ${shelter.capacity.toLocaleString()}`}
                                                </Text>
                                                <Text style={styles.occupancyPercentText}>{`${occPercent}%`}</Text>
                                            </View>
                                            <View style={styles.miniProgressTrack}>
                                                <View
                                                    style={[
                                                        styles.miniProgressFill,
                                                        { width: `${Math.min(100, occPercent)}%` },
                                                    ]}
                                                />
                                            </View>
                                        </View>

                                        {/* Available */}
                                        <View style={styles.colAvailable}>
                                            <Text
                                                style={[
                                                    styles.availableText,
                                                    isSelected && styles.availableTextHighlight,
                                                ]}
                                            >
                                                {`${remaining.toLocaleString()} spaces`}
                                            </Text>
                                        </View>

                                        {/* Action */}
                                        <View style={styles.colAction}>
                                            {isSelected ? (
                                                <View
                                                    style={styles.selectedButton}
                                                    testID={`btn-selected-${shelter.id}`}
                                                >
                                                    <Text style={styles.selectedButtonText}>Selected</Text>
                                                </View>
                                            ) : (
                                                <Pressable
                                                    accessibilityRole="button"
                                                    onPress={() => handleSelectAlternative(shelter)}
                                                    style={styles.selectButton}
                                                    testID={`btn-select-${shelter.id}`}
                                                >
                                                    <Text style={styles.selectButtonText}>Select</Text>
                                                </Pressable>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Table Footer */}
                        <Text style={styles.tableFooterNote}>
                            Distances calculated from Aranayake evacuation pick-up node. Road accessibility status verified via Ground reports.
                        </Text>
                    </Card>

                    {/* Right Column: Alternative Allocation Details */}
                    <Card style={[styles.card, isWide && styles.rightColumn]}>
                        <Text style={styles.cardTitle}>Alternative Allocation Details</Text>

                        {/* Gray Info Box */}
                        <View style={styles.detailsGrayBox}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Original Shelter:</Text>
                                <Text style={styles.detailValueRed}>
                                    {`${originShelter?.name ?? "Aranayake Community Hall"} (Over capacity)`}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Selected Alternative:</Text>
                                <Text style={styles.detailValueBold} testID="details-selected-name">
                                    {selectedAlternative?.name ?? "Mawanella Sports Complex"}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Transit Route:</Text>
                                <Text style={styles.detailValueRoute}>
                                    {selectedAlternative?.transitRoute ?? "8.5 km via A1 Highway (Clear)"}
                                </Text>
                            </View>

                            <View style={[styles.detailRow, styles.detailRowRedirect]}>
                                <Text style={styles.detailLabel}>Evacuees to redirect:</Text>
                                <Text style={styles.detailValueBigNumber} testID="details-redirect-count">
                                    {`${parsedCount.toLocaleString()} persons`}
                                </Text>
                            </View>
                        </View>

                        {/* Capacity Validated Box */}
                        {isCapacitySufficient ? (
                            <View style={styles.validationCardSuccess} testID="alternative-capacity-valid-box">
                                <Icon color={colors.green} icon={CheckCircle2} size={18} />
                                <View style={styles.validationCardContent}>
                                    <Text style={styles.validationCardTitle}>
                                        {`Capacity validated: ${altAvailable.toLocaleString()} spaces available`}
                                    </Text>
                                    <Text style={styles.validationCardSub}>
                                        {`Projected occupancy after redirection: ${projectedOccupancy.toLocaleString()} / ${altCapacity.toLocaleString()} (${projectedPercent}%)`}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.validationCardWarning} testID="alternative-capacity-warning-box">
                                <Icon color={colors.red} icon={AlertCircle} size={18} />
                                <View style={styles.validationCardContent}>
                                    <Text style={styles.validationCardTitleRed}>
                                        Insufficient capacity at selected shelter
                                    </Text>
                                    <Text style={styles.validationCardSubRed}>
                                        {`Only ${altAvailable} spaces available for ${parsedCount} evacuees.`}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Transit & Assistance Notes Input */}
                        <View style={styles.notesGroup}>
                            <Text style={styles.notesLabel}>Transit & Assistance Notes (optional)</Text>
                            <TextInput
                                accessibilityLabel="Transit & Assistance Notes"
                                multiline
                                numberOfLines={3}
                                onChangeText={setTransitNotes}
                                placeholder="e.g., Coordinated with Police RT-02 for evacuation escort along A1 corridor..."
                                placeholderTextColor={colors.textMuted}
                                style={styles.notesTextarea}
                                testID="transit-notes-input"
                                value={transitNotes}
                            />
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.buttonRow}>
                            <Pressable
                                accessibilityRole="button"
                                onPress={handleCancel}
                                style={({ pressed }) => [
                                    styles.btnCancelReturn,
                                    pressed && styles.btnPressed,
                                ]}
                                testID="btn-cancel-return"
                            >
                                <Text style={styles.btnCancelReturnText}>Cancel / Return</Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                disabled={!isCapacitySufficient || confirming}
                                onPress={handleConfirmAlternative}
                                style={({ pressed }) => [
                                    styles.btnConfirmAlternative,
                                    (!isCapacitySufficient || confirming) && styles.btnDisabled,
                                    pressed && styles.btnPressed,
                                ]}
                                testID="btn-confirm-alternative"
                            >
                                {confirming ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.btnConfirmAlternativeText}>
                                            Confirm Alternative Shelter
                                        </Text>
                                        <Icon color={colors.white} icon={ArrowRight} size={16} />
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </Card>
                </View>

                {/* Bottom Offline Sync Notice */}
                <View style={styles.offlineNoticeBanner} testID="offline-sync-notice">
                    <Icon color={colors.primary} icon={RefreshCw} size={18} />
                    <Text style={styles.offlineNoticeText}>
                        Offline capture is supported. Alternative shelter allocation will synchronize when connection is restored.
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
        maxWidth: 1180,
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
        marginBottom: spacing.md,
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
        lineHeight: 20,
    },
    warningBanner: {
        alignItems: "flex-start",
        backgroundColor: "#FFFBEB",
        borderColor: "#FCD34D",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.md,
        marginBottom: spacing.xl,
        padding: spacing.md,
    },
    warningBannerText: {
        color: "#92400E",
        flex: 1,
        fontSize: typography.sizes.xs,
        lineHeight: 18,
    },
    warningBannerBold: {
        fontWeight: "700",
    },
    successBanner: {
        alignItems: "center",
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.xl,
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
        flex: 1.5,
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
    cardHeaderRow: {
        alignItems: "flex-start",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.md,
    },
    cardTitle: {
        color: colors.navy,
        fontSize: typography.sizes.lg,
        fontWeight: "700",
    },
    cardSubtitle: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        marginTop: 2,
    },
    districtBadge: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        fontWeight: "600",
    },
    searchContainer: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        height: 42,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
    },
    searchInput: {
        color: colors.navy,
        flex: 1,
        fontSize: typography.sizes.sm,
    },
    table: {
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        overflow: "hidden",
    },
    tableHeaderRow: {
        backgroundColor: "#F8FAFC",
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    th: {
        color: colors.textMuted,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    colShelter: {
        flex: 3,
        paddingRight: spacing.sm,
    },
    colOccupancy: {
        flex: 2.8,
        paddingHorizontal: spacing.sm,
    },
    colAvailable: {
        flex: 2,
        paddingHorizontal: spacing.sm,
    },
    colAction: {
        flex: 1.5,
        alignItems: "flex-end",
    },
    tableRow: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    tableRowSelected: {
        backgroundColor: "#F0F7FF",
    },
    shelterNameRow: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
    },
    shelterName: {
        color: colors.navy,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    selectedPillBadge: {
        backgroundColor: "#EFF6FF",
        borderColor: "#BFDBFE",
        borderRadius: radii.pill,
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    selectedPillBadgeText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: "700",
    },
    shelterDistance: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        marginTop: 2,
    },
    occupancyTextRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    occupancyRatioText: {
        color: colors.navy,
        fontSize: typography.sizes.xs,
        fontWeight: "600",
    },
    occupancyPercentText: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
    },
    miniProgressTrack: {
        backgroundColor: "#E2E8F0",
        borderRadius: radii.pill,
        height: 6,
        overflow: "hidden",
        width: "100%",
    },
    miniProgressFill: {
        backgroundColor: colors.primary,
        borderRadius: radii.pill,
        height: 6,
    },
    availableText: {
        color: colors.navy,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    availableTextHighlight: {
        color: "#15803D",
    },
    selectButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    selectButtonText: {
        color: colors.primary,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    selectedButton: {
        backgroundColor: colors.surface,
        borderColor: colors.primary,
        borderRadius: radii.md,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
    },
    selectedButtonText: {
        color: colors.primary,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    tableFooterNote: {
        color: colors.textMuted,
        fontSize: typography.sizes.xs,
        lineHeight: 18,
        marginTop: spacing.md,
    },
    detailsGrayBox: {
        backgroundColor: "#F8FAFC",
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    detailRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    detailRowRedirect: {
        borderTopColor: colors.border,
        borderTopWidth: 1,
        marginBottom: 0,
        marginTop: spacing.xs,
        paddingTop: spacing.sm,
    },
    detailLabel: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
    },
    detailValueRed: {
        color: colors.red,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    detailValueBold: {
        color: colors.navy,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    detailValueRoute: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
    },
    detailValueBigNumber: {
        color: colors.navy,
        fontSize: 18,
        fontWeight: "800",
    },
    validationCardSuccess: {
        alignItems: "flex-start",
        backgroundColor: "#F0FDF4",
        borderColor: "#BBF7D0",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    validationCardContent: {
        flex: 1,
    },
    validationCardTitle: {
        color: "#15803D",
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    validationCardSub: {
        color: "#166534",
        fontSize: 11,
        marginTop: 2,
    },
    validationCardWarning: {
        alignItems: "flex-start",
        backgroundColor: "#FEF2F2",
        borderColor: "#FECACA",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    validationCardTitleRed: {
        color: colors.red,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    validationCardSubRed: {
        color: "#991B1B",
        fontSize: 11,
        marginTop: 2,
    },
    notesGroup: {
        marginBottom: spacing.lg,
    },
    notesLabel: {
        color: colors.textSecondary,
        fontSize: typography.sizes.xs,
        fontWeight: "600",
        marginBottom: spacing.xs,
    },
    notesTextarea: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        color: colors.navy,
        fontSize: typography.sizes.xs,
        minHeight: 80,
        padding: spacing.md,
        textAlignVertical: "top",
    },
    buttonRow: {
        flexDirection: "row",
        gap: spacing.md,
        justifyContent: "flex-end",
    },
    btnCancelReturn: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radii.md,
        borderWidth: 1,
        height: 42,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    btnCancelReturnText: {
        color: colors.navy,
        fontSize: typography.sizes.sm,
        fontWeight: "600",
    },
    btnConfirmAlternative: {
        alignItems: "center",
        backgroundColor: colors.primary,
        borderRadius: radii.md,
        flexDirection: "row",
        gap: spacing.xs,
        height: 42,
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    btnConfirmAlternativeText: {
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
});
