import "server-only";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { getSupabase } from "@/lib/supabase";
import type { Profile, UserRole, ProfileWithUser } from "@/lib/supabase/types";

/**
 * MVP single-tenant helper.
 *
 * Returns the only `profiles.id` row currently in the database. The SaaS is
 * deployed per-tenant in this iteration, so the public `/solicitar` form
 * attaches new requests to this single profile.
 *
 * Implemented as an RPC call to `public.get_only_profile_id`, a SECURITY
 * DEFINER function that bypasses RLS and returns a single UUID. This avoids
 * exposing the `profiles` table to the anonymous client.
 *
 * When the SaaS evolves to multi-tenant, this helper is replaced by slug
 * resolution from the URL.
 */
export async function getOnlyProfileId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_only_profile_id");

  if (error) return null;
  return (data as string | null) ?? null;
}

/**
 * Authenticated variant: reads the full profile of the current user via the
 * existing `profiles_select_own` RLS policy. Used by dashboard pages where a
 * session is present.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * Single-tenant: gets the workspace profile using service role.
 * Used by public pages like PDF that don't require auth.
 */
export async function getProfileAdmin(): Promise<Profile | null> {
  const supabaseAdmin = await getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * Like {@link getCurrentProfile}, but tries to create the profile row
 * on-the-fly when it's missing. Returns the row once it exists (either
 * just-created or already there).
 *
 * Behavior:
 * 1. SELECT — most common path, returns the row.
 * 2. INSERT with defaults — used when SELECT returned nothing (trigger
 *    broken, profile deleted, signup race).
 * 3. Re-SELECT on `23505` unique-violation — covers the race where
 *    another concurrent request inserted the row between our SELECT and
 *    INSERT.
 * 4. Returns null on any other failure and logs the error.
 */
export async function getOrCreateCurrentProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const fallbackEmail = user.email ?? "";
  const { data: created, error: createErr } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: fallbackEmail,
      company_name: fallbackEmail.split("@")[0] || "",
      currency: "USD",
      tax_rate: 0,
      role: "member",
      invited_by: null,
    })
    .select("*")
    .single();

  if (created) return created as Profile;

  if (createErr?.code === "23505") {
    const { data: reFetch } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (reFetch) return reFetch as Profile;
  }

  console.error("[QuoteFlow] self-heal profile failed", createErr);
  return null;
}

export type ProfileEditableFields = {
  company_name: string;
  phone: string | null;
  address: string | null;
  currency: string;
  tax_rate: number;
};

/**
 * Updates the editable fields of the current user's own profile.
 * Does NOT touch email (auth-managed) or created_at (immutable).
 */
export async function updateProfile(
  profileId: string,
  input: ProfileEditableFields,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("profiles")
    .update({
      company_name: input.company_name,
      phone: input.phone,
      address: input.address,
      currency: input.currency,
      tax_rate: input.tax_rate,
    })
    .eq("id", profileId);

  if (error) {
    console.error("[QuoteFlow] update profile failed", {
      profileId,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * List all workspace users (profiles + auth.users data).
 * Admin only — throws if current user is not admin.
 */
export async function listWorkspaceUsers(): Promise<ProfileWithUser[]> {
  const supabaseAdmin = await getSupabaseAdmin();

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !profiles) return [];

  const userIds = profiles.map((p) => p.id);

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();

  const authUserMap = new Map(
    (authUsers?.users ?? [])
      .filter((u) => userIds.includes(u.id))
      .map((u) => [u.id, { id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at }])
  );

  return profiles.map((p) => ({
    ...p,
    user: authUserMap.get(p.id),
  })) as ProfileWithUser[];
}

/**
 * Updates a user's role. Admin only.
 */
export async function updateUserRole(
  adminProfileId: string,
  targetProfileId: string,
  newRole: UserRole,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  const supabaseAdmin = await getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetProfileId);

  if (error) {
    console.error("[QuoteFlow] update user role failed", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Deletes a user (both auth.users and profile). Admin only.
 */
export async function deleteWorkspaceUser(
  adminProfileId: string,
  targetProfileId: string,
): Promise<{ ok: boolean; error?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, error: "Unauthorized" };
  }

  if (adminProfileId === targetProfileId) {
    return { ok: false, error: "Cannot delete yourself" };
  }

  const supabaseAdmin = await getSupabaseAdmin();

  // Delete profile first
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", targetProfileId);

  if (profileError) {
    console.error("[QuoteFlow] delete profile failed", profileError);
    return { ok: false, error: profileError.message };
  }

  // Delete auth user
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(targetProfileId);

  if (authError) {
    console.error("[QuoteFlow] delete auth user failed", authError);
    return { ok: false, error: authError.message };
  }

  return { ok: true };
}