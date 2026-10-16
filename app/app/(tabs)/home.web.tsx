import {
  AlertTriangle,
  ChevronRight,
  Info,
  Radio,
} from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { getActiveHazards, type HazardRecord } from "@/src/features/hazard-assessment/api/hazards";

const navyText = "#0C1424";
const mutedBlue = "#607797";
const paleBackground = "#F1F5F9";

export default function WebHomeScreen() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [step, setStep] = useState(1);
  const [hazards, setHazards] = useState<HazardRecord[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<HazardRecord | null>(null);
  const [hazardError, setHazardError] = useState("");

  useEffect(() => {
    const refresh = () => getActiveHazards().then((items) => {
      setHazards(items);
      setSelectedHazard((current) => current ? items.find((hazard) => hazard.id === current.id) ?? items[0] ?? null : items[0] ?? null);
      setHazardError("");
    }).catch((error: Error) => setHazardError(error.message));
    void refresh();
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  }, []);

  const continueWithHazard = () => {
    if (selectedHazard) router.push({ pathname: "/web/affected-area", params: { hazardId: selectedHazard.id } } as never);
  };

  return (
    <DmcWebShell>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heading}>
            <Text style={styles.title}>Assess Active Hazard</Text>
            <Text style={styles.subtitle}>
              Review sensor evidence and hydrological thresholds before
              selecting warning area.
            </Text>
          </View>

          <View style={[styles.steps, styles.responsiveWrap]}>
            <StepCard
              active={step === 1}
              label="Assess hazard"
              number="1"
              onPress={() => setStep(1)}
            />
            <StepCard
              active={step === 2}
              label="Select affected area"
              number="2"
              onPress={continueWithHazard}
            />
            <StepCard
              active={step === 3}
              label="Prepare warning"
              number="3"
              onPress={() => selectedHazard && router.push({ pathname: "/web/prepare-warning", params: { hazardId: selectedHazard.id } } as never)}
            />
            <StepCard
              active={step === 4}
              label="Review & authorize"
              number="4"
              onPress={() => selectedHazard && router.push({ pathname: "/web/review-authorize", params: { hazardId: selectedHazard.id } } as never)}
            />
          </View>

          {!acknowledged ? (
            <View style={[styles.criticalNotice, styles.responsiveWrap]}>
              <View style={styles.noticeIcon}>
                <Icon color={colors.red} icon={AlertTriangle} size={19} />
              </View>
              <Text style={styles.noticeText}>
                <Text style={styles.noticeStrong}>{selectedHazard?.severity.toUpperCase() ?? "ACTIVE"} hazard</Text>
                {" · "}{selectedHazard ? `${selectedHazard.title} · ${selectedHazard.location}, ${selectedHazard.district}.` : hazardError || "Loading active hazards from Supabase…"}
              </Text>
              <Pressable
                onPress={() => setAcknowledged(true)}
                style={({ pressed }) => [
                  styles.outlineButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.outlineButtonText}>Acknowledge</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.acknowledgedNotice}>
              <Icon color={colors.green} icon={Radio} size={18} />
              <Text style={styles.acknowledgedText}>
                Event acknowledged and added to command activity log.
              </Text>
            </View>
          )}

          <View style={styles.hazardSelectorSection}>
            <View style={styles.hazardSelectorHeading}><Text style={styles.cardTitle}>Currently reported hazards</Text><Text style={styles.cardSubtitle}>{hazards.length} active · select to monitor</Text></View>
            {hazardError ? <Text style={styles.hazardError}>{hazardError}</Text> : null}
            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.hazardSlider}>
              {hazards.map((hazard) => <Pressable key={hazard.id} onPress={() => { setSelectedHazard(hazard); setAcknowledged(false); }} style={[styles.hazardSlide, selectedHazard?.id === hazard.id && styles.hazardSlideSelected]}>
                <Text style={styles.hazardSlideTitle}>{hazard.title}</Text>
                <Text style={styles.hazardSlideMeta}>{hazard.hazard_type.toUpperCase()} · {hazard.severity.toUpperCase()} · {hazard.district}</Text>
                <Text style={styles.hazardSlideReading}>{hazard.water_level_m !== null ? `${hazard.water_level_m.toFixed(2)} m water` : hazard.slope_displacement_mm !== null ? `${hazard.slope_displacement_mm.toFixed(1)} mm slope movement` : `${hazard.rainfall_mm_hr?.toFixed(1) ?? "—"} mm/hr rainfall`}</Text>
              </Pressable>)}
            </ScrollView>
          </View>

          <View style={[styles.panels, styles.responsiveWrap]}>
            {selectedHazard ? <HazardPanel hazard={selectedHazard} /> : <View style={styles.emptyHazard}><Text style={styles.cardTitle}>{hazardError || "No active hazards found"}</Text></View>}
            {selectedHazard ? <ForecastPanel hazard={selectedHazard} /> : null}
          </View>

          <View style={styles.evidenceCard}>
            <View>
              <Text style={styles.cardTitle}>Basin Sensor Evidence Table</Text>
              <Text style={styles.cardSubtitle}>
                Latest hazard data loaded from Supabase.
              </Text>
            </View>
            <View style={styles.evidenceRow}>
              <Text style={styles.evidenceLabel}>{selectedHazard?.location ?? "No selected hazard"}</Text>
              <Text style={styles.evidenceValue}>{selectedHazard?.water_level_m !== null && selectedHazard ? `${selectedHazard.water_level_m.toFixed(2)} m water level` : selectedHazard?.slope_displacement_mm !== null && selectedHazard ? `${selectedHazard.slope_displacement_mm.toFixed(1)} mm slope movement · ${selectedHazard.rainfall_mm_hr?.toFixed(1) ?? "—"} mm/hr rain` : `${selectedHazard?.rainfall_mm_hr?.toFixed(1) ?? "—"} mm/hr rainfall`}</Text>
              <Text style={styles.evidenceStatus}>{selectedHazard?.severity.toUpperCase() ?? "—"}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.actionBar, styles.responsiveWrap]}>
          <Pressable
            onPress={() => setAcknowledged(true)}
            style={({ pressed }) => [
              styles.bottomOutlineButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.bottomOutlineText}>Acknowledge event</Text>
          </Pressable>
          <Text style={styles.syncText}>
            ⌘ + Enter　· Continuous acoustic relay active · Latency 12 ms ·
            Next sync in 8 seconds
          </Text>
          <Pressable
            onPress={continueWithHazard}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {selectedHazard ? "Assess hazard & select area" : "Select an active hazard"}
            </Text>
            <Icon color={colors.white} icon={ChevronRight} size={18} />
          </Pressable>
        </View>
    </DmcWebShell>
  );
}

