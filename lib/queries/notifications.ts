import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types/notification";
import type { SupabaseClient } from "@supabase/supabase-js";

export type { Notification } from "@/lib/types/notification";

export async function listNotifications(
  profileId: string,
  limit = 20,
  offset = 0,
  supabase?: SupabaseClient,
): Promise<Notification[]> {
  const client = supabase ?? await getSupabaseServer();
  const { data, error } = await client
    .from("notifications")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];
  return data as Notification[];
}

export async function countUnreadNotifications(
  profileId: string,
): Promise<number> {
  const supabase = await getSupabaseServer();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationAsRead(
  profileId: string,
  notificationId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("profile_id", profileId)
    .is("read_at", null);

  if (error) {
    console.error("[QuoteFlow] mark notification as read failed", {
      id: notificationId,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function markAllNotificationsAsRead(
  profileId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", profileId)
    .is("read_at", null);

  if (error) {
    console.error("[QuoteFlow] mark all notifications as read failed", {
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
