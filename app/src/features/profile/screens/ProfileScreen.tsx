import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button, TextField } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { getMyProfile, saveMyProfile, type UserProfile } from "@/src/features/profile/api";
import { colors } from "@/src/theme";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    getMyProfile()
      .then((result) => {
        if (!mounted) return;
        setProfile(result);
        setFullName(result.full_name);
        setPhone(result.phone);
        setDistrict(result.district);
      })
      .catch((loadError: unknown) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : "Could not load your profile.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const saved = await saveMyProfile({ full_name: fullName, phone, district });
      setProfile(saved);
      setFullName(saved.full_name);
      setPhone(saved.phone);
      setDistrict(saved.district);
      setSuccess("Your profile details have been saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DmcWebShell activeNav="profile" protocol="" topbarTitle="My profile">
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.subtitle}>Keep your contact details current so your community response team can reach you.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <Text style={styles.cardTitle}>Personal details</Text>
            <Text style={styles.cardHint}>Your email is managed by your Safenex sign-in account.</Text>
          </View>

          {loading ? <Text style={styles.message}>Loading your profile…</Text> : (
            <View style={styles.form}>
              <TextField label="Full name" autoCapitalize="words" autoComplete="name" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />
              <TextField label="Email address" value={profile?.email ?? ""} editable={false} autoCapitalize="none" keyboardType="email-address" />
              <TextField label="Role" value={profile ? formatRole(profile.role) : ""} editable={false} />
              <TextField label="Phone number" autoComplete="tel" keyboardType="phone-pad" placeholder="Add a contact number" value={phone} onChangeText={setPhone} />
              <TextField label="District" autoCapitalize="words" placeholder="Add your district" value={district} onChangeText={setDistrict} />

              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
              {success ? <Text accessibilityRole="status" style={styles.success}>{success}</Text> : null}

              <View style={styles.saveRow}>
                <Button label={saving ? "Saving profile…" : "Save changes"} onPress={() => void handleSave()} loading={saving} disabled={loading || !profile} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </DmcWebShell>
  );
}

function formatRole(role: UserProfile["role"]) {
  if (role === "duty_officer") return "Duty Officer";
  if (role === "district_officer") return "District Officer";
  if (role === "dmc_officer") return "DMC Officer";
  if (role === "dmc_analyst") return "DMC Analyst";
  if (role === "volunteer") return "Community Volunteer";
  return "Citizen";
}

const styles = StyleSheet.create({
  page: { backgroundColor: "#F3F6FA", flexGrow: 1, gap: 20, padding: 28, paddingBottom: 38 },
  heading: { gap: 5, maxWidth: 760 },
  title: { color: "#0B1424", fontSize: 27, fontWeight: "800" },
  subtitle: { color: "#5E7595", fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: colors.white, borderColor: "#D9E2EC", borderRadius: 12, borderWidth: 1, maxWidth: 760, overflow: "hidden", width: "100%" },
  cardHeading: { borderBottomColor: "#E8EDF3", borderBottomWidth: 1, gap: 5, padding: 22 },
  cardTitle: { color: "#0B1424", fontSize: 18, fontWeight: "800" },
  cardHint: { color: "#6B829C", fontSize: 12 },
  form: { gap: 17, padding: 22 },
  message: { color: "#6B829C", fontSize: 13, padding: 22 },
  error: { color: "#B42323", fontSize: 13 },
  success: { color: "#047857", fontSize: 13 },
  saveRow: { alignItems: "flex-start", paddingTop: 3 },
});
