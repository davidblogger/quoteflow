"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthFormState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<
    Record<
      | "company"
      | "email"
      | "password"
      | "confirmPassword",
      "required" | "email" | "passwordTooShort" | "passwordMismatch" | "emailTaken"
    >
  >;
  formError?: "invalidCredentials" | "generic";
  checkEmail?: string;
};

function safeNext(input: FormDataEntryValue | null): string | null {
  if (typeof input !== "string") return null;
  if (!input.startsWith("/")) return null;
  if (input.startsWith("//")) return null;
  return input;
}

export async function signInAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const next = safeNext(formData.get("next"));
  const lang = (formData.get("lang") ?? "en").toString();

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "required";
  else if (!EMAIL_RE.test(email)) fieldErrors.email = "email";
  if (!password) fieldErrors.password = "required";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      ok: false,
      message: "error",
      formError: "invalidCredentials",
    };
  }

  redirect(next ?? `/${lang}`);
}

export async function signUpAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const company = (formData.get("company") ?? "").toString().trim();
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const confirmPassword = (formData.get("confirmPassword") ?? "").toString();
  const next = safeNext(formData.get("next"));
  const lang = (formData.get("lang") ?? "en").toString();

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (!company) fieldErrors.company = "required";
  if (!email) fieldErrors.email = "required";
  else if (!EMAIL_RE.test(email)) fieldErrors.email = "email";
  if (!password) fieldErrors.password = "required";
  else if (password.length < 8) fieldErrors.password = "passwordTooShort";
  if (!confirmPassword) fieldErrors.confirmPassword = "required";
  else if (password !== confirmPassword)
    fieldErrors.confirmPassword = "passwordMismatch";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: company },
    },
  });

  if (error) {
    const isDuplicate =
      /already registered|already been registered|user already exists/i.test(
        error.message,
      );
    return {
      ok: false,
      message: "error",
      formError: isDuplicate ? "generic" : "generic",
      fieldErrors: isDuplicate ? { email: "emailTaken" } : undefined,
    };
  }

  if (!data.session) {
    return {
      ok: true,
      message: "checkEmail",
      checkEmail: email,
    };
  }

  redirect(next ?? `/${lang}`);
}

export async function signOutAction(lang: string = "en"): Promise<void> {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect(`/${lang}`);
}