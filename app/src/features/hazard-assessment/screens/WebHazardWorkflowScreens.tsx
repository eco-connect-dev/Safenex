import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  LockKeyhole,
  MapPin,
  ShieldAlert,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Icon } from "@/src/components/ui";
import { DmcWebShell } from "@/src/components/web/DmcWebShell";
import { colors } from "@/src/theme";
import { getActiveHazards, saveWarning, type HazardRecord } from "@/src/features/hazard-assessment/api/hazards";
import { supabase } from "@/lib/supabase";

const navy = "#0E172B";
const ink = "#0B1424";
const muted = "#5E7595";
const page = "#F3F6FA";

export function AffectedAreaScreen() {
  const [modified, setModified] = useState(false);
  const [hazard, setHazard] = useState<HazardRecord | null>(null);
  useEffect(() => {
    getActiveHazards().then((items) => setHazard(items[0] ?? null)).catch(() => setHazard(null));
  }, []);

  return (
    <WorkflowShell activeStep={2}>
      <ScreenHeading
        title="Select Affected Area"
        subtitle="Review hydrological boundaries and vulnerable community targets without spatial GIS dependencies."
      />
      <Steps activeStep={2} />
      <AlertBar>
        <Text style={styles.alertCopy}>
          <Text style={styles.alertStrong}>Active hazard from Supabase:</Text>{" "}
          {hazard ? `${hazard.title} · ${hazard.description}` : "Loading active hazards…"}
        </Text>
      </AlertBar>

      <View style={[styles.twoColumns, styles.responsiveWrap]}>
        <View style={[styles.card, styles.responsiveCard]}>
          <View style={styles.cardHeadingRow}>
            <View>
              <Text style={styles.cardTitle}>Selected Coverage Definition</Text>
              <Text style={styles.cardSubtitle}>Hydrological boundary parameters</Text>
            </View>
            <Pressable onPress={() => setModified(!modified)} style={styles.outlineButton}>
              <Text style={styles.outlineText}>{modified ? "Save definition" : "Modify area definition"}</Text>
            </Pressable>
          </View>
          <View style={styles.formGrid}>
            <Field label="COVERAGE TYPE" value="River basin" dropdown />
            <Field label="HAZARD" value={hazard?.title ?? "Loading…"} />
            <Field label="DISTRICT / TERRITORY" value={hazard?.district ?? "—"} dropdown full />
            <Field label="LATITUDE (°N)" value={hazard?.latitude.toFixed(4) ?? "—"} mono />
            <Field label="LONGITUDE (°E)" value={hazard?.longitude.toFixed(4) ?? "—"} mono />
          </View>
          <Text style={styles.helperMono}>Coordinate reference system: WGS 84 / UTM zone 47N</Text>
          <Field label="WARNING RADIUS (BUFFER ZONE)" value="14.8                 km" />
          <View style={styles.locked}>
            <Icon color={muted} icon={LockKeyhole} size={17} />
            <Text style={styles.lockedText}>Affected area: <Text style={styles.bold}>{hazard?.location ?? "—"}</Text> · Hazard type: {hazard?.hazard_type ?? "—"}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.responsiveCard]}>
          <View style={styles.triageRow}>
            <View>
              <View style={styles.criticalPill}><Text style={styles.criticalPillText}>Critical triage</Text></View>
              <Text style={styles.basinTitle}>{hazard?.title ?? "Active hazard"}</Text>
              <Text style={styles.cardSubtitle}>{hazard ? `${hazard.district} · ${hazard.severity.toUpperCase()} severity` : "Hazard details load from Supabase"}</Text>
            </View>
            <View style={styles.buildingIcon}><Icon color={colors.primary} icon={MapPin} size={24} /></View>
          </View>
          <View style={styles.statRow}>
            <Stat label="HAZARD TYPE" value={hazard?.hazard_type ?? "—"} suffix="" />
            <Stat label="PEOPLE AFFECTED" value={hazard?.affected_people.toLocaleString() ?? "—"} suffix="people" />
          </View>
          <View style={styles.exposed}>
            <Text style={styles.exposedLabel}>TOTAL RESIDENTS EXPOSED IN POLYGON</Text>
            <Text style={styles.exposedValue}>{hazard?.affected_people.toLocaleString() ?? "—"} <Text style={styles.exposedUnit}>people</Text></Text>
            <Text style={styles.exposedHint}>{hazard?.location ?? "Affected area"}, {hazard?.district ?? ""}</Text>
          </View>
          <View style={styles.successBox}>
            <View style={styles.successMark}><Icon color={colors.white} icon={Check} size={14} /></View>
            <Text style={styles.successText}><Text style={styles.bold}>Hazard record loaded:</Text> This location and severity are read from the active hazards table.</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}><Text style={styles.sectionTitle}>DATABASE HAZARD SUMMARY</Text><Text style={styles.sync}>{hazard ? `Observed ${new Date(hazard.observed_at).toLocaleString()}` : "Loading"}</Text></View>
        <View style={[styles.summaryRow, styles.responsiveWrap]}>
          <Summary icon={AlertTriangle} title="HAZARD" value={hazard?.title ?? "No active hazard"} hint={hazard?.description ?? "Check Supabase connection"} tone="red" />
          <Summary icon={BarChart3} title="SEVERITY" value={hazard?.severity.toUpperCase() ?? "—"} hint={`${hazard?.affected_people.toLocaleString() ?? "0"} people potentially affected`} tone="amber" />
          <Summary icon={MapPin} title="LOCATION" value={hazard?.location ?? "—"} hint={hazard ? `${hazard.latitude.toFixed(4)}, ${hazard.longitude.toFixed(4)} · ${hazard.district}` : "WGS 84 coordinates"} tone="blue" />
        </View>
      </View>
      <BottomBar button="Prepare warning" onPress={() => router.push("/web/prepare-warning" as never)} />
    </WorkflowShell>
  );
}

