import {
  Check,
  CircleAlert,
  Droplets,
  Ellipsis,
  MapPin,
  Mountain,
  Navigation,
  Waves,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NavigationProp } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Badge, Button, Card, Icon, TextField } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";
import type { MobileRootStackParamList } from "@/src/app/navigation/RootNavigator.native";
import { FlowActions } from "../components/FlowActions";
import { MobileHeader } from "../components/MobileHeader";
import { ProgressSteps } from "../components/ProgressSteps";

type Props<Route extends keyof MobileRootStackParamList> =
  NativeStackScreenProps<MobileRootStackParamList, Route>;

export function HomeScreen({ navigation }: Props<"MobileHome">) {
  return (
    <View style={styles.screen}>
      <MobileHeader
        showProfile
        subtitle="Disaster Management Centre"
        title="DMC Hazard Alert"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>
          Good morning, <Text style={styles.bold}>Nadeesha</Text>
        </Text>
        <Card style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Icon color={colors.white} icon={CircleAlert} size={22} />
          </View>
          <View style={styles.alertCopy}>
            <Text style={styles.alertTitle}>3 Active Alerts Nearby</Text>
            <Text style={styles.alertSubtitle}>
              Landslide risk elevated — Kadawatha area
            </Text>
          </View>
        </Card>
        <Button
          label="REPORT A HAZARD"
          onPress={() => navigation.navigate("HazardType")}
          icon={CircleAlert}
          size="lg"
        />
        <Button
          label="MY REPORTS"
          onPress={() => navigation.navigate("MyReports")}
          variant="outline"
          size="lg"
        />
        <Text style={styles.sectionTitle}>RECENT ALERTS</Text>
        <AlertRow
          color={colors.red}
          title="Landslide warning — Kandy Rd."
          meta="1.2 km away · 20 min ago"
        />
        <AlertRow
          color={colors.primary}
          title="Flood watch — Kelani River"
          meta="3.4 km away · 1 hr ago"
        />
      </ScrollView>
      <BottomHint active="Home" navigation={navigation} />
    </View>
  );
}

function AlertRow({
  color,
  title,
  meta,
}: {
  color: string;
  title: string;
  meta: string;
}) {
  return (
    <View style={styles.alertRow}>
      <View style={[styles.alertDot, { backgroundColor: color }]} />
      <View>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowMeta}>{meta}</Text>
      </View>
    </View>
  );
}

