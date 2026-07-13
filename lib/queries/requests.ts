import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

export type RequestStatus = "new" | "contacted" | "qualified" | "converted" | "closed";

export type QuoteRequest = {
  id: string;
  profile_id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service: string | null;
  message: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
};

export const REQUEST_STATUSES: readonly RequestStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "closed",
] as const;

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

export function parseStatusFilter(value: string | undefined): RequestStatus | null {
  if (!value) return null;
  if ((REQUEST_STATUSES as readonly string[]).includes(value)) {
    return value as RequestStatus;
  }
  return null;
}