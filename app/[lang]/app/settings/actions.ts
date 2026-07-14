"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/queries/profile";

export type SettingsFormState = {
  ok: boolean;
  message: "idle" | "success" | "invalid" | "error";
  fieldErrors?: Partial<
    Record<
      "companyName" | "taxRate",
      "required" | "invalidTaxRate"
    >
  >;
};

const CURRENCY_RE = /^[A-Z]{3}$/;

export async function updateProfileAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const companyName = (formData.get("companyName") ?? "").toString().trim();
  const phone = (formData.get("phone") ?? "").toString().trim() || null;
  const address = (formData.get("address") ?? "").toString().trim() || null;
  const currency = (formData.get("currency") ?? "USD").toString().trim().toUpperCase() || "USD";
  const taxRateRaw = (formData.get("taxRate") ?? "").toString().trim();

  const fieldErrors: SettingsFormState["fieldErrors"] = {};
  if (!companyName) fieldErrors.companyName = "required";

  let taxRate = 0;
  if (taxRateRaw) {
    const normalized = taxRateRaw.replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      fieldErrors.taxRate = "invalidTaxRate";
    } else {
      taxRate = parsed;
    }
  }

  if (!CURRENCY_RE.test(currency) || Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await updateProfile(user.id, {
    company_name: companyName,
    phone,
    address,
    currency,
    tax_rate: taxRate,
  });

  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${formData.get("lang")?.toString() ?? "en"}/app/settings`);
  revalidatePath(`/${formData.get("lang")?.toString() ?? "en"}/app/quotes/new`);
  revalidatePath(`/${formData.get("lang")?.toString() ?? "en"}/app`);

  return { ok: true, message: "success" };
}