export function PrepareWarningScreen() {
  const [tier, setTier] = useState(3);
  const [language, setLanguage] = useState("EN · English");
  const [message, setMessage] = useState("Severe flooding is expected. Move to higher ground immediately and follow official protection instructions.");
  const [hazard, setHazard] = useState<HazardRecord | null>(null);
  const [hazardError, setHazardError] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  useEffect(() => {
    getActiveHazards().then((items) => setHazard(items[0] ?? null)).catch((error: Error) => setHazardError(error.message));
  }, []);
  const saveDraft = async () => {
    if (!hazard) return;
    setSavingDraft(true);
    setDraftMessage("");
    try {
      await saveWarning({
        hazard_id: hazard.id,
        tier,
        title: `${hazard.title} — draft`,
        message,
        language: language.startsWith("BM") ? "bm" : "en",
        status: "draft",
        target_location: `${hazard.location}, ${hazard.district}`,
        affected_people: hazard.affected_people,
        channels: ["push", "sms", "siren"],
      });
      setDraftMessage("Draft saved to Supabase.");
    } catch (error) {
      setDraftMessage(error instanceof Error ? error.message : "Could not save the draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <WorkflowShell activeStep={3}>
      <ScreenHeading
        title="Prepare Warning"
        subtitle="Choose warning tier, author multi-lingual emergency dispatch copy, and review gateway delivery readiness."
      />
      <Steps activeStep={3} />
      <AlertBar>
        <Text style={styles.alertCopy}>{hazardError || (hazard ? `${hazard.title} · ${hazard.severity.toUpperCase()} hazard · ${hazard.location}, ${hazard.district} · ${hazard.affected_people.toLocaleString()} people potentially affected` : "No active hazards are available in the database.")}</Text>
      </AlertBar>
      {draftMessage ? <Text style={styles.helperMono}>{draftMessage}</Text> : null}

      <View style={[styles.card, styles.responsiveCard]}>
        <Text style={styles.sectionHeading}>Select warning tier</Text>
        <View style={styles.tierRow}>
          <Tier number="1" title="Advisory" copy="Elevated hydrological anomalies. Precautionary notifications." selected={tier === 1} onPress={() => setTier(1)} />
          <Tier number="2" title="Watch" copy="High probability of cresting. Prepare emergency staging." selected={tier === 2} onPress={() => setTier(2)} />
          <Tier number="3" title="Warning · Immediate action" copy="Imminent life-safety hazard. Evacuation protocols mandated." selected={tier === 3} onPress={() => setTier(3)} />
        </View>
      </View>

      <View style={[styles.twoColumns, styles.responsiveWrap]}>
        <View style={[styles.card, styles.responsiveCard]}>
          <Text style={styles.sectionHeading}>Broadcast content</Text>
          <View style={styles.broadcastTop}>
            <View style={styles.languageTabs}>
              <Pressable onPress={() => setLanguage("EN · English")} style={[styles.languageTab, language.startsWith("EN") && styles.languageActive]}><Text style={[styles.languageText, language.startsWith("EN") && styles.languageActiveText]}>EN · English</Text></Pressable>
              <Pressable onPress={() => setLanguage("BM · Bahasa Melayu")} style={[styles.languageTab, language.startsWith("BM") && styles.languageActive]}><Text style={[styles.languageText, language.startsWith("BM") && styles.languageActiveText]}>BM · Bahasa Melayu</Text></Pressable>
            </View>
            <Pressable style={styles.templateButton}><Text style={styles.templateText}>Switch template / Insert var</Text><Icon color={muted} icon={ChevronDown} size={16} /></Pressable>
          </View>
          <Text style={styles.inputLabel}>Emergency message body</Text>
          <TextInput
            multiline
            value={message}
            onChangeText={setMessage}
            style={styles.messageInput}
          />
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
          <View style={styles.characterRow}><Text style={styles.characterText}>164 / 280 characters · 1 SMS segment · Maximum 3 segments</Text><Text style={styles.safeText}>Capacity safe</Text></View>
          <Text style={styles.tokenHint}>Click to inject localized tokens:</Text>
          <View style={styles.tokenRow}><Token text="+ Sungai Muda Basin" /><Token text="+ SMK Merbok Relief Centre" /><Token text="+ Hotline 999" /></View>
        </View>
        <View style={[styles.card, styles.responsiveCard]}>
          <View style={styles.cardHeadingRow}><Text style={styles.sectionHeading}>Distribution channels</Text><View style={styles.channelCount}><Text style={styles.channelCountText}>3 channels configured</Text></View></View>
          <Channel title="Push notification" copy="12,430 registered devices" latency="1.2 s gateway latency · Within target" />
          <Channel title="SMS cell broadcast" copy="All active cellular towers · Priority 0" latency="1.8 s gateway latency · Within target" />
          <Channel title="Audible siren override" copy="6 sirens online · RF over-the-air" latency="2.1 s gateway latency · Degradation watch" warning />
        </View>
      </View>
      <BottomBar button="Review warning" saveLabel={savingDraft ? "Saving…" : "Save draft"} onSave={() => void saveDraft()} onPress={() => router.push({ pathname: "/web/review-authorize", params: { tier: String(tier), message, language: language.startsWith("BM") ? "bm" : "en" } } as never)} />
    </WorkflowShell>
  );
}

export function ReviewAuthorizeScreen() {
  const params = useLocalSearchParams<{ tier?: string; message?: string; language?: string }>();
  const warningTier = Math.min(3, Math.max(1, Number(params.tier) || 3));
  const [issuing, setIssuing] = useState(false);
  const [hazard, setHazard] = useState<HazardRecord | null>(null);
  const [hazardError, setHazardError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [message] = useState(typeof params.message === "string" ? params.message : "Severe flooding is expected. Move to higher ground immediately and follow official protection instructions.");
  useEffect(() => {
    getActiveHazards().then((items) => setHazard(items[0] ?? null)).catch((error: Error) => setHazardError(error.message));
  }, []);
  const persistWarning = async (status: "draft" | "issued") => {
    if (!hazard) {
      setActionMessage(hazardError || "No active hazard was found. Apply the Supabase migration and try again.");
      return;
    }
    setSaving(true);
    setActionMessage("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await saveWarning({
        hazard_id: hazard.id,
        tier: warningTier,
        title: `${hazard.title} — ${status === "issued" ? "warning" : "draft"}`,
        message,
        language: params.language === "bm" ? "bm" : "en",
        status,
        target_location: `${hazard.location}, ${hazard.district}`,
        affected_people: hazard.affected_people,
        channels: ["push", "sms", "siren"],
        ...(status === "issued" ? { issued_by: user?.id ?? null, issued_at: new Date().toISOString() } : {}),
      });
      setActionMessage(status === "issued" ? "Warning issued and saved to Supabase." : "Warning draft saved to Supabase.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Could not save the warning.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <WorkflowShell activeStep={4}>
      <ScreenHeading
        title="Review & Authorize"
        subtitle="Confirm affected coverage, citizen message payload, and transmission channels before issuance."
      />
      <Steps activeStep={4} />
      <AlertBar>
          <Text style={styles.alertCopy}>
          <Text style={styles.alertStrong}>Warning level: Urgent Hazard Alert</Text>
          {" · "}{hazardError || (hazard ? `${hazard.severity.toUpperCase()} · ${hazard.title} · ${hazard.location}, ${hazard.district}` : "Loading active hazard from Supabase…")}
        </Text>
      </AlertBar>
      <View style={styles.issuingBar}>
        <View style={styles.issuingDot} />
        <Text style={styles.issuingText}>
          {issuing ? "Saving warning to Supabase…" : actionMessage || "Review the warning, then save a draft or issue it."}
        </Text>
        <Pressable onPress={() => setIssuing(false)} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>

      <View style={[styles.reviewColumns, styles.responsiveWrap]}>
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Broadcast{"\n"}Summary</Text>
            <View style={styles.readyPill}><View style={styles.readyDot} /><Text style={styles.readyText}>Ready</Text></View>
            <View style={styles.broadcastId}><Text style={styles.broadcastIdText}>#FL-{"\n"}2025-{"\n"}042</Text></View>
          </View>
          <View style={styles.reviewRows}>
            <ReviewRow label="Hazard" value={hazard?.title ?? "Loading…"} />
            <ReviewRow danger label="Severity" value={hazard?.severity.toUpperCase() ?? "—"} />
            <ReviewRow label="Target area" value={hazard ? `${hazard.location}, ${hazard.district}` : "—"} />
            <ReviewRow label="People potentially affected" value={hazard?.affected_people.toLocaleString() ?? "—"} />
            <ReviewRow label="Issuing officer" value="Signed-in user" />
            <ReviewRow label="Observed" mono value={hazard ? new Date(hazard.observed_at).toLocaleString() : "—"} />
          </View>
          <Text style={styles.reviewSection}>AREA SUMMARY</Text>
          <View style={styles.areaBox}>
            <Text style={styles.areaLine}><Text style={styles.bold}>Hazard type:</Text> {hazard?.hazard_type ?? "—"}</Text>
            <Text style={styles.areaLine}><Text style={styles.bold}>District:</Text> {hazard?.district ?? "—"}</Text>
            <Text style={styles.areaLine}><Text style={styles.bold}>Coordinates:</Text> {hazard ? `${hazard.latitude.toFixed(4)}°N, ${hazard.longitude.toFixed(4)}°E` : "—"}</Text>
            <Text style={styles.areaLine}><Text style={styles.bold}>Description:</Text> {hazard?.description ?? "—"}</Text>
          </View>
          <Text style={styles.reviewSection}>HAZARD EXTENT</Text>
          <View style={styles.extentRow}>
            <View style={styles.extentBox}><Text style={styles.extentLabel}>Hazard type</Text><Text style={styles.extentValue}>{hazard?.hazard_type ?? "—"}</Text></View>
            <View style={styles.extentDanger}><Text style={styles.extentLabelDanger}>Severity</Text><Text style={styles.extentValueDanger}>{hazard?.severity.toUpperCase() ?? "—"}</Text></View>
          </View>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.reviewTitle}>Citizen Message{"\n"}Preview</Text>
            <View style={styles.emergencyPill}><Text style={styles.emergencyText}>Emergency alert{"\n"}· Severe</Text></View>
          </View>
          <View style={styles.messagePreview}>
            <View style={styles.messageIcon}><Icon color={colors.white} icon={ShieldAlert} size={17} /></View>
            <Text style={styles.messageTitle}>{hazard?.title ?? "Hazard warning"}</Text>
            <Text style={styles.messageBody}>{message}</Text>
            <View style={styles.tagDivider} />
            <Text style={styles.previewTag}>Lock-screen override</Text>
            <Text style={styles.previewTag}>Geo-targeted alert</Text>
          </View>
          <View style={styles.behaviourBox}>
            <Text style={styles.behaviourTitle}>Push Broadcast Behaviour</Text>
            <Text style={styles.behaviourText}>Standard cell devices in coverage zone will receive high-priority tone interruption and full-screen display warning.</Text>
          </View>
        </View>

        <View style={styles.reviewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.reviewTitle}>SMS Cell{"\n"}Broadcast</Text>
            <View style={styles.channelBadge}><Text style={styles.channelBadgeText}>Channel{"\n"}4370</Text></View>
          </View>
          <View style={styles.terminal}>
            <View style={styles.terminalTop}><Text style={styles.terminalLabel}>TERMINAL BROADCAST{"\n"}BUFFER</Text><Text style={styles.encoded}>ENCODED</Text></View>
            <Text style={styles.terminalText}>[SAFENEX / DMC SRI LANKA]{"\n"}{hazard?.title.toUpperCase() ?? "HAZARD ALERT"}{"\n"}{hazard?.location ?? "Affected area"}, {hazard?.district ?? ""}.{"\n"}{message}</Text>
          </View>
          <View style={styles.payloadBox}>
            <Payload label="Sender" value="GOV-ALERT" />
            <Payload label="Channel" value="4370" />
            <Payload label="Payload" value="228 / 360 chars" />
            <Payload danger label="Priority" value="Immediate priority (0)" />
          </View>
        </View>
      </View>
      <View style={[styles.authorizationBar, styles.responsiveWrap]}>
        <Pressable disabled={saving} onPress={() => void persistWarning("draft")} style={styles.saveButton}><Text style={styles.saveText}>{saving ? "Saving…" : "Save as draft"}</Text></Pressable>
        <Pressable><Text style={styles.editParameters}>Edit parameters</Text></Pressable>
        <Text style={styles.keyRequired}>REQUIRES COMMANDER KEY</Text>
        <Pressable disabled={saving || !hazard} onPress={() => { setIssuing(true); void persistWarning("issued").finally(() => setIssuing(false)); }} style={styles.confirmButton}><Text style={styles.primaryText}>{saving ? "Saving…" : "Confirm & issue warning"}</Text><Icon color={colors.white} icon={ChevronRight} size={18} /></Pressable>
      </View>
    </WorkflowShell>
  );
}

function WorkflowShell({ activeStep: _activeStep, children }: { activeStep: number; children: ReactNode }) {
  return <DmcWebShell><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView></DmcWebShell>;
}

function ScreenHeading({ title, subtitle }: { title: string; subtitle: string }) { return <View style={styles.heading}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>; }
function Steps({ activeStep }: { activeStep: number }) { return <View style={[styles.steps, styles.responsiveWrap]}>{["Assess hazard", "Select affected area", "Prepare warning", "Review & authorize"].map((label, i) => { const number = i + 1; const complete = number < activeStep; return <Pressable key={label} onPress={() => number === 1 ? router.push("/home") : number === 2 ? router.push("/web/affected-area" as never) : number === 3 ? router.push("/web/prepare-warning" as never) : router.push("/web/review-authorize" as never)} style={[styles.step, number === activeStep && styles.stepActive, complete && styles.stepComplete]}><View style={styles.stepCircle}>{complete ? <Icon color="#059669" icon={Check} size={16} /> : <Text style={[styles.stepNumber, number === activeStep && styles.activeStepText]}>{number}</Text>}</View><View><Text style={[styles.stepOverline, number === activeStep && styles.activeStepText]}>STEP {number}{number === activeStep ? " · ACTIVE" : ""}</Text><Text style={[styles.stepLabel, number === activeStep && styles.activeStepText]}>{label}</Text></View></Pressable>; })}</View>; }
function AlertBar({ children }: { children: ReactNode }) { return <View style={styles.alertBar}><Icon color={colors.red} icon={AlertTriangle} size={20} />{children}</View>; }
function Field({ label, value, dropdown, full, mono }: { label: string; value: string; dropdown?: boolean; full?: boolean; mono?: boolean }) { return <View style={[styles.field, full && styles.fullField]}><Text style={styles.inputLabel}>{label}</Text><View style={styles.fieldBox}><Text style={[styles.fieldValue, mono && styles.mono]}>{value}</Text>{dropdown ? <Icon color={muted} icon={ChevronDown} size={18} /> : null}</View></View>; }
function Stat({ label, value, suffix }: { label: string; value: string; suffix: string }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value} <Text style={styles.statSuffix}>{suffix}</Text></Text></View>; }
function Summary({ icon, title, value, hint, tone }: { icon: typeof AlertTriangle; title: string; value: string; hint: string; tone: "red" | "amber" | "blue" }) { return <View style={styles.summary}><View style={[styles.summaryIcon, tone === "red" ? styles.redBg : tone === "amber" ? styles.amberBg : styles.blueBg]}><Icon color={tone === "red" ? colors.red : tone === "amber" ? "#D97706" : colors.primary} icon={icon} size={20} /></View><View><Text style={styles.summaryTitle}>{title}</Text><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryHint}>{hint}</Text></View></View>; }
function Tier({ number, title, copy, selected, onPress }: { number: string; title: string; copy: string; selected: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.tier, selected && styles.tierSelected]}><Text style={[styles.tierOverline, selected && styles.blueText]}>LEVEL {number}{selected ? " · SELECTED" : ""}</Text><Text style={styles.tierTitle}>{title}</Text><Text style={styles.tierCopy}>{copy}</Text>{selected ? <View style={styles.selectedCheck}><Icon color={colors.white} icon={Check} size={13} /></View> : null}</Pressable>; }
function Channel({ title, copy, latency, warning = false }: { title: string; copy: string; latency: string; warning?: boolean }) { return <View style={[styles.channel, warning && styles.channelWarning]}><View style={[styles.channelDot, warning && styles.channelDotWarning]} /><View style={styles.channelCopy}><Text style={styles.channelTitle}>{title}</Text><Text style={styles.channelMeta}>{copy}</Text><Text style={[styles.channelLatency, warning && styles.warningText]}>{latency}</Text></View><Text style={styles.channelOn}>On</Text></View>; }
function Token({ text }: { text: string }) { return <View style={styles.token}><Text style={styles.tokenText}>{text}</Text></View>; }
function ReviewRow({ danger = false, label, mono = false, value }: { danger?: boolean; label: string; mono?: boolean; value: string }) { return <View style={styles.reviewRow}><Text style={styles.reviewLabel}>{label}</Text><Text style={[styles.reviewValue, danger && styles.reviewDanger, mono && styles.reviewMono]}>{value}</Text></View>; }
function Payload({ danger = false, label, value }: { danger?: boolean; label: string; value: string }) { return <View style={styles.payloadRow}><Text style={styles.payloadLabel}>{label}</Text><Text style={[styles.payloadValue, danger && styles.reviewDanger]}>{value}</Text></View>; }
function BottomBar({ button, onPress, onSave, saveLabel = "Save draft" }: { button: string; onPress: () => void; onSave?: () => void; saveLabel?: string }) { return <View style={[styles.bottomBar, styles.responsiveWrap]}>{onSave ? <Pressable onPress={onSave} style={styles.saveButton}><Text style={styles.saveText}>{saveLabel}</Text></Pressable> : null}<Text style={styles.bottomHint}>Target audience: <Text style={styles.bold}>Database hazard count</Text>　·　Back to affected area available</Text><Pressable onPress={onPress} style={styles.primaryButton}><Text style={styles.primaryText}>{button}</Text><Icon color={colors.white} icon={ChevronRight} size={18} /></Pressable></View>; }

