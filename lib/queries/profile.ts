import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase/types";

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