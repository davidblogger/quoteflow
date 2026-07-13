import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/**
 * MVP single-tenant helper.
 *
 * Returns the only `profiles.id` row currently in the database. The SaaS is
 * deployed per-tenant in this iteration, so the public `/solicitar` form
 * attaches new requests to this single profile.
 *
 * When the SaaS evolves to multi-tenant, this helper is replaced by slug
 * resolution from the URL.
 */
export async function getOnlyProfileId(): Promise<string | null> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export async function getOnlyProfile(): Promise<Profile | null> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}