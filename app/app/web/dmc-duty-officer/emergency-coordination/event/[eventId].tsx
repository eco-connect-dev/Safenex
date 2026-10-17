import { Redirect } from "expo-router";

export default function EventDetailsFallback() {
    return <Redirect href="/home" />;
}
