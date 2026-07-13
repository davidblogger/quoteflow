"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/queries/clients";
import type { ClientFieldErrors } from "@/lib/types/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ClientFormState = {
  ok: boolean;
  message: "idle" | "successCreate" | "successUpdate" | "invalid" | "error";
  fieldErrors?: ClientFieldErrors;
};

function parseField(input: FormDataEntryValue | null): string {
  return (input ?? "").toString().trim();
}

function validate(fields: {
  name: string;
  email: string;
}): ClientFieldErrors {
  const fe: ClientFieldErrors = {};
  if (!fields.name) fe.name = "required";
  if (fields.email && !EMAIL_RE.test(fields.email)) fe.email = "email";
  return fe;
}

function parseFields(formData: FormData) {
  return {
    name: parseField(formData.get("name")),
    company: parseField(formData.get("company")) || null,
    email: parseField(formData.get("email")) || null,
    phone: parseField(formData.get("phone")) || null,
    address: parseField(formData.get("address")) || null,
    notes: parseField(formData.get("notes")) || null,
  };
}

export async function createClientAction(
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const fields = parseFields(formData);

  const fe = validate({ name: fields.name, email: fields.email ?? "" });
  if (Object.keys(fe).length > 0) {
    return { ok: false, message: "invalid", fieldErrors: fe };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await createClient(user.id, fields);
  if (!result.ok || !result.id) {
    return { ok: false, message: "error" };
  }

  revalidatePath(`/${lang}/app/clients`);
  redirect(`/${lang}/app/clients/${result.id}`);
}

export async function updateClientAction(
  _prev: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const lang = (formData.get("lang") ?? "en").toString();
  const id = parseField(formData.get("id"));
  if (!id) return { ok: false, message: "error" };

  const fields = parseFields(formData);
  const fe = validate({ name: fields.name, email: fields.email ?? "" });
  if (Object.keys(fe).length > 0) {
    return { ok: false, message: "invalid", fieldErrors: fe };
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "error" };

  const result = await updateClient(user.id, id, fields);
  if (!result.ok) return { ok: false, message: "error" };

  revalidatePath(`/${lang}/app/clients`);
  revalidatePath(`/${lang}/app/clients/${id}`);

  return { ok: true, message: "successUpdate" };
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  const lang = (formData.get("lang") ?? "en").toString();
  const id = parseField(formData.get("id"));
  if (!id) redirect(`/${lang}/app/clients`);

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${lang}/login`);

  await deleteClient(user.id, id);
  revalidatePath(`/${lang}/app/clients`);
  redirect(`/${lang}/app/clients`);
}