function StepCard({
  active,
  label,
  number,
  onPress,
}: {
  active: boolean;
  label: string;
  number: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepCard,
        active && styles.stepCardActive,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.stepNumber, active && styles.stepActiveText]}>
        STEP {number}
      </Text>
      <Text style={[styles.stepLabel, active && styles.stepActiveText]}>
        {label}
      </Text>
      {active ? <View style={styles.stepDot} /> : null}
    </Pressable>
  );
}

function HazardPanel({ hazard }: { hazard: HazardRecord }) {
  const isFlood = hazard.hazard_type === "flood";
  const metricLabel = isFlood ? "ACTIVE SENSOR WATER LEVEL" : hazard.hazard_type === "landslide" ? "SLOPE DISPLACEMENT" : "CURRENT RAINFALL";
  const value = isFlood ? hazard.water_level_m : hazard.hazard_type === "landslide" ? hazard.slope_displacement_mm : hazard.rainfall_mm_hr;
  const unit = isFlood ? "m" : hazard.hazard_type === "landslide" ? "mm" : "mm/hr";
  const maxValue = Math.max(1, (value ?? 0) * 1.2);
  const middleValue = maxValue * 0.75;
  return (
    <View style={[styles.panel, styles.hazardPanel]}>
      <View style={styles.badgeRow}>
        <View style={styles.criticalBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.criticalBadgeText}>{hazard.severity.toUpperCase()}</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>{hazard.affected_people.toLocaleString()} people at risk</Text>
        </View>
      </View>
      <Text style={styles.hazardTitle}>{hazard.title}</Text>
      <Text style={styles.hazardSubtitle}>{hazard.location} · {hazard.district} · {hazard.hazard_type}</Text>

      <View style={styles.levelBox}>
        <View style={styles.levelScale}>
          <View style={styles.scaleBar}>
            <View style={styles.scaleRed} />
            <View style={styles.scaleAmber} />
            <View style={styles.scaleGreen} />
          </View>
          <View style={styles.scaleLabels}>
            <Text style={styles.redText}>{maxValue.toFixed(1)} {unit}</Text>
            <Text style={styles.amberText}>{middleValue.toFixed(1)} {unit}</Text>
            <Text style={styles.datumText}>0.00 {unit} · Baseline</Text>
          </View>
        </View>
        <View style={styles.levelDivider} />
        <View style={styles.currentLevel}>
          <Text style={styles.overline}>{metricLabel}</Text>
          <Text style={styles.levelValue}>
            {value?.toFixed(isFlood ? 2 : 1) ?? "—"}<Text style={styles.levelUnit}> {unit}</Text>
          </Text>
          <View style={styles.thresholdCallout}>
            <Text style={styles.thresholdText}>Current severity: {hazard.severity.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <Detail label="Last observed" value={new Date(hazard.observed_at).toLocaleString()} />
        <Detail label="Hazard type / Severity" value={`${hazard.hazard_type} · ${hazard.severity}`} />
        <Detail label={isFlood ? "Water level" : hazard.hazard_type === "landslide" ? "Slope displacement" : "Rainfall"} value={value === null ? "No current measurement" : `${value} ${unit}`} accent />
        <Detail label="Rainfall" value={hazard.rainfall_mm_hr === null ? "No current measurement" : `${hazard.rainfall_mm_hr} mm/hr`} />
      </View>
      <View style={styles.panelFooter}>
        <Text style={styles.footerMeta}>{hazard.location} · {hazard.description}</Text>
        <Text style={styles.footerMeta}>{hazard.affected_people.toLocaleString()} exposed</Text>
      </View>
    </View>
  );
}

function Detail({
  accent = false,
  label,
  value,
}: {
  accent?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && styles.detailAccent]}>
        {value}
      </Text>
    </View>
  );
}

