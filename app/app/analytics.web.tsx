import { Download } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import {
  getAnalyticsData,
  type AnalyticsData,
  type AnalyticsPeriod,
  type EmergencyEventRow,
} from "@/src/features/hazard-assessment/api/analytics";
import { colors } from "@/src/theme";

const periods: AnalyticsPeriod[] = ["Today", "7 days", "30 days"];

export default function AnalyticsWebScreen() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("Today");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getAnalyticsData(period)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load analytics data from Supabase.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [period]);

  const windowStart = useMemo(() => periodStart(period), [period]);
  const windowEvents = useMemo(() => (data?.events ?? []).filter((event) => new Date(event.started_at) >= windowStart), [data, windowStart]);
  const activeEvents = useMemo(() => (data?.events ?? []).filter((event) => event.status === "active"), [data]);
  const openEvents = useMemo(() => (data?.events ?? []).filter((event) => event.status !== "resolved"), [data]);
  const activeEventIds = useMemo(() => new Set(openEvents.map((event) => event.id)), [openEvents]);
  const liveShelters = useMemo(() => (data?.shelters ?? []).filter((shelter) => !shelter.event_id || activeEventIds.has(shelter.event_id)), [activeEventIds, data]);
  const occupancy = liveShelters.reduce((total, shelter) => total + Number(shelter.current_occupancy || 0), 0);
  const capacity = liveShelters.reduce((total, shelter) => total + Number(shelter.capacity || 0), 0);
  const utilization = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;
  const currentTeams = useMemo(() => data?.rescueTeams ?? [], [data]);
  const availableTeams = currentTeams.filter((team) => team.status.toLowerCase() === "available").length;
  const rescueDispatches = useMemo(() => data?.rescueDispatches ?? [], [data]);
  const allocations = useMemo(() => data?.allocations ?? [], [data]);
  const warnings = useMemo(() => data?.warnings ?? [], [data]);
  const districts = useMemo(() => summarizeDistricts(data, windowEvents, warnings, allocations, rescueDispatches), [data, windowEvents, warnings, allocations, rescueDispatches]);
  const occupancyPoints = useMemo(() => liveShelters.slice(0, 6).map((shelter) => shelter.capacity > 0 ? Math.min(100, (shelter.current_occupancy / shelter.capacity) * 100) : 0), [liveShelters]);

  const exportPdf = () => {
    if (!data) return;
    const lines = makeReportLines(period, data, windowEvents, liveShelters, districts);
    downloadPdf(`safenex-analytics-${period.toLowerCase().replace(" ", "-")}.pdf`, lines);
  };

  return (
    <DmcWebShell activeNav="analytics" protocol="" topbarTitle="Analytics & reports">
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <View style={styles.heading}>
            <Text style={styles.title}>Analytics &amp; Reports</Text>
            <Text style={styles.subtitle}>{loading ? "Loading live Supabase data…" : `Live operational summary · ${period} · Updated ${new Date().toLocaleTimeString()}`}</Text>
          </View>
          <Pressable accessibilityLabel="Download analytics report as PDF" disabled={!data || Platform.OS !== "web"} onPress={exportPdf} style={({ pressed }) => [styles.exportButton, pressed && styles.pressed, (!data || Platform.OS !== "web") && styles.disabled]}>
            <Icon color="#1D3553" icon={Download} size={16} />
            <Text style={styles.exportText}>Download PDF</Text>
          </Pressable>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.periods}>
            {periods.map((option) => (
              <Pressable key={option} onPress={() => { setLoading(true); setPeriod(option); }} style={[styles.periodButton, period === option && styles.periodSelected]}>
                <Text style={[styles.periodText, period === option && styles.periodTextSelected]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>Unable to load analytics: {error}</Text></View> : null}

        <View style={styles.kpiGrid}>
          <KpiCard label="Active emergency events" value={data ? String(activeEvents.length) : "—"} detail={`${windowEvents.length} events started in this period`} />
          <KpiCard label="People affected" value={data ? sum(activeEvents.map((event) => event.people_affected)).toLocaleString() : "—"} detail="Across active emergency events" />
          <KpiCard label="Shelter occupancy" value={data ? `${occupancy.toLocaleString()} / ${capacity.toLocaleString()}` : "—"} detail={`${liveShelters.length} live shelter records`} />
          <KpiCard label="Rescue teams available" value={data ? `${availableTeams} / ${currentTeams.length}` : "—"} detail={`${rescueDispatches.length} dispatches in selected period`} />
        </View>

        <View style={styles.chartRow}>
          <View style={[styles.panel, styles.timelinePanel]}>
            <Text style={styles.panelTitle}>Warning issuance timeline – {period.toLowerCase()}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableLabel, styles.timeColumn]}>Issued</Text>
              <Text style={[styles.tableLabel, styles.levelColumn]}>Tier</Text>
              <Text style={[styles.tableLabel, styles.districtColumn]}>Target area</Text>
              <Text style={[styles.tableLabel, styles.reachedColumn]}>People</Text>
            </View>
            {warnings.slice(0, 6).map((warning) => (
              <View key={warning.id} style={styles.alertRow}>
                <Text style={[styles.tableValue, styles.timeColumn]}>{warning.issued_at ? new Date(warning.issued_at).toLocaleString() : "—"}</Text>
                <Text style={[styles.tableValue, styles.levelColumn]}>Tier {warning.tier}</Text>
                <Text style={[styles.tableValue, styles.districtColumn]}>{warning.target_location}</Text>
                <Text style={[styles.tableValue, styles.reachedColumn]}>{Number(warning.affected_people).toLocaleString()}</Text>
              </View>
            ))}
            {!warnings.length ? <Text style={styles.empty}>{loading ? "Loading warning records…" : "No issued warnings in this period."}</Text> : null}
          </View>

          <View style={[styles.panel, styles.occupancyPanel]}>
            <Text style={styles.panelTitle}>Live shelter occupancy</Text>
            <OccupancyChart values={occupancyPoints} />
            <View style={styles.occupancyCaption}>
            <Text style={styles.caption}>Current occupancy across live shelter records</Text>
              <View style={styles.peakRow}>
                <Text style={styles.caption}>Occupancy / capacity</Text>
                <Text style={styles.peakValue}>{occupancy.toLocaleString()} / {capacity.toLocaleString()}</Text>
              </View>
              <View style={styles.utilization}><Text style={styles.utilizationText}>{capacity ? `${utilization}% utilisation` : "Capacity not reported"}</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Emergency response summary by district</Text>
          <View style={styles.districtHeader}>
            {["District", "Active events", "Shelters", "People affected", "Response actions"].map((label) => <Text key={label} style={[styles.tableLabel, styles.districtCell]}>{label}</Text>)}
          </View>
          {districts.map((row) => (
            <View key={row.district} style={styles.districtRow}>
              {[row.district, String(row.events), String(row.shelters), row.people.toLocaleString(), String(row.actions)].map((value, index) => <Text key={`${row.district}-${index}`} style={[styles.tableValue, styles.districtCell, index === 0 && styles.boldValue]}>{value}</Text>)}
            </View>
          ))}
          {!districts.length ? <Text style={styles.empty}>{loading ? "Loading district records…" : "No emergency or response records found."}</Text> : null}
        </View>

        <View style={styles.totalGrid}>
          <TotalCard label="Issued warnings in period" value={String(warnings.length)} />
          <TotalCard label="Relief quantities allocated" value={sum(allocations.map((allocation) => allocation.quantity)).toLocaleString()} />
          <TotalCard label="Rescue dispatches in period" value={String(rescueDispatches.length)} />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Hazard reports and priority needs</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableLabel, styles.districtColumn]}>Report / need</Text>
            <Text style={[styles.tableLabel, styles.levelColumn]}>Type / focus</Text>
            <Text style={[styles.tableLabel, styles.districtColumn]}>District / context</Text>
            <Text style={[styles.tableLabel, styles.reachedColumn]}>Severity / review</Text>
          </View>
          {(data?.hazards ?? []).slice(0, 8).map((hazard) => (
            <View key={hazard.id} style={styles.alertRow}>
              <Text style={[styles.tableValue, styles.districtColumn]}>{hazard.title}</Text>
              <Text style={[styles.tableValue, styles.levelColumn]}>{hazard.hazard_type}</Text>
              <Text style={[styles.tableValue, styles.districtColumn]}>{hazard.district} · {hazard.location}</Text>
              <Text style={[styles.tableValue, styles.reachedColumn]}>{hazard.severity} · {hazard.review_status.replace("_", " ")}</Text>
            </View>
          ))}
          {(data?.priorityNeeds ?? []).slice(0, 8).map((need) => (
            <View key={need.id} style={styles.alertRow}>
              <Text style={[styles.tableValue, styles.districtColumn]}>{need.need}</Text>
              <Text style={[styles.tableValue, styles.levelColumn]}>{need.focus}</Text>
              <Text style={[styles.tableValue, styles.districtColumn]}>{need.context}</Text>
              <Text style={[styles.tableValue, styles.reachedColumn]}>{need.priority_label}</Text>
            </View>
          ))}
          {!data?.hazards.length && !data?.priorityNeeds.length ? <Text style={styles.empty}>{loading ? "Loading hazard and needs records…" : "No hazard reports or priority needs in this period."}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Shelters, relief inventory, and rescue teams</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableLabel, styles.districtColumn]}>Resource / team</Text>
            <Text style={[styles.tableLabel, styles.levelColumn]}>Organisation</Text>
            <Text style={[styles.tableLabel, styles.districtColumn]}>Location / status</Text>
            <Text style={[styles.tableLabel, styles.reachedColumn]}>Availability</Text>
          </View>
          {(data?.shelters ?? []).slice(0, 5).map((shelter) => (
            <View key={shelter.id} style={styles.alertRow}>
              <Text style={[styles.tableValue, styles.districtColumn]}>{shelter.name}</Text>
              <Text style={[styles.tableValue, styles.levelColumn]}>{shelter.category}</Text>
              <Text style={[styles.tableValue, styles.districtColumn]}>{shelter.location} · {shelter.status}</Text>
              <Text style={[styles.tableValue, styles.reachedColumn]}>{Number(shelter.current_occupancy).toLocaleString()} / {Number(shelter.capacity).toLocaleString()}</Text>
            </View>
          ))}
          {(data?.resources ?? []).slice(0, 5).map((resource) => (
            <View key={resource.id} style={styles.alertRow}>
              <Text style={[styles.tableValue, styles.districtColumn]}>{resource.name}</Text>
              <Text style={[styles.tableValue, styles.levelColumn]}>{resource.organisation}</Text>
              <Text style={[styles.tableValue, styles.districtColumn]}>{resource.unit || "Stock"}</Text>
              <Text style={[styles.tableValue, styles.reachedColumn]}>{Number(resource.available_quantity).toLocaleString()} available</Text>
            </View>
          ))}
          {(data?.rescueTeams ?? []).slice(0, 5).map((team) => (
            <View key={team.id} style={styles.alertRow}>
              <Text style={[styles.tableValue, styles.districtColumn]}>{team.id}</Text>
              <Text style={[styles.tableValue, styles.levelColumn]}>{team.organisation}</Text>
              <Text style={[styles.tableValue, styles.districtColumn]}>{team.location}</Text>
              <Text style={[styles.tableValue, styles.reachedColumn]}>{team.status}</Text>
            </View>
          ))}
          {!data?.shelters.length && !data?.resources.length && !data?.rescueTeams.length ? <Text style={styles.empty}>{loading ? "Loading resource records…" : "No shelter, relief, or rescue records found."}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Latest operational updates and locations</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableLabel, styles.timeColumn]}>Time</Text>
            <Text style={[styles.tableLabel, styles.districtColumn]}>Update / location</Text>
            <Text style={[styles.tableLabel, styles.levelColumn]}>Status</Text>
            <Text style={[styles.tableLabel, styles.reachedColumn]}>Event</Text>
          </View>
          {(data?.updates ?? []).slice(0, 5).map((update) => {
            const event = data?.events.find((item) => item.id === update.event_id);
            return <View key={update.id} style={styles.alertRow}><Text style={[styles.tableValue, styles.timeColumn]}>{new Date(update.occurred_at).toLocaleString()}</Text><Text style={[styles.tableValue, styles.districtColumn]}>{update.update_text}</Text><Text style={[styles.tableValue, styles.levelColumn]}>{update.status}</Text><Text style={[styles.tableValue, styles.reachedColumn]}>{event?.district ?? "—"}</Text></View>;
          })}
          {(data?.locations ?? []).filter((location) => location.is_epicenter).slice(0, 5).map((location) => {
            const event = data?.events.find((item) => item.id === location.event_id);
            return <View key={location.id} style={styles.alertRow}><Text style={[styles.tableValue, styles.timeColumn]}>Epicenter</Text><Text style={[styles.tableValue, styles.districtColumn]}>{location.name} · map {location.map_x}, {location.map_y}</Text><Text style={[styles.tableValue, styles.levelColumn]}>{event?.severity ?? "—"}</Text><Text style={[styles.tableValue, styles.reachedColumn]}>{event?.district ?? "—"}</Text></View>;
          })}
          {!data?.updates.length && !data?.locations.length ? <Text style={styles.empty}>{loading ? "Loading event updates and locations…" : "No updates or event locations found."}</Text> : null}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Relief allocations and rescue dispatches</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableLabel, styles.timeColumn]}>Time</Text>
            <Text style={[styles.tableLabel, styles.districtColumn]}>Resource / team</Text>
            <Text style={[styles.tableLabel, styles.districtColumn]}>Destination / mission</Text>
            <Text style={[styles.tableLabel, styles.reachedColumn]}>Quantity / status</Text>
          </View>
          {allocations.slice(0, 6).map((allocation) => <View key={allocation.id} style={styles.alertRow}><Text style={[styles.tableValue, styles.timeColumn]}>{new Date(allocation.allocated_at).toLocaleString()}</Text><Text style={[styles.tableValue, styles.districtColumn]}>{allocation.resource} · {allocation.organisation}</Text><Text style={[styles.tableValue, styles.districtColumn]}>{allocation.location}</Text><Text style={[styles.tableValue, styles.reachedColumn]}>{Number(allocation.quantity).toLocaleString()}</Text></View>)}
          {rescueDispatches.slice(0, 6).map((dispatch) => <View key={dispatch.id} style={styles.alertRow}><Text style={[styles.tableValue, styles.timeColumn]}>{new Date(dispatch.dispatched_at).toLocaleString()}</Text><Text style={[styles.tableValue, styles.districtColumn]}>{dispatch.team_id} · {dispatch.organisation}</Text><Text style={[styles.tableValue, styles.districtColumn]}>{dispatch.target_location} · {dispatch.mission_details}</Text><Text style={[styles.tableValue, styles.reachedColumn]}>{dispatch.status}</Text></View>)}
          {!allocations.length && !rescueDispatches.length ? <Text style={styles.empty}>{loading ? "Loading response activity…" : "No allocations or rescue dispatches in this period."}</Text> : null}
        </View>
        <Text style={styles.footerNote}>Source: Supabase emergency operations, hazard reports, warnings, shelters, relief, and rescue registers.</Text>
      </ScrollView>
    </DmcWebShell>
  );
}

