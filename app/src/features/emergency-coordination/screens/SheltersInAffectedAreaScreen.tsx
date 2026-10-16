import { router, useLocalSearchParams, type Href } from "expo-router";
import { Info, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { Button, Card, Icon } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";
import { useShelters, type ShelterFilterStatus } from "../hooks/useShelters";
import { emergencyCoordinationRoutes } from "../routes";
import type { EmergencyShelter } from "../types";

export function SheltersInAffectedAreaScreen() {
    const { eventId } = useLocalSearchParams<{ eventId?: string }>();
    const {
        filteredShelters,
        selectedShelter,
        selectedShelterId,
        setSelectedShelterId,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        event,
        source,
        loading,
        refreshing,
        error,
        refresh,
        retry,
        allocate,
        totalActiveShelters,
    } = useShelters(eventId);

    // Evacuee allocation state
    const [evacueeCount, setEvacueeCount] = useState<string>("25");
    const [allocating, setAllocating] = useState<boolean>(false);
    const [allocationSuccess, setAllocationSuccess] = useState<string | null>(null);
    const [allocationError, setAllocationError] = useState<string | null>(null);

    const district = event?.district ?? "Kegalle";

    const remainingCapacity = useMemo(() => {
        if (!selectedShelter) return 0;
        return Math.max(0, selectedShelter.capacity - selectedShelter.currentOccupancy);
    }, [selectedShelter]);

    const parsedCount = parseInt(evacueeCount, 10);
    const isCountValid =
        !isNaN(parsedCount) && parsedCount > 0 && parsedCount <= remainingCapacity;

    const handleSelectShelter = (shelter: EmergencyShelter) => {
        if (shelter.status === "full") return;
        setAllocationSuccess(null);
        setAllocationError(null);
        if (selectedShelterId === shelter.id) {
            setSelectedShelterId(null);
        } else {
            setSelectedShelterId(shelter.id);
            // Pre-fill a reasonable default count
            const remaining = shelter.capacity - shelter.currentOccupancy;
            setEvacueeCount(remaining > 0 ? String(Math.min(25, remaining)) : "0");
        }
    };

    const handleConfirmAllocation = async () => {
        if (!selectedShelter || !isCountValid) return;
        setAllocating(true);
        setAllocationError(null);
        setAllocationSuccess(null);
        try {
            await allocate(selectedShelter.id, parsedCount);
            setAllocationSuccess(
                `Successfully allocated ${parsedCount} evacuee(s) to ${selectedShelter.name}.`,
            );
            setSelectedShelterId(null);
            setEvacueeCount("25");
        } catch (err) {
            setAllocationError(
                err instanceof Error ? err.message : "Failed to record evacuees.",
            );
        } finally {
            setAllocating(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center} testID="shelters-loading">
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.muted}>Loading registered emergency shelters…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center} testID="shelters-error">
                <Text style={styles.errorTitle}>Could not load emergency shelters</Text>
                <Text style={styles.muted}>{error}</Text>
                <Button label="Try again" onPress={retry} testID="shelters-retry-button" />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            testID="shelters-in-affected-area-screen"
        >
            {/* Breadcrumb & Navigation */}
            <View style={styles.topNavigationRow}>
                <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                        router.push(emergencyCoordinationRoutes.activeEmergency as Href)
                    }
                    style={({ pressed }) => [
                        styles.backLink,
                        pressed && styles.pressed,
                    ]}
                    testID="back-to-active-emergency"
                >
                    <Text style={styles.backLinkText}>
                        ← Back to Active Emergency
                    </Text>
                </Pressable>
                {source === "sample" ? (
                    <View style={styles.devTag} testID="sample-shelters-tag">
                        <Text style={styles.devTagText}>Sample Data (Dev)</Text>
                    </View>
                ) : null}
            </View>

            {/* Page Header */}
            <View style={styles.pageHeader}>
                <View style={styles.pageHeaderText}>
                    <Text style={styles.title} testID="screen-title">
                        Shelters in Affected Area ({district})
                    </Text>
                    <Text style={styles.subtitle} testID="screen-subtitle">
                        Compare registered shelter capacity and current occupancy before selecting a suitable shelter.
                    </Text>
                </View>
                <View style={styles.pageHeaderActions}>
                    <Button
                        label="Allocate Evacuees"
                        onPress={() => router.push(emergencyCoordinationRoutes.allocateEvacuees() as Href)}
                        size="sm"
                        testID="btn-header-allocate"
                        variant="primary"
                    />
                    <Button
                        label="Alternative Shelters"
                        onPress={() => router.push(emergencyCoordinationRoutes.alternativeShelter() as Href)}
                        size="sm"
                        testID="btn-header-alternative"
                        variant="outline"
                    />
                </View>
            </View>

            {/* Main Shelters Card */}
            <Card padded={false} style={styles.card} testID="shelters-card">
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Registered emergency shelters</Text>

                    {/* Filter Row: Search & Status Dropdown */}
                    <View style={styles.filterRow}>
                        {/* Search Input */}
                        <View style={styles.searchWrapper}>
                            <Text style={styles.fieldLabel}>Search shelters or locations</Text>
                            <View style={styles.searchInputContainer}>
                                <Icon
                                    color={colors.textSecondary}
                                    icon={Search}
                                    size={18}
                                />
                                <TextInput
                                    onChangeText={setSearchQuery}
                                    placeholder="Search shelters or locations..."
                                    placeholderTextColor={colors.textMuted}
                                    style={styles.searchInput}
                                    testID="shelters-search-input"
                                    value={searchQuery}
                                />
                                {searchQuery ? (
                                    <Pressable
                                        accessibilityLabel="Clear search"
                                        accessibilityRole="button"
                                        onPress={() => setSearchQuery("")}
                                        style={styles.clearSearchBtn}
                                        testID="clear-search-button"
                                    >
                                        <Icon color={colors.textSecondary} icon={X} size={16} />
                                    </Pressable>
                                ) : null}
                            </View>
                        </View>

                        {/* Status Filter */}
                        <View style={styles.statusFilterWrapper}>
                            <Text style={styles.fieldLabel}>Status</Text>
                            <View style={styles.statusButtonsRow}>
                                {(
                                    [
                                        { label: "All", value: "all" },
                                        { label: "Available", value: "available" },
                                        { label: "Full", value: "full" },
                                    ] as { label: string; value: ShelterFilterStatus }[]
                                ).map((item) => {
                                    const active = statusFilter === item.value;
                                    return (
                                        <Pressable
                                            accessibilityRole="button"
                                            key={item.value}
                                            onPress={() => setStatusFilter(item.value)}
                                            style={[
                                                styles.statusTab,
                                                active && styles.statusTabActive,
                                            ]}
                                            testID={`status-filter-${item.value}`}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusTabText,
                                                    active && styles.statusTabTextActive,
                                                ]}
                                            >
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.columnHeader, styles.colName]}>
                        SHELTER NAME
                    </Text>
                    <Text style={[styles.columnHeader, styles.colLocation]}>
                        LOCATION
                    </Text>
                    <Text style={[styles.columnHeader, styles.colOccupancy]}>
                        CURRENT OCCUPANCY
                    </Text>
                    <Text style={[styles.columnHeader, styles.colStatus]}>
                        STATUS
                    </Text>
                    <Text style={[styles.columnHeader, styles.colAction]}>
                        ACTION
                    </Text>
                </View>

                {/* Table Rows */}
                {filteredShelters.length === 0 ? (
                    <View style={styles.emptyContainer} testID="shelters-empty">
                        <Text style={styles.emptyTitle}>No matching shelters found</Text>
                        <Text style={styles.emptySubtitle}>
                            Try clearing your search query or changing the status filter.
                        </Text>
                        <Button
                            label="Clear filters"
                            onPress={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                            }}
                            size="sm"
                            testID="reset-filters-button"
                            variant="outline"
                        />
                    </View>
                ) : (
                    filteredShelters.map((shelter) => {
                        const percent = Math.min(
                            100,
                            Math.round((shelter.currentOccupancy / shelter.capacity) * 100),
                        );
                        const isFull = shelter.status === "full" || percent >= 100;
                        const isSelected = selectedShelterId === shelter.id;

                        return (
                            <View
                                key={shelter.id}
                                style={[
                                    styles.tableRow,
                                    isSelected && styles.tableRowSelected,
                                ]}
                                testID={`shelter-row-${shelter.id}`}
                            >
                                {/* Shelter Name Column */}
                                <View style={styles.colName}>
                                    <Text style={styles.shelterName} testID={`shelter-name-${shelter.id}`}>
                                        {shelter.name}
                                    </Text>
                                    <Text style={styles.shelterCategory}>
                                        {shelter.category}
                                    </Text>
                                </View>

                                {/* Location Column */}
                                <View style={styles.colLocation}>
                                    <Text style={styles.locationText} testID={`shelter-location-${shelter.id}`}>
                                        {shelter.location}
                                    </Text>
                                </View>

                                {/* Current Occupancy Column */}
                                <View style={styles.colOccupancy}>
                                    <Text style={styles.occupancyText} testID={`shelter-occupancy-${shelter.id}`}>
                                        {`${shelter.currentOccupancy.toLocaleString()} / ${shelter.capacity.toLocaleString()} · ${percent}%`}
                                    </Text>
                                    <View style={styles.progressBarTrack}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                { width: `${percent}%` },
                                                isFull
                                                    ? styles.progressBarFull
                                                    : styles.progressBarNormal,
                                            ]}
                                        />
                                    </View>
                                </View>

                                {/* Status Badge Column */}
                                <View style={styles.colStatus}>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            isFull
                                                ? styles.statusBadgeFull
                                                : styles.statusBadgeAvailable,
                                        ]}
                                        testID={`shelter-badge-${shelter.id}`}
                                    >
                                        <Text
                                            style={[
                                                styles.statusBadgeText,
                                                isFull
                                                    ? styles.statusBadgeTextFull
                                                    : styles.statusBadgeTextAvailable,
                                            ]}
                                        >
                                            {isFull ? "Full" : "Available"}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Column */}
                                <View style={styles.colAction}>
                                    {isFull ? (
                                        <View style={styles.unavailableActionBox}>
                                            <View
                                                style={styles.unavailableButton}
                                                testID={`btn-unavailable-${shelter.id}`}
                                            >
                                                <Text style={styles.unavailableButtonText}>
                                                    Unavailable
                                                </Text>
                                            </View>
                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={() =>
                                                    router.push(
                                                        emergencyCoordinationRoutes.alternativeShelter(
                                                            shelter.id,
                                                            200,
                                                        ) as Href,
                                                    )
                                                }
                                                style={styles.alternativeShelterLink}
                                                testID={`btn-alternative-${shelter.id}`}
                                            >
                                                <Text style={styles.alternativeShelterLinkText}>
                                                    Alternative →
                                                </Text>
                                            </Pressable>
                                        </View>
                                    ) : (
                                        <Pressable
                                            accessibilityRole="button"
                                            onPress={() => handleSelectShelter(shelter)}
                                            style={({ pressed }) => [
                                                styles.actionButton,
                                                isSelected
                                                    ? styles.actionButtonSelected
                                                    : styles.actionButtonDefault,
                                                pressed && styles.pressed,
                                            ]}
                                            testID={`btn-select-${shelter.id}`}
                                        >
                                            <Text
                                                style={[
                                                    styles.actionButtonText,
                                                    isSelected
                                                        ? styles.actionButtonTextSelected
                                                        : styles.actionButtonTextDefault,
                                                ]}
                                            >
                                                Select
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
            </Card>

            {/* Instruction Callout Box */}
            <View style={styles.noticeBox} testID="shelters-info-notice">
                <View style={styles.noticeIcon}>
                    <Icon color={colors.primary} icon={Info} size={20} />
                </View>
                <Text style={styles.noticeText}>
                    Select an available shelter to record evacuees. Capacity will be checked before confirming the allocation.
                </Text>
            </View>

            {/* Selected Shelter Evacuee Allocation Panel */}
            {selectedShelter ? (
                <Card style={styles.allocationCard} testID="evacuee-allocation-panel">
                    <View style={styles.allocationHeader}>
                        <View style={styles.allocationHeaderText}>
                            <Text style={styles.allocationTitle}>
                                Record Evacuees · {selectedShelter.name}
                            </Text>
                            <Text style={styles.allocationSubtitle}>
                                Specify the number of evacuees to allocate to this shelter ({selectedShelter.location}).
                            </Text>
                        </View>
                        <Pressable
                            accessibilityLabel="Close panel"
                            accessibilityRole="button"
                            onPress={() => setSelectedShelterId(null)}
                            style={styles.closePanelBtn}
                            testID="close-allocation-panel"
                        >
                            <Icon color={colors.textSecondary} icon={X} size={20} />
                        </Pressable>
                    </View>

                    <View style={styles.allocationStatsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Current Occupancy</Text>
                            <Text style={styles.statValue}>
                                {selectedShelter.currentOccupancy} / {selectedShelter.capacity}
                            </Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Remaining Spaces</Text>
                            <Text style={[styles.statValue, { color: colors.primary }]}>
                                {remainingCapacity}
                            </Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Status</Text>
                            <Text style={[styles.statValue, { color: colors.green }]}>
                                Available
                            </Text>
                        </View>
                    </View>

                    {/* Evacuee Count Input & Quick Increment Buttons */}
                    <View style={styles.allocationInputGroup}>
                        <Text style={styles.inputLabel}>Number of Evacuees</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                keyboardType="number-pad"
                                onChangeText={setEvacueeCount}
                                placeholder="Enter count"
                                style={styles.evacueeInput}
                                testID="evacuee-count-input"
                                value={evacueeCount}
                            />
                            {/* Quick Add Buttons */}
                            <View style={styles.quickButtons}>
                                {[10, 25, 50].map((addAmount) => (
                                    <Pressable
                                        accessibilityRole="button"
                                        key={addAmount}
                                        onPress={() =>
                                            setEvacueeCount(
                                                String(Math.min(remainingCapacity, addAmount)),
                                            )
                                        }
                                        style={styles.quickBtn}
                                        testID={`quick-add-${addAmount}`}
                                    >
                                        <Text style={styles.quickBtnText}>+{addAmount}</Text>
                                    </Pressable>
                                ))}
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => setEvacueeCount(String(remainingCapacity))}
                                    style={styles.quickBtn}
                                    testID="quick-add-max"
                                >
                                    <Text style={styles.quickBtnText}>Max ({remainingCapacity})</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Capacity Validation Feedback */}
                        {parsedCount > remainingCapacity ? (
                            <Text style={styles.validationError} testID="capacity-error-message">
                                ⚠ Exceeds available shelter capacity (maximum {remainingCapacity} spaces remaining).
                            </Text>
                        ) : isCountValid ? (
                            <Text style={styles.validationSuccess} testID="capacity-success-message">
                                ✓ Capacity verified: {parsedCount} spaces will be allocated.
                            </Text>
                        ) : (
                            <Text style={styles.validationError} testID="count-invalid-message">
                                Please enter a valid number greater than 0.
                            </Text>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.allocationActionsRow}>
                        <Button
                            disabled={!isCountValid || allocating}
                            label={allocating ? "Recording evacuees…" : "Confirm Allocation"}
                            loading={allocating}
                            onPress={() => void handleConfirmAllocation()}
                            testID="confirm-allocation-button"
                        />
                        <Button
                            label="Open Full Allocation Page →"
                            onPress={() =>
                                router.push(
                                    emergencyCoordinationRoutes.allocateEvacuees(
                                        selectedShelter.id,
                                        isCountValid ? parsedCount : 25,
                                    ) as Href,
                                )
                            }
                            testID="open-full-allocation-page-button"
                            variant="secondary"
                        />
                        <Button
                            label="Cancel"
                            onPress={() => setSelectedShelterId(null)}
                            testID="cancel-allocation-button"
                            variant="outline"
                        />
                    </View>
                </Card>
            ) : null}

            {/* Notification / Feedback Banner */}
            {allocationSuccess ? (
                <View style={styles.successBanner} testID="allocation-success-banner">
                    <Text style={styles.successBannerText}>{allocationSuccess}</Text>
                </View>
            ) : null}
            {allocationError ? (
                <View style={styles.errorBanner} testID="allocation-error-banner">
                    <Text style={styles.errorBannerText}>{allocationError}</Text>
                </View>
            ) : null}

            {/* Footer Summary Info */}
            <View style={styles.footerRow} testID="shelters-footer-info">
                <Text style={styles.footerText}>
                    {`${filteredShelters.length} shelters shown · ${district} flood response · ${totalActiveShelters} shelters active across the event`}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        backgroundColor: "#F3F6FA",
        flex: 1,
    },
    content: {
        gap: spacing.lg,
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.xl,
        paddingBottom: spacing.xxxl,
    },
    center: {
        alignItems: "center",
        backgroundColor: "#F3F6FA",
        flex: 1,
        gap: spacing.md,
        justifyContent: "center",
        padding: spacing.xxl,
    },
    muted: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
        textAlign: "center",
    },
    errorTitle: {
        color: colors.text,
        fontSize: typography.sizes.lg,
        fontWeight: "700",
    },
    topNavigationRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    backLink: {
        alignSelf: "flex-start",
        paddingVertical: spacing.xs,
    },
    backLinkText: {
        color: colors.primary,
        fontSize: typography.sizes.sm,
        fontWeight: "600",
    },
    devTag: {
        backgroundColor: colors.amberSoft,
        borderRadius: radii.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    devTagText: {
        color: colors.amber,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    pageHeader: {
        alignItems: "flex-start",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.lg,
        justifyContent: "space-between",
    },
    pageHeaderText: {
        flex: 1,
        gap: spacing.xs,
        minWidth: 280,
    },
    pageHeaderActions: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    title: {
        color: "#0F172A",
        fontSize: 30,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    subtitle: {
        color: "#5E7595",
        fontSize: typography.sizes.md,
        lineHeight: 22,
    },
    card: {
        backgroundColor: colors.surface,
        borderColor: "#E2E8F0",
        borderRadius: radii.lg,
        borderWidth: 1,
        overflow: "hidden",
    },
    cardHeader: {
        gap: spacing.md,
        padding: spacing.xl,
    },
    cardTitle: {
        color: "#0F172A",
        fontSize: 20,
        fontWeight: "700",
    },
    filterRow: {
        alignItems: "flex-end",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.lg,
        justifyContent: "space-between",
    },
    searchWrapper: {
        flex: 1,
        gap: spacing.xs,
        minWidth: 260,
    },
    statusFilterWrapper: {
        gap: spacing.xs,
    },
    fieldLabel: {
        color: "#64748B",
        fontSize: typography.sizes.xs,
        fontWeight: "600",
    },
    searchInputContainer: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: "#CBD5E1",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.sm,
        height: 44,
        paddingHorizontal: spacing.md,
    },
    searchInput: {
        color: "#0F172A",
        flex: 1,
        fontSize: typography.sizes.sm,
        height: "100%",
    },
    clearSearchBtn: {
        padding: spacing.xs,
    },
    statusButtonsRow: {
        backgroundColor: "#F1F5F9",
        borderColor: "#CBD5E1",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        padding: 2,
    },
    statusTab: {
        borderRadius: radii.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
    },
    statusTabActive: {
        backgroundColor: colors.surface,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    statusTabText: {
        color: "#64748B",
        fontSize: typography.sizes.sm,
        fontWeight: "600",
    },
    statusTabTextActive: {
        color: "#0F172A",
        fontWeight: "700",
    },
    tableHeaderRow: {
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderBottomColor: "#E2E8F0",
        borderBottomWidth: 1,
        borderTopColor: "#E2E8F0",
        borderTopWidth: 1,
        flexDirection: "row",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
    },
    columnHeader: {
        color: "#8B9BB4",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    tableRow: {
        alignItems: "center",
        borderBottomColor: "#F1F5F9",
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
    },
    tableRowSelected: {
        backgroundColor: "#F8FAFC",
    },
    colName: {
        flex: 2.2,
        paddingRight: spacing.md,
    },
    colLocation: {
        flex: 1.2,
        paddingRight: spacing.md,
    },
    colOccupancy: {
        flex: 1.8,
        paddingRight: spacing.lg,
    },
    colStatus: {
        flex: 1,
        paddingRight: spacing.md,
    },
    colAction: {
        alignItems: "flex-end",
        flex: 0.9,
    },
    shelterName: {
        color: "#0F172A",
        fontSize: 15,
        fontWeight: "700",
    },
    shelterCategory: {
        color: "#8B9BB4",
        fontSize: 13,
        marginTop: 3,
    },
    locationText: {
        color: "#334155",
        fontSize: 14,
        fontWeight: "500",
    },
    occupancyText: {
        color: "#1E293B",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
    },
    progressBarTrack: {
        backgroundColor: "#E2E8F0",
        borderRadius: radii.pill,
        height: 7,
        overflow: "hidden",
        width: "100%",
    },
    progressBarFill: {
        borderRadius: radii.pill,
        height: 7,
    },
    progressBarNormal: {
        backgroundColor: "#2563EB",
    },
    progressBarFull: {
        backgroundColor: "#DC2626",
    },
    statusBadge: {
        alignSelf: "flex-start",
        borderRadius: radii.pill,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    statusBadgeAvailable: {
        backgroundColor: "#DCFCE7",
    },
    statusBadgeFull: {
        backgroundColor: "#FEE2E2",
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    statusBadgeTextAvailable: {
        color: "#15803D",
    },
    statusBadgeTextFull: {
        color: "#DC2626",
    },
    actionButton: {
        alignItems: "center",
        borderRadius: radii.md,
        height: 38,
        justifyContent: "center",
        minWidth: 88,
        paddingHorizontal: spacing.md,
    },
    actionButtonDefault: {
        backgroundColor: colors.surface,
        borderColor: "#CBD5E1",
        borderWidth: 1,
    },
    actionButtonSelected: {
        backgroundColor: "#2563EB",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "700",
    },
    actionButtonTextDefault: {
        color: "#0F172A",
    },
    actionButtonTextSelected: {
        color: colors.white,
    },
    unavailableButton: {
        alignItems: "center",
        backgroundColor: colors.surface,
        borderColor: "#E2E8F0",
        borderRadius: radii.md,
        borderWidth: 1,
        height: 38,
        justifyContent: "center",
        minWidth: 96,
        opacity: 0.65,
        paddingHorizontal: spacing.md,
    },
    unavailableActionBox: {
        alignItems: "center",
        gap: 4,
    },
    alternativeShelterLink: {
        paddingVertical: 2,
    },
    alternativeShelterLinkText: {
        color: colors.primary,
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    unavailableButtonText: {
        color: "#94A3B8",
        fontSize: 14,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        gap: spacing.sm,
        paddingVertical: spacing.xxxl,
    },
    emptyTitle: {
        color: "#0F172A",
        fontSize: typography.sizes.md,
        fontWeight: "700",
    },
    emptySubtitle: {
        color: colors.textSecondary,
        fontSize: typography.sizes.sm,
    },
    noticeBox: {
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        borderColor: "#DBEAFE",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    noticeIcon: {
        alignItems: "center",
        justifyContent: "center",
    },
    noticeText: {
        color: "#1D4ED8",
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
        lineHeight: 20,
    },
    allocationCard: {
        borderColor: "#93C5FD",
        borderRadius: radii.lg,
        borderWidth: 1.5,
        gap: spacing.md,
    },
    allocationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    allocationHeaderText: {
        flex: 1,
        gap: spacing.xs,
    },
    allocationTitle: {
        color: "#0F172A",
        fontSize: 18,
        fontWeight: "800",
    },
    allocationSubtitle: {
        color: "#64748B",
        fontSize: typography.sizes.sm,
    },
    closePanelBtn: {
        padding: spacing.xs,
    },
    allocationStatsRow: {
        backgroundColor: "#F8FAFC",
        borderColor: "#E2E8F0",
        borderRadius: radii.md,
        borderWidth: 1,
        flexDirection: "row",
        gap: spacing.md,
        padding: spacing.md,
    },
    statBox: {
        flex: 1,
        gap: 3,
    },
    statLabel: {
        color: "#64748B",
        fontSize: typography.sizes.xs,
        fontWeight: "600",
    },
    statValue: {
        color: "#0F172A",
        fontSize: 16,
        fontWeight: "800",
    },
    allocationInputGroup: {
        gap: spacing.sm,
    },
    inputLabel: {
        color: "#0F172A",
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    inputRow: {
        alignItems: "center",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
    },
    evacueeInput: {
        backgroundColor: colors.surface,
        borderColor: "#CBD5E1",
        borderRadius: radii.md,
        borderWidth: 1,
        color: "#0F172A",
        fontSize: typography.sizes.md,
        fontWeight: "700",
        height: 44,
        paddingHorizontal: spacing.md,
        width: 140,
    },
    quickButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
    },
    quickBtn: {
        backgroundColor: "#F1F5F9",
        borderColor: "#CBD5E1",
        borderRadius: radii.sm,
        borderWidth: 1,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    quickBtnText: {
        color: "#334155",
        fontSize: typography.sizes.xs,
        fontWeight: "700",
    },
    validationError: {
        color: colors.red,
        fontSize: typography.sizes.xs,
        fontWeight: "600",
    },
    validationSuccess: {
        color: colors.green,
        fontSize: typography.sizes.xs,
        fontWeight: "600",
    },
    allocationActionsRow: {
        flexDirection: "row",
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    successBanner: {
        backgroundColor: colors.greenSoft,
        borderColor: "#86EFAC",
        borderRadius: radii.md,
        borderWidth: 1,
        padding: spacing.md,
    },
    successBannerText: {
        color: colors.green,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    errorBanner: {
        backgroundColor: colors.redSoft,
        borderColor: "#FCA5A5",
        borderRadius: radii.md,
        borderWidth: 1,
        padding: spacing.md,
    },
    errorBannerText: {
        color: colors.red,
        fontSize: typography.sizes.sm,
        fontWeight: "700",
    },
    footerRow: {
        paddingTop: spacing.xs,
    },
    footerText: {
        color: "#64748B",
        fontSize: 13,
        fontWeight: "500",
    },
    pressed: {
        opacity: 0.75,
    },
});
