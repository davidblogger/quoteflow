"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Self-heal action for authenticated users whose `profiles` row is
 * missing (trigger broken, manual deletion, race condition on signup).
 * Creates the row with safe defaults and redirects back.
 */
export async function ensureProfileAction(formData: FormData): Promise<void> {
  const lang = (formData.get("lang") ?? "en").toString();

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login`);

  const fallbackEmail = user.email ?? "";
  const companyName = fallbackEmail.split("@")[0] || "";

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    email: fallbackEmail,
    company_name: companyName,
    currency: "USD",
    tax_rate: 0,
  });

  // 23505 = unique_violation; another request created the row first.
  // Treat as success — the result is what we wanted anyway.
  if (error && error.code !== "23505") {
    console.error("[QuoteFlow] ensureProfile failed", error);
    return;
  }

  revalidatePath(`/${lang}/app/settings`);
  revalidatePath(`/${lang}/app`);
  redirect(`/${lang}/app/settings`);
}