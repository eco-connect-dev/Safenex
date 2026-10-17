import { Redirect } from "expo-router";

export default function ActiveEmergencyFallback() {
    return <Redirect href="/home" />;
}
