import { useCallback, useEffect, useRef, useState } from "react";

import { fetchActiveEmergency } from "../services/emergencyCoordinationService";
import type { ActiveEmergency, EmergencyDataSource } from "../types";

export function useActiveEmergency(eventId?: string) {
    const [data, setData] = useState<ActiveEmergency | null>(null);
    const [source, setSource] = useState<EmergencyDataSource | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mounted = useRef(true);

    const load = useCallback(
        async (isRefresh: boolean) => {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
            try {
                const result = await fetchActiveEmergency(eventId);
                if (!mounted.current) return;
                setData(result.data);
                setSource(result.source);
            } catch (e) {
                if (!mounted.current) return;
                setError(e instanceof Error ? e.message : "Unable to load emergency data.");
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
        mounted.current = true;
        void load(false);
        return () => {
            mounted.current = false;
        };
    }, [load]);

    return {
        data,
        source,
        loading,
        refreshing,
        error,
        refresh: () => load(true),
        retry: () => load(false),
    };
}
