import {
  AlertTriangle,
  FileText,
  LayoutDashboard,
  UsersRound,
} from "lucide-react-native";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui";
import { colors } from "@/src/theme";

type DmcWebShellProps = {
  activeNav?: "dashboard" | "hazards" | "ground-reports";
  children: ReactNode;
  topbarTitle?: string;
  protocol?: string;
};

export function DmcWebShell({
  activeNav = "hazards",
  children,
  protocol = "PROTOCOL LEVEL 3",
  topbarTitle = "HAZARD ASSESSMENT & WARNING",
}: DmcWebShellProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.sidebar}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>DMC</Text>
            </View>
            <View>
              <Text style={styles.brand}>DMC Portal</Text>
              <Text style={styles.brandSub}>Flood Telemetry &amp; Ops</Text>
            </View>
          </View>
          <View style={styles.nav}>
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              onPress={() => router.push("/dashboard")}
              selected={activeNav === "dashboard"}
            />
            <NavItem
              icon={AlertTriangle}
              label="Hazards & warnings"
              onPress={() => router.push("/home")}
              selected={activeNav === "hazards"}
            />
            <NavItem
              icon={FileText}
              label="Ground reports"
              onPress={() => router.push("/ground-reports")}
              selected={activeNav === "ground-reports"}
            />
            <NavItem icon={UsersRound} label="Emergency coordination" />
          </View>
        </View>
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerTitle}>Disaster Management Centre</Text>
          <Text style={styles.footerText}>Public service operations</Text>
          <Text style={styles.connected}>● Connected</Text>
        </View>
      </View>
      <View style={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>
            {topbarTitle}　/　<Text style={styles.protocol}>{protocol}</Text>
          </Text>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RV</Text>
            </View>
            <Text style={styles.commander}>
              Capt. R. Vance · Commander{"\n"}
              <Text style={styles.duty}>Duty Command HQ</Text>
            </Text>
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

function NavItem({
  icon,
  label,
  onPress,
  selected = false,
}: {
  icon: typeof AlertTriangle;
  label: string;
  onPress?: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.navItem, selected && styles.navSelected]}
    >
      <Icon color={selected ? "#67A7FF" : "#98A9C2"} icon={icon} size={21} />
      <Text style={[styles.navText, selected && styles.navTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F3F6FA", flex: 1, flexDirection: "row" },
  sidebar: {
    backgroundColor: "#0E172B",
    justifyContent: "space-between",
    paddingBottom: 24,
    paddingHorizontal: 12,
    paddingTop: 38,
    width: 280,
  },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 12, paddingHorizontal: 10 },
  brandMark: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, height: 46, justifyContent: "center", width: 46 },
  brandMarkText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  brand: { color: colors.white, fontSize: 21, fontWeight: "800" },
  brandSub: { color: "#A4B4C9", fontSize: 14, marginTop: 4 },
  nav: { gap: 8, marginTop: 55 },
  navItem: { alignItems: "center", borderRadius: 10, flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingVertical: 15 },
  navSelected: { backgroundColor: "#17294B", borderLeftColor: "#4E9AFF", borderLeftWidth: 3 },
  navText: { color: "#9AAAC2", flexShrink: 1, fontSize: 16 },
  navTextSelected: { color: colors.white, fontWeight: "700" },
  sidebarFooter: { borderTopColor: "#25334A", borderTopWidth: 1, gap: 5, paddingTop: 30 },
  footerTitle: { color: colors.white, fontSize: 14 },
  footerText: { color: "#9AAAC2", fontSize: 14 },
  connected: { color: "#10D99B", fontSize: 14, marginTop: 12 },
  main: { flex: 1, minWidth: 0, position: "relative" },
  topbar: { alignItems: "center", backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 20, minHeight: 76, justifyContent: "space-between", paddingHorizontal: 28 },
  topbarTitle: { color: "#5E7595", flexShrink: 1, fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },
  protocol: { color: "#0B1424" },
  commander: { color: "#0B1424", fontSize: 16, textAlign: "right" },
  duty: { color: "#8DA0BB", fontSize: 14 },
  profile: { alignItems: "center", flexDirection: "row", gap: 14 },
  avatar: { alignItems: "center", backgroundColor: "#E7EDF5", borderColor: "#CBD7E5", borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  avatarText: { color: "#29405F", fontSize: 13, fontWeight: "800" },
});
