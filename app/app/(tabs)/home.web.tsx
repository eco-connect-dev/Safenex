import {
  Activity,
  AlertTriangle,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Map,
  ShieldCheck,
  Users,
} from "lucide-react-native";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, Icon, Notice } from "@/src/components/ui";
import { groundReports } from "@/src/features/ground-verification/api";
import { colors, radii, spacing, typography } from "@/src/theme";

export default function WebHomeScreen() {
  const pendingReports = groundReports.filter(
    (report) => report.status === "pending",
  ).length;

  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Icon color={colors.white} icon={ShieldCheck} size={22} />
          </View>
          <Text style={styles.brand}>DMC Portal</Text>
        </View>
        <View style={styles.nav}>
          <NavItem icon={Activity} label="Overview" selected />
          <NavItem
            icon={AlertTriangle}
            label="Ground reports"
            onPress={() => router.push("/web/ground-reports")}
          />
          <NavItem icon={ShieldCheck} label="Emergency coordination" />
          <NavItem icon={BarChart3} label="Analytics & reports" />
        </View>
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerText}>Disaster Management Centre</Text>
          <Text style={styles.footerText}>Public service operations</Text>
          <Text style={styles.connected}>● Connected</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>District operations overview</Text>
          <Text style={styles.officer}>District Officer · DMC</Text>
        </View>
        <View style={styles.heading}>
          <Text style={styles.title}>Good morning, Officer</Text>
          <Text style={styles.subtitle}>
            Monitor community reports and coordinate an informed response.
          </Text>
        </View>

        <Notice
          message={`${pendingReports} ground reports are waiting for verification.`}
          title="Verification queue needs attention"
          tone="warning"
        />

        <View style={styles.metrics}>
          <Metric
            icon={ClipboardCheck}
            label="Pending reports"
            value={String(pendingReports)}
            tone="warning"
          />
          <Metric
            icon={AlertTriangle}
            label="Active warnings"
            value="3"
            tone="danger"
          />
          <Metric icon={Map} label="Reports today" value="18" tone="info" />
          <Metric
            icon={Users}
            label="Volunteers online"
            value="42"
            tone="success"
          />
        </View>

        <View style={styles.columns}>
          <Card style={styles.queueCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Ground verification</Text>
                <Text style={styles.cardSubtitle}>
                  Review citizen evidence before escalation.
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/web/ground-reports")}
                style={styles.viewButton}
              >
                <Text style={styles.viewButtonText}>View queue</Text>
                <Icon color={colors.primary} icon={ChevronRight} size={16} />
              </Pressable>
            </View>
            {groundReports.slice(0, 3).map((report) => (
              <Pressable
                key={report.id}
                onPress={() =>
                  router.push({
                    pathname: "/web/verify-report",
                    params: { reportId: report.id },
                  })
                }
                style={({ pressed }) => [
                  styles.queueRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.queueIcon}>
                  <Icon color={colors.amber} icon={AlertTriangle} size={18} />
                </View>
                <View style={styles.queueCopy}>
                  <Text style={styles.queueTitle}>
                    {report.hazardType} — {report.location}
                  </Text>
                  <Text style={styles.queueMeta}>
                    {report.reporter} · {report.relativeTime}
                  </Text>
                </View>
                <Badge label="Pending" tone="warning" />
              </Pressable>
            ))}
          </Card>

          <Card style={styles.activityCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Recent activity</Text>
                <Text style={styles.cardSubtitle}>Latest district updates</Text>
              </View>
              <Icon color={colors.textMuted} icon={Clock3} size={19} />
            </View>
            <ActivityRow
              label="New landslide report received"
              time="12 min ago"
            />
            <ActivityRow
              label="Flood watch updated for Kelani River"
              time="1 hr ago"
            />
            <ActivityRow
              label="Volunteer network check completed"
              time="2 hrs ago"
            />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function NavItem({
  icon,
  label,
  onPress,
  selected = false,
}: {
  icon: typeof Activity;
  label: string;
  onPress?: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.navItem, selected && styles.navItemSelected]}
    >
      <Icon color={selected ? colors.white : "#A7BDD3"} icon={icon} size={18} />
      <Text style={[styles.navLabel, selected && styles.navLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Metric({
  icon,
  label,
  tone,
  value,
}: {
  icon: typeof Activity;
  label: string;
  tone: "warning" | "danger" | "info" | "success";
  value: string;
}) {
  const palette = {
    warning: { color: colors.amber, background: colors.amberSoft },
    danger: { color: colors.red, background: colors.redSoft },
    info: { color: colors.primary, background: colors.primarySoft },
    success: { color: colors.green, background: colors.greenSoft },
  }[tone];

  return (
    <Card style={styles.metric}>
      <View
        style={[styles.metricIcon, { backgroundColor: palette.background }]}
      >
        <Icon color={palette.color} icon={icon} size={19} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

function ActivityRow({ label, time }: { label: string; time: string }) {
  return (
    <View style={styles.activityRow}>
      <View style={styles.activityDot} />
      <View style={styles.activityCopy}>
        <Text style={styles.activityLabel}>{label}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1, flexDirection: "row" },
  sidebar: {
    backgroundColor: colors.navy,
    justifyContent: "space-between",
    padding: spacing.xl,
    width: 270,
  },
  brandRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  brandIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  brand: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  nav: { gap: spacing.sm, marginTop: spacing.xxxl },
  navItem: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  navItemSelected: { backgroundColor: colors.primary },
  navLabel: { color: "#A7BDD3", fontSize: typography.sizes.sm },
  navLabelSelected: { color: colors.white, fontWeight: "800" },
  sidebarFooter: { gap: spacing.xs },
  footerText: { color: "#A7BDD3", fontSize: typography.sizes.xs },
  connected: {
    color: "#9BD8B0",
    fontSize: typography.sizes.xs,
    marginTop: spacing.sm,
  },
  main: {
    flexGrow: 1,
    gap: spacing.xl,
    maxWidth: 1440,
    padding: spacing.xxxl,
    width: "100%",
  },
  topbar: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
  },
  topbarTitle: {
    color: colors.navy,
    fontSize: typography.sizes.lg,
    fontWeight: "700",
  },
  officer: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  heading: { gap: spacing.sm },
  title: { color: colors.navy, fontSize: 32, fontWeight: "800" },
  subtitle: { color: "#6B829C", fontSize: typography.sizes.md },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  metric: { flex: 1, gap: spacing.sm, minWidth: 170 },
  metricIcon: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  metricValue: {
    color: colors.navy,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
  },
  metricLabel: { color: colors.textSecondary, fontSize: typography.sizes.sm },
  columns: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xl },
  queueCard: { flex: 1, gap: spacing.md, minWidth: 500 },
  activityCard: { flex: 1, gap: spacing.md, minWidth: 360 },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: colors.navy,
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  viewButton: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  viewButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: "800",
  },
  queueRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  queueIcon: {
    alignItems: "center",
    backgroundColor: colors.amberSoft,
    borderRadius: radii.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  queueCopy: { flex: 1, gap: 3 },
  queueTitle: {
    color: colors.navy,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  queueMeta: { color: colors.textMuted, fontSize: typography.sizes.xs },
  activityRow: {
    alignItems: "flex-start",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  activityDot: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    height: 8,
    marginTop: 5,
    width: 8,
  },
  activityCopy: { gap: 3 },
  activityLabel: { color: colors.navy, fontSize: typography.sizes.sm },
  activityTime: { color: colors.textMuted, fontSize: typography.sizes.xs },
  pressed: { opacity: 0.7 },
});
