import { Redirect } from "expo-router";

export default function DashboardFallback() {
  return <Redirect href="/home" />;
}
