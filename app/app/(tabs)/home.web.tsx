import {
  AlertTriangle,
  ChevronRight,
  Info,
  Radio,
} from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";
import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";

const navyText = "#0C1424";
const mutedBlue = "#607797";
const paleBackground = "#F1F5F9";

export default function WebHomeScreen() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [step, setStep] = useState(1);

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
              onPress={() => router.push("/web/affected-area" as never)}
            />
            <StepCard
              active={step === 3}
              label="Prepare warning"
              number="3"
              onPress={() => router.push("/web/prepare-warning" as never)}
            />
            <StepCard
              active={step === 4}
              label="Review & authorize"
              number="4"
              onPress={() => router.push("/web/review-authorize" as never)}
            />
          </View>

          {!acknowledged ? (
            <View style={[styles.criticalNotice, styles.responsiveWrap]}>
              <View style={styles.noticeIcon}>
                <Icon color={colors.red} icon={AlertTriangle} size={19} />
              </View>
              <Text style={styles.noticeText}>
                <Text style={styles.noticeStrong}>Critical threshold exceeded</Text>
                {" · "}Sensor RS-04 breached the emergency spillway barrier
                stage in Northern Sector. Verified 6 min ago.
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

          <View style={[styles.panels, styles.responsiveWrap]}>
            <HazardPanel />
            <ForecastPanel />
          </View>

          <View style={styles.evidenceCard}>
            <View>
              <Text style={styles.cardTitle}>Basin Sensor Evidence Table</Text>
              <Text style={styles.cardSubtitle}>
                Latest telemetry received from the northern catchment network.
              </Text>
            </View>
            <View style={styles.evidenceRow}>
              <Text style={styles.evidenceLabel}>RS-04</Text>
              <Text style={styles.evidenceValue}>4.85 m water level</Text>
              <Text style={styles.evidenceStatus}>CRITICAL</Text>
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
            onPress={() => setStep(Math.min(step + 1, 4))}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {step === 4 ? "Review & authorize" : "Assess hazard & select area"}
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

function HazardPanel() {
  return (
    <View style={[styles.panel, styles.hazardPanel]}>
      <View style={styles.badgeRow}>
        <View style={styles.criticalBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.criticalBadgeText}>High critical</Text>
        </View>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>Confidence 99.4%</Text>
        </View>
      </View>
      <Text style={styles.hazardTitle}>Riverine Flash Flood</Text>
      <Text style={styles.hazardSubtitle}>
        Sungai Muda Sub-Catchment Basin · Kedah Delta Interface
      </Text>

      <View style={styles.levelBox}>
        <View style={styles.levelScale}>
          <View style={styles.scaleBar}>
            <View style={styles.scaleRed} />
            <View style={styles.scaleAmber} />
            <View style={styles.scaleGreen} />
          </View>
          <View style={styles.scaleLabels}>
            <Text style={styles.redText}>5.00m</Text>
            <Text style={styles.amberText}>4.50m</Text>
            <Text style={styles.datumText}>0.00m · Datum{"\n"}base</Text>
          </View>
        </View>
        <View style={styles.levelDivider} />
        <View style={styles.currentLevel}>
          <Text style={styles.overline}>ACTIVE SENSOR WATER LEVEL</Text>
          <Text style={styles.levelValue}>
            4.85<Text style={styles.levelUnit}> m</Text>
          </Text>
          <View style={styles.thresholdCallout}>
            <Text style={styles.thresholdText}>↑ +0.35 m above danger{"\n"}threshold</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <Detail label="Sensor / Logged" value="RS-04 · 14:32 MYT" />
        <Detail label="Danger / Crest Threshold" value="4.50 m / 5.00 m" />
        <Detail label="River Flow Rate" value="820 m³/s (+35% surge)" accent />
        <Detail label="Rainfall / Soil Saturation" value="92 mm/hr · 94.2%" />
      </View>
      <View style={styles.panelFooter}>
        <Text style={styles.footerMeta}>Sungai Muda Pier · Torrential rainfall band · Runoff peak</Text>
        <Text style={styles.footerMeta}>RS4-HYD-998</Text>
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

function ForecastPanel() {
  return (
    <View style={[styles.panel, styles.forecastPanel]}>
      <Text style={styles.cardTitle}>Water Level Trend &amp; Forecast</Text>
      <View style={styles.chartLegendRow}>
        <Text style={styles.chartSubtitle}>
          Water level (m) · Sensor RS-04 · Last 6 hours and predictive model
        </Text>
        <View style={styles.legend}>
          <Text style={styles.legendBlue}>━</Text>
          <Text style={styles.legendText}>Recorded</Text>
          <Text style={styles.legendRed}>━</Text>
          <Text style={styles.legendText}>Forecast</Text>
        </View>
      </View>

      <View style={styles.chart}>
        <View style={[styles.thresholdLine, styles.crestLine]}>
          <Text style={styles.chartThresholdRed}>Crest: 5.00m</Text>
        </View>
        <View style={[styles.thresholdLine, styles.dangerLine]}>
          <Text style={styles.chartThresholdAmber}>Danger: 4.50m</Text>
        </View>
        <View style={styles.forecastShade} />
        <View style={styles.chartGridOne} />
        <View style={styles.chartGridTwo} />
        <View style={styles.trendLine}>
          <View style={[styles.trendSegment, { left: 4, top: 102, width: 68, transform: [{ rotate: "-10deg" }] }]} />
          <View style={[styles.trendSegment, { left: 68, top: 90, width: 78, transform: [{ rotate: "-18deg" }] }]} />
          <View style={[styles.trendSegment, { left: 142, top: 66, width: 82, transform: [{ rotate: "-25deg" }] }]} />
          <View style={[styles.trendSegment, { left: 218, top: 30, width: 84, transform: [{ rotate: "-31deg" }] }]} />
          <View style={[styles.trendSegment, { left: 296, top: 0, width: 72, transform: [{ rotate: "-17deg" }] }]} />
          <View style={styles.currentPoint} />
          <View style={styles.forecastPoint} />
        </View>
        <Text style={[styles.chartTime, { left: 0 }]}>08:00</Text>
        <Text style={[styles.chartTime, { left: "18%" }]}>10:00</Text>
        <Text style={[styles.chartTime, { left: "38%" }]}>11:00</Text>
        <Text style={[styles.chartTime, { left: "58%" }]}>12:00</Text>
        <Text style={[styles.chartTime, styles.nowTime]}>14:00 (Now)</Text>
        <Text style={[styles.chartTime, styles.plusTime]}>+45m</Text>
      </View>

      <View style={styles.forecastNotice}>
        <Icon color={colors.red} icon={Info} size={16} />
        <Text style={styles.forecastNoticeText}>
          <Text style={styles.noticeStrong}>Forecast: 4.95m crest within 45 minutes</Text>
          {" · "}Critical rapid rise: +0.82 m in 2 hours across northern
          catchment dykes.
        </Text>
      </View>

      <View style={styles.decision}>
        <Text style={styles.overline}>ASSESSMENT DECISION</Text>
        <View style={styles.decisionRow}>
          <Pressable style={styles.primaryDecision}>
            <Text style={styles.primaryDecisionText}>Assess hazard &amp; select{"\n"}area</Text>
            <Icon color={colors.white} icon={ChevronRight} size={17} />
          </Pressable>
          <Pressable style={styles.secondaryDecision}>
            <Text style={styles.secondaryDecisionText}>No escalation</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.keepPending}>Keep pending</Text>
          </Pressable>
        </View>
        <Text style={styles.decisionHint}>
          Every operational action is hashed &amp; synchronized to state command logs automatically.
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
  scrollContent: { gap: 30, padding: 40, paddingBottom: 130 },
  heading: { gap: 8 },
  title: { color: navyText, fontSize: 30, fontWeight: "800" },
  subtitle: { color: mutedBlue, fontSize: 18 },
  steps: { flexDirection: "row", gap: 20 },
  stepCard: { backgroundColor: "#F8FAFC", borderColor: "#DFE6EF", borderRadius: 10, borderWidth: 1, flex: 1, minHeight: 80, paddingHorizontal: 20, paddingVertical: 16 },
  stepCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNumber: { color: "#B2C0D2", fontSize: 15, letterSpacing: 0.3 },
  stepLabel: { color: "#9DACC0", fontSize: 17, fontWeight: "700", marginTop: 7 },
  stepActiveText: { color: colors.white },
  stepDot: { backgroundColor: colors.white, borderRadius: 5, height: 10, position: "absolute", right: 20, top: 21, width: 10 },
  criticalNotice: { alignItems: "center", backgroundColor: "#FFF4F3", borderColor: "#FFB4B3", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 16, minHeight: 92, paddingHorizontal: 20 },
  noticeIcon: { alignItems: "center", backgroundColor: "#FFE1DF", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  noticeText: { color: "#941A1A", flex: 1, fontSize: 16, lineHeight: 24 },
  noticeStrong: { fontWeight: "800" },
  outlineButton: { borderColor: "#FF7775", borderRadius: 8, borderWidth: 1, paddingHorizontal: 17, paddingVertical: 10 },
  outlineButtonText: { color: "#A52323", fontSize: 15, fontWeight: "800" },
  acknowledgedNotice: { alignItems: "center", backgroundColor: "#ECFDF5", borderColor: "#86EFAC", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 10, padding: 18 },
  acknowledgedText: { color: "#047857", fontSize: 15, fontWeight: "700" },
  panels: { flexDirection: "row", gap: 30 },
  panel: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 15, borderWidth: 1, padding: 30 },
  hazardPanel: { flex: 1, minWidth: 280 },
  forecastPanel: { flex: 1, minWidth: 280 },
  badgeRow: { flexDirection: "row", gap: 10 },
  criticalBadge: { alignItems: "center", backgroundColor: "#FFE0E1", borderRadius: 20, flexDirection: "row", gap: 7, paddingHorizontal: 14, paddingVertical: 5 },
  badgeDot: { backgroundColor: colors.red, borderRadius: 5, height: 10, width: 10 },
  criticalBadgeText: { color: "#C42327", fontSize: 14, fontWeight: "700" },
  confidenceBadge: { borderColor: "#86B4FF", borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 5 },
  confidenceText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  hazardTitle: { color: navyText, fontSize: 26, fontWeight: "800", marginTop: 16 },
  hazardSubtitle: { color: mutedBlue, fontSize: 15, marginTop: 5 },
  levelBox: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E8EEF5", borderRadius: 14, flexDirection: "row", marginTop: 32, minHeight: 232, padding: 24 },
  levelScale: { alignItems: "center", flexDirection: "row", gap: 20, width: "43%" },
  scaleBar: { borderRadius: 15, height: 180, overflow: "hidden", width: 25 },
  scaleRed: { backgroundColor: "#EF4444", flex: 1 },
  scaleAmber: { backgroundColor: "#F59E0B", flex: 1 },
  scaleGreen: { backgroundColor: "#10B981", flex: 2.2 },
  scaleLabels: { gap: 15 },
  redText: { color: colors.red, fontSize: 14, fontWeight: "800" },
  amberText: { color: "#DC7200", fontSize: 14, fontWeight: "800" },
  datumText: { color: "#8FA3BF", fontSize: 14, marginTop: 40 },
  levelDivider: { backgroundColor: "#DDE5EE", height: 135, width: 1 },
  currentLevel: { flex: 1, paddingLeft: 30 },
  overline: { color: "#627796", fontSize: 14, fontWeight: "800", letterSpacing: 0.8 },
  levelValue: { color: colors.red, fontSize: 46, fontWeight: "800", marginTop: 10 },
  levelUnit: { color: "#304865", fontSize: 22 },
  thresholdCallout: { backgroundColor: "#FFF2F1", borderColor: "#FFB5B3", borderRadius: 6, borderWidth: 1, marginTop: 10, paddingHorizontal: 14, paddingVertical: 8 },
  thresholdText: { color: "#B42323", fontSize: 14, fontWeight: "800", lineHeight: 20 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 22 },
  detail: { borderBottomColor: "#E5ECF4", borderBottomWidth: 1, minHeight: 68, paddingVertical: 8, width: "50%" },
  detailLabel: { color: "#8EA3C0", fontSize: 14 },
  detailValue: { color: navyText, fontSize: 14, fontWeight: "700", marginTop: 5 },
  detailAccent: { color: colors.red },
  panelFooter: { borderTopColor: "#E5ECF4", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 26, paddingTop: 18 },
  footerMeta: { color: "#879BB6", fontSize: 13 },
  cardTitle: { color: navyText, fontSize: 21, fontWeight: "800" },
  cardSubtitle: { color: mutedBlue, fontSize: 14, lineHeight: 20, marginTop: 4 },
  chartLegendRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  chartSubtitle: { color: mutedBlue, flex: 1, fontSize: 14, lineHeight: 20, marginTop: 3 },
  legend: { alignItems: "center", flexDirection: "row", gap: 6, paddingTop: 3 },
  legendBlue: { color: colors.primary, fontSize: 24, lineHeight: 12 },
  legendRed: { color: colors.red, fontSize: 24, lineHeight: 12, marginLeft: 12 },
  legendText: { color: "#344A67", fontSize: 14 },
  chart: { backgroundColor: "#F8FAFC", borderColor: "#E7EDF4", borderRadius: 12, height: 220, marginTop: 21, overflow: "hidden", position: "relative" },
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
  forecastNotice: { alignItems: "flex-start", backgroundColor: "#FFF6F5", borderColor: "#FFB8B5", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 20, padding: 17 },
  forecastNoticeText: { color: "#9C2929", flex: 1, fontSize: 14, lineHeight: 21 },
  decision: { borderTopColor: "#E6ECF3", borderTopWidth: 1, marginTop: 30, paddingTop: 27 },
  decisionRow: { alignItems: "center", flexDirection: "row", gap: 16, marginTop: 18 },
  primaryDecision: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 9, flexDirection: "row", flex: 1, justifyContent: "space-between", minHeight: 60, paddingHorizontal: 25 },
  primaryDecisionText: { color: colors.white, fontSize: 14, fontWeight: "800", lineHeight: 18 },
  secondaryDecision: { borderColor: "#B7C6D9", borderRadius: 9, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 20 },
  secondaryDecisionText: { color: "#344A67", fontSize: 14 },
  keepPending: { color: "#506785", fontSize: 14, textDecorationLine: "underline" },
  decisionHint: { color: "#8BA0BB", fontSize: 13, lineHeight: 19, marginTop: 13 },
  evidenceCard: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 15, borderWidth: 1, gap: 15, padding: 28 },
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
