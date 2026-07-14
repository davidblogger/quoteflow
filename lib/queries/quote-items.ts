import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  QuoteItem,
  QuoteItemInsert,
} from "@/lib/types/quote-item";

export type { QuoteItem, QuoteItemInsert } from "@/lib/types/quote-item";

export async function listItems(quoteId: string): Promise<QuoteItem[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quoteId)
    .order("position", { ascending: true });

  if (error || !data) return [];
  return data as QuoteItem[];
}

/**
 * Adds a line item, then recomputes the parent quote's subtotal/total.
 * Ownership of the quote is checked before insert.
 */
export async function addQuoteItem(
  profileId: string,
  quoteId: string,
  input: QuoteItemInsert,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();

  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .select("id, profile_id, tax_rate")
    .eq("id", quoteId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (qErr || !quote) {
    return { ok: false, error: "quote_not_found" };
  }

  const { data: maxRow } = await supabase
    .from("quote_items")
    .select("position")
    .eq("quote_id", quoteId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextPosition = (maxRow?.position ?? -1) + 1;

  const { error: insertErr } = await supabase.from("quote_items").insert({
    quote_id: quoteId,
    description: input.description,
    quantity: input.quantity,
    unit_price: input.unit_price,
    position: nextPosition,
  });

  if (insertErr) {
    console.error("[QuoteFlow] insert quote item failed", {
      quoteId,
      code: insertErr.code,
      message: insertErr.message,
    });
    return { ok: false, error: insertErr.message };
  }

  await recomputeQuoteTotals(profileId, quoteId);
  return { ok: true };
}

/**
 * Updates a line item (ownership verified), then recomputes the parent
 * quote's subtotal/total.
 */
export async function updateQuoteItem(
  profileId: string,
  itemId: string,
  input: QuoteItemInsert,
): Promise<{ ok: boolean; quoteId?: string; error?: string }> {
  const supabase = await getSupabaseServer();

  const { data: item } = await supabase
    .from("quote_items")
    .select("id, quote_id")
    .eq("id", itemId)
    .maybeSingle();
  if (!item) return { ok: false, error: "item_not_found" };

  const { data: quote } = await supabase
    .from("quotes")
    .select("id")
    .eq("id", item.quote_id)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!quote) return { ok: false, error: "quote_not_found" };

  const { error } = await supabase
    .from("quote_items")
    .update({
      description: input.description,
      quantity: input.quantity,
      unit_price: input.unit_price,
    })
    .eq("id", itemId);

  if (error) {
    console.error("[QuoteFlow] update quote item failed", {
      itemId,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }

  await recomputeQuoteTotals(profileId, item.quote_id);
  return { ok: true, quoteId: item.quote_id };
}

/**
 * Deletes a line item (ownership verified via join to quotes), then
 * recomputes the parent quote's subtotal/total.
 */
export async function deleteQuoteItem(
  profileId: string,
  itemId: string,
): Promise<{ ok: boolean; quoteId?: string; error?: string }> {
  const supabase = await getSupabaseServer();

  const { data: item, error: iErr } = await supabase
    .from("quote_items")
    .select("id, quote_id")
    .eq("id", itemId)
    .maybeSingle();

  if (iErr || !item) return { ok: false, error: "item_not_found" };

  const { data: quote, error: qErr } = await supabase
    .from("quotes")
    .select("id")
    .eq("id", item.quote_id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (qErr || !quote) return { ok: false, error: "quote_not_found" };

  const { error: delErr } = await supabase
    .from("quote_items")
    .delete()
    .eq("id", itemId);

  if (delErr) {
    console.error("[QuoteFlow] delete quote item failed", {
      itemId,
      code: delErr.code,
      message: delErr.message,
    });
    return { ok: false, error: delErr.message };
  }

  await recomputeQuoteTotals(profileId, item.quote_id);
  return { ok: true, quoteId: item.quote_id };
}

/**
 * Sums all line items, applies the quote's tax_rate, and writes
 * subtotal + total back to the quotes row.
 */
async function recomputeQuoteTotals(
  profileId: string,
  quoteId: string,
): Promise<void> {
  const supabase = await getSupabaseServer();

  const { data: quote } = await supabase
    .from("quotes")
    .select("tax_rate")
    .eq("id", quoteId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!quote) return;

  const items = await listItems(quoteId);
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.quantity) * Number(it.unit_price),
    0,
  );
  const total = subtotal * (1 + Number(quote.tax_rate) / 100);

  await supabase
    .from("quotes")
    .update({ subtotal, total })
    .eq("id", quoteId)
    .eq("profile_id", profileId);
}