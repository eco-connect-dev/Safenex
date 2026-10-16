import {
  Check,
  CircleAlert,
  Droplets,
  Ellipsis,
  MapPin,
  Mountain,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  Alert,
  Image as RNImage,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Badge, Button, Card, Icon, TextField } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";
import type { MobileRootStackParamList } from "@/src/app/navigation/RootNavigator.native";
import { FlowActions } from "../components/FlowActions";
import { MobileHeader } from "../components/MobileHeader";
import { ProgressSteps } from "../components/ProgressSteps";
import { submitGroundReport } from "../api/submitReport";
import { getMyGroundReports, type MyGroundReport } from "../api/myReports";
import { useReportDraft } from "../store/reportDraft";
import type { GroundReportStatus } from "../../ground-verification/types";

type MobileNavigation = {
  navigate<Route extends keyof MobileRootStackParamList>(route: Route): void;
  goBack(): void;
};

type Props<Route extends keyof MobileRootStackParamList> = {
  navigation: MobileNavigation;
  route: { key: string; name: Route };
};

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
  const selected = useReportDraft((state) => state.hazardType);
  const setDraft = useReportDraft((state) => state.setDraft);
  const hazards = [
    {
      label: "Landslide",
      value: "landslide" as const,
      icon: Mountain,
      color: "#A6763B",
    },
    {
      label: "Flood",
      value: "flood" as const,
      icon: Droplets,
      color: "#3387E9",
    },
    {
      label: "Other",
      value: "other" as const,
      icon: Ellipsis,
      color: "#9CA3A9",
    },
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
          const active = selected === hazard.value;
          return (
            <Pressable
              key={hazard.label}
              onPress={() => setDraft({ hazardType: hazard.value })}
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
  const description = useReportDraft((state) => state.description);
  const hazardType = useReportDraft((state) => state.hazardType);
  const setDraft = useReportDraft((state) => state.setDraft);
  return (
    <View style={styles.screen}>
      <MobileHeader
        onBack={() => navigation.goBack()}
        title="Incident Details"
      />
      <ProgressSteps current={2} />
      <View style={styles.detailContent}>
        <Badge
          label={hazardType[0].toUpperCase() + hazardType.slice(1)}
          tone="warning"
        />
        <Text style={styles.fieldCaption}>WHAT DID YOU OBSERVE?</Text>
        <TextField
          multiline
          numberOfLines={7}
          onChangeText={(value) => setDraft({ description: value })}
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
  const image = useReportDraft((state) => state.image);
  const setDraft = useReportDraft((state) => state.setDraft);
  const selectImage = async (camera: boolean) => {
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Camera permission required",
            "Allow camera access to take a hazard evidence photo.",
          );
          return;
        }
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            base64: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            base64: true,
            quality: 0.8,
          });
      const asset = result.canceled ? null : result.assets[0];
      if (asset?.base64) {
        setDraft({
          image: {
            uri: asset.uri,
            base64: asset.base64,
            mimeType: asset.mimeType ?? "image/jpeg",
            fileName:
              asset.fileName ??
              `evidence.${(asset.mimeType ?? "image/jpeg").split("/")[1] ?? "jpg"}`,
          },
        });
      }
    } catch (error) {
      Alert.alert(
        "Unable to open images",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };
  return (
    <View style={styles.screen}>
      <MobileHeader onBack={() => navigation.goBack()} title="Add Evidence" />
      <ProgressSteps current={3} />
      <View style={styles.evidenceContent}>
        {image ? (
          <RNImage
            resizeMode="cover"
            source={{ uri: image.uri }}
            style={styles.evidenceFrame}
          />
        ) : (
          <View style={styles.evidenceFrame}>
            <View style={styles.evidenceSky} />
            <View style={styles.evidenceLand} />
            <Text style={styles.evidenceSample}>EXAMPLE EVIDENCE PHOTO</Text>
          </View>
        )}
        <Button
          label="TAKE PHOTO"
          icon={CircleAlert}
          onPress={() => void selectImage(true)}
          size="lg"
        />
        <Button
          label="CHOOSE FROM GALLERY"
          onPress={() => void selectImage(false)}
          variant="outline"
          size="lg"
        />
        {image ? (
          <Button
            label="REMOVE PHOTO"
            onPress={() => setDraft({ image: null })}
            variant="ghost"
            size="sm"
          />
        ) : null}
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
  const location = useReportDraft((state) => state.location);
  const district = useReportDraft((state) => state.district);
  const setDraft = useReportDraft((state) => state.setDraft);
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
          <Text style={styles.mapLabel}>
            {location || "Enter the incident location below"}
          </Text>
        </View>
        <TextField
          label="LOCATION"
          value={location}
          onChangeText={(value) => setDraft({ location: value })}
          placeholder="Town, road, or village"
        />
        <TextField
          label="DISTRICT"
          value={district}
          onChangeText={(value) => setDraft({ district: value })}
          placeholder="District"
        />
      </View>
      <FlowActions
        continueLabel="REVIEW REPORT"
        onBack={() => navigation.goBack()}
        onContinue={() => navigation.navigate("ReviewReport")}
      />
    </View>
  );
}

