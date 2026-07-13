import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { QuoteRequest, RequestStatus } from "@/lib/types/request";

export {
  REQUEST_STATUSES,
  parseStatusFilter,
  type QuoteRequest,
  type RequestStatus,
} from "@/lib/types/request";

export async function listRequests(
  profileId: string,
  filter?: RequestStatus,
): Promise<QuoteRequest[]> {
  const supabase = await getSupabaseServer();
  let query = supabase
    .from("requests")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });

  if (filter) {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as QuoteRequest[];
}

export async function getRequestById(
  profileId: string,
  id: string,
): Promise<QuoteRequest | null> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error || !data) return null;
  return data as QuoteRequest;
}

export async function updateRequestStatus(
  profileId: string,
  id: string,
  status: RequestStatus,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("requests")
    .update({ status })
    .eq("id", id)
    .eq("profile_id", profileId);

  if (error) {
    console.error("[QuoteFlow] update request status failed", {
      id,
      status,
      code: error.code,
      message: error.message,
    });
    return { ok: false, error: error.message };
  }
  return { ok: true };
}