import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  UserRound,
  UsersRound,
} from "lucide-react-native";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/src/components/ui";
import { emergencyCoordinationRoutes } from "@/src/features/emergency-coordination/routes";
import { colors } from "@/src/theme";
import { supabase } from "@/lib/supabase";

type DmcWebShellProps = {
  activeNav?: "dashboard" | "hazards" | "ground-reports" | "emergency-coordination" | "analytics" | "profile";
  children: ReactNode;
  topbarTitle?: string;
  protocol?: string;
  profileInitials?: string;
  profileName?: string;
  profileSubtitle?: string;
  showTopbarSignOut?: boolean;
};

export function DmcWebShell({
  activeNav = "hazards",
  children,
  protocol = "PROTOCOL LEVEL 3",
  topbarTitle = "HAZARD ASSESSMENT & WARNING",
  profileInitials,
  profileName,
  profileSubtitle,
  showTopbarSignOut = true,
}: DmcWebShellProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountRole, setAccountRole] = useState("citizen");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const email = user.email ?? "";
      let name = String(user.user_metadata?.full_name ?? "").trim();
      const { data } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user.id)
        .maybeSingle();
      if (typeof data?.full_name === "string" && data.full_name.trim()) name = data.full_name.trim();
      if (active) {
        setAccountName(name || email || "Safenex user");
        setAccountEmail(email);
        setAccountRole(typeof data?.role === "string" ? data.role : "citizen");
      }
    })().catch(() => undefined);
    return () => { active = false; };
  }, []);

  const resolvedProfileName = profileName ?? (accountName || "Safenex user");
  const resolvedProfileSubtitle = profileSubtitle ?? accountEmail;
  const resolvedProfileInitials = profileInitials === undefined ? initialsFor(resolvedProfileName) : profileInitials;

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSignOutError(error.message);
      setSigningOut(false);
      return;
    }
    router.replace("/login");
  };

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
              onPress={() => router.push("/dashboard" as never)}
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
            <NavItem
              icon={UsersRound}
              label="Emergency coordination"
              onPress={() =>
                router.push(emergencyCoordinationRoutes.activeEmergency as never)
              }
              selected={activeNav === "emergency-coordination"}
            />
            <NavItem
              icon={BarChart3}
              label="Analytics & reports"
              onPress={() => router.push("/analytics" as never)}
              selected={activeNav === "analytics"}
            />
            <NavItem
              icon={UserRound}
              label="My profile"
              onPress={() => router.push("/profile" as never)}
              selected={activeNav === "profile"}
            />
          </View>
        </View>
        <View style={styles.sidebarFooter}>
          <Text style={styles.footerTitle}>Disaster Management Centre</Text>
          <Text style={styles.footerText}>Public service operations</Text>
          <Text style={styles.connected}>● Connected</Text>
          {signOutError ? <Text style={styles.signOutError}>{signOutError}</Text> : null}
          <Pressable accessibilityRole="button" disabled={signingOut} onPress={() => void handleSignOut()} style={({ pressed }) => [styles.sidebarSignOut, pressed && styles.pressed, signingOut && styles.disabled]}>
            <Icon color="#CBD5E1" icon={LogOut} size={17} />
            <Text style={styles.sidebarSignOutText}>{signingOut ? "Signing out…" : "Sign out"}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.topbarTitle}>
            {topbarTitle}
            {protocol ? (
              <>
                {"　/　"}
                <Text style={styles.protocol}>{protocol}</Text>
              </>
            ) : null}
          </Text>
          <View style={styles.topbarRight}>
            <View style={styles.profileMenuWrap}>
              <Pressable accessibilityRole="button" accessibilityLabel="Open profile menu" accessibilityState={{ expanded: profileMenuOpen }} onPress={() => setProfileMenuOpen((open) => !open)} style={styles.profile}>
                {resolvedProfileInitials ? (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{resolvedProfileInitials}</Text>
                  </View>
                ) : null}
                <Text style={styles.commander}>
                  {resolvedProfileName}
                  {resolvedProfileSubtitle ? (
                    <>
                      {"\n"}
                      <Text style={styles.duty}>{resolvedProfileSubtitle}</Text>
                    </>
                  ) : null}
                </Text>
                <Icon color="#5E7595" icon={ChevronDown} size={16} />
              </Pressable>
              {profileMenuOpen ? (
                <View style={styles.profileMenu}>
                  <Text style={styles.profileMenuName}>{accountName || resolvedProfileName}</Text>
                  {accountEmail ? <Text style={styles.profileMenuEmail}>{accountEmail}</Text> : null}
                  <Text style={styles.profileMenuRole}>{formatRole(accountRole)}</Text>
                  <View style={styles.profileMenuDivider} />
                  <Pressable accessibilityRole="button" onPress={() => { setProfileMenuOpen(false); router.push("/profile" as never); }} style={({ pressed }) => [styles.profileMenuAction, pressed && styles.pressed]}>
                    <Icon color={colors.primary} icon={UserRound} size={17} />
                    <Text style={styles.profileMenuActionText}>Edit profile details</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            {showTopbarSignOut ? (
              <Pressable accessibilityRole="button" disabled={signingOut} onPress={() => void handleSignOut()} style={({ pressed }) => [styles.topbarSignOut, pressed && styles.pressed, signingOut && styles.disabled]}>
                <Icon color={colors.primary} icon={LogOut} size={17} />
                <Text style={styles.topbarSignOutText}>{signingOut ? "Signing out…" : "Sign out"}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
}

function initialsFor(name: string) {
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRole(role: string) {
  if (role === "duty_officer") return "Duty Officer";
  if (role === "district_officer") return "District Officer";
  if (role === "dmc_officer") return "DMC Officer";
  if (role === "dmc_analyst") return "DMC Analyst";
  if (role === "volunteer") return "Community Volunteer";
  return "Citizen";
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
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.navItem, selected && styles.navSelected]}
      testID={`nav-${label}`}
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
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 10,
  },
  brandMark: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  brandMarkText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  brand: { color: colors.white, fontSize: 21, fontWeight: "800" },
  brandSub: { color: "#A4B4C9", fontSize: 14, marginTop: 4 },
  nav: { gap: 8, marginTop: 55 },
  navItem: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  navSelected: {
    backgroundColor: "#17294B",
    borderLeftColor: "#4E9AFF",
    borderLeftWidth: 3,
  },
  navText: { color: "#9AAAC2", flexShrink: 1, fontSize: 16 },
  navTextSelected: { color: colors.white, fontWeight: "700" },
  sidebarFooter: {
    borderTopColor: "#25334A",
    borderTopWidth: 1,
    gap: 5,
    paddingTop: 30,
  },
  footerTitle: { color: colors.white, fontSize: 14 },
  footerText: { color: "#9AAAC2", fontSize: 14 },
  connected: { color: "#10D99B", fontSize: 14, marginTop: 12 },
  sidebarSignOut: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 9, marginTop: 16, paddingHorizontal: 7, paddingVertical: 8 },
  sidebarSignOutText: { color: "#CBD5E1", fontSize: 14, fontWeight: "700" },
  signOutError: { color: "#FDA4AF", fontSize: 11, marginTop: 5 },
  main: { flex: 1, minWidth: 0, position: "relative" },
  topbar: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 20,
    minHeight: 76,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    position: "relative",
    zIndex: 1000,
    elevation: 20,
  },
  topbarTitle: {
    color: "#5E7595",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  protocol: { color: "#0B1424" },
  commander: { color: "#0B1424", fontSize: 16, textAlign: "right" },
  duty: { color: "#8DA0BB", fontSize: 14 },
  profile: { alignItems: "center", flexDirection: "row", gap: 14 },
  avatar: {
    alignItems: "center",
    backgroundColor: "#E7EDF5",
    borderColor: "#CBD7E5",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  topbarRight: { alignItems: "center", flexDirection: "row", gap: 20, position: "relative", zIndex: 1001, elevation: 21 },
  profileMenuWrap: { position: "relative", zIndex: 1002, elevation: 22 },
  profileMenu: { backgroundColor: colors.white, borderColor: "#D8E1EC", borderRadius: 10, borderWidth: 1, elevation: 24, padding: 15, position: "absolute", right: 0, shadowColor: "#0E172B", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.13, shadowRadius: 12, top: 52, width: 265, zIndex: 1003 },
  profileMenuName: { color: "#0B1424", fontSize: 14, fontWeight: "800" },
  profileMenuEmail: { color: "#6B829C", fontSize: 11, marginTop: 3 },
  profileMenuRole: { alignSelf: "flex-start", backgroundColor: "#EEF4FF", borderRadius: 12, color: colors.primary, fontSize: 10, fontWeight: "800", marginTop: 9, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5 },
  profileMenuDivider: { backgroundColor: "#E8EDF3", height: 1, marginVertical: 10 },
  profileMenuAction: { alignItems: "center", flexDirection: "row", gap: 9, paddingVertical: 5 },
  profileMenuActionText: { color: "#29405F", fontSize: 12, fontWeight: "700" },
  topbarSignOut: { alignItems: "center", borderColor: "#CBD5E1", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 7, paddingHorizontal: 11, paddingVertical: 8 },
  topbarSignOutText: { color: colors.primary, fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.55 },
  avatarText: { color: "#29405F", fontSize: 13, fontWeight: "800" },
});
