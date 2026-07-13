export type Client = {
  id: string;
  profile_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientInsert = {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
};

export type ClientUpdate = ClientInsert;

export type ClientFieldErrors = Partial<
  Record<"name" | "email" | "phone", "required" | "email">
>;