export function HazardTypeScreen({ navigation }: Props<"HazardType">) {
  const [selected, setSelected] = useState("Landslide");
  const hazards = [
    { label: "Landslide", icon: Mountain, color: "#A6763B" },
    { label: "Flood", icon: Droplets, color: "#3387E9" },
    { label: "Blocked Road", icon: CircleAlert, color: "#F6A51C" },
    { label: "River Overflow", icon: Waves, color: "#238BA7" },
    { label: "Other", icon: Ellipsis, color: "#9CA3A9" },
  ];

  return (
    <View style={styles.screen}>
      <MobileHeader
        onBack={() => navigation.goBack()}
        title="Report a Hazard"
      />
      <ProgressSteps current={1} />
      <Text style={styles.stepLabel}>STEP 1 OF 4 · WHAT DID YOU SEE?</Text>
      <ScrollView contentContainerStyle={styles.hazardList}>
        {hazards.map((hazard) => {
          const active = selected === hazard.label;
          return (
            <Pressable
              key={hazard.label}
              onPress={() => setSelected(hazard.label)}
              style={[styles.hazardCard, active && styles.hazardCardActive]}
            >
              <View
                style={[styles.hazardIcon, { backgroundColor: hazard.color }]}
              >
                <Icon color={colors.white} icon={hazard.icon} size={22} />
              </View>
              <Text style={styles.hazardLabel}>{hazard.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <FlowActions
        onBack={() => navigation.goBack()}
        onContinue={() => navigation.navigate("IncidentDetails")}
      />
    </View>
  );
}

export function IncidentDetailsScreen({
  navigation,
}: Props<"IncidentDetails">) {
  const [description, setDescription] = useState(
    "Large crack appeared near the hillside road after heavy rainfall.",
  );
  return (
    <View style={styles.screen}>
      <MobileHeader
        onBack={() => navigation.goBack()}
        title="Incident Details"
      />
      <ProgressSteps current={2} />
      <View style={styles.detailContent}>
        <Badge label="Landslide" tone="warning" />
        <Text style={styles.fieldCaption}>WHAT DID YOU OBSERVE?</Text>
        <TextField
          multiline
          numberOfLines={7}
          onChangeText={setDescription}
          placeholder="Describe what happened..."
          style={styles.description}
          value={description}
        />
        <Text style={styles.helper}>
          Include what you saw, when it happened, and any immediate risks to
          people or property.
        </Text>
      </View>
      <FlowActions
        onBack={() => navigation.goBack()}
        onContinue={() => navigation.navigate("Evidence")}
      />
    </View>
  );
}

export function EvidenceScreen({ navigation }: Props<"Evidence">) {
  return (
    <View style={styles.screen}>
      <MobileHeader onBack={() => navigation.goBack()} title="Add Evidence" />
      <ProgressSteps current={3} />
      <View style={styles.evidenceContent}>
        <View style={styles.evidenceFrame}>
          <View style={styles.evidenceSky} />
          <View style={styles.evidenceLand} />
          <Text style={styles.evidenceSample}>EXAMPLE EVIDENCE PHOTO</Text>
        </View>
        <Button label="TAKE PHOTO" icon={CircleAlert} size="lg" />
        <Button label="CHOOSE FROM GALLERY" variant="outline" size="lg" />
        <Text style={styles.helper}>
          Photos help Duty Officers verify your report.
        </Text>
      </View>
      <FlowActions
        onBack={() => navigation.goBack()}
        onContinue={() => navigation.navigate("Location")}
      />
    </View>
  );
}

export function LocationScreen({ navigation }: Props<"Location">) {
  return (
    <View style={styles.screen}>
      <MobileHeader
        onBack={() => navigation.goBack()}
        title="Hazard Location"
      />
      <ProgressSteps current={4} />
      <View style={styles.locationContent}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapRoad} />
          <View style={styles.mapPin}>
            <Icon color={colors.white} icon={MapPin} size={28} />
          </View>
          <Text style={styles.mapLabel}>Kandy Rd, Kadawatha</Text>
        </View>
        <Button
          label="+ USE CURRENT LOCATION"
          variant="outline"
          size="md"
          icon={Navigation}
        />
        <View style={styles.coordinates}>
          <Coordinate label="LATITUDE" value="6.9271° N" />
          <Coordinate label="LONGITUDE" value="79.8612° E" />
        </View>
        <Text style={styles.helper}>
          Location accuracy <Text style={styles.accuracy}>± 5 m · High</Text>
        </Text>
      </View>
      <FlowActions
        continueLabel="REVIEW REPORT"
        onBack={() => navigation.goBack()}
        onContinue={() => navigation.navigate("ReviewReport")}
      />
    </View>
  );
}

function Coordinate({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.coordinate}>
      <Text style={styles.coordinateLabel}>{label}</Text>
      <Text style={styles.coordinateValue}>{value}</Text>
    </View>
  );
}

export function ReviewScreen({ navigation }: Props<"ReviewReport">) {
  return (
    <View style={styles.screen}>
      <MobileHeader onBack={() => navigation.goBack()} title="Review Report" />
      <ScrollView contentContainerStyle={styles.reviewContent}>
        <ReviewItem label="HAZARD TYPE" value="Landslide" />
        <ReviewItem
          label="DESCRIPTION"
          value="Large crack appeared near the hillside road after heavy rainfall."
        />
        <ReviewItem label="EVIDENCE" value="1 photo attached" />
        <ReviewItem label="LOCATION" value="Kandy Rd, Kadawatha" />
        <Text style={styles.submitting}>
          Submitting as Community Volunteer · Nadeesha P.
        </Text>
      </ScrollView>
      <View style={styles.submitAction}>
        <Button
          label="SUBMIT REPORT"
          onPress={() => navigation.navigate("Submitted")}
          size="lg"
        />
      </View>
    </View>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.reviewItem}>
      <View style={styles.reviewText}>
        <Text style={styles.fieldCaption}>{label}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
      </View>
      <Text style={styles.edit}>Edit</Text>
    </Card>
  );
}

export function SubmittedScreen({ navigation }: Props<"Submitted">) {
  return (
    <View style={styles.screen}>
      <View style={styles.submittedContent}>
        <View style={styles.successCircle}>
          <Icon color={colors.green} icon={Check} size={35} />
        </View>
        <Text style={styles.submittedTitle}>
          Report Submitted{"\n"}Successfully
        </Text>
        <Text style={styles.reference}>Reference: GH-2026-04821</Text>
        <Badge label="PENDING VERIFICATION" tone="warning" />
        <Text style={styles.helper}>
          Your report has been sent to a DMC Duty Officer for verification.
        </Text>
      </View>
      <View style={styles.submitAction}>
        <Button
          label="VIEW REPORT STATUS"
          onPress={() => navigation.navigate("MyReports")}
          variant="outline"
          size="lg"
        />
        <Button
          label="BACK TO HOME"
          onPress={() => navigation.navigate("MobileHome")}
          size="lg"
        />
      </View>
    </View>
  );
}

export function ReportsScreen({ navigation }: Props<"MyReports">) {
  return (
    <View style={styles.screen}>
      <MobileHeader onBack={() => navigation.goBack()} title="My Reports" />
      <ScrollView contentContainerStyle={styles.content}>
        <ReportCard
          status="APPROVED"
          title="Landslide"
          detail="Kandy Rd, Kadawatha · 04 Sep, 09:12"
        />
        <ReportCard
          status="PENDING"
          title="Flood"
          detail="Negombo Canal Rd · 04 Sep, 10:40"
        />
        <ReportCard
          status="REJECTED"
          title="Blocked Road"
          detail="Gampaha Junction · 05 Sep, 07:05"
        />
      </ScrollView>
      <BottomHint active="Reports" navigation={navigation} />
    </View>
  );
}

function ReportCard({
  status,
  title,
  detail,
}: {
  status: "APPROVED" | "PENDING" | "REJECTED";
  title: string;
  detail: string;
}) {
  const tone =
    status === "APPROVED"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : "danger";
  return (
    <Card style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View>
          <Text style={styles.reportTitle}>{title}</Text>
          <Text style={styles.rowMeta}>{detail}</Text>
        </View>
        <Badge label={status} tone={tone} />
      </View>
      {status === "APPROVED" ? <NoticeText /> : null}
    </Card>
  );
}

function NoticeText() {
  return (
    <View style={styles.verifiedNotice}>
      <Text style={styles.verifiedText}>
        Your ground hazard report has been verified by a DMC Duty Officer.
      </Text>
    </View>
  );
}

function BottomHint({
  active,
  navigation,
}: {
  active: string;
  navigation?: NavigationProp<MobileRootStackParamList>;
}) {
  const routes = {
    Home: "MobileHome",
    Reports: "MyReports",
    Alerts: "Alerts",
    Profile: "Profile",
  } as const;

  return (
    <View style={styles.bottomHint}>
      {Object.keys(routes).map((label) => (
        <Pressable
          key={label}
          onPress={() =>
            navigation?.navigate(routes[label as keyof typeof routes])
          }
          style={styles.bottomItem}
        >
          <Text
            style={[
              styles.bottomLabel,
              active === label && styles.bottomActive,
            ]}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AlertsScreen({ navigation }: Props<"Alerts">) {
  return (
    <View style={styles.screen}>
      <MobileHeader showProfile title="Alerts" />
      <ScrollView contentContainerStyle={styles.content}>
        <AlertRow
          color={colors.red}
          title="Landslide warning — Kandy Rd."
          meta="1.2 km away · 20 min ago"
        />
        <AlertRow
          color={colors.primary}
          title="Flood watch — Kelani River"
          meta="3.4 km away · 1 hr ago"
        />
      </ScrollView>
      <BottomHint active="Alerts" navigation={navigation} />
    </View>
  );
}

export function ProfileScreen({ navigation }: Props<"Profile">) {
  return (
    <View style={styles.screen}>
      <MobileHeader showProfile title="Profile" />
      <View style={styles.content}>
        <Text style={styles.greeting}>Nadeesha P.</Text>
        <Text style={styles.helper}>Community Volunteer</Text>
      </View>
      <BottomHint active="Profile" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.surface, flex: 1 },
  content: { gap: spacing.md, padding: spacing.lg },
  greeting: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  bold: { color: colors.text, fontWeight: "800" },
  alertCard: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderWidth: 0,
    flexDirection: "row",
    gap: spacing.md,
  },
  alertIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  alertCopy: { flex: 1 },
  alertTitle: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  alertSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.md,
  },
  alertRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  alertDot: { borderRadius: radii.pill, height: 7, marginTop: 4, width: 7 },
  rowTitle: { color: colors.text, fontSize: typography.sizes.sm },
  rowMeta: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: 3,
  },
  bottomHint: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  bottomItem: { alignItems: "center", flex: 1 },
  bottomLabel: { color: colors.textMuted, fontSize: 10 },
  bottomActive: { color: colors.primary, fontWeight: "700" },
  stepLabel: { color: colors.textMuted, fontSize: 10, margin: spacing.lg },
  hazardList: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  hazardCard: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  hazardCardActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  hazardIcon: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  hazardLabel: { color: colors.text, fontSize: typography.sizes.sm },
  detailContent: { flex: 1, gap: spacing.md, padding: spacing.lg },
  fieldCaption: { color: colors.textMuted, fontSize: 10, fontWeight: "500" },
  description: { minHeight: 150, textAlignVertical: "top" },
  helper: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
  evidenceContent: { flex: 1, gap: spacing.sm, padding: spacing.lg },
  evidenceFrame: {
    borderRadius: radii.lg,
    height: 180,
    overflow: "hidden",
    position: "relative",
  },
  evidenceSky: { backgroundColor: "#B8D9E9", flex: 1 },
  evidenceLand: {
    backgroundColor: "#6E754B",
    bottom: 0,
    height: "55%",
    position: "absolute",
    width: "100%",
  },
  evidenceSample: {
    backgroundColor: "#43535A",
    borderRadius: radii.sm,
    color: colors.white,
    fontSize: 9,
    left: spacing.sm,
    padding: spacing.xs,
    position: "absolute",
    top: spacing.sm,
  },
  locationContent: { flex: 1, gap: spacing.md, padding: spacing.lg },
  mapPlaceholder: {
    backgroundColor: "#DCECD8",
    borderRadius: radii.lg,
    height: 270,
    overflow: "hidden",
    position: "relative",
  },
  mapRoad: {
    backgroundColor: colors.white,
    height: 18,
    left: -20,
    position: "absolute",
    right: -20,
    top: 120,
    transform: [{ rotate: "-5deg" }],
  },
  mapPin: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#E84C2B",
    borderRadius: radii.pill,
    height: 52,
    justifyContent: "center",
    marginTop: 80,
    width: 52,
  },
  mapLabel: {
    backgroundColor: colors.white,
    bottom: spacing.sm,
    left: spacing.sm,
    padding: spacing.sm,
    position: "absolute",
  },
  coordinates: { flexDirection: "row", gap: spacing.sm },
  coordinate: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.sm,
  },
  coordinateLabel: { color: colors.textMuted, fontSize: 9 },
  coordinateValue: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    marginTop: 3,
  },
  accuracy: { color: colors.green, fontWeight: "700" },
  reviewContent: { gap: spacing.sm, padding: spacing.lg },
  reviewItem: { flexDirection: "row", justifyContent: "space-between" },
  reviewText: { flex: 1, gap: spacing.xs },
  reviewValue: { color: colors.text, fontSize: typography.sizes.sm },
  edit: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  submitting: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    padding: spacing.md,
  },
  submitAction: { gap: spacing.sm, padding: spacing.lg },
  submittedContent: {
    alignItems: "center",
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
    padding: spacing.xl,
  },
  successCircle: {
    alignItems: "center",
    backgroundColor: colors.greenSoft,
    borderRadius: radii.pill,
    height: 74,
    justifyContent: "center",
    width: 74,
  },
  submittedTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    textAlign: "center",
  },
  reference: {
    backgroundColor: colors.background,
    color: colors.textMuted,
    padding: spacing.md,
    width: "100%",
  },
  reportCard: { gap: spacing.md },
  reportHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportTitle: { color: colors.text, fontSize: typography.sizes.md },
  verifiedNotice: {
    backgroundColor: colors.greenSoft,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  verifiedText: { color: colors.green, fontSize: typography.sizes.xs },
});
