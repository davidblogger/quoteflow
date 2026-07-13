"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { parseStatusFilter } from "@/lib/types/request";
import { updateRequestStatus } from "@/lib/queries/requests";

export type UpdateStatusState = {
  ok: boolean;
  message: "idle" | "success" | "error";
};

export async function updateStatusAction(
  _prev: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const id = (formData.get("id") ?? "").toString();
  const status = parseStatusFilter(formData.get("status")?.toString()) ?? null;
  const lang = (formData.get("lang") ?? "en").toString();
  const back = (formData.get("back") ?? "").toString();

  if (!id || !status) {
    return { ok: false, message: "error" };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "error" };
  }

  const result = await updateRequestStatus(user.id, id, status);
  if (!result.ok) {
    return { ok: false, message: "error" };
  }

  revalidatePath(`/${lang}/app/requests`);
  revalidatePath(`/${lang}/app/requests/${id}`);
  if (back) revalidatePath(back);

  return { ok: true, message: "success" };
}