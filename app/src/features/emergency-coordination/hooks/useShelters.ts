import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    allocateShelterEvacuees,
    fetchEmergencyShelters,
} from "../services/emergencyCoordinationService";
import type {
    EmergencyDataSource,
    EmergencyEvent,
    EmergencyShelter,
    ShelterStatus,
} from "../types";

export type ShelterFilterStatus = "all" | ShelterStatus;

export function useShelters(eventId?: string) {
    const [shelters, setShelters] = useState<EmergencyShelter[]>([]);
    const [event, setEvent] = useState<EmergencyEvent | null>(null);
    const [source, setSource] = useState<EmergencyDataSource | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ShelterFilterStatus>("all");
    const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);

    const mounted = useRef(true);

    const fetchShelterData = useCallback(
        async (isRefresh: boolean) => {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
            try {
                const result = await fetchEmergencyShelters(eventId);
                if (!mounted.current) return;
                setShelters(result.shelters);
                setEvent(result.event);
                setSource(result.source);
            } catch (e) {
                if (!mounted.current) return;
                setError(e instanceof Error ? e.message : "Unable to load emergency shelters.");
            } finally {
                if (mounted.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [eventId],
    );

    useEffect(() => {
        let isCurrent = true;
        mounted.current = true;

        fetchEmergencyShelters(eventId)
            .then((result) => {
                if (!isCurrent) return;
                setShelters(result.shelters);
                setEvent(result.event);
                setSource(result.source);
                setLoading(false);
            })
            .catch((e) => {
                if (!isCurrent) return;
                setError(e instanceof Error ? e.message : "Unable to load emergency shelters.");
                setLoading(false);
            });

        return () => {
            isCurrent = false;
            mounted.current = false;
        };
    }, [eventId]);

    const allocate = useCallback(
        async (shelterId: string, count: number) => {
            const updated = await allocateShelterEvacuees(shelterId, count);
            setShelters((prev) =>
                prev.map((s) => (s.id === shelterId ? updated : s)),
            );
            return updated;
        },
        [],
    );

    const filteredShelters = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return shelters.filter((shelter) => {
            // Only show shelters in affected area if flag exists or default
            if (shelter.inAffectedArea === false) {
                return false;
            }

            // Status filter
            if (statusFilter !== "all" && shelter.status !== statusFilter) {
                return false;
            }

            // Search query filter
            if (query) {
                const matchName = shelter.name.toLowerCase().includes(query);
                const matchLocation = shelter.location.toLowerCase().includes(query);
                if (!matchName && !matchLocation) {
                    return false;
                }
            }

            return true;
        });
    }, [shelters, searchQuery, statusFilter]);

    const selectedShelter = useMemo(
        () => shelters.find((s) => s.id === selectedShelterId) ?? null,
        [shelters, selectedShelterId],
    );

    const totalActiveShelters = useMemo(() => {
        return event?.sheltersActive ?? shelters.length;
    }, [event, shelters]);

    return {
        shelters,
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
        refresh: () => fetchShelterData(true),
        retry: () => fetchShelterData(false),
        allocate,
        totalActiveShelters,
    };
}
