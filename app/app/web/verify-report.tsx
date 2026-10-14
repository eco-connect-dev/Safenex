import { Redirect } from "expo-router";

export { ErrorBoundary } from "expo-router";

export default function VerifyReportFallback() {
  return <Redirect href="/home" />;
}
