"use server";

import { getOnlyProfileId } from "@/lib/queries/profile";
import { getSupabase } from "@/lib/supabase";

export type QuoteRequestState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "company" | "phone" | "service" | "message", string>
  >;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitQuoteRequest(
  _prev: QuoteRequestState | undefined,
  formData: FormData,
): Promise<QuoteRequestState> {
  const fields = {
    name: (formData.get("name") ?? "").toString().trim(),
    email: (formData.get("email") ?? "").toString().trim(),
    company: (formData.get("company") ?? "").toString().trim(),
    phone: (formData.get("phone") ?? "").toString().trim(),
    service: (formData.get("service") ?? "").toString().trim(),
    message: (formData.get("message") ?? "").toString().trim(),
  };

  const fieldErrors: QuoteRequestState["fieldErrors"] = {};

  if (!fields.name) fieldErrors.name = "required";
  if (!fields.email) fieldErrors.email = "required";
  else if (!EMAIL_RE.test(fields.email)) fieldErrors.email = "email";
  if (!fields.company) fieldErrors.company = "required";
  if (!fields.service) fieldErrors.service = "required";
  if (!fields.message) fieldErrors.message = "required";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "invalid",
      fieldErrors,
    };
  }

  const profileId = await getOnlyProfileId();
  if (!profileId) {
    return { ok: false, message: "error" };
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("requests").insert({
    profile_id: profileId,
    name: fields.name,
    email: fields.email,
    company: fields.company || null,
    phone: fields.phone || null,
    service: fields.service || null,
    message: fields.message,
    status: "new",
  });

  if (error) {
    console.error("[QuoteFlow] insert request failed", error);
    return { ok: false, message: "error" };
  }

  return { ok: true, message: "success" };
}