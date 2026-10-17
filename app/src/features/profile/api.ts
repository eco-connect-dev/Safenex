import { supabase } from "@/lib/supabase";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  district: string;
  role: "citizen" | "volunteer" | "duty_officer" | "district_officer" | "dmc_officer" | "dmc_analyst";
};

type ProfileRow = Omit<UserProfile, "email">;

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Sign in to view and edit your profile.");
  return data.user;
}

export async function getMyProfile(): Promise<UserProfile> {
  const user = await getCurrentUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,phone,district,role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: data?.full_name ?? String(metadata.full_name ?? ""),
    phone: data?.phone ?? String(metadata.phone ?? ""),
    district: data?.district ?? String(metadata.district ?? ""),
    role: data?.role ?? "citizen",
  };
}

export async function saveMyProfile(input: Pick<UserProfile, "full_name" | "phone" | "district">): Promise<UserProfile> {
  const user = await getCurrentUser();
  const fullName = input.full_name.trim();
  if (!fullName) throw new Error("Enter your full name before saving.");

  const values = {
    full_name: fullName,
    phone: input.phone.trim() || null,
    district: input.district.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", user.id)
    .select("id,full_name,phone,district,role")
    .maybeSingle();

  if (updateError) throw updateError;

  let row = updated as ProfileRow | null;
  if (!row) {
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: values.full_name,
        phone: values.phone,
        district: values.district,
      })
      .select("id,full_name,phone,district,role")
      .single();
    if (insertError) throw insertError;
    row = inserted as ProfileRow;
  }

  return { ...row, email: user.email ?? "" };
}
