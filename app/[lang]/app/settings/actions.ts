"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { updateProfile, listWorkspaceUsers, updateUserRole, deleteWorkspaceUser, getCurrentProfile } from "@/lib/queries/profile";
import type { UserRole, ProfileWithUser } from "@/lib/supabase/types";

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

// ─── Admin User Management ─────────────────────────────────────────────────────

export type CreateUserFormState = {
  ok: boolean;
  message: "idle" | "success" | "invalid" | "error" | "exists";
  fieldErrors?: Partial<Record<"email" | "name" | "role", string>>;
};

export async function createUserByAdminAction(
  _prev: CreateUserFormState,
  formData: FormData,
): Promise<CreateUserFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const email = (formData.get("email") ?? "").toString().trim().toLowerCase();
  const name = (formData.get("name") ?? "").toString().trim();
  const role = (formData.get("role") ?? "member").toString() as UserRole;

  const fieldErrors: CreateUserFormState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "invalid";
  if (!name) fieldErrors.name = "required";
  if (role !== "admin" && role !== "member") fieldErrors.role = "invalid";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "invalid", fieldErrors };
  }

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, message: "error" };
  }

  const supabaseAdmin = await getSupabaseAdmin();

  // Check if user already exists in auth.users
  const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
  const userExists = existingAuth?.users.some((u) => u.email?.toLowerCase() === email);
  if (userExists) {
    return { ok: false, message: "exists" };
  }

  // Create user with generated password
  const temporaryPassword = generateSecurePassword();

  const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { name, company_name: profile.company_name },
  });

  if (createErr || !newUser.user) {
    console.error("[QuoteFlow] create user failed", createErr);
    return { ok: false, message: "error" };
  }

  // Create profile with role and invited_by
  const { error: profileErr } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: newUser.user.id,
      email,
      company_name: name,
      role,
      invited_by: profile.id,
      currency: "USD",
      tax_rate: 0,
    });

  if (profileErr) {
    console.error("[QuoteFlow] create profile failed", profileErr);
    // Try to delete the auth user if profile creation failed
    await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
    return { ok: false, message: "error" };
  }

  revalidatePath(`/${lang}/app/settings/users`);

  return {
    ok: true,
    message: "success",
  };
}

export type UpdateRoleFormState = {
  ok: boolean;
  message: "idle" | "success" | "error";
  userId?: string;
};

export async function updateUserRoleAction(
  _prev: UpdateRoleFormState,
  formData: FormData,
): Promise<UpdateRoleFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const targetProfileId = (formData.get("profileId") ?? "").toString();
  const newRole = (formData.get("role") ?? "").toString() as UserRole;

  if (!targetProfileId || (newRole !== "admin" && newRole !== "member")) {
    return { ok: false, message: "error" };
  }

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, message: "error" };
  }

  const result = await updateUserRole(profile.id, targetProfileId, newRole);

  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${lang}/app/settings/users`);

  return { ok: true, message: "success" };
}

export type DeleteUserFormState = {
  ok: boolean;
  message: "idle" | "success" | "error";
};

export async function deleteUserAction(
  _prev: DeleteUserFormState,
  formData: FormData,
): Promise<DeleteUserFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const targetProfileId = (formData.get("profileId") ?? "").toString();

  if (!targetProfileId) return { ok: false, message: "error" };

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, message: "error" };
  }

  const result = await deleteWorkspaceUser(profile.id, targetProfileId);

  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${lang}/app/settings/users`);

  return { ok: true, message: "success" };
}

function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$?";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}