function KpiCard({ detail, label, value }: { detail: string; label: string; value: string }) {
  return <View style={styles.kpiCard}><Text style={styles.kpiLabel}>{label}</Text><Text style={styles.kpiValue}>{value}</Text><Text style={styles.kpiDetail}>{detail}</Text></View>;
}

function TotalCard({ label, value }: { label: string; value: string }) {
  return <View style={styles.totalCard}><Text style={styles.kpiLabel}>{label}</Text><Text style={styles.totalValue}>{value}</Text></View>;
}

function OccupancyChart({ values }: { values: number[] }) {
  const xs = [0, 83, 160, 255, 336, 413, 488];
  const ys = [0, ...values, values.at(-1) ?? 0].slice(0, 7).map((value) => 205 - value * 1.7);
  return (
    <View style={styles.chart}>
      {[22, 64, 106, 148].map((top) => <View key={top} style={[styles.gridLine, { top }]} />)}
      {values.length > 1 ? xs.slice(0, values.length).map((x, index) => {
        const width = xs[index + 1] - x;
        const deltaY = ys[index + 1] - ys[index];
        return <View key={x} style={[styles.trendSegment, { left: x, top: ys[index], width, transform: [{ rotate: `${Math.atan2(deltaY, width) * 180 / Math.PI}deg` }] }]} />;
      }) : null}
      <View style={styles.chartLabels}>{["Shelter 1", "Shelter 2", "Shelter 3", "Shelter 4", "Shelter 5", "Shelter 6"].map((label, index) => <Text key={label} style={styles.chartLabel}>{values.length > index ? label : ""}</Text>)}</View>
    </View>
  );
}

