import { Download } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { colors } from "@/src/theme";

type Period = "Today" | "7 days" | "30 days";

const alertRows = [
  ["06:00", "Yellow", "Colombo", "61,200"],
  ["08:30", "Orange", "Colombo", "98,400"],
  ["10:15", "Orange", "Kandy", "18,640"],
  ["13:20", "Red", "Colombo", "124,320"],
  ["14:05", "Yellow", "Gampaha", "44,200"],
];

const districtRows = [
  ["Colombo", "4", "12", "8,752", "34"],
  ["Kandy", "2", "5", "2,140", "12"],
  ["Gampaha", "1", "3", "820", "8"],
  ["Trincomalee", "1", "4", "1,280", "7"],
  ["Nuwara Eliya", "1", "2", "540", "5"],
];

const periods: Record<
  Period,
  { subtitle: string; alerts: string; reached: string }
> = {
  Today: {
    subtitle: "Operational response performance · System live at 14:32 IST",
    alerts: "9",
    reached: "203,720",
  },
  "7 days": {
    subtitle: "Operational response performance · Last 7 days",
    alerts: "42",
    reached: "612,480",
  },
  "30 days": {
    subtitle: "Operational response performance · Last 30 days",
    alerts: "168",
    reached: "1,984,320",
  },
};

export default function AnalyticsWebScreen() {
  const [period, setPeriod] = useState<Period>("Today");
  const data = periods[period];

  return (
    <DmcWebShell
      activeNav="analytics"
      protocol=""
      topbarTitle="Analytics & reports"
    >
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingRow}>
          <View style={styles.heading}>
            <Text style={styles.title}>Analytics &amp; Reports</Text>
            <Text style={styles.subtitle}>{data.subtitle}</Text>
          </View>
          <Pressable
            accessibilityLabel="Export analytics as PDF"
            onPress={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            style={({ pressed }) => [
              styles.exportButton,
              pressed && styles.pressed,
            ]}
          >
            <Icon color="#1D3553" icon={Download} size={16} />
            <Text style={styles.exportText}>Export PDF</Text>
          </Pressable>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.periods}>
            {(["Today", "7 days", "30 days"] as Period[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => setPeriod(option)}
                style={[
                  styles.periodButton,
                  period === option && styles.periodSelected,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    period === option && styles.periodTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.kpiGrid}>
          <KpiCard
            label="Mean time to first alert"
            value="14 min"
            detail="From hazard detection"
          />
          <KpiCard
            label="Citizen notification rate"
            value="94.2%"
            detail="Registered users in affected zones"
          />
          <KpiCard
            label="Shelter open response time"
            value="38 min"
            detail="Average from red alert to shelter opening"
          />
          <KpiCard
            label="Resource dispatch time"
            value="2.1 hrs"
            detail="Average from request to delivery"
          />
        </View>

        <View style={styles.chartRow}>
          <View style={[styles.panel, styles.timelinePanel]}>
            <Text style={styles.panelTitle}>
              Alert issuance timeline – {period.toLowerCase()}
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableLabel, styles.timeColumn]}>Time</Text>
              <Text style={[styles.tableLabel, styles.levelColumn]}>Level</Text>
              <Text style={[styles.tableLabel, styles.districtColumn]}>
                District
              </Text>
              <Text style={[styles.tableLabel, styles.reachedColumn]}>
                Citizens reached
              </Text>
            </View>
            {alertRows.map((row) => (
              <View key={`${row[0]}-${row[2]}`} style={styles.alertRow}>
                <Text style={[styles.tableValue, styles.timeColumn]}>
                  {row[0]}
                </Text>
                <Text style={[styles.tableValue, styles.levelColumn]}>
                  {row[1]}
                </Text>
                <Text style={[styles.tableValue, styles.districtColumn]}>
                  {row[2]}
                </Text>
                <Text style={[styles.tableValue, styles.reachedColumn]}>
                  {row[3]}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.panel, styles.occupancyPanel]}>
            <Text style={styles.panelTitle}>Shelter occupancy over time</Text>
            <OccupancyChart />
            <View style={styles.occupancyCaption}>
              <Text style={styles.caption}>Shelter occupancy over time</Text>
              <View style={styles.peakRow}>
                <Text style={styles.caption}>Peak occupancy</Text>
                <Text style={styles.peakValue}>12,840 / 19,600 capacity</Text>
              </View>
              <View style={styles.utilization}>
                <Text style={styles.utilizationText}>69% utilisation</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Response summary by district</Text>
          <View style={styles.districtHeader}>
            {[
              "District",
              "Alerts issued",
              "Shelters opened",
              "Citizens evacuated",
              "Resource dispatches",
            ].map((label) => (
              <Text
                key={label}
                style={[styles.tableLabel, styles.districtCell]}
              >
                {label}
              </Text>
            ))}
          </View>
          {districtRows.map((row) => (
            <View key={row[0]} style={styles.districtRow}>
              {row.map((value, index) => (
                <Text
                  key={`${row[0]}-${index}`}
                  style={[
                    styles.tableValue,
                    styles.districtCell,
                    index === 0 && styles.boldValue,
                  ]}
                >
                  {value}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.totalGrid}>
          <TotalCard label="Total citizens reached" value={data.reached} />
          <TotalCard
            label="Total relief dispatches"
            value={`${data.alerts === "9" ? "89" : data.alerts === "42" ? "264" : "1,032"} shipments`}
          />
          <TotalCard
            label="Event duration"
            value={
              period === "Today"
                ? "8h 32m active"
                : period === "7 days"
                  ? "7d active"
                  : "30d active"
            }
          />
        </View>
        <Text style={styles.footerNote}>
          N. Karunaratne · Duty Officer L3 · Operational reporting dataset
        </Text>
      </ScrollView>
    </DmcWebShell>
  );
}

function KpiCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiDetail}>{detail}</Text>
    </View>
  );
}

function TotalCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.totalCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.totalValue}>{value}</Text>
    </View>
  );
}

