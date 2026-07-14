"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/queries/profile";

const MIN_PASSWORD_LENGTH = 8;

export type PasswordFormState = {
  ok: boolean;
  message: "idle" | "success" | "invalid" | "error";
  fieldErrors?: Partial<
    Record<"current" | "next" | "confirm", "required" | "tooShort" | "mismatch">
  >;
  formError?: "currentIncorrect" | "sameAsCurrent" | "generic";
};

/**
 * Verify the current password then update to a new one. The pattern is:
 *   1. signInWithPassword(current) — cheap, server-side proof that the
 *      caller knows the current password. Throttling is handled by
 *      Supabase Auth.
 *   2. updateUser({ password: new }) — only on success.
 * On failure (wrong current, network, weak new password) we return a
 * typed state without redirecting so the form can show the exact error.
 */
export async function changePasswordAction(
  _prev: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const current = (formData.get("current") ?? "").toString();
  const next = (formData.get("next") ?? "").toString();
  const confirm = (formData.get("confirm") ?? "").toString();

  const fieldErrors: PasswordFormState["fieldErrors"] = {};
  if (!current) fieldErrors.current = "required";
  if (!next) fieldErrors.next = "required";
  else if (next.length < MIN_PASSWORD_LENGTH) fieldErrors.next = "tooShort";
  if (!confirm) fieldErrors.confirm = "required";
  else if (next !== confirm) fieldErrors.confirm = "mismatch";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  // Catch the "same as current" case before hitting Supabase — it's a
  // friendlier message than the generic one Supabase would return.
  if (current === next) {
    return {
      ok: false,
      message: "error",
      formError: "sameAsCurrent",
    };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, message: "error", formError: "generic" };
  }

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInErr) {
    return { ok: false, message: "error", formError: "currentIncorrect" };
  }

  const { error: updateErr } = await supabase.auth.updateUser({
    password: next,
  });
  if (updateErr) {
    console.error("[QuoteFlow] changePassword failed", updateErr);
    return { ok: false, message: "error", formError: "generic" };
  }

  revalidatePath(`/${lang}/app/settings`);
  return { ok: true, message: "success" };
}

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