type DistrictSummary = { district: string; events: number; shelters: number; people: number; actions: number };

function summarizeDistricts(
  data: AnalyticsData | null,
  windowEvents: EmergencyEventRow[],
  warnings: AnalyticsData["warnings"],
  allocations: AnalyticsData["allocations"],
  dispatches: AnalyticsData["rescueDispatches"],
): DistrictSummary[] {
  if (!data) return [];
  const rows = new Map<string, DistrictSummary>();
  const getRow = (district: string) => {
    const row = rows.get(district) ?? { district, events: 0, shelters: 0, people: 0, actions: 0 };
    rows.set(district, row);
    return row;
  };
  const eventById = new Map(data.events.map((event) => [event.id, event]));
  for (const event of windowEvents.filter((item) => item.status !== "resolved")) {
    const row = getRow(event.district);
    row.events += 1;
    row.people += Number(event.people_affected || 0);
  }
  for (const shelter of data.shelters) {
    const event = shelter.event_id ? eventById.get(shelter.event_id) : null;
    if (event) getRow(event.district).shelters += 1;
  }
  for (const warning of warnings) {
    const hazard = data.hazards.find((item) => item.id === warning.hazard_id);
    const district = hazard?.district ?? warning.target_location.split(",").at(-1)?.trim() ?? "Other";
    getRow(district).actions += 1;
  }
  for (const allocation of allocations) {
    const event = allocation.event_id ? eventById.get(allocation.event_id) : null;
    getRow(event?.district ?? allocation.location).actions += 1;
  }
  for (const dispatch of dispatches) {
    const event = dispatch.event_id ? eventById.get(dispatch.event_id) : null;
    getRow(event?.district ?? dispatch.target_location).actions += 1;
  }
  return [...rows.values()].sort((a, b) => b.people - a.people || a.district.localeCompare(b.district));
}

function periodStart(period: AnalyticsPeriod) {
  const start = new Date();
  if (period === "Today") start.setHours(0, 0, 0, 0);
  else start.setDate(start.getDate() - (period === "7 days" ? 7 : 30));
  return start;
}

function sum(values: number[]) { return values.reduce((total, value) => total + Number(value || 0), 0); }

function makeReportLines(period: AnalyticsPeriod, data: AnalyticsData, windowEvents: EmergencyEventRow[], shelters: AnalyticsData["shelters"], districts: DistrictSummary[]) {
  const occupancy = sum(shelters.map((shelter) => shelter.current_occupancy));
  const capacity = sum(shelters.map((shelter) => shelter.capacity));
  const lines = [
    "SAFENEX | ANALYTICS AND OPERATIONS REPORT",
    `Period: ${period} | Generated: ${new Date().toLocaleString()}`,
    "",
    "SUMMARY",
    `Active emergency events: ${data.events.filter((event) => event.status === "active").length}`,
    `People affected by active events: ${sum(data.events.filter((event) => event.status === "active").map((event) => event.people_affected)).toLocaleString()}`,
    `Shelter occupancy: ${occupancy.toLocaleString()} / ${capacity.toLocaleString()}`,
    `Warnings issued in period: ${data.warnings.length}`,
    `Rescue teams: ${data.rescueTeams.length}; available: ${data.rescueTeams.filter((team) => team.status.toLowerCase() === "available").length}`,
    `Relief quantities allocated: ${sum(data.allocations.map((item) => item.quantity)).toLocaleString()}`,
    "",
    "DISTRICT RESPONSE SUMMARY",
    "District | Active events | Shelters | People affected | Response actions",
    ...districts.map((row) => `${row.district} | ${row.events} | ${row.shelters} | ${row.people} | ${row.actions}`),
    "",
    "EMERGENCY EVENTS",
    ...windowEvents.map((event) => `${event.district} | ${event.hazard_type} | ${event.severity} | ${event.status} | ${event.people_affected} people | shelters ${event.shelters_active} | rescue teams ${event.rescue_teams_deployed} | relief items ${event.relief_items_allocated} | ${new Date(event.started_at).toLocaleString()}`),
    "",
    "EVENT LOCATIONS",
    ...data.locations.map((location) => `${data.events.find((event) => event.id === location.event_id)?.district ?? "Event"} | ${location.name} | ${location.is_epicenter ? "Epicenter" : "Location"} | map ${location.map_x}, ${location.map_y}`),
    "",
    "PRIORITY NEEDS",
    ...data.priorityNeeds.map((need) => `${need.focus} | ${need.need} | ${need.priority_label} | ${need.context}`),
    "",
    "OPERATIONAL UPDATES",
    ...data.updates.map((update) => `${new Date(update.occurred_at).toLocaleString()} | ${update.status} | ${update.update_text}`),
    "",
    "SHELTERS",
    ...data.shelters.map((shelter) => `${shelter.name} | ${shelter.location} | ${shelter.status} | ${shelter.current_occupancy}/${shelter.capacity} | affected area: ${shelter.in_affected_area ? "yes" : "no"}`),
    "",
    "HAZARD REPORTS",
    ...data.hazards.map((hazard) => `${hazard.title} | ${hazard.hazard_type} | ${hazard.severity} | ${hazard.review_status} | ${hazard.district} | ${hazard.affected_people} people`),
    "",
    "ISSUED WARNINGS",
    ...data.warnings.map((warning) => `${warning.title} | tier ${warning.tier} | ${warning.target_location} | ${warning.affected_people} people | ${warning.channels.join(", ")} | ${warning.issued_at ?? ""}`),
    "",
    "RELIEF INVENTORY",
    ...data.resources.map((resource) => `${resource.name} | ${resource.organisation} | available: ${resource.available_quantity} ${resource.unit}`),
    "",
    "RELIEF ALLOCATIONS",
    ...data.allocations.map((item) => `${item.resource} | ${item.organisation} | ${item.quantity} | ${item.location} | ${new Date(item.allocated_at).toLocaleString()}`),
    "",
    "RESCUE TEAMS",
    ...data.rescueTeams.map((team) => `${team.id} | ${team.organisation} | ${team.status} | ${team.location}`),
    "",
    "RESCUE DISPATCHES",
    ...data.rescueDispatches.map((dispatch) => `${dispatch.team_id} | ${dispatch.organisation} | ${dispatch.target_location} | ${dispatch.status} | ${new Date(dispatch.dispatched_at).toLocaleString()} | ${dispatch.mission_details}`),
  ];
  return lines.flatMap((line) => wrapText(line, 105));
}

