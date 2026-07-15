"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  createFollowup,
  completeFollowup,
  cancelFollowup,
  reopenFollowup,
  deleteFollowup,
} from "@/lib/queries/followups";
import type { FollowupFieldErrors } from "@/lib/types/followup";

export type FollowupFormState = {
  ok: boolean;
  message: "idle" | "success" | "invalid" | "error";
  fieldErrors?: FollowupFieldErrors;
  formError?: "generic";
};

function parseDateInput(input: FormDataEntryValue | null): string | null {
  const raw = (input ?? "").toString().trim();
  if (!raw) return null;
  // datetime-local has no timezone; treat it as local midnight and
  // convert to an ISO string so Postgres can sort on it cleanly.
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export async function createFollowupAction(
  _prev: FollowupFormState,
  formData: FormData,
): Promise<FollowupFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const subject = (formData.get("subject") ?? "").toString().trim();
  const notesRaw = (formData.get("notes") ?? "").toString().trim();
  const clientIdRaw = (formData.get("clientId") ?? "").toString().trim();
  const dueAt = parseDateInput(formData.get("dueAt"));

  const fieldErrors: FollowupFieldErrors = {};
  if (!subject) fieldErrors.subject = "required";
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await createFollowup(user.id, {
    subject,
    notes: notesRaw || null,
    due_at: dueAt,
    client_id: clientIdRaw || null,
  });

  if (!result.ok) return { ok: false, message: "error", formError: "generic" };

  revalidatePath(`/${lang}/app/followup`);
  revalidatePath(`/${lang}/app`);
  revalidatePath(`/${lang}/app/clients`);
  return { ok: true, message: "success" };
}

function revalidateFollowupPaths(lang: string, clientId?: string | null) {
  revalidatePath(`/${lang}/app/followup`);
  revalidatePath(`/${lang}/app`);
  if (clientId) revalidatePath(`/${lang}/app/clients/${clientId}`);
}

async function runOnFollowup(
  formData: FormData,
  fn: (
    profileId: string,
    followupId: string,
  ) => Promise<{ ok: boolean; error?: string }>,
) {
  const lang = (formData.get("lang") ?? "en").toString();
  const followupId = (formData.get("followupId") ?? "").toString();
  const clientId = (formData.get("clientId") ?? "").toString() || null;
  if (!followupId) redirect(`/${lang}/app/followup`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login`);

  const result = await fn(user.id, followupId);
  revalidateFollowupPaths(lang, clientId);
  if (!result.ok) {
    console.error("[QuoteFlow] followup action failed", result);
  }
  redirect(`/${lang}/app/followup`);
}

export async function completeFollowupAction(formData: FormData) {
  await runOnFollowup(formData, completeFollowup);
}

export async function cancelFollowupAction(formData: FormData) {
  await runOnFollowup(formData, cancelFollowup);
}

export async function reopenFollowupAction(formData: FormData) {
  await runOnFollowup(formData, reopenFollowup);
}

export async function deleteFollowupAction(formData: FormData) {
  await runOnFollowup(formData, deleteFollowup);
}