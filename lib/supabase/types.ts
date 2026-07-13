export type Profile = {
  id: string;
  company_name: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  address: string | null;
  currency: string;
  tax_rate: number;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = Omit<
  Profile,
  "created_at" | "updated_at"
> & {
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>;