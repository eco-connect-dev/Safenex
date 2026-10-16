import { Link, router } from "expo-router";
import { Waves } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthButton } from "@/components/ui/AuthButton";
import { AuthTextField } from "@/components/ui/AuthTextField";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginLayout}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Waves color="#FFFFFF" size={30} strokeWidth={2.3} />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brandTitle}>safenex</Text>
              <Text style={styles.brandCaption}>Community safety and hazard alerts</Text>
            </View>
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.tagline}>Stay informed, report local hazards, and help keep your community safe.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardAccentBar} />
            <View style={styles.form}>
              <View style={styles.formHeading}>
                <Text style={styles.formTitle}>Sign in to your account</Text>
                <Text style={styles.formSubtitle}>Sign in to access your safenex account.</Text>
              </View>
              <AuthTextField
                icon="mail-outline"
                placeholder="Email address"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <AuthTextField
                icon="lock-closed-outline"
                placeholder="Password"
                autoCapitalize="none"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

              <AuthButton
                label="Sign in to safenex"
                icon="arrow-forward"
                loading={submitting}
                onPress={handleLogin}
              />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>NEW TO SAFENEX?</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.altActions}>
              <Text style={styles.accountPrompt}>Create an account to report hazards and receive local alerts.</Text>
              <Link href="./onboarding/community-signup" asChild>
                <AuthButton
                  label="Create an account"
                  icon="people-outline"
                  iconPosition="left"
                  variant="secondary"
                  tintColor="#2563EB"
                />
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F1F5F9", flex: 1 },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  loginLayout: { gap: 20, maxWidth: 460, width: "100%" },
  brandRow: { alignItems: "center", alignSelf: "center", gap: 9 },
  brandMark: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 16,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  brandCopy: { alignItems: "center" },
  brandTitle: { color: "#0E172B", fontSize: 24, fontWeight: "800", letterSpacing: 0.2 },
  brandCaption: { color: "#6B829C", fontSize: 12, marginTop: 2, textAlign: "center" },
  intro: { gap: 5, marginTop: 8 },
  title: {
    color: "#0B1424",
    fontSize: 27,
    fontWeight: "800",
  },
  tagline: {
    color: "#607797",
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E1EC",
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    overflow: "hidden",
    shadowColor: "#0E172B",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    width: "100%",
  },
  cardAccentBar: { backgroundColor: "#2563EB", height: 4 },
  form: { gap: 13, padding: 24 },
  formHeading: { gap: 5, marginBottom: 3 },
  formTitle: { color: "#0B1424", fontSize: 18, fontWeight: "800" },
  formSubtitle: {
    color: "#607797",
    fontSize: 13,
    lineHeight: 19,
  },
  error: { color: "#B42323", fontSize: 13 },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
  },
  dividerLine: { backgroundColor: "#E5ECF4", flex: 1, height: 1 },
  dividerText: {
    color: "#8CA1BE",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginHorizontal: 12,
  },
  altActions: { padding: 20, paddingTop: 14 },
  accountPrompt: {
    color: "#607797",
    fontSize: 12,
    marginBottom: 8,
    textAlign: "center",
  },
});
