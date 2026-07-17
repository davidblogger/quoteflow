import "server-only";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
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

/**
 * Single-tenant: get quote by ID without profile filter.
 * All quotes belong to the same workspace, so we just need the quote ID.
 * Uses admin client to bypass RLS for public PDF access.
 */
export async function getQuoteByIdUnfiltered(
  id: string,
): Promise<Quote | null> {
  const supabaseAdmin = await getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("quotes")
    .select("*")
    .eq("id", id)
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

export type QuoteEditableFields = {
  title: string;
  currency: string;
  tax_rate: number;
  valid_until: string | null;
  notes: string | null;
};

/**
 * Updates the editable header fields of a quote. Does NOT touch client_id
 * (which would require migrating line items) or status (which has its own
 * dedicated action).
 */
export async function updateQuote(
  profileId: string,
  id: string,
  input: QuoteEditableFields,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("quotes")
    .update({
      title: input.title,
      currency: input.currency,
      tax_rate: input.tax_rate,
      valid_until: input.valid_until,
      notes: input.notes,
    })
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] update quote failed", {
      id,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export type ClientQuoteCounts = Map<string, { total: number; active: number }>;

/**
 * Returns a map of client_id -> { total, active } counts for all quotes
 * owned by this profile. One query, grouped in memory — the dataset per
 * tenant is small enough that an aggregation RPC is not worth the
 * complexity yet.
 *
 * Active = draft or sent (still in flight). The remaining
 * (accepted or rejected) are treated as historical.
 */
export async function countQuotesByClient(
  profileId: string,
): Promise<ClientQuoteCounts> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("quotes")
    .select("client_id, status")
    .eq("profile_id", profileId);

  const counts: ClientQuoteCounts = new Map();
  if (error || !data) return counts;

  for (const row of data) {
    const existing = counts.get(row.client_id) ?? { total: 0, active: 0 };
    existing.total += 1;
    if (row.status === "draft" || row.status === "sent") {
      existing.active += 1;
    }
    counts.set(row.client_id, existing);
  }
  return counts;
}