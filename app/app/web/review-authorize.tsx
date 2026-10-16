import { Redirect } from "expo-router";

export default function ReviewAuthorizeFallback() {
  return <Redirect href="/home" />;
}