function ForecastPanel({ hazard }: { hazard: HazardRecord }) {
  const isFlood = hazard.hazard_type === "flood";
  const isLandslide = hazard.hazard_type === "landslide";
  const currentValue = isFlood ? hazard.water_level_m : isLandslide ? hazard.slope_displacement_mm : hazard.rainfall_mm_hr;
  const unit = isFlood ? "m" : isLandslide ? "mm" : "mm/hr";
  const chartTitle = isFlood ? "Water Level Monitor" : isLandslide ? "Slope Movement Monitoring" : "Rainfall Monitoring";
  const chartMetric = isFlood ? "Water level (m)" : isLandslide ? "Slope displacement (mm)" : "Rainfall (mm/hr)";
  const chartMax = Math.max(1, (currentValue ?? 0) * 1.2);
  const currentTop = 145 - (currentValue ?? 0) / chartMax * 125;
  return (
    <View style={[styles.panel, styles.forecastPanel]}>
      <Text style={styles.cardTitle}>{chartTitle}</Text>
      <View style={styles.chartLegendRow}>
        <Text style={styles.chartSubtitle}>
          {chartMetric} · {hazard.title} · Current value from hazard record
        </Text>
        <View style={styles.legend}>
          <Text style={styles.legendBlue}>━</Text>
          <Text style={styles.legendText}>Reference</Text>
          <Text style={styles.legendRed}>━</Text>
          <Text style={styles.legendText}>Current</Text>
        </View>
      </View>

      <View style={styles.chart}>
        <View style={styles.chartGridOne} />
        <View style={styles.chartGridTwo} />
        <View style={[styles.currentPoint, { right: "12%", top: currentTop }]} />
        <Text style={[styles.chartTime, { left: 0 }]}>LOW</Text>
        <Text style={[styles.chartTime, { left: "42%" }]}>MEASUREMENT RANGE</Text>
        <Text style={[styles.chartTime, styles.nowTime]}>CURRENT</Text>
        <Text style={[styles.chartThresholdRed, { right: 8, top: 12 }]}>{chartMax.toFixed(1)} {unit}</Text>
        <Text style={[styles.chartThresholdAmber, { right: 8, bottom: 36 }]}>0 {unit}</Text>
      </View>

      <View style={styles.forecastNotice}>
        <Icon color={colors.red} icon={Info} size={16} />
        <Text style={styles.forecastNoticeText}>
          <Text style={styles.noticeStrong}>{isFlood ? "Current water level" : isLandslide ? "Current slope movement" : "Current rainfall"}: {currentValue === null ? "No reading" : `${currentValue.toFixed(2)} ${unit}`}</Text>
          {" · "}{hazard.severity.toUpperCase()} severity · Last observed {new Date(hazard.observed_at).toLocaleString()}.
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  responsiveWrap: { flexWrap: "wrap" },
  screen: { backgroundColor: paleBackground, flex: 1, flexDirection: "row" },
  sidebar: {
    backgroundColor: "#0E172B",
    justifyContent: "space-between",
    paddingBottom: 22,
    paddingHorizontal: 15,
    paddingTop: 20,
    width: 320,
  },
  content: { flex: 1, minWidth: 0 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 14, paddingHorizontal: 15 },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: "#6F9BFF",
    borderRadius: 5,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  brandMarkText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  brand: { color: colors.white, fontSize: 22, fontWeight: "800" },
  nav: { gap: 8, marginTop: 48 },
  navItem: { alignItems: "center", borderRadius: 9, flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingVertical: 14 },
  navItemSelected: { backgroundColor: "#1D2B42" },
  navLabel: { color: "#9AAAC2", fontSize: 17 },
  navLabelSelected: { color: colors.white, fontWeight: "800" },
  sidebarFooter: { gap: 4, paddingHorizontal: 5 },
  footerTitle: { color: colors.white, fontSize: 14 },
  footerText: { color: "#8292AA", fontSize: 14 },
  connected: { color: "#1EE7A2", fontSize: 14, marginTop: 17 },
  topbar: { alignItems: "center", backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", height: 80, justifyContent: "space-between", paddingHorizontal: 38 },
  topbarTitle: { color: navyText, fontSize: 18 },
  profile: { alignItems: "center", flexDirection: "row", gap: 16 },
  profileCopy: { alignItems: "flex-end" },
  profileName: { color: navyText, fontSize: 18, fontWeight: "800" },
  profileRole: { color: mutedBlue, fontSize: 14 },
  avatar: { alignItems: "center", backgroundColor: "#E6ECF5", borderColor: "#CAD5E5", borderRadius: 24, borderWidth: 1, height: 46, justifyContent: "center", width: 46 },
  avatarText: { color: "#20334E", fontSize: 14, fontWeight: "700" },
  scrollContent: { gap: 9, padding: 14, paddingBottom: 84 },
  heading: { gap: 3 },
  title: { color: navyText, fontSize: 20, fontWeight: "800" },
  subtitle: { color: mutedBlue, fontSize: 12 },
  steps: { flexDirection: "row", gap: 7 },
  stepCard: { backgroundColor: "#F8FAFC", borderColor: "#DFE6EF", borderRadius: 7, borderWidth: 1, flex: 1, height: 56, minHeight: 56, paddingHorizontal: 8, paddingVertical: 6 },
  stepCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNumber: { color: "#B2C0D2", fontSize: 11, letterSpacing: 0.2 },
  stepLabel: { color: "#9DACC0", fontSize: 13, fontWeight: "700", marginTop: 4 },
  stepActiveText: { color: colors.white },
  stepDot: { backgroundColor: colors.white, borderRadius: 5, height: 10, position: "absolute", right: 20, top: 21, width: 10 },
  criticalNotice: { alignItems: "center", backgroundColor: "#FFF4F3", borderColor: "#FFB4B3", borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 7, minHeight: 40, paddingHorizontal: 9 },
  noticeIcon: { alignItems: "center", backgroundColor: "#FFE1DF", borderRadius: 15, height: 30, justifyContent: "center", width: 30 },
  noticeText: { color: "#941A1A", flex: 1, fontSize: 11, lineHeight: 15 },
  noticeStrong: { fontWeight: "800" },
  outlineButton: { borderColor: "#FF7775", borderRadius: 8, borderWidth: 1, paddingHorizontal: 17, paddingVertical: 10 },
  outlineButtonText: { color: "#A52323", fontSize: 15, fontWeight: "800" },
  acknowledgedNotice: { alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#86EFAC", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 10, padding: 18 },
  acknowledgedText: { color: "#047857", fontSize: 15, fontWeight: "700" },
  hazardSelectorSection: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 8, borderWidth: 1, gap: 5, padding: 8 },
  hazardSelectorHeading: { alignItems: "flex-start", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  hazardSlider: { gap: 12, paddingVertical: 2 },
  hazardSlide: { backgroundColor: "#F8FAFC", borderColor: "#D8E1EC", borderRadius: 7, borderWidth: 1, gap: 3, minWidth: 190, padding: 8 },
  hazardSlideSelected: { backgroundColor: "#EFF6FF", borderColor: colors.primary, borderWidth: 2 },
  hazardSlideTitle: { color: navyText, fontSize: 12, fontWeight: "800" },
  hazardSlideMeta: { color: mutedBlue, fontSize: 9, fontWeight: "700" },
  hazardSlideReading: { color: colors.primary, fontSize: 11, fontWeight: "700" },
  hazardError: { color: colors.red, fontSize: 13 },
  emptyHazard: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 240, padding: 24 },
  panels: { flexDirection: "row", gap: 30 },
  panel: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 8, borderWidth: 1, padding: 10 },
  hazardPanel: { flex: 1, minWidth: 280 },
  forecastPanel: { flex: 1, minWidth: 280 },
  badgeRow: { flexDirection: "row", gap: 10 },
  criticalBadge: { alignItems: "center", backgroundColor: "#FFE0E1", borderRadius: 20, flexDirection: "row", gap: 7, paddingHorizontal: 14, paddingVertical: 5 },
  badgeDot: { backgroundColor: colors.red, borderRadius: 5, height: 10, width: 10 },
  criticalBadgeText: { color: "#C42327", fontSize: 11, fontWeight: "700" },
  confidenceBadge: { borderColor: "#86B4FF", borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 5 },
  confidenceText: { color: colors.primary, fontSize: 11, fontWeight: "700" },
  hazardTitle: { color: navyText, fontSize: 16, fontWeight: "800", marginTop: 7 },
  hazardSubtitle: { color: mutedBlue, fontSize: 12, marginTop: 3 },
  levelBox: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E8EEF5", borderRadius: 7, flexDirection: "row", marginTop: 9, minHeight: 104, padding: 8 },
  levelScale: { alignItems: "center", flexDirection: "row", gap: 20, width: "43%" },
  scaleBar: { borderRadius: 10, height: 78, overflow: "hidden", width: 15 },
  scaleRed: { backgroundColor: "#EF4444", flex: 1 },
  scaleAmber: { backgroundColor: "#F59E0B", flex: 1 },
  scaleGreen: { backgroundColor: "#10B981", flex: 2.2 },
  scaleLabels: { gap: 8 },
  redText: { color: colors.red, fontSize: 11, fontWeight: "800" },
  amberText: { color: "#DC7200", fontSize: 11, fontWeight: "800" },
  datumText: { color: "#8FA3BF", fontSize: 10, marginTop: 20 },
  levelDivider: { backgroundColor: "#DDE5EE", height: 86, width: 1 },
  currentLevel: { flex: 1, paddingLeft: 14 },
  overline: { color: "#627796", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  levelValue: { color: colors.red, fontSize: 26, fontWeight: "800", marginTop: 4 },
  levelUnit: { color: "#304865", fontSize: 16 },
  thresholdCallout: { backgroundColor: "#FFF2F1", borderColor: "#FFB5B3", borderRadius: 5, borderWidth: 1, marginTop: 6, paddingHorizontal: 8, paddingVertical: 5 },
  thresholdText: { color: "#B42323", fontSize: 10, fontWeight: "800", lineHeight: 14 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  detail: { borderBottomColor: "#E5ECF4", borderBottomWidth: 1, minHeight: 46, paddingVertical: 5, width: "50%" },
  detailLabel: { color: "#8EA3C0", fontSize: 10 },
  detailValue: { color: navyText, fontSize: 11, fontWeight: "700", marginTop: 3 },
  detailAccent: { color: colors.red },
  panelFooter: { borderTopColor: "#E5ECF4", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 26, paddingTop: 18 },
  footerMeta: { color: "#879BB6", fontSize: 13 },
  cardTitle: { color: navyText, fontSize: 16, fontWeight: "800" },
  cardSubtitle: { color: mutedBlue, fontSize: 11, lineHeight: 15, marginTop: 3 },
  chartLegendRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  chartSubtitle: { color: mutedBlue, flex: 1, fontSize: 14, lineHeight: 20, marginTop: 3 },
  legend: { alignItems: "center", flexDirection: "row", gap: 6, paddingTop: 3 },
  legendBlue: { color: colors.primary, fontSize: 24, lineHeight: 12 },
  legendRed: { color: colors.red, fontSize: 24, lineHeight: 12, marginLeft: 12 },
  legendText: { color: "#344A67", fontSize: 14 },
  chart: { backgroundColor: "#F8FAFC", borderColor: "#E7EDF4", borderRadius: 7, height: 96, marginTop: 7, overflow: "hidden", position: "relative" },
  thresholdLine: { borderTopWidth: 2, left: 32, position: "absolute", right: 30, top: 35 },
  crestLine: { borderColor: colors.red, borderStyle: "dashed" },
  dangerLine: { borderColor: "#F59E0B", borderStyle: "dashed", top: 66 },
  chartThresholdRed: { color: colors.red, fontSize: 10, left: 4, position: "absolute", top: -17 },
  chartThresholdAmber: { color: "#DC7200", fontSize: 10, left: 4, position: "absolute", top: 4 },
  forecastShade: { backgroundColor: "#FFF0EF", bottom: 35, opacity: 0.8, position: "absolute", right: 30, top: 24, width: "22%" },
  chartGridOne: { backgroundColor: "#DFE7F0", height: 1, left: 30, position: "absolute", right: 30, top: 115 },
  chartGridTwo: { backgroundColor: "#DFE7F0", height: 1, left: 30, position: "absolute", right: 30, top: 170 },
  trendLine: { height: 160, left: 30, position: "absolute", top: 23, width: "82%" },
  trendSegment: { backgroundColor: colors.primary, height: 4, position: "absolute", transformOrigin: "left center" },
  currentPoint: { backgroundColor: colors.red, borderColor: "#FFB2AF", borderRadius: 9, borderWidth: 4, height: 18, position: "absolute", right: "21%", top: 27, width: 18 },
  forecastPoint: { backgroundColor: colors.red, borderRadius: 5, height: 10, position: "absolute", right: 1, top: 21, width: 10 },
  chartTime: { bottom: 16, color: "#91A3BC", fontSize: 10, position: "absolute" },
  nowTime: { color: navyText, fontWeight: "800", right: "19%" },
  plusTime: { color: colors.red, fontWeight: "800", right: 31 },
  forecastNotice: { alignItems: "flex-start", backgroundColor: "#FFF6F5", borderColor: "#FFB8B5", borderRadius: 7, borderWidth: 1, flexDirection: "row", gap: 6, marginTop: 8, padding: 8 },
  forecastNoticeText: { color: "#9C2929", flex: 1, fontSize: 10, lineHeight: 14 },
  decision: { borderTopColor: "#E6ECF3", borderTopWidth: 1, marginTop: 16, paddingTop: 14 },
  decisionRow: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 10 },
  primaryDecision: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, flexDirection: "row", flex: 1, justifyContent: "space-between", minHeight: 60, paddingHorizontal: 25 },
  primaryDecisionText: { color: colors.white, fontSize: 14, fontWeight: "800", lineHeight: 18 },
  secondaryDecision: { borderColor: "#B7C6D9", borderRadius: 9, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 20 },
  secondaryDecisionText: { color: "#344A67", fontSize: 14 },
  keepPending: { color: "#506785", fontSize: 14, textDecorationLine: "underline" },
  decisionHint: { color: "#8BA0BB", fontSize: 13, lineHeight: 19, marginTop: 13 },
  evidenceCard: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 8, borderWidth: 1, gap: 6, padding: 10 },
  evidenceRow: { alignItems: "center", borderTopColor: "#E5ECF4", borderTopWidth: 1, flexDirection: "row", gap: 30, paddingTop: 16 },
  evidenceLabel: { color: navyText, fontSize: 15, fontWeight: "800" },
  evidenceValue: { color: mutedBlue, fontSize: 14 },
  evidenceStatus: { color: colors.red, fontSize: 12, fontWeight: "800", marginLeft: "auto" },
  actionBar: { alignItems: "center", backgroundColor: colors.white, borderTopColor: "#D8E1EC", borderTopWidth: 1, bottom: 0, flexDirection: "row", gap: 22, minHeight: 80, paddingHorizontal: 40, position: "absolute", width: "100%" },
  bottomOutlineButton: { borderColor: "#B6C7DD", borderRadius: 9, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 12 },
  bottomOutlineText: { color: "#304866", fontSize: 14, fontWeight: "700" },
  syncText: { color: "#8CA1BE", flex: 1, fontSize: 14 },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, flexDirection: "row", gap: 10, justifyContent: "center", minWidth: 280, paddingHorizontal: 20, paddingVertical: 14 },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.72 },
});