const styles = StyleSheet.create({
  responsiveWrap: { flexWrap: "wrap" },
  responsiveCard: { minWidth: 280 },
  screen: { backgroundColor: page, flex: 1, flexDirection: "row" },
  sidebar: { backgroundColor: navy, justifyContent: "space-between", paddingBottom: 24, paddingHorizontal: 15, paddingTop: 38, width: 320 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 15, paddingHorizontal: 15 },
  brandMark: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, height: 46, justifyContent: "center", width: 46 },
  brandMarkText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  brand: { color: colors.white, fontSize: 23, fontWeight: "800" },
  brandSub: { color: "#A4B4C9", fontSize: 14, marginTop: 4 },
  nav: { gap: 8, marginTop: 55 },
  navItem: { alignItems: "center", borderRadius: 10, flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingVertical: 15 },
  navSelected: { backgroundColor: "#17294B", borderLeftColor: "#4E9AFF", borderLeftWidth: 3 },
  navText: { color: "#9AAAC2", fontSize: 17 },
  navTextSelected: { color: colors.white, fontWeight: "700" },
  sidebarFooter: { borderTopColor: "#25334A", borderTopWidth: 1, gap: 5, paddingHorizontal: 0, paddingTop: 30 },
  footerTitle: { color: colors.white, fontSize: 14 }, footerText: { color: "#9AAAC2", fontSize: 14 }, connected: { color: "#10D99B", fontSize: 14, marginTop: 12 },
  main: { flex: 1, minWidth: 0 }, topbar: { alignItems: "center", backgroundColor: colors.white, borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", height: 76, justifyContent: "space-between", paddingHorizontal: 40 }, topbarTitle: { color: muted, fontSize: 15, fontWeight: "700", letterSpacing: 0.5 }, protocol: { color: ink }, commander: { color: ink, fontSize: 16, textAlign: "right" }, duty: { color: "#8DA0BB", fontSize: 14 },
  content: { gap: 30, padding: 40, paddingBottom: 120 }, heading: { gap: 8 }, title: { color: ink, fontSize: 32, fontWeight: "800" }, subtitle: { color: muted, fontSize: 19 }, steps: { flexDirection: "row", gap: 15 }, step: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#E1E8F0", borderRadius: 12, borderWidth: 1, flex: 1, flexDirection: "row", gap: 14, minHeight: 80, padding: 16 }, stepActive: { backgroundColor: "#EFF6FF", borderColor: colors.primary, borderWidth: 2 }, stepComplete: { backgroundColor: "#F0FDF9", borderColor: "#86E7C0" }, stepCircle: { alignItems: "center", backgroundColor: "#E8EEF5", borderRadius: 20, height: 38, justifyContent: "center", width: 38 }, stepActiveCircle: { backgroundColor: colors.primary }, stepNumber: { color: "#92A3B9", fontSize: 16, fontWeight: "800" }, activeStepText: { color: colors.primary }, stepOverline: { color: "#9AABC1", fontSize: 14, fontWeight: "700" }, stepLabel: { color: "#71849F", fontSize: 15, marginTop: 3 },
  alertBar: { alignItems: "center", backgroundColor: "#FFF2F1", borderColor: "#FFB9B6", borderLeftColor: colors.red, borderLeftWidth: 4, borderRadius: 11, flexDirection: "row", gap: 16, minHeight: 68, paddingHorizontal: 22 }, alertCopy: { color: "#982929", fontSize: 16 }, alertStrong: { fontWeight: "800" },
  twoColumns: { flexDirection: "row", gap: 30 }, card: { backgroundColor: colors.white, borderColor: "#D9E2EC", borderRadius: 15, borderWidth: 1, flex: 1, minWidth: 500, padding: 30 }, cardHeadingRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" }, cardTitle: { color: ink, fontSize: 21, fontWeight: "800" }, cardSubtitle: { color: muted, fontSize: 14, marginTop: 5 }, outlineButton: { borderColor: "#70A9FF", borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10 }, outlineText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  formGrid: { borderTopColor: "#E6EDF4", borderTopWidth: 1, flexDirection: "row", flexWrap: "wrap", marginTop: 20, paddingTop: 20 }, field: { paddingRight: 14, width: "50%" }, fullField: { width: "100%" }, inputLabel: { color: "#1C3352", fontSize: 14, fontWeight: "700", letterSpacing: 0.4, marginBottom: 8, marginTop: 14 }, fieldBox: { alignItems: "center", borderColor: "#C6D4E4", borderRadius: 9, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 48, paddingHorizontal: 15 }, fieldValue: { color: ink, fontSize: 16 }, mono: { fontFamily: "monospace" }, helperMono: { color: "#8DA2BD", fontFamily: "monospace", fontSize: 13, marginTop: 15 }, locked: { alignItems: "center", backgroundColor: "#F7F9FC", borderRadius: 10, flexDirection: "row", gap: 12, marginTop: 24, padding: 15 }, lockedText: { color: "#49607D", fontSize: 14 },
  triageRow: { flexDirection: "row", justifyContent: "space-between" }, criticalPill: { alignSelf: "flex-start", backgroundColor: "#FFE0DF", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 }, criticalPillText: { color: colors.red, fontSize: 14, fontWeight: "800" }, basinTitle: { color: ink, fontSize: 24, fontWeight: "800", marginTop: 16 }, buildingIcon: { alignItems: "center", backgroundColor: "#EFF6FF", borderColor: "#CBE0FF", borderRadius: 12, borderWidth: 1, height: 50, justifyContent: "center", width: 50 }, statRow: { flexDirection: "row", gap: 20, marginTop: 32 }, stat: { backgroundColor: "#F8FAFC", borderRadius: 13, flex: 1, minHeight: 126, padding: 20 }, statLabel: { color: muted, fontSize: 14, lineHeight: 19 }, statValue: { color: ink, fontFamily: "monospace", fontSize: 29, fontWeight: "800", marginTop: 15 }, statSuffix: { color: "#283E5E", fontFamily: "System", fontSize: 15, fontWeight: "400" }, exposed: { backgroundColor: "#FFF8F7", borderColor: "#FFAAA7", borderRadius: 13, borderWidth: 1, marginTop: 20, padding: 20 }, exposedLabel: { color: colors.red, fontSize: 14, fontWeight: "800" }, exposedValue: { color: colors.red, fontFamily: "monospace", fontSize: 33, fontWeight: "800", marginTop: 8 }, exposedUnit: { fontFamily: "System", fontSize: 16 }, exposedHint: { color: colors.red, fontSize: 14, marginTop: 6 }, successBox: { alignItems: "flex-start", backgroundColor: "#F0FDF9", borderColor: "#72E2B7", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 60, padding: 20 }, successMark: { alignItems: "center", backgroundColor: "#059669", borderRadius: 10, height: 20, justifyContent: "center", width: 20 }, successText: { color: "#145A49", flex: 1, fontSize: 14, lineHeight: 20 },
  summaryCard: { backgroundColor: colors.white, borderColor: "#D9E2EC", borderRadius: 15, borderWidth: 1, padding: 30 }, summaryHeader: { flexDirection: "row", justifyContent: "space-between" }, sectionTitle: { color: "#1F385B", fontSize: 17, fontWeight: "800", letterSpacing: 0.8 }, sync: { color: "#8EA2BD", fontFamily: "monospace", fontSize: 14 }, summaryRow: { flexDirection: "row", gap: 20, marginTop: 24 }, summary: { alignItems: "center", backgroundColor: "#F8FAFC", borderColor: "#DCE5EF", borderRadius: 13, flex: 1, flexDirection: "row", gap: 15, padding: 20 }, summaryIcon: { alignItems: "center", borderRadius: 10, height: 45, justifyContent: "center", width: 45 }, redBg: { backgroundColor: "#FFE1E0" }, amberBg: { backgroundColor: "#FFF2C9" }, blueBg: { backgroundColor: "#DDEBFF" }, summaryTitle: { color: muted, fontSize: 14, fontWeight: "700" }, summaryValue: { color: ink, fontSize: 16, fontWeight: "800", marginTop: 5 }, summaryHint: { color: muted, fontSize: 13, marginTop: 4 },
  bottomBar: { alignItems: "center", backgroundColor: colors.white, borderTopColor: "#D9E2EC", borderTopWidth: 1, bottom: 0, flexDirection: "row", gap: 25, minHeight: 80, paddingHorizontal: 40, position: "absolute", width: "100%" }, saveButton: { borderColor: "#B9C9DC", borderRadius: 8, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 11 }, saveText: { color: "#334B6B", fontSize: 14, fontWeight: "700" }, bottomHint: { color: muted, flex: 1, fontSize: 14, textAlign: "right" }, primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, flexDirection: "row", gap: 10, justifyContent: "center", minWidth: 210, paddingHorizontal: 20, paddingVertical: 14 }, primaryText: { color: colors.white, fontSize: 14, fontWeight: "800" }, bold: { fontWeight: "800" },
  sectionHeading: { color: ink, fontSize: 18, fontWeight: "800" }, tierRow: { flexDirection: "row", gap: 20, marginTop: 22 }, tier: { borderColor: "#D8E2EE", borderRadius: 13, borderWidth: 1, flex: 1, minHeight: 160, padding: 20, position: "relative" }, tierSelected: { backgroundColor: "#F3F8FF", borderColor: colors.primary, borderWidth: 2 }, tierOverline: { color: muted, fontSize: 14, fontWeight: "700" }, blueText: { color: colors.primary }, tierTitle: { color: ink, fontSize: 20, fontWeight: "800", marginTop: 12 }, tierCopy: { color: "#334A69", fontSize: 15, lineHeight: 24, marginTop: 14 }, selectedCheck: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, height: 20, justifyContent: "center", position: "absolute", right: 20, top: 20, width: 20 },
  broadcastTop: { alignItems: "center", borderBottomColor: "#E5ECF4", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingBottom: 16 }, languageTabs: { backgroundColor: "#EDF2F8", borderRadius: 9, flexDirection: "row", padding: 5 }, languageTab: { borderRadius: 6, paddingHorizontal: 13, paddingVertical: 9 }, languageActive: { backgroundColor: colors.primary }, languageText: { color: "#263B58", fontSize: 14 }, languageActiveText: { color: colors.white, fontWeight: "700" }, templateButton: { alignItems: "center", borderColor: "#BCCCE0", borderRadius: 8, flexDirection: "row", gap: 8, paddingHorizontal: 13, paddingVertical: 10 }, templateText: { color: "#253C5A", fontSize: 14, fontWeight: "700" }, messageInput: { borderColor: "#C7D5E5", borderRadius: 10, borderWidth: 1, color: ink, fontSize: 16, lineHeight: 27, minHeight: 145, padding: 15, textAlignVertical: "top" }, progressTrack: { backgroundColor: "#E5ECF4", borderRadius: 4, height: 7, marginTop: 24 }, progressFill: { backgroundColor: "#10B981", borderRadius: 4, height: 7, width: "59%" }, characterRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 9 }, characterText: { color: muted, fontSize: 13 }, safeText: { color: "#059669", fontSize: 13 }, tokenHint: { borderTopColor: "#E5ECF4", borderTopWidth: 1, color: "#8BA0BB", fontSize: 13, marginTop: 24, paddingTop: 14 }, tokenRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }, token: { backgroundColor: "#F8FAFC", borderColor: "#D1DCE9", borderRadius: 18, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 }, tokenText: { color: "#354B69", fontSize: 13 },
  channelCount: { backgroundColor: "#EAF2FF", borderRadius: 7, paddingHorizontal: 12, paddingVertical: 7 }, channelCountText: { color: colors.primary, fontSize: 14, fontWeight: "700" }, channel: { alignItems: "flex-start", borderColor: "#DCE5EF", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 16, padding: 17 }, channelWarning: { borderColor: "#FFD36B" }, channelDot: { backgroundColor: "#10B981", borderRadius: 5, height: 10, marginTop: 4, width: 10 }, channelDotWarning: { backgroundColor: "#F59E0B" }, channelCopy: { flex: 1 }, channelTitle: { color: ink, fontSize: 15, fontWeight: "800" }, channelMeta: { color: muted, fontSize: 14, marginTop: 11 }, channelLatency: { color: "#059669", fontSize: 13, marginTop: 10 }, warningText: { color: "#D97706" }, channelOn: { borderColor: "#CBD8E7", borderRadius: 4, borderWidth: 1, color: "#4C6685", fontSize: 13, paddingHorizontal: 9, paddingVertical: 5 },
  issuingBar: { alignItems: "center", backgroundColor: "#FFF9EB", borderColor: "#FBBF24", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 14, minHeight: 68, paddingHorizontal: 20 }, issuingDot: { backgroundColor: "#F59E0B", borderRadius: 7, height: 14, width: 14 }, issuingText: { color: "#4A2515", flex: 1, fontSize: 15, fontWeight: "700" }, cancelButton: { borderColor: "#F2B900", borderRadius: 6, borderWidth: 1, paddingHorizontal: 17, paddingVertical: 9 }, cancelText: { color: "#8A341E", fontSize: 14, fontWeight: "800" },
  reviewColumns: { flexDirection: "row", gap: 30 }, reviewCard: { backgroundColor: colors.white, borderColor: "#D9E2EC", borderRadius: 14, borderWidth: 1, flex: 1, minWidth: 300, padding: 26 }, reviewHeader: { alignItems: "center", borderBottomColor: "#E5ECF4", borderBottomWidth: 1, flexDirection: "row", gap: 12, paddingBottom: 18 }, reviewTitle: { color: ink, fontSize: 18, fontWeight: "800", lineHeight: 26 }, readyPill: { alignItems: "center", borderColor: "#6EE7B7", borderRadius: 20, flexDirection: "row", gap: 7, marginLeft: "auto", paddingHorizontal: 12, paddingVertical: 8 }, readyDot: { backgroundColor: "#10B981", borderRadius: 5, height: 9, width: 9 }, readyText: { color: "#047857", fontSize: 15, fontWeight: "800" }, broadcastId: { backgroundColor: "#EFF6FF", borderColor: "#A7CBFF", borderRadius: 5, borderWidth: 1, padding: 8 }, broadcastIdText: { color: colors.primary, fontFamily: "monospace", fontSize: 16, lineHeight: 23 }, reviewRows: { marginTop: 14 }, reviewRow: { alignItems: "center", borderBottomColor: "#EDF1F5", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 40 }, reviewLabel: { color: muted, fontSize: 14 }, reviewValue: { color: ink, fontSize: 14, fontWeight: "700" }, reviewDanger: { color: colors.red }, reviewMono: { fontFamily: "monospace", fontWeight: "400" }, reviewSection: { color: "#8FA3BF", fontSize: 18, fontWeight: "800", letterSpacing: 1, marginTop: 22 }, areaBox: { backgroundColor: "#F8FAFC", borderRadius: 10, gap: 8, marginTop: 12, padding: 14 }, areaLine: { color: "#354C6A", fontSize: 13, lineHeight: 18 }, extentRow: { flexDirection: "row", gap: 10, marginTop: 12 }, extentBox: { backgroundColor: "#F8FAFC", borderColor: "#E1E8F0", borderRadius: 8, borderWidth: 1, flex: 1, padding: 13 }, extentDanger: { backgroundColor: "#FFF8F7", borderColor: "#FFB4B3", borderRadius: 8, borderWidth: 1, flex: 1, padding: 13 }, extentLabel: { color: muted, fontSize: 13 }, extentValue: { color: ink, fontSize: 15, fontWeight: "800", marginTop: 6 }, extentLabelDanger: { color: colors.red, fontSize: 13 }, extentValueDanger: { color: colors.red, fontSize: 15, fontWeight: "800", lineHeight: 19, marginTop: 6 },
  previewHeader: { alignItems: "center", borderBottomColor: "#E5ECF4", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingBottom: 18 }, emergencyPill: { backgroundColor: "#FFE1E0", borderColor: "#FFB1AE", borderRadius: 28, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 8 }, emergencyText: { color: colors.red, fontSize: 16, fontWeight: "800", lineHeight: 20 }, messagePreview: { backgroundColor: "#F8FAFC", borderColor: "#DCE5EF", borderRadius: 13, marginTop: 20, padding: 20 }, messageIcon: { alignItems: "center", backgroundColor: colors.red, borderRadius: 4, height: 29, justifyContent: "center", width: 29 }, messageTitle: { color: ink, fontSize: 20, fontWeight: "800", lineHeight: 27, marginTop: -31, paddingLeft: 43 }, messageBody: { color: "#1A2E4B", fontSize: 15, lineHeight: 24, marginTop: 22 }, tagDivider: { borderTopColor: "#DCE5EF", borderTopWidth: 1, marginTop: 14 }, previewTag: { alignSelf: "flex-start", backgroundColor: "#E5EBF2", borderRadius: 4, color: "#334C6D", fontSize: 14, marginTop: 8, paddingHorizontal: 9, paddingVertical: 5 }, behaviourBox: { backgroundColor: "#F0F7FF", borderColor: "#B9D6FF", borderRadius: 9, marginTop: 20, padding: 15 }, behaviourTitle: { color: "#163C8D", fontSize: 14, fontWeight: "800" }, behaviourText: { color: muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
  channelBadge: { backgroundColor: "#EEF3F8", borderColor: "#D9E3EE", borderRadius: 5, borderWidth: 1, padding: 10 }, channelBadgeText: { color: "#203652", fontSize: 16, fontWeight: "800", lineHeight: 23 }, terminal: { backgroundColor: "#0D162A", borderRadius: 13, marginTop: 20, padding: 20 }, terminalTop: { borderBottomColor: "#26334A", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingBottom: 14 }, terminalLabel: { color: "#A8B7CE", fontFamily: "monospace", fontSize: 13, lineHeight: 19 }, encoded: { color: "#10D99B", fontFamily: "monospace", fontSize: 13, fontWeight: "800" }, terminalText: { color: "#F5F7FB", fontFamily: "monospace", fontSize: 14, lineHeight: 24, marginTop: 16 }, payloadBox: { backgroundColor: "#F8FAFC", borderRadius: 9, gap: 13, marginTop: 20, padding: 16 }, payloadRow: { flexDirection: "row", justifyContent: "space-between" }, payloadLabel: { color: muted, fontSize: 14 }, payloadValue: { color: ink, fontFamily: "monospace", fontSize: 14, fontWeight: "700" }, authorizationBar: { alignItems: "center", backgroundColor: colors.white, borderTopColor: "#D9E2EC", borderTopWidth: 1, bottom: 0, flexDirection: "row", gap: 20, minHeight: 80, paddingHorizontal: 40, position: "absolute", width: "100%" }, editParameters: { color: colors.primary, fontSize: 14, textDecorationLine: "underline" }, keyRequired: { color: "#91A3BA", flex: 1, fontFamily: "monospace", fontSize: 18, textAlign: "right" }, confirmButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 8, flexDirection: "row", gap: 10, justifyContent: "center", minWidth: 255, paddingHorizontal: 20, paddingVertical: 14 },
});
