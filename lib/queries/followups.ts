import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  Followup,
  FollowupInsert,
  FollowupStatus,
} from "@/lib/types/followup";

export type { Followup, FollowupInsert, FollowupStatus } from "@/lib/types/followup";

/**
 * All followups for the current profile, ordered so the most actionable
 * ones float to the top: overdue first, then today, then upcoming by
 * due_at, then completed/cancelled by most-recent activity.
 */
export async function listFollowups(profileId: string): Promise<Followup[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("followups")
    .select("*")
    .eq("profile_id", profileId)
    .order("status", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Followup[];
}

export async function listFollowupsForClient(
  profileId: string,
  clientId: string,
): Promise<Followup[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("followups")
    .select("*")
    .eq("profile_id", profileId)
    .eq("client_id", clientId)
    .order("due_at", { ascending: true, nullsFirst: false });

  if (error || !data) return [];
  return data as Followup[];
}

export async function createFollowup(
  profileId: string,
  input: FollowupInsert,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("followups")
    .insert({
      profile_id: profileId,
      client_id: input.client_id ?? null,
      quote_id: input.quote_id ?? null,
      subject: input.subject,
      notes: input.notes ?? null,
      due_at: input.due_at ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[QuoteFlow] create followup failed", error);
    return { ok: false, error: error?.message };
  }
  return { ok: true, id: data.id };
}

async function setStatus(
  profileId: string,
  followupId: string,
  status: FollowupStatus,
  completed: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const patch: Record<string, unknown> = { status };
  if (completed) patch.completed_at = new Date().toISOString();
  const { error } = await supabase
    .from("followups")
    .update(patch)
    .eq("id", followupId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] update followup status failed", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function completeFollowup(
  profileId: string,
  followupId: string,
) {
  return setStatus(profileId, followupId, "done", true);
}

export async function cancelFollowup(
  profileId: string,
  followupId: string,
) {
  return setStatus(profileId, followupId, "cancelled", false);
}

export async function reopenFollowup(
  profileId: string,
  followupId: string,
) {
  return setStatus(profileId, followupId, "pending", false);
}

export async function deleteFollowup(
  profileId: string,
  followupId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("followups")
    .delete()
    .eq("id", followupId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] delete followup failed", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export type FollowupCounts = {
  overdue: number;
  dueToday: number;
  upcoming: number;
  completed: number;
};

/**
 * Aggregate counts for the sidebar badge. Only counts pending rows
 * that have a due_at; rows without a due_at go to "upcoming" by default
 * (they're loose reminders).
 */
export async function countFollowupsByUrgency(
  profileId: string,
  now: Date = new Date(),
): Promise<FollowupCounts> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("followups")
    .select("status, due_at")
    .eq("profile_id", profileId);

  const counts: FollowupCounts = {
    overdue: 0,
    dueToday: 0,
    upcoming: 0,
    completed: 0,
  };
  if (error || !data) return counts;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  for (const row of data) {
    if (row.status === "done" || row.status === "cancelled") {
      counts.completed += 1;
      continue;
    }
    if (!row.due_at) {
      counts.upcoming += 1;
      continue;
    }
    const due = new Date(row.due_at);
    if (due < startOfToday) counts.overdue += 1;
    else if (due < endOfToday) counts.dueToday += 1;
    else counts.upcoming += 1;
  }
  return counts;
}