export type QuoteItem = {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  position: number;
  created_at: string;
};

export type QuoteItemInsert = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type QuoteItemFieldErrors = Partial<
  Record<"description" | "quantity" | "unit_price", "required" | "invalidNumber">
>;