import React from "react";
import { Pressable, View } from "react-native";

const MapView = ({ children, testID }: { children?: React.ReactNode; testID?: string }) => <View testID={testID}>{children}</View>;
const Marker = ({ onPress, testID }: { title?: string; description?: string; onPress?: () => void; testID?: string }) => <Pressable accessibilityRole="button" onPress={onPress} testID={testID} />;
const Circle = () => null;

export { Circle, Marker };
export default MapView;
