"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  createQuote,
  updateQuoteStatus,
} from "@/lib/queries/quotes";
import { parseQuoteStatus } from "@/lib/types/quote";

export type QuoteFormState = {
  ok: boolean;
  message: "idle" | "invalid" | "error";
  fieldErrors?: Partial<
    Record<
      "client" | "title" | "validUntil" | "taxRate",
      "required" | "clientRequired" | "invalidNumber"
    >
  >;
};

export async function createQuoteAction(
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const clientId = (formData.get("clientId") ?? "").toString();
  const title = (formData.get("title") ?? "").toString().trim();
  const currency = (formData.get("currency") ?? "USD").toString().trim() || "USD";
  const taxRateRaw = (formData.get("taxRate") ?? "").toString().trim();
  const validUntil = (formData.get("validUntil") ?? "").toString().trim();
  const notes = (formData.get("notes") ?? "").toString().trim();

  const fieldErrors: QuoteFormState["fieldErrors"] = {};
  if (!clientId) fieldErrors.client = "clientRequired";
  if (!title) fieldErrors.title = "required";

  let taxRate = 0;
  if (taxRateRaw) {
    const parsed = Number(taxRateRaw);
    if (Number.isNaN(parsed) || parsed < 0) {
      fieldErrors.taxRate = "invalidNumber";
    } else {
      taxRate = parsed;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await createQuote(user.id, {
    client_id: clientId,
    title,
    currency,
    tax_rate: taxRate,
    valid_until: validUntil || null,
    notes: notes || null,
  });

  if (!result.ok || !result.id) {
    return { ok: false, message: "error" };
  }

  revalidatePath(`/${lang}/app/quotes`);
  redirect(`/${lang}/app/quotes/${result.id}`);
}

export async function updateQuoteStatusAction(
  _prev: { ok: boolean; message: "idle" | "success" | "error" },
  formData: FormData,
): Promise<{ ok: boolean; message: "idle" | "success" | "error" }> {
  const lang = (formData.get("lang") ?? "en").toString();
  const id = (formData.get("id") ?? "").toString();
  const status = parseQuoteStatus(formData.get("status")?.toString());

  if (!id || !status) {
    return { ok: false, message: "error" };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await updateQuoteStatus(user.id, id, status);
  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${lang}/app/quotes`);
  revalidatePath(`/${lang}/app/quotes/${id}`);

  return { ok: true, message: "success" };
}