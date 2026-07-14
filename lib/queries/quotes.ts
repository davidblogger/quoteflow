import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  Quote,
  QuoteInsert,
  QuoteStatus,
} from "@/lib/types/quote";

export {
  QUOTE_STATUSES,
  parseQuoteStatus,
  type Quote,
  type QuoteInsert,
  type QuoteStatus,
  type QuoteStatusLabels,
} from "@/lib/types/quote";

export async function listQuotes(profileId: string): Promise<Quote[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Quote[];
}

export async function getQuoteById(
  profileId: string,
  id: string,
): Promise<Quote | null> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Quote;
}

export async function createQuote(
  profileId: string,
  input: QuoteInsert,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      profile_id: profileId,
      client_id: input.client_id,
      title: input.title,
      currency: input.currency ?? "USD",
      tax_rate: input.tax_rate ?? 0,
      valid_until: input.valid_until ?? null,
      notes: input.notes ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[QuoteFlow] create quote failed", {
      code: error?.code,
      message: error?.message,
    });
    return { ok: false, error: error?.message };
  }
  return { ok: true, id: data.id };
}

export async function updateQuoteStatus(
  profileId: string,
  id: string,
  status: QuoteStatus,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] update quote status failed", {
      id,
      status,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}