export function ReviewScreen({ navigation }: Props<"ReviewReport">) {
  const draft = useReportDraft();
  const setDraft = useReportDraft((state) => state.setDraft);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submit = async () => {
    if (
      !draft.description.trim() ||
      !draft.location.trim() ||
      !draft.district.trim()
    ) {
      setSubmitError(
        "Add the incident description, location, and district before submitting.",
      );
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const id = await submitGroundReport(draft);
      setDraft({ submittedId: id });
      navigation.navigate("Submitted");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "The report could not be submitted. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  const typeLabel =
    draft.hazardType[0].toUpperCase() + draft.hazardType.slice(1);
  return (
    <View style={styles.screen}>
      <MobileHeader onBack={() => navigation.goBack()} title="Review Report" />
      <ScrollView contentContainerStyle={styles.reviewContent}>
        <ReviewItem label="HAZARD TYPE" value={typeLabel} />
        <ReviewItem
          label="DESCRIPTION"
          value={draft.description || "Not provided"}
        />
        <ReviewItem
          label="EVIDENCE"
          value={draft.image ? "1 photo attached" : "No photo attached"}
        />
        <ReviewItem
          label="LOCATION"
          value={`${draft.location || "—"}, ${draft.district || "—"}`}
        />
        <Text style={styles.submitting}>
          Submitted reports are marked pending verification.
        </Text>
        {submitError ? (
          <Text style={styles.errorText}>{submitError}</Text>
        ) : null}
      </ScrollView>
      <View style={styles.submitAction}>
        <Button
          label="SUBMIT REPORT"
          disabled={submitting}
          loading={submitting}
          onPress={() => void submit()}
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
  const submittedId = useReportDraft((state) => state.submittedId);
  const reset = useReportDraft((state) => state.reset);
  return (
    <View style={styles.screen}>
      <View style={styles.submittedContent}>
        <View style={styles.successCircle}>
          <Icon color={colors.green} icon={Check} size={35} />
        </View>
        <Text style={styles.submittedTitle}>
          Report Submitted{"\n"}Successfully
        </Text>
        <Text style={styles.reference}>
          Reference: {submittedId?.slice(0, 8).toUpperCase() ?? "—"}
        </Text>
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
          onPress={() => {
            reset();
            navigation.navigate("MobileHome");
          }}
          size="lg"
        />
      </View>
    </View>
  );
}

export function ReportsScreen({ navigation }: Props<"MyReports">) {
  const [reports, setReports] = useState<MyGroundReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getMyGroundReports()
        .then((items) => {
          if (!active) return;
          setReports(items);
          setLoadError("");
        })
        .catch((error: unknown) => {
          if (active) {
            setLoadError(
              error instanceof Error
                ? error.message
                : "Your reports could not be loaded.",
            );
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <View style={styles.screen}>
      <MobileHeader onBack={() => navigation.goBack()} title="My Reports" />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={styles.reportsMessage}>Loading your reports…</Text>
        ) : null}
        {loadError ? (
          <Text style={styles.reportsError}>{loadError}</Text>
        ) : null}
        {!loading && !loadError && reports.length === 0 ? (
          <Card style={styles.emptyReports}>
            <Text style={styles.reportTitle}>No reports yet</Text>
            <Text style={styles.rowMeta}>
              Hazard reports you submit will appear here.
            </Text>
            <Button
              label="REPORT A HAZARD"
              onPress={() => navigation.navigate("HazardType")}
              size="md"
            />
          </Card>
        ) : null}
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </ScrollView>
      <BottomHint active="Reports" navigation={navigation} />
    </View>
  );
}

function ReportCard({ report }: { report: MyGroundReport }) {
  const statusLabel: Record<GroundReportStatus, string> = {
    pending_review: "PENDING",
    accepted: "VERIFIED",
    rejected: "REJECTED",
  };
  const tone: Record<GroundReportStatus, "success" | "warning" | "danger"> = {
    pending_review: "warning",
    accepted: "success",
    rejected: "danger",
  };
  return (
    <Card style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.rowMeta}>
            {report.location}, {report.district} ·{" "}
            {new Date(report.submittedAt).toLocaleString()}
          </Text>
        </View>
        <Badge label={statusLabel[report.status]} tone={tone[report.status]} />
      </View>
      {report.status === "accepted" ? <NoticeText /> : null}
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
  navigation?: MobileNavigation;
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
    width: "100%",
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
  errorText: {
    color: colors.red,
    fontSize: typography.sizes.sm,
    paddingHorizontal: spacing.lg,
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
  reportsMessage: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    paddingVertical: spacing.lg,
    textAlign: "center",
  },
  reportsError: {
    color: colors.red,
    fontSize: typography.sizes.sm,
    padding: spacing.md,
  },
  emptyReports: { gap: spacing.md },
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
