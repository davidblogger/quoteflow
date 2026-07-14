export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

export const QUOTE_STATUSES: readonly QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "rejected",
] as const;

export type Quote = {
  id: string;
  profile_id: string;
  client_id: string;
  title: string;
  status: QuoteStatus;
  currency: string;
  tax_rate: number;
  subtotal: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteInsert = {
  client_id: string;
  title: string;
  currency?: string;
  tax_rate?: number;
  valid_until?: string | null;
  notes?: string | null;
};

export type QuoteStatusLabels = Record<QuoteStatus, string>;

export function parseQuoteStatus(value: string | undefined): QuoteStatus | null {
  if (!value) return null;
  if ((QUOTE_STATUSES as readonly string[]).includes(value)) {
    return value as QuoteStatus;
  }
  return null;
}