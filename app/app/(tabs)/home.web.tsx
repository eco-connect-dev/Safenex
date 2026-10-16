import { AlertTriangle, Check, ChevronRight, Droplets, MapPin, Mountain, Radio } from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { colors } from "@/src/theme";
import { getActiveHazards, getHazardReadings, type HazardReading, type HazardRecord } from "@/src/features/hazard-assessment/api/hazards";

const ink = "#0C1424";
const muted = "#607797";

export default function WebHomeScreen() {
  const [hazards, setHazards] = useState<HazardRecord[]>([]);
  const [selected, setSelected] = useState<HazardRecord | null>(null);
  const [readings, setReadings] = useState<HazardReading[]>([]);
  const [error, setError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const refresh = () => getActiveHazards().then((items) => {
      setHazards(items);
      setSelected((current) => current ? items.find((item) => item.id === current.id) ?? items[0] ?? null : items[0] ?? null);
      setError("");
    }).catch((cause: Error) => setError(cause.message));
    void refresh();
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selected) { setReadings([]); return; }
    const refresh = () => getHazardReadings(selected.id).then(setReadings).catch(() => setReadings([]));
    void refresh();
    const timer = setInterval(refresh, 30_000);
    return () => clearInterval(timer);
  }, [selected?.id]);

  const continueWithHazard = () => {
    if (selected) router.push({ pathname: "/web/affected-area", params: { hazardId: selected.id } } as never);
  };

  return (
    <DmcWebShell>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.title}>Assess Active Hazards</Text>
          <Text style={styles.subtitle}>Monitor reported hazards and select one to prepare a warning.</Text>
        </View>

        <View style={styles.steps}>
          <Step number="1" title="Assess hazards" active />
          <Step number="2" title="Select affected area" />
          <Step number="3" title="Prepare warning" />
          <Step number="4" title="Review & authorize" />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Currently reported hazards</Text>
              <Text style={styles.sectionSubtitle}>{hazards.length} active hazard{hazards.length === 1 ? "" : "s"} from the hazards database</Text>
            </View>
            <View style={styles.count}><Text style={styles.countText}>{hazards.length} ACTIVE</Text></View>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {hazards.length === 0 && !error ? <Text style={styles.empty}>Loading hazards or no active hazards are reported.</Text> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.hazardSlider}>
            {hazards.map((hazard) => {
              const active = selected?.id === hazard.id;
              const HazardIcon = hazard.hazard_type === "landslide" ? Mountain : hazard.hazard_type === "flood" ? Droplets : AlertTriangle;
              return (
                <Pressable key={hazard.id} onPress={() => setSelected(hazard)} style={[styles.hazardCard, active && styles.hazardCardSelected]}>
                  <View style={[styles.hazardIcon, hazard.severity === "critical" || hazard.severity === "high" ? styles.dangerIcon : styles.normalIcon]}><Icon color={hazard.severity === "critical" || hazard.severity === "high" ? "#B42323" : colors.primary} icon={HazardIcon} size={20} /></View>
                  <View style={styles.hazardCopy}>
                    <Text style={styles.hazardTitle}>{hazard.title}</Text>
                    <Text style={styles.hazardMeta}>{hazard.location} · {hazard.district} · {hazard.hazard_type}</Text>
                    <Text style={styles.hazardDescription} numberOfLines={2}>{hazard.description}</Text>
                  </View>
                  <View style={styles.hazardMetrics}>
                    <Text style={styles.severity}>{hazard.severity.toUpperCase()}</Text>
                    {hazard.water_level_m !== null ? <Text style={styles.metric}>{hazard.water_level_m.toFixed(2)} m water</Text> : null}
                    {hazard.slope_displacement_mm !== null ? <Text style={styles.metric}>{hazard.slope_displacement_mm.toFixed(1)} mm movement</Text> : null}
                    <Text style={styles.metric}>{hazard.affected_people.toLocaleString()} people</Text>
                  </View>
                  {active ? <Icon color={colors.primary} icon={Check} size={20} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {selected ? <HazardChart hazard={selected} readings={readings} /> : null}

        <View style={styles.notice}>
          <Icon color={acknowledged ? colors.green : colors.red} icon={acknowledged ? Radio : AlertTriangle} size={19} />
          <Text style={styles.noticeText}>{acknowledged ? "Selected hazard acknowledged." : selected ? `${selected.severity.toUpperCase()} · ${selected.title} · ${selected.location}, ${selected.district}` : "Select a reported hazard to review monitoring data."}</Text>
          <Pressable onPress={() => setAcknowledged(!acknowledged)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>{acknowledged ? "Undo" : "Acknowledge"}</Text></Pressable>
        </View>
      </ScrollView>
      <View style={styles.actionBar}>
        <View style={styles.selectedSummary}><Icon color={muted} icon={MapPin} size={17} /><Text style={styles.footerText}>{selected ? `Selected: ${selected.title}` : "Select a hazard to continue"}</Text></View>
        <Pressable disabled={!selected} onPress={continueWithHazard} style={[styles.continueButton, !selected && styles.disabledButton]}>
          <Text style={styles.continueText}>Continue with selected hazard</Text><Icon color={colors.white} icon={ChevronRight} size={18} />
        </Pressable>
      </View>
    </DmcWebShell>
  );
}

function Step({ number, title, active = false }: { number: string; title: string; active?: boolean }) {
  return <View style={[styles.step, active && styles.stepActive]}><Text style={[styles.stepNumber, active && styles.stepNumberActive]}>STEP {number}</Text><Text style={[styles.stepTitle, active && styles.stepTitleActive]}>{title}</Text></View>;
}

function HazardChart({ hazard, readings }: { hazard: HazardRecord; readings: HazardReading[] }) {
  const isLandslide = hazard.hazard_type === "landslide";
  const isFlood = hazard.hazard_type === "flood";
  const chartTitle = isFlood ? "Water Level Trend & Forecast" : isLandslide ? "Slope Movement Trend" : "Rainfall Trend & Forecast";
  const metricLabel = isFlood ? "Water level (m)" : isLandslide ? "Slope displacement (mm)" : "Rainfall (mm/hr)";
  const points = readings.slice(-6).map((point) => ({
    id: point.id,
    recorded_at: point.recorded_at,
    value: isFlood ? point.water_level_m : isLandslide ? point.slope_displacement_mm : point.rainfall_mm_hr,
  })).filter((point): point is typeof point & { value: number } => point.value !== null);
  const currentValue = isFlood ? hazard.water_level_m : isLandslide ? hazard.slope_displacement_mm : hazard.rainfall_mm_hr;
  if (currentValue !== null && !points.some((point) => point.value === currentValue)) {
    points.push({ id: `${hazard.id}-current`, recorded_at: hazard.observed_at, value: currentValue });
  }
  const chartMax = Math.max(1, ...points.map((point) => point.value)) * 1.15;
  const coordinates = points.map((point, index) => {
    const x = points.length <= 1 ? 370 : 20 + index * (350 / (points.length - 1));
    const y = 145 - point.value / chartMax * 125;
    return { x, y, point };
  });
  const polyline = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const lastCoordinate = coordinates[coordinates.length - 1];

  return (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>{chartTitle}</Text>
      <View style={styles.chartLegendRow}>
        <Text style={styles.chartSubtitle}>{metricLabel} · {hazard.title} · Latest readings</Text>
        <View style={styles.legend}><Text style={styles.legendBlue}>━</Text><Text style={styles.legendText}>Recorded</Text><Text style={styles.legendRed}>●</Text><Text style={styles.legendText}>Current</Text></View>
      </View>
      <View style={styles.chart}>
        <View style={styles.chartGridOne} /><View style={styles.chartGridTwo} />
        {coordinates.length > 1 ? <Svg pointerEvents="none" style={styles.chartSvg} viewBox="0 0 400 160" preserveAspectRatio="none">
          <Line x1="0" y1="40" x2="400" y2="40" stroke="#DFE7F0" strokeWidth="1" />
          <Line x1="0" y1="95" x2="400" y2="95" stroke="#DFE7F0" strokeWidth="1" />
          <Polyline points={polyline} fill="none" stroke={colors.primary} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          <Circle cx={coordinates[coordinates.length - 1].x} cy={coordinates[coordinates.length - 1].y} r="7" fill={colors.red} stroke="#FFB2AF" strokeWidth="3" />
        </Svg> : <Text style={styles.empty}>No monitoring readings are available for this hazard.</Text>}
        <Text style={[styles.chartTime, { left: 0 }]}>{coordinates[0] ? new Date(coordinates[0].point.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</Text>
        <Text style={[styles.chartTime, styles.nowTime]}>{lastCoordinate ? `${lastCoordinate.point.value.toFixed(2)} ${isFlood ? "m" : isLandslide ? "mm" : "mm/hr"} · now` : ""}</Text>
      </View>
      <View style={styles.forecastNotice}>
        <Icon color={isFlood || isLandslide ? colors.red : colors.primary} icon={isFlood || isLandslide ? AlertTriangle : Droplets} size={16} />
        <Text style={styles.forecastNoticeText}><Text style={styles.noticeStrong}>{isFlood ? `Current water level: ${hazard.water_level_m?.toFixed(2) ?? "—"} m` : isLandslide ? `Current slope movement: ${hazard.slope_displacement_mm?.toFixed(1) ?? "—"} mm` : `Current rainfall: ${hazard.rainfall_mm_hr?.toFixed(1) ?? "—"} mm/hr`}</Text>{hazard.rainfall_mm_hr !== null ? ` · Rainfall ${hazard.rainfall_mm_hr.toFixed(1)} mm/hr.` : ""} Readings are loaded from Supabase.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 24, padding: 36, paddingBottom: 130 },
  heading: { gap: 6 }, title: { color: ink, fontSize: 30, fontWeight: "800" }, subtitle: { color: muted, fontSize: 16 },
  steps: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, step: { backgroundColor: "#F8FAFC", borderColor: "#DFE6EF", borderRadius: 9, borderWidth: 1, flex: 1, minWidth: 160, padding: 14 }, stepActive: { backgroundColor: "#EFF6FF", borderColor: colors.primary }, stepNumber: { color: "#91A3BA", fontSize: 12, fontWeight: "800" }, stepNumberActive: { color: colors.primary }, stepTitle: { color: muted, fontSize: 14, fontWeight: "700", marginTop: 5 }, stepTitleActive: { color: ink },
  section: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 14, borderWidth: 1, padding: 22 }, sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, sectionTitle: { color: ink, fontSize: 20, fontWeight: "800" }, sectionSubtitle: { color: muted, fontSize: 13, marginTop: 5 }, count: { backgroundColor: "#ECFDF5", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 }, countText: { color: "#047857", fontSize: 12, fontWeight: "800" }, hazardSlider: { gap: 12, paddingBottom: 6, paddingTop: 18 }, hazardCard: { alignItems: "center", borderColor: "#E1E8F0", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 12, height: 128, padding: 14, width: 330 }, hazardCardSelected: { backgroundColor: "#F4F8FF", borderColor: colors.primary, borderWidth: 2 }, hazardIcon: { alignItems: "center", borderRadius: 22, height: 44, justifyContent: "center", width: 44 }, dangerIcon: { backgroundColor: "#FEE2E2" }, normalIcon: { backgroundColor: "#EAF2FF" }, hazardCopy: { flex: 1 }, hazardTitle: { color: ink, fontSize: 14, fontWeight: "800" }, hazardMeta: { color: muted, fontSize: 11, marginTop: 4, textTransform: "capitalize" }, hazardDescription: { color: "#506785", fontSize: 11, lineHeight: 15, marginTop: 5 }, hazardMetrics: { alignItems: "flex-end", gap: 5 }, severity: { color: "#B42323", fontSize: 10, fontWeight: "800" }, metric: { color: "#344A67", fontSize: 10 },
  chartCard: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 15, borderWidth: 1, padding: 30 }, chartLegendRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" }, chartSubtitle: { color: muted, flex: 1, fontSize: 14, lineHeight: 20, marginTop: 3 }, legend: { alignItems: "center", flexDirection: "row", gap: 6, paddingTop: 3 }, legendBlue: { color: colors.primary, fontSize: 24, lineHeight: 12 }, legendRed: { color: colors.red, fontSize: 15, marginLeft: 12 }, legendText: { color: "#344A67", fontSize: 13 }, chart: { backgroundColor: "#F8FAFC", borderColor: "#E7EDF4", borderRadius: 12, height: 220, marginTop: 21, overflow: "hidden", position: "relative" }, chartGridOne: { backgroundColor: "#DFE7F0", height: 1, left: 30, position: "absolute", right: 30, top: 75 }, chartGridTwo: { backgroundColor: "#DFE7F0", height: 1, left: 30, position: "absolute", right: 30, top: 130 }, chartSvg: { bottom: 34, left: 30, position: "absolute", right: 30, top: 22 }, chartTime: { bottom: 13, color: "#91A3BC", fontSize: 10, position: "absolute" }, nowTime: { color: ink, fontWeight: "800", right: 12 }, forecastNotice: { alignItems: "flex-start", backgroundColor: "#FFF6F5", borderColor: "#FFB8B5", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 20, padding: 17 }, forecastNoticeText: { color: "#9C2929", flex: 1, fontSize: 14, lineHeight: 21 }, noticeStrong: { fontWeight: "800" },
  notice: { alignItems: "center", backgroundColor: "#FFF4F3", borderColor: "#FFB4B3", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 13, padding: 15 }, noticeText: { color: "#8F2626", flex: 1, fontSize: 14 }, secondaryButton: { borderColor: "#E5A4A2", borderRadius: 7, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 }, secondaryButtonText: { color: "#8F2626", fontSize: 12, fontWeight: "800" }, error: { color: "#B42323", marginTop: 12 }, empty: { color: muted, fontSize: 13, marginTop: 20 }, actionBar: { alignItems: "center", backgroundColor: colors.white, borderTopColor: "#D8E1EC", borderTopWidth: 1, bottom: 0, flexDirection: "row", gap: 18, minHeight: 76, paddingHorizontal: 32, position: "absolute", width: "100%" }, selectedSummary: { alignItems: "center", flex: 1, flexDirection: "row", gap: 9 }, footerText: { color: muted, fontSize: 13 }, continueButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingVertical: 13 }, disabledButton: { opacity: 0.5 }, continueText: { color: colors.white, fontSize: 13, fontWeight: "800" },
});