function OccupancyChart() {
  return (
    <View style={styles.chart}>
      {[22, 64, 106, 148].map((top) => (
        <View key={top} style={[styles.gridLine, { top }]} />
      ))}
      <View
        style={[
          styles.trendSegment,
          { left: 0, top: 168, width: 91, transform: [{ rotate: "-20deg" }] },
        ]}
      />
      <View
        style={[
          styles.trendSegment,
          { left: 83, top: 137, width: 85, transform: [{ rotate: "-7deg" }] },
        ]}
      />
      <View
        style={[
          styles.trendSegment,
          {
            left: 160,
            top: 121,
            width: 105,
            transform: [{ rotate: "-32deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.trendSegment,
          { left: 255, top: 70, width: 88, transform: [{ rotate: "-18deg" }] },
        ]}
      />
      <View
        style={[
          styles.trendSegment,
          { left: 336, top: 42, width: 84, transform: [{ rotate: "-10deg" }] },
        ]}
      />
      <View
        style={[
          styles.trendSegment,
          { left: 413, top: 22, width: 75, transform: [{ rotate: "-25deg" }] },
        ]}
      />
      <View style={styles.chartLabels}>
        {["08:00", "09:00", "10:00", "11:00", "12:00", "14:00"].map((label) => (
          <Text key={label} style={styles.chartLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const ink = "#1D3553";
const muted = "#6B829C";

const styles = StyleSheet.create({
  page: { backgroundColor: "#F3F6FA", gap: 26, padding: 34, paddingBottom: 30 },
  headingRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heading: { gap: 6 },
  title: { color: ink, fontSize: 31, fontWeight: "800" },
  subtitle: { color: muted, fontSize: 15 },
  toolbar: { minHeight: 48 },
  periods: { flexDirection: "row", gap: 8 },
  periodButton: {
    backgroundColor: colors.white,
    borderColor: "#D8E2EE",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 19,
    paddingVertical: 13,
  },
  periodSelected: { backgroundColor: "#286AC5", borderColor: "#286AC5" },
  periodText: { color: ink, fontSize: 14, fontWeight: "700" },
  periodTextSelected: { color: colors.white },
  exportButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: "#D8E2EE",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  exportText: { color: ink, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.75 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  kpiCard: {
    backgroundColor: colors.white,
    borderColor: "#D8E2EE",
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    gap: 8,
    minHeight: 126,
    padding: 18,
  },
  kpiLabel: { color: muted, fontSize: 13 },
  kpiValue: { color: "#286AC5", fontSize: 30, fontWeight: "400" },
  kpiDetail: { color: muted, fontSize: 12 },
  chartRow: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  panel: {
    backgroundColor: colors.white,
    borderColor: "#D8E2EE",
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  timelinePanel: { flexBasis: 400, flexGrow: 1, minHeight: 470 },
  occupancyPanel: { flexBasis: 430, flexGrow: 1, minHeight: 440 },
  panelTitle: { color: ink, fontSize: 19, fontWeight: "800", marginBottom: 18 },
  tableHeader: { flexDirection: "row", paddingHorizontal: 8 },
  tableLabel: { color: muted, fontSize: 12, fontWeight: "700" },
  tableValue: { color: ink, fontSize: 13 },
  timeColumn: { flex: 1.1 },
  levelColumn: { flex: 1.2 },
  districtColumn: { flex: 1.4 },
  reachedColumn: { flex: 1.6 },
  alertRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 81,
    paddingHorizontal: 8,
  },
  chart: { height: 250, overflow: "hidden", position: "relative" },
  gridLine: {
    borderTopColor: "#D8E2EE",
    borderTopWidth: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  trendSegment: {
    backgroundColor: "#286AC5",
    height: 3,
    position: "absolute",
    transformOrigin: "left center",
  },
  chartLabels: {
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    position: "absolute",
    right: 0,
  },
  chartLabel: { color: muted, fontSize: 11 },
  occupancyCaption: { gap: 14 },
  caption: { color: muted, fontSize: 12 },
  peakRow: { flexDirection: "row", justifyContent: "space-between" },
  peakValue: { color: ink, fontSize: 14, fontWeight: "800" },
  utilization: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3D8",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  utilizationText: { color: "#B77900", fontSize: 11, fontWeight: "700" },
  districtHeader: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  districtRow: {
    flexDirection: "row",
    minHeight: 65,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  districtCell: { flex: 1 },
  boldValue: { fontWeight: "800" },
  totalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  totalCard: {
    backgroundColor: colors.white,
    borderColor: "#D8E2EE",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minWidth: 220,
    padding: 18,
  },
  totalValue: { color: "#286AC5", fontSize: 28, marginTop: 8 },
  footerNote: { color: muted, fontSize: 12 },
});
