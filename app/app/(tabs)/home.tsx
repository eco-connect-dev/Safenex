import {
  Bell,
  ChevronRight,
  CircleAlert,
  Droplets,
  FileText,
  MapPin,
  Mountain,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Badge, Card, Icon } from "@/src/components/ui";
import { colors, radii, spacing, typography } from "@/src/theme";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Icon color={colors.white} icon={ShieldCheck} size={22} />
            </View>
            <View>
              <Text style={styles.brand}>Safenex</Text>
              <Text style={styles.brandSubtitle}>Community safety network</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" style={styles.headerButton}>
            <Icon color={colors.textSecondary} icon={Bell} size={20} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>MONDAY, 14 OCTOBER</Text>
          <Text style={styles.title}>Good morning, Nadeesha</Text>
          <Text style={styles.subtitle}>
            Stay informed and help keep your community prepared.
          </Text>
        </View>

        <Card style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Icon color={colors.white} icon={CircleAlert} size={22} />
          </View>
          <View style={styles.alertCopy}>
            <View style={styles.alertHeading}>
              <Text style={styles.alertTitle}>3 active alerts nearby</Text>
              <Badge label="NEARBY" tone="danger" />
            </View>
            <Text style={styles.alertText}>
              Landslide risk is elevated around Kadawatha.
            </Text>
            <Pressable style={styles.alertLink}>
              <Text style={styles.alertLinkText}>View alerts</Text>
              <Icon color={colors.red} icon={ChevronRight} size={16} />
            </Pressable>
          </View>
        </Card>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/report-flow/hazard-type")}
          style={({ pressed }) => [styles.reportCta, pressed && styles.pressed]}
        >
          <View style={styles.reportCtaIcon}>
            <Icon color={colors.primary} icon={CircleAlert} size={24} />
          </View>
          <View style={styles.reportCtaCopy}>
            <Text style={styles.reportCtaTitle}>Report a hazard</Text>
            <Text style={styles.reportCtaText}>
              Share what you see so responders can act faster.
            </Text>
          </View>
          <Icon color={colors.white} icon={ChevronRight} size={22} />
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>
        <View style={styles.quickGrid}>
          <QuickAction
            color={colors.primary}
            icon={FileText}
            label="My reports"
            onPress={() => router.push("/report-flow/my-reports")}
          />
          <QuickAction color={colors.green} icon={MapPin} label="Safe places" />
          <QuickAction
            color={colors.amber}
            icon={Bell}
            label="Emergency alerts"
          />
          <QuickAction color="#7C3AED" icon={UserRound} label="My profile" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent alerts</Text>
          <Text style={styles.viewAll}>View all</Text>
        </View>
        <AlertRow
          color={colors.red}
          icon={Mountain}
          meta="1.2 km away · 20 min ago"
          title="Landslide warning — Kandy Road"
        />
        <AlertRow
          color={colors.primary}
          icon={Droplets}
          meta="3.4 km away · 1 hour ago"
          title="Flood watch — Kelani River"
        />
      </ScrollView>
    </View>
  );
}

function QuickAction({
  color,
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: typeof FileText;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <View style={[styles.quickIcon, { backgroundColor: `${color}18` }]}>
        <Icon color={color} icon={icon} size={20} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function AlertRow({
  color,
  icon,
  meta,
  title,
}: {
  color: string;
  icon: typeof Mountain;
  meta: string;
  title: string;
}) {
  return (
    <Card style={styles.alertRow}>
      <View style={[styles.alertRowIcon, { backgroundColor: `${color}18` }]}>
        <Icon color={color} icon={icon} size={19} />
      </View>
      <View style={styles.alertRowCopy}>
        <Text style={styles.alertRowTitle}>{title}</Text>
        <Text style={styles.alertRowMeta}>{meta}</Text>
      </View>
      <Icon color={colors.textMuted} icon={ChevronRight} size={18} />
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background, flex: 1 },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  brandIcon: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  brand: {
    color: colors.navy,
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  brandSubtitle: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  headerButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  notificationDot: {
    backgroundColor: colors.red,
    borderColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 9,
    position: "absolute",
    right: 7,
    top: 6,
    width: 9,
  },
  greeting: { gap: spacing.xs, marginTop: spacing.md },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.navy,
    fontSize: typography.sizes.xl,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  alertCard: {
    alignItems: "center",
    backgroundColor: colors.redSoft,
    borderColor: "#FECACA",
    flexDirection: "row",
    gap: spacing.md,
  },
  alertIcon: {
    alignItems: "center",
    backgroundColor: colors.red,
    borderRadius: radii.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  alertCopy: { flex: 1, gap: spacing.xs },
  alertHeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  alertTitle: {
    color: colors.navy,
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: "800",
  },
  alertText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
  alertLink: { alignItems: "center", flexDirection: "row", gap: 2 },
  alertLinkText: {
    color: colors.red,
    fontSize: typography.sizes.xs,
    fontWeight: "800",
  },
  reportCta: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  reportCtaIcon: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.md,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  reportCtaCopy: { flex: 1, gap: spacing.xs },
  reportCtaTitle: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: "800",
  },
  reportCtaText: {
    color: "#DCEBFF",
    fontSize: typography.sizes.xs,
    lineHeight: 17,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.navy,
    fontSize: typography.sizes.md,
    fontWeight: "800",
  },
  viewAll: {
    color: colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  quickAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 104,
    justifyContent: "center",
    padding: spacing.md,
  },
  quickIcon: {
    alignItems: "center",
    borderRadius: radii.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  quickLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: "700",
  },
  alertRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  alertRowIcon: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  alertRowCopy: { flex: 1, gap: 3 },
  alertRowTitle: {
    color: colors.navy,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
  },
  alertRowMeta: { color: colors.textMuted, fontSize: typography.sizes.xs },
  pressed: { opacity: 0.78 },
});
