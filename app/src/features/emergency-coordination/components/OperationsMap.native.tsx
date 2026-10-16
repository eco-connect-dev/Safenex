import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View } from "react-native";

import { colors } from "@/src/theme";
import { categoryColor, type OperationsMapFeature } from "./operationsMapTypes";

type Props = { features: OperationsMapFeature[]; selectedId?: string | null; onSelect?: (id: string) => void; testID?: string };

export function OperationsMap({ features, selectedId: _selectedId, onSelect, testID = "operations-map" }: Props) {
    const center = features.length ? {
        latitude: features.reduce((sum, feature) => sum + feature.latitude, 0) / features.length,
        longitude: features.reduce((sum, feature) => sum + feature.longitude, 0) / features.length,
    } : { latitude: 7.2523, longitude: 80.3436 };
    return <View style={styles.container} testID={testID}>
        <MapView
            initialRegion={{ ...center, latitudeDelta: 0.42, longitudeDelta: 0.48 }}
            mapType="standard"
            style={StyleSheet.absoluteFill}
            testID={`${testID}-native-map`}
        >
            {features.map((feature) => <Marker
                key={feature.id}
                accessibilityLabel={`${feature.category}: ${feature.name}`}
                coordinate={{ latitude: feature.latitude, longitude: feature.longitude }}
                pinColor={categoryColor(feature.category)}
                onPress={() => onSelect?.(feature.id)}
                testID={`native-map-marker-${feature.id}`}
                title={feature.name}
                description={feature.detail ?? feature.category}
            />)}
        </MapView>
        {features.length === 0 ? <View style={styles.empty} /> : null}
    </View>;
}

const styles = StyleSheet.create({ container: { borderRadius: 10, height: 280, minHeight: 220, overflow: "hidden", width: "100%" }, empty: { ...StyleSheet.absoluteFill, backgroundColor: colors.primarySoft, opacity: 0.15, pointerEvents: "none" } });
