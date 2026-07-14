"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  addQuoteItem,
  deleteQuoteItem,
} from "@/lib/queries/quote-items";
import type { QuoteItemFieldErrors } from "@/lib/types/quote-item";

export type AddItemFormState = {
  ok: boolean;
  message: "idle" | "invalid" | "error";
  fieldErrors?: QuoteItemFieldErrors;
};

function parseDecimal(input: FormDataEntryValue | null): number | null {
  const raw = (input ?? "").toString().trim();
  if (!raw) return null;
  const normalized = raw.replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export async function addQuoteItemAction(
  _prev: AddItemFormState,
  formData: FormData,
): Promise<AddItemFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const quoteId = (formData.get("quoteId") ?? "").toString();

  const description = (formData.get("description") ?? "").toString().trim();
  const quantity = parseDecimal(formData.get("quantity"));
  const unitPrice = parseDecimal(formData.get("unitPrice"));

  const fieldErrors: AddItemFormState["fieldErrors"] = {};
  if (!description) fieldErrors.description = "required";
  if (quantity === null || quantity <= 0) fieldErrors.quantity = "invalidNumber";
  if (unitPrice === null || unitPrice < 0) fieldErrors.unit_price = "invalidNumber";

  if (!quoteId || Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await addQuoteItem(user.id, quoteId, {
    description,
    quantity: quantity as number,
    unit_price: unitPrice as number,
  });

  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${lang}/app/quotes/${quoteId}`);
  revalidatePath(`/${lang}/app/quotes`);

  return { ok: true, message: "idle" };
}

export async function deleteQuoteItemAction(formData: FormData): Promise<void> {
  const lang = (formData.get("lang") ?? "en").toString();
  const itemId = (formData.get("itemId") ?? "").toString();
  const quoteId = (formData.get("quoteId") ?? "").toString();
  if (!itemId || !quoteId) return;

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await deleteQuoteItem(user.id, itemId);

  revalidatePath(`/${lang}/app/quotes/${quoteId}`);
  revalidatePath(`/${lang}/app/quotes`);
}