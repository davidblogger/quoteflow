"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  addQuoteItem,
  updateQuoteItem,
  deleteQuoteItem,
} from "@/lib/queries/quote-items";
import { updateQuote } from "@/lib/queries/quotes";
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

export type EditItemFormState = {
  ok: boolean;
  message: "idle" | "invalid" | "error";
  fieldErrors?: QuoteItemFieldErrors;
};

export async function updateQuoteItemAction(
  _prev: EditItemFormState,
  formData: FormData,
): Promise<EditItemFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const quoteId = (formData.get("quoteId") ?? "").toString();
  const itemId = (formData.get("itemId") ?? "").toString();

  const description = (formData.get("description") ?? "").toString().trim();
  const quantity = parseDecimal(formData.get("quantity"));
  const unitPrice = parseDecimal(formData.get("unitPrice"));

  const fieldErrors: EditItemFormState["fieldErrors"] = {};
  if (!description) fieldErrors.description = "required";
  if (quantity === null || quantity <= 0) fieldErrors.quantity = "invalidNumber";
  if (unitPrice === null || unitPrice < 0) fieldErrors.unit_price = "invalidNumber";

  if (!quoteId || !itemId || Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await updateQuoteItem(user.id, itemId, {
    description,
    quantity: quantity as number,
    unit_price: unitPrice as number,
  });

  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${lang}/app/quotes/${quoteId}`);
  revalidatePath(`/${lang}/app/quotes`);

  redirect(`/${lang}/app/quotes/${quoteId}`);
}

export type EditQuoteFormState = {
  ok: boolean;
  message: "idle" | "invalid" | "error";
  fieldErrors?: Partial<
    Record<
      "title" | "currency" | "taxRate" | "validUntil",
      "required" | "invalidNumber"
    >
  >;
};

export async function updateQuoteAction(
  _prev: EditQuoteFormState,
  formData: FormData,
): Promise<EditQuoteFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const quoteId = (formData.get("quoteId") ?? "").toString();

  const title = (formData.get("title") ?? "").toString().trim();
  const currency = (formData.get("currency") ?? "USD").toString().trim() || "USD";
  const taxRateRaw = (formData.get("taxRate") ?? "").toString().trim();
  const validUntilRaw = (formData.get("validUntil") ?? "").toString().trim();
  const notes = (formData.get("notes") ?? "").toString().trim();

  const fieldErrors: EditQuoteFormState["fieldErrors"] = {};
  if (!title) fieldErrors.title = "required";

  let taxRate = 0;
  if (taxRateRaw) {
    const parsed = Number(taxRateRaw.replace(",", "."));
    if (Number.isNaN(parsed) || parsed < 0) {
      fieldErrors.taxRate = "invalidNumber";
    } else {
      taxRate = parsed;
    }
  }

  if (!quoteId || Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await updateQuote(user.id, quoteId, {
    title,
    currency,
    tax_rate: taxRate,
    valid_until: validUntilRaw || null,
    notes: notes || null,
  });

  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${lang}/app/quotes/${quoteId}`);
  revalidatePath(`/${lang}/app/quotes`);

  redirect(`/${lang}/app/quotes/${quoteId}`);
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