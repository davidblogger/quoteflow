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