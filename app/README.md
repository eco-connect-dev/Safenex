# Safenex application scaffold

Safenex uses separate navigation roots for its two audiences:

- **Mobile (`RootNavigator.native.tsx`)** is bundled for iOS and Android citizens
  and volunteers. Mobile-only features such as hazard reporting, location
  capture, maps, and camera capture belong under the mobile feature areas.
- **Web (`RootNavigator.web.tsx`)** is bundled for district officers in the DMC
  workspace. Web-only features such as ground verification, emergency
  coordination, analytics, and operational alerts belong under the web feature
  areas.

Platform-specific files use React Native's `.native.tsx` and `.web.tsx`
resolution, so a platform bundle imports only its own root navigator. The
project uses Expo Router's `Stack` and `Drawer` layouts because Expo SDK 56+
does not allow application imports from external `@react-navigation/*`
packages. Shared domain types, API adapters, theme tokens, UI primitives, and
providers live under `src/` and can be used by both audiences.

The `src/components/map/MapView.native.tsx` and `.web.tsx` pair, together with
the `src/components/media/CameraCapture.native.tsx` and `.web.tsx` pair, keeps
platform-specific widgets isolated in the same way.

Additional feature screens can be added without coupling the mobile bundle to
officer-only screens or the web bundle to citizen-only screens.

The native navigator now includes the citizen hazard-reporting flow:
dashboard, hazard selection, incident details, evidence, location, review,
submission confirmation, reports, alerts, and profile. The screens are
implemented under `src/features/hazard-reporting/screens` and use the shared
mobile UI primitives and theme tokens.

The web navigator includes the DMC ground-verification flow under
`src/features/ground-verification`. Pending report data is represented as a
JSON array in `src/api/ground-reports.json`, with typed access through the
feature API module. The list and report detail routes remain web-only through
`RootNavigator.web.tsx`.

The web build also resolves `app/(tabs)/home.web.tsx` and
`app/(tabs)/_layout.web.tsx` instead of the citizen dashboard. This gives
district officers a dedicated operations overview with links to the
ground-report queue and verification detail pages.
