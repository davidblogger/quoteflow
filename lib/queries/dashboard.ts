import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function countNewRequestsThisWeek(profileId: string): Promise<number> {
  const supabase = await getSupabaseServer();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { count, error } = await supabase
    .from("requests")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .gte("created_at", oneWeekAgo.toISOString());

  if (error || count === null) return 0;
  return count;
}

export async function countPendingQuotes(profileId: string): Promise<number> {
  const supabase = await getSupabaseServer();
  const { count, error } = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "sent");

  if (error || count === null) return 0;
  return count;
}

export async function countActiveClientsLast30Days(profileId: string): Promise<number> {
  const supabase = await getSupabaseServer();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count, error } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("status", "active")
    .gte("updated_at", thirtyDaysAgo.toISOString());

  if (error || count === null) return 0;
  return count;
}
