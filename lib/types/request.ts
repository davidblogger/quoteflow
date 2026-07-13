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

export function parseStatusFilter(value: string | undefined): RequestStatus | null {
  if (!value) return null;
  if ((REQUEST_STATUSES as readonly string[]).includes(value)) {
    return value as RequestStatus;
  }
  return null;
}