function wrapText(value: string, max: number) {
  const text = value.normalize("NFKD").replace(/[^\x20-\x7E]/g, "");
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > max) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

function downloadPdf(filename: string, lines: string[]) {
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += 55) pages.push(lines.slice(index, index + 55));
  if (!pages.length) pages.push(["No report data available."]);
  const objects: string[] = ["", "", ""];
  const pageIds: number[] = [];
  pages.forEach((pageLines, pageIndex) => {
    const pageId = 3 + pageIndex * 2;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    const commands = ["BT", "/F1 9 Tf", "12 TL", "42 800 Td"];
    pageLines.forEach((line) => commands.push(`(${line.replace(/([\\()])/g, "\\$1")}) Tj`, "T*"));
    commands.push("ET");
    const stream = commands.join("\n");
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  const fontId = 3 + pages.length * 2;
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const ink = "#1D3553";
const muted = "#6B829C";
const styles = StyleSheet.create({
  page: { backgroundColor: "#F3F6FA", gap: 26, padding: 34, paddingBottom: 30 },
  headingRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  heading: { gap: 6 },
  title: { color: ink, fontSize: 31, fontWeight: "800" },
  subtitle: { color: muted, fontSize: 15 },
  toolbar: { minHeight: 48 },
  periods: { flexDirection: "row", gap: 8 },
  periodButton: { backgroundColor: colors.white, borderColor: "#D8E2EE", borderRadius: 8, borderWidth: 1, paddingHorizontal: 19, paddingVertical: 13 },
  periodSelected: { backgroundColor: "#286AC5", borderColor: "#286AC5" },
  periodText: { color: ink, fontSize: 14, fontWeight: "700" },
  periodTextSelected: { color: colors.white },
  exportButton: { alignItems: "center", backgroundColor: colors.white, borderColor: "#D8E2EE", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 8, paddingHorizontal: 18, paddingVertical: 13 },
  exportText: { color: ink, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
  errorBox: { backgroundColor: "#FFF2F1", borderColor: "#FFB9B6", borderRadius: 8, borderWidth: 1, padding: 12 },
  errorText: { color: "#982929", fontSize: 13 },
  empty: { color: muted, fontSize: 13, padding: 12 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  kpiCard: { backgroundColor: colors.white, borderColor: "#D8E2EE", borderRadius: 12, borderWidth: 1, flexBasis: 220, flexGrow: 1, gap: 8, minHeight: 126, padding: 18 },
  kpiLabel: { color: muted, fontSize: 13 },
  kpiValue: { color: "#286AC5", fontSize: 30, fontWeight: "400" },
  kpiDetail: { color: muted, fontSize: 12 },
  chartRow: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  panel: { backgroundColor: colors.white, borderColor: "#D8E2EE", borderRadius: 12, borderWidth: 1, padding: 20 },
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
  alertRow: { alignItems: "center", flexDirection: "row", minHeight: 55, paddingHorizontal: 8, paddingVertical: 6 },
  chart: { height: 250, overflow: "hidden", position: "relative" },
  gridLine: { borderTopColor: "#D8E2EE", borderTopWidth: 1, left: 0, position: "absolute", right: 0 },
  trendSegment: { backgroundColor: "#286AC5", height: 3, position: "absolute", transformOrigin: "left center" },
  chartLabels: { bottom: 0, flexDirection: "row", justifyContent: "space-between", left: 0, position: "absolute", right: 0 },
  chartLabel: { color: muted, fontSize: 11 },
  occupancyCaption: { gap: 14 },
  caption: { color: muted, fontSize: 12 },
  peakRow: { flexDirection: "row", justifyContent: "space-between" },
  peakValue: { color: ink, fontSize: 14, fontWeight: "800" },
  utilization: { alignSelf: "flex-start", backgroundColor: "#FFF3D8", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  utilizationText: { color: "#B77900", fontSize: 11, fontWeight: "700" },
  districtHeader: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 12 },
  districtRow: { flexDirection: "row", minHeight: 65, paddingHorizontal: 8, paddingVertical: 12 },
  districtCell: { flex: 1 },
  boldValue: { fontWeight: "800" },
  totalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  totalCard: { backgroundColor: colors.white, borderColor: "#D8E2EE", borderRadius: 12, borderWidth: 1, flex: 1, minWidth: 220, padding: 18 },
  totalValue: { color: "#286AC5", fontSize: 28, marginTop: 8 },
  footerNote: { color: muted, fontSize: 12 },
});
