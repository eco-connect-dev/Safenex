export type MapFeatureCategory = "hazard" | "location" | "shelter" | "rescue" | "resource";

export type OperationsMapFeature = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    category: MapFeatureCategory;
    detail?: string;
};

export function coordinatesForPlace(name: string): { latitude: number; longitude: number } {
    const place = name.toLowerCase();
    if (place.includes("galigamuwa")) return { latitude: 7.2398, longitude: 80.3116 };
    if (place.includes("kegalle")) return { latitude: 7.2523, longitude: 80.3436 };
    if (place.includes("rambukkana")) return { latitude: 7.3164, longitude: 80.3906 };
    if (place.includes("mawanella")) return { latitude: 7.2519, longitude: 80.4453 };
    if (place.includes("ruwanwella")) return { latitude: 7.0427, longitude: 80.2517 };
    if (place.includes("aranayake")) return { latitude: 7.1776, longitude: 80.4572 };
    return { latitude: 7.2523, longitude: 80.3436 };
}

export function categoryColor(category: MapFeatureCategory): string {
    switch (category) {
        case "hazard": return "#DC2626";
        case "shelter": return "#16A34A";
        case "rescue": return "#2563EB";
        case "resource": return "#D97706";
        default: return "#475569";
    }
}
