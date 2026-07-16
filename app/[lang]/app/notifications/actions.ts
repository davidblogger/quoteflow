"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/queries/notifications";

export async function markReadAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const notificationId = (formData.get("notificationId") ?? "").toString();
  const link = (formData.get("link") ?? "").toString();
  const lang = (formData.get("lang") ?? "en").toString();

  if (!notificationId) return { ok: false, message: "error" };

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  await markNotificationAsRead(user.id, notificationId);

  if (link) redirect(`/${lang}${link}`);

  return { ok: true, message: "success" };
}

export async function markAllReadAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const lang = (formData.get("lang") ?? "en").toString();

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  await markAllNotificationsAsRead(user.id);

  return { ok: true, message: "success" };
}
