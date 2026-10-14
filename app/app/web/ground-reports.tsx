import { Redirect } from "expo-router";

export { ErrorBoundary } from "expo-router";

export default function GroundReportsFallback() {
  return <Redirect href="/home" />;
}
