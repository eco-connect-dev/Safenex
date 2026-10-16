import MapView, { Marker, type MapPressEvent } from "react-native-maps";
import { StyleSheet } from "react-native";

export type MapCoordinate = { latitude: number; longitude: number };

type Props = {
  latitude: number | null;
  longitude: number | null;
  onSelect: (coordinate: MapCoordinate) => void;
};

const sriLankaRegion = {
  latitude: 7.8731,
  longitude: 80.7718,
  latitudeDelta: 4.4,
  longitudeDelta: 3.8,
};

export function SriLankaLocationMap({ latitude, longitude, onSelect }: Props) {
  const hasPin = latitude !== null && longitude !== null;
  const region = hasPin
    ? {
        latitude,
        longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }
    : sriLankaRegion;

  const selectCoordinate = (event: MapPressEvent) => {
    onSelect(event.nativeEvent.coordinate);
  };

  return (
    <MapView
      initialRegion={region}
      onPress={selectCoordinate}
      style={styles.map}
    >
      {hasPin ? (
        <Marker
          coordinate={{ latitude, longitude }}
          draggable
          onDragEnd={(event) => onSelect(event.nativeEvent.coordinate)}
          title="Reported hazard location"
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({ map: { height: 280, width: